import { Command } from 'commander'
import chalk from 'chalk'
import { createWebhookServer } from './server.js'
import { getHistory } from './executor.js'

const program = new Command()

program
  .name('claude-webhook')
  .description('Trigger Claude Code tasks from webhooks')
  .version('1.0.0')

// ─── start ───────────────────────────────────

program
  .command('start')
  .description('Start the webhook server')
  .option('-p, --port <number>', 'Port to listen on', String(process.env.PORT || '3847'))
  .option('-s, --secret <string>', 'Webhook secret (overrides WEBHOOK_SECRET env var)')
  .option('-q, --quiet', 'Suppress request logs')
  .action((opts) => {
    const port = Number(opts.port)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      console.error(chalk.red(`Invalid port: ${opts.port}`))
      process.exit(1)
    }

    const secret = opts.secret || process.env.WEBHOOK_SECRET || ''

    createWebhookServer({ port, secret, quiet: opts.quiet })

    // Graceful shutdown
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.on(signal, () => {
        console.log(chalk.dim(`\n${signal} received — shutting down`))
        process.exit(0)
      })
    }
  })

// ─── status ──────────────────────────────────

program
  .command('status')
  .description('Show recent execution history from a running server')
  .option('-p, --port <number>', 'Port the server is running on', '3847')
  .option('-n, --limit <number>', 'Number of recent executions to show', '10')
  .action(async (opts) => {
    const url = `http://localhost:${opts.port}/status`
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      const data = await res.json()
      console.log(chalk.bold('\nServer status\n'))
      console.log(`  Uptime:   ${Math.round(data.uptime)}s`)
      console.log(`  Started:  ${data.startedAt}`)
      console.log(`  Version:  ${data.version}\n`)

      const recent = (data.recentExecutions || []).slice(0, Number(opts.limit))
      if (recent.length === 0) {
        console.log(chalk.dim('  No executions yet.\n'))
        return
      }

      console.log(chalk.bold('  Recent executions:\n'))
      for (const exec of recent) {
        const statusColor =
          exec.status === 'success' ? chalk.green :
          exec.status === 'running' ? chalk.blue :
          chalk.red
        console.log(
          `  ${statusColor(exec.status.padEnd(10))} ` +
          chalk.dim(exec.id) + '  ' +
          chalk.white(exec.task.slice(0, 60)) +
          (exec.task.length > 60 ? chalk.dim('…') : '')
        )
      }
      console.log('')
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.name === 'TimeoutError') {
        console.error(chalk.red(`Cannot connect to server on port ${opts.port}. Is it running?`))
      } else {
        console.error(chalk.red('Error:'), err.message)
      }
      process.exit(1)
    }
  })

export { program }
