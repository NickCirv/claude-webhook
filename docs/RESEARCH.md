# claude-webhook — documentation research

Reviewed 21 September 2026. Public GitHub source only.

## Revision and scope

- Commit: [`d8586b99705cbae9e72f2ca44834ae26aed2c0a6`](https://github.com/NickCirv/claude-webhook/commit/d8586b99705cbae9e72f2ca44834ae26aed2c0a6).
- Tree: `17ba967f100854e35d4341d8a7095d5dff537091`; truncated: `false`.
- Capture: 11 of 11 eligible text files; all eligible text files.
- Method: package and entrypoint inspection, implementation-interface review, targeted behavior/limitation inspection, and test-source review. This is not an exhaustive correctness or security audit.
- Commands run against repository code: **none**. External services, deployment and npm publication were not verified.

## Claim and evidence map

| Documentation claim | Pinned evidence | Assessment |
| --- | --- | --- |
| Runtime, executable and development commands | [package.json](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/package.json) | Source declaration inspected; runtime unverified |
| Exposes HTTP handlers that turn authenticated webhook requests into local Claude CLI tasks. | [bin/webhook.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/bin/webhook.js) · [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) | Implementation interfaces inspected; behavior not executed |
| Generic task endpoint; GitHub and Slack signature handlers; execution history; status command. | [bin/webhook.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/bin/webhook.js), [src/auth.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/auth.js), [src/executor.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/executor.js), [src/handlers.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/handlers.js), [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js), [src/server.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/server.js) | Source-backed scope, not a test result |
| Execution runs Claude with local filesystem access. Source permits an empty secret configuration; configure authentication and network isolation before use. This repository is not reviewed as a public internet service. | [bin/webhook.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/bin/webhook.js), [src/auth.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/auth.js), [src/executor.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/executor.js), [src/handlers.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/handlers.js), [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js), [src/server.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/server.js) | Material limits documented; service compatibility remains open |
| Existing checks | [test/smoke.test.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/test/smoke.test.js) | Test source read; no passing-run claim |

## Documentation inventory and disposition

| Existing document | Decision |
| --- | --- |
| [README.md](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/README.md) | Rewritten with source-specific purpose, direct checkout setup, limitations and verification status. Old section fragments retained where practical. |

Added `docs/REFERENCE.md` for the observed implementation and command surface, and this research record. Protected license and attribution files remain in their original locations without edits. No source or product UI was changed.

## Quality dimensions

| Dimension | Status | Evidence / next step |
| --- | --- | --- |
| Pinned provenance | Verified | Captured commit, tree and per-file hashes recorded below |
| Interface documentation | Partially verified | Source inspection only; run clean-checkout quickstart |
| Runtime behavior | Unverified | No repository execution in this review |
| Test results | Unverified | Existing tests were not run |
| Deployment / package availability | Unverified | No remote publish or live-service check |
| Visual / link checks | Unverified | Portfolio renderer and independent QA are separate from this authoring step |

## Unresolved issues

Execution runs Claude with local filesystem access. Source permits an empty secret configuration; configure authentication and network isolation before use. This repository is not reviewed as a public internet service.

## Captured source inventory

This lists captured provenance, not a claim that every line received a full audit. Binary/generated/excluded files are outside the eligible text capture.

| File | SHA-256 | Bytes |
| --- | --- | --- |
| [LICENSE](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/LICENSE) | `8edf13ba2a2e443fa49e42493414f6952a4a14b6c407983a7c95162ab37f6265` | 1065 |
| [README.md](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/README.md) | `afbbd1edcdd93816bbf4afcee9f9c75d87450d9248beb07c2ab26284ed99f433` | 2688 |
| [package.json](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/package.json) | `c94b3d29002560f049d6d9f4adf6d4b971679cccf60d2b3510ff5181da54e056` | 878 |
| [.github/workflows/ci.yml](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/.github/workflows/ci.yml) | `e818f4e6bd805f798665dbbf04964d02f12fc59dd7f18903ad63d26d374ae3f0` | 380 |
| [bin/webhook.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/bin/webhook.js) | `ebfd9981ef1afc488ddd9ebca3bad096af6fab9670981a757bee8a9343e1a929` | 79 |
| [src/auth.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/auth.js) | `b630a39293e02c7e82cc05dcff93a9adbed729e8ae3d94deb9413312b3efe06e` | 1898 |
| [src/executor.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/executor.js) | `ceb4ab18610b978de5fa0dbb7d007b29834cd16555245d580067505fd35674a5` | 3012 |
| [src/handlers.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/handlers.js) | `b201845033d604bff3a167d983b0e5b3e1eafc835f37ea9c46eff42b078798e2` | 7371 |
| [src/index.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/index.js) | `142cc7c3605f68373cb0acf5bb439a65c30275e52be08b27367e017ba9ab40e3` | 3104 |
| [src/server.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/src/server.js) | `e6afbc66efa1b61e00dc03efed928662a4384251ef8ac06604fb482cdc9b181a` | 2886 |
| [test/smoke.test.js](https://github.com/NickCirv/claude-webhook/blob/d8586b99705cbae9e72f2ca44834ae26aed2c0a6/test/smoke.test.js) | `d356328f5fa5af8b849ce3ab21257797a22f2b215c61e4d43253e68e75480ab2` | 340 |
