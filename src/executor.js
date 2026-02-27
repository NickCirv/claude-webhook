import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync } from 'node:fs'

const execFileAsync = promisify(execFile)

// In-memory execution history (last 50 runs)
const MAX_HISTORY = 50
const history = []

let executionCounter = 0

/**
 * Run a Claude Code task via the CLI.
 *
 * @param {Object} opts
 * @param {string}   opts.task        Natural language task for Claude
 * @param {string}  [opts.cwd]        Working directory (defaults to process.cwd())
 * @param {number}  [opts.timeout]    Timeout in ms (default 5 minutes)
 * @param {string}  [opts.source]     Where the task came from (slack, github, api...)
 * @returns {Promise<Object>}         Execution result record
 */
export async function runTask({ task, cwd, timeout = 300_000, source = 'api' }) {
  if (!task || typeof task !== 'string' || !task.trim()) {
    throw new Error('task must be a non-empty string')
  }

  const workDir = cwd || process.cwd()
  if (!existsSync(workDir)) {
    throw new Error(`Working directory does not exist: ${workDir}`)
  }

  const id = `exec_${++executionCounter}_${Date.now()}`
  const startedAt = new Date().toISOString()

  const record = {
    id,
    task,
    cwd: workDir,
    source,
    status: 'running',
    startedAt,
    completedAt: null,
    durationMs: null,
    stdout: null,
    stderr: null,
    exitCode: null,
    error: null,
  }

  addToHistory(record)

  const start = Date.now()

  try {
    const { stdout, stderr } = await execFileAsync(
      'claude',
      [
        '--dangerously-skip-permissions',
        '--print',
        task,
      ],
      {
        cwd: workDir,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10 MB
        env: { ...process.env },
      }
    )

    const durationMs = Date.now() - start

    Object.assign(record, {
      status: 'success',
      completedAt: new Date().toISOString(),
      durationMs,
      stdout: stdout.trim(),
      stderr: stderr.trim() || null,
      exitCode: 0,
    })
  } catch (err) {
    const durationMs = Date.now() - start

    if (err.code === 'ETIMEDOUT' || err.killed) {
      Object.assign(record, {
        status: 'timeout',
        completedAt: new Date().toISOString(),
        durationMs,
        error: `Task timed out after ${timeout}ms`,
        exitCode: null,
      })
    } else {
      Object.assign(record, {
        status: 'error',
        completedAt: new Date().toISOString(),
        durationMs,
        stdout: err.stdout?.trim() || null,
        stderr: err.stderr?.trim() || null,
        error: err.message,
        exitCode: err.code ?? null,
      })
    }
  }

  return record
}

/**
 * Return execution history (most recent first).
 *
 * @param {number} [limit=10]
 * @returns {Object[]}
 */
export function getHistory(limit = 10) {
  return history.slice(0, Math.min(limit, history.length))
}

function addToHistory(record) {
  history.unshift(record)
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY
  }
}
