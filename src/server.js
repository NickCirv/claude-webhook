import { createServer } from 'node:http'
import chalk from 'chalk'
import {
  handleStatus,
  handleRun,
  handleGithub,
  handleSlack,
  handleNotFound,
} from './handlers.js'

/**
 * Create and start the webhook HTTP server.
 *
 * @param {Object} opts
 * @param {number}  opts.port     Port to listen on
 * @param {string} [opts.secret]  WEBHOOK_SECRET for auth
 * @param {boolean} [opts.quiet]  Suppress request logs
 * @returns {import('node:http').Server}
 */
export function createWebhookServer({ port, secret, quiet = false }) {
  const server = createServer(async (req, res) => {
    const method = req.method || 'GET'
    const url = new URL(req.url || '/', `http://localhost:${port}`)
    const pathname = url.pathname

    if (!quiet) {
      process.stdout.write(
        chalk.dim(`${new Date().toISOString()}  `) +
        chalk.cyan(method.padEnd(6)) +
        chalk.white(pathname) + '\n'
      )
    }

    try {
      if (method === 'GET' && pathname === '/status') {
        return handleStatus(req, res)
      }

      if (method === 'POST' && pathname === '/run') {
        return await handleRun(req, res, secret)
      }

      if (method === 'POST' && pathname === '/webhook/github') {
        return await handleGithub(req, res, secret)
      }

      if (method === 'POST' && pathname === '/webhook/slack') {
        return await handleSlack(req, res, secret)
      }

      return handleNotFound(req, res)
    } catch (err) {
      if (!quiet) {
        console.error(chalk.red('Unhandled error:'), err)
      }

      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
    }
  })

  server.listen(port, () => {
    const secretStatus = secret
      ? chalk.green('HMAC auth enabled')
      : chalk.yellow('No auth — set WEBHOOK_SECRET to secure')

    console.log(
      chalk.bold('\nclaude-webhook') + chalk.dim(' v1.0.0\n') +
      chalk.dim('─────────────────────────────────\n') +
      `  ${chalk.green('Listening')}  ${chalk.white(`http://localhost:${port}`)}\n` +
      `  ${chalk.dim('Auth')}       ${secretStatus}\n` +
      chalk.dim('─────────────────────────────────\n') +
      `  ${chalk.cyan('GET')}  /status\n` +
      `  ${chalk.cyan('POST')} /run\n` +
      `  ${chalk.cyan('POST')} /webhook/github\n` +
      `  ${chalk.cyan('POST')} /webhook/slack\n` +
      chalk.dim('─────────────────────────────────\n')
    )
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(chalk.red(`Port ${port} is already in use.`))
      process.exit(1)
    }
    throw err
  })

  return server
}
