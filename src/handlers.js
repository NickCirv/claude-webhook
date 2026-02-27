import { runTask, getHistory } from './executor.js'
import {
  verifyBearerToken,
  verifyGithubSignature,
  verifySlackSignature,
} from './auth.js'

const startedAt = new Date().toISOString()

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────

function json(res, status, body) {
  const payload = JSON.stringify(body, null, 2)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function parseJson(buf) {
  try {
    return JSON.parse(buf.toString('utf8'))
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// GET /status
// ─────────────────────────────────────────────

export function handleStatus(req, res) {
  const recent = getHistory(10)
  json(res, 200, {
    status: 'ok',
    version: '1.0.0',
    startedAt,
    uptime: process.uptime(),
    recentExecutions: recent,
  })
}

// ─────────────────────────────────────────────
// POST /run
// ─────────────────────────────────────────────

export async function handleRun(req, res, secret) {
  const rawBody = await readBody(req)
  const body = parseJson(rawBody)

  if (!body) {
    return json(res, 400, { error: 'Invalid JSON body' })
  }

  // Auth check
  if (secret) {
    const auth = req.headers['authorization'] || ''
    if (!verifyBearerToken(secret, auth)) {
      return json(res, 401, { error: 'Unauthorized' })
    }
  }

  const { task, cwd, timeout } = body

  if (!task || typeof task !== 'string' || !task.trim()) {
    return json(res, 400, { error: 'Missing required field: task (non-empty string)' })
  }

  // Respond immediately with accepted status, run async
  const accepted = {
    accepted: true,
    message: 'Task queued — running Claude',
    task,
    cwd: cwd || process.cwd(),
  }
  json(res, 202, accepted)

  // Fire and don't await — result lands in history
  runTask({ task, cwd, timeout, source: 'api' }).catch(() => {})
}

// ─────────────────────────────────────────────
// POST /webhook/github
// ─────────────────────────────────────────────

export async function handleGithub(req, res, secret) {
  const rawBody = await readBody(req)

  if (secret) {
    const sig = req.headers['x-hub-signature-256'] || ''
    if (!verifyGithubSignature(secret, rawBody, sig)) {
      return json(res, 401, { error: 'Invalid signature' })
    }
  }

  const event = req.headers['x-github-event'] || 'unknown'
  const body = parseJson(rawBody)

  if (!body) {
    return json(res, 400, { error: 'Invalid JSON body' })
  }

  // Only act on workflow_run failures and check_run failures
  const isCiFailure =
    (event === 'workflow_run' && body.action === 'completed' && body.workflow_run?.conclusion === 'failure') ||
    (event === 'check_run' && body.action === 'completed' && body.check_run?.conclusion === 'failure')

  if (!isCiFailure) {
    return json(res, 200, { skipped: true, reason: `Event ${event}/${body.action} not actionable` })
  }

  const repo = body.repository?.full_name || 'unknown'
  const branch = body.workflow_run?.head_branch || body.check_run?.check_suite?.head_branch || 'main'
  const runUrl = body.workflow_run?.html_url || body.check_run?.html_url || ''
  const cwd = process.cwd()

  const task = [
    `CI failed on ${repo} (branch: ${branch}).`,
    runUrl ? `Run URL: ${runUrl}` : '',
    'Investigate the failure, identify the root cause, and fix it.',
    'Run the tests to verify the fix works.',
  ].filter(Boolean).join(' ')

  json(res, 202, { accepted: true, event, repo, branch, task })

  runTask({ task, cwd, source: 'github' }).catch(() => {})
}

// ─────────────────────────────────────────────
// POST /webhook/slack
// ─────────────────────────────────────────────

export async function handleSlack(req, res, secret) {
  const rawBody = await readBody(req)

  if (secret) {
    const ts = req.headers['x-slack-request-timestamp'] || ''
    const sig = req.headers['x-slack-signature'] || ''
    if (!verifySlackSignature(secret, rawBody.toString('utf8'), ts, sig)) {
      return json(res, 401, { error: 'Invalid Slack signature' })
    }
  }

  // Slack sends application/x-www-form-urlencoded for slash commands
  let text = ''
  let responseUrl = ''

  const contentType = req.headers['content-type'] || ''

  if (contentType.includes('application/json')) {
    const body = parseJson(rawBody)
    text = body?.text || ''
    responseUrl = body?.response_url || ''
  } else {
    // Parse URL-encoded form body
    const params = new URLSearchParams(rawBody.toString('utf8'))
    text = params.get('text') || ''
    responseUrl = params.get('response_url') || ''
  }

  if (!text.trim()) {
    return json(res, 200, {
      response_type: 'ephemeral',
      text: 'Usage: /claude <task description>',
    })
  }

  // Respond to Slack immediately (3s deadline)
  json(res, 200, {
    response_type: 'ephemeral',
    text: `Running task: _${text}_\nI'll update you when done.`,
  })

  const cwd = process.cwd()

  runTask({ task: text.trim(), cwd, source: 'slack' }).then(async (result) => {
    if (!responseUrl) return

    const slackBody = {
      response_type: 'in_channel',
      text: result.status === 'success'
        ? `*Task complete* (${result.durationMs}ms)\n\`\`\`\n${result.stdout?.slice(0, 2800) || 'Done.'}\n\`\`\``
        : `*Task failed* (${result.status})\n${result.error || result.stderr || 'Unknown error'}`,
    }

    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackBody),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => {})
  }).catch(() => {})
}

// ─────────────────────────────────────────────
// 404 fallback
// ─────────────────────────────────────────────

export function handleNotFound(req, res) {
  json(res, 404, {
    error: 'Not found',
    available: [
      'GET  /status',
      'POST /run',
      'POST /webhook/github',
      'POST /webhook/slack',
    ],
  })
}
