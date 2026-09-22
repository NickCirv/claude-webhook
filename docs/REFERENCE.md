# claude-webhook — implementation reference

Source revision: `d8586b99705cbae9e72f2ca44834ae26aed2c0a6`. This reference records source declarations; it is not a transcript of a successful run.

## Entrypoint and runtime

[package.json](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/package.json) declares `bin/webhook.js`. Node.js `>=20` and npm.

Executable mapping: `claude-webhook` → `./bin/webhook.js`.

## Supported workflow

Generic task endpoint; GitHub and Slack signature handlers; execution history; status command.

Execution runs Claude with local filesystem access. Source permits an empty secret configuration; configure authentication and network isolation before use. This repository is not reviewed as a public internet service.

## Declared command interface

Options belong to the preceding command in the linked source; they are not necessarily global.

| Kind | Declaration | Source description | Source |
| --- | --- | --- | --- |
| command | `start` | Start the webhook server | [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) |
| option | `-p, --port <number>` | Port to listen on | [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) |
| option | `-s, --secret <string>` | Webhook secret (overrides WEBHOOK_SECRET env var) | [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) |
| option | `-q, --quiet` | Suppress request logs | [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) |
| command | `status` | Show recent execution history from a running server | [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) |
| option | `-p, --port <number>` | Port the server is running on | [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) |
| option | `-n, --limit <number>` | Number of recent executions to show | [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) |

## Option defaults

These are literal defaults or parsers declared by the command builder; flags belong to their command as shown above.

| Option | Declared default / parser |
| --- | --- |
| `-p, --port <number>` | `String(process.env.PORT \|\| '3847'` |
| `-p, --port <number>` | `'3847'` |
| `-n, --limit <number>` | `'10'` |

## HTTP request contract

`start` uses `--port`, then `PORT`, then `3847`. `--secret` overrides `WEBHOOK_SECRET`. The server calls `listen(port)` without a loopback-only host argument. Setting a secret enables route-specific authentication; an empty secret skips it. `/status` remains unauthenticated and includes recent execution history.

| Route | Input | Result |
| --- | --- | --- |
| `GET /status` | None | `200`: `status`, `version`, `startedAt`, `uptime`, `recentExecutions` |
| `POST /run` | JSON `task` (non-empty string), optional `cwd` and `timeout`; bearer secret when configured | `202`: `accepted`, `message`, `task`, `cwd`; execution continues asynchronously |
| `POST /webhook/github` | GitHub JSON + `x-github-event`; HMAC header when configured | Completed failed `workflow_run` / `check_run` events queue work with `202`; other events return `200` with `skipped` |
| `POST /webhook/slack` | Form or JSON `text`, optional `response_url`; Slack signature when configured | Command acknowledgment, then local task execution |

Illustrative `/run` body for a controlled test environment:

```json
{"task":"Summarize the README without changing files","cwd":"/path/to/disposable-checkout","timeout":300000}
```

`202` means accepted, not completed or successful. A caller-supplied prompt is not an enforced read-only boundary: Claude runs with the process's local permissions. Inspect status/history for the eventual result. Invalid JSON or missing task returns `400`; failed bearer/signature checks return `401`; unknown routes return `404`; uncaught handler errors return `500`.

GitHub verification uses `x-hub-signature-256` over the raw body. Slack uses `x-slack-signature` and `x-slack-request-timestamp`, with a five-minute timestamp tolerance. The same configured secret is used by the relevant route. Body collection has no explicit size cap in the inspected handler; do not expose this process directly to untrusted traffic without an independently reviewed boundary.

## Package scripts

| Script | Exact command |
| --- | --- |
| `start` | `node bin/webhook.js start` |
| `dev` | `node --watch bin/webhook.js start` |
| `test` | `node --test` |

## Environment references

The implementation reads `PORT`, `WEBHOOK_SECRET`. Some are optional or mode-specific; inspect their call sites before configuring a service. Credentials and endpoint values are never supplied by this document.

## Implementation sources

[src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js).

## Verification boundary

No repository code, tests, network operation, hook installer or migration was executed for this review. Source inspection supports the documented interface; runtime correctness and external-service compatibility remain unverified.
