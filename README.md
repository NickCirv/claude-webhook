<div align="center">

# claude-webhook

**HTTP server that lets Slack, GitHub CI, n8n, and Zapier trigger Claude Code tasks via webhook**

[![License: MIT](https://img.shields.io/badge/License-MIT-0B0A09?style=flat-square&labelColor=0B0A09&color=555)](LICENSE)
[![Node: >=18](https://img.shields.io/badge/Node-%3E%3D18-0B0A09?style=flat-square&labelColor=0B0A09&color=555)](package.json)

</div>

## Install

```bash
npx github:NickCirv/claude-webhook start
```

Or clone and run directly:

```bash
git clone https://github.com/NickCirv/claude-webhook
cd claude-webhook
node bin/webhook.js start --port 3847
```

## Usage

```bash
# Start the webhook server
WEBHOOK_SECRET=mysecret npx github:NickCirv/claude-webhook start --port 3847

# Trigger a Claude task via curl
curl -X POST http://localhost:3847/run \
  -H "Authorization: Bearer mysecret" \
  -H "Content-Type: application/json" \
  -d '{"task": "list all TODO comments in the repo", "cwd": "/path/to/repo"}'

# Check server status + recent executions
claude-webhook status --port 3847
```

## CLI flags

| Flag | Description |
|------|-------------|
| `start -p, --port <n>` | Port to listen on (default: 3847, env: `PORT`) |
| `start -s, --secret <s>` | Webhook secret (default: env `WEBHOOK_SECRET`) |
| `start -q, --quiet` | Suppress request logs |
| `status -p, --port <n>` | Port to check (default: 3847) |
| `status -n, --limit <n>` | Executions to show (default: 10) |

## What it does

`claude-webhook` runs a lightweight HTTP server that accepts task descriptions and executes them via `claude -p` (Claude Code CLI). It exposes three endpoints: `POST /run` (generic Bearer-authed task), `POST /webhook/github` (CI failure auto-fix via HMAC-SHA256), and `POST /webhook/slack` (Slack `/claude` slash command with replay protection). Tasks run async — `GET /status` returns live execution history.

No Express. Uses Node's built-in `http` module with only `chalk` and `commander` as runtime deps.

## Environment variables

| Variable | Description |
|----------|-------------|
| `WEBHOOK_SECRET` | Shared secret for HMAC auth (required in production) |
| `PORT` | Default port (overridden by `--port`) |

## Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /run` | Bearer token | Run any Claude task |
| `POST /webhook/github` | HMAC-SHA256 (`X-Hub-Signature-256`) | Auto-fix on CI failure |
| `POST /webhook/slack` | Slack HMAC + replay protection | Handle `/claude <task>` slash command |
| `GET /status` | None | Server health + execution history |

---

<sub>2 runtime deps (chalk, commander) · Node ≥18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
