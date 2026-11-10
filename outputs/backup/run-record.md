# BACKUP run record: prepared earlier run

This is a completed earlier run. It is not today's live job. The page in this folder (`index.html`) carries the visible banner "BACKUP — prepared earlier run".

## What the backup is

- `index.html`: the working widget from the earlier run, with the banner and page title added. The calculator code is unchanged from `outputs/demo/index.html`.
- `widget-desktop.png` (1280 px) and `widget-mobile.png` (390 px): screenshots refreshed from this backup page with bundled Playwright and Edge on 2026-11-10.
- Offline: no external scripts, fonts, links or requests. The check recorded zero network requests.

## Roles and models, from the saved traces

All three were direct workers. Each was a scripted request loop from `work/routed-worker.mjs` sent to the local OpenCodex proxy (`http://127.0.0.1:10100/v1/responses`). Each had a separate context, with read and write tools limited to its own files. They were not native subagents and did not appear in the app as subagents. Native launcher calls to these external IDs failed at the time ("not supported when using Codex with a ChatGPT account", including after the OpenCodex 2.100.1 update), so these runs used the direct route. Whether native launches work now has not been tested.

| Role | Requested model | Model reported in response | Effort | Turns | Original evidence (not included) |
|---|---|---|---|---|---|
| Builder | minimax/MiniMax-M3 | MiniMax-M3 | low | 18 (turn cap reached) | `work/widget-build-trace.json` |
| Correctness review | anthropic/claude-sonnet-5-5 | anthropic/claude-sonnet-5-5 | high | 3 | `work/correctness-review-trace.json`, `work/reviews/correctness.md` |
| Frontend review | zai/glm-5.3 | glm-5.3 | low | 3 | `work/frontend-review-trace.json`, `work/reviews/frontend.md` |

Coordinator for these runs: GPT-6 Sol in Codex. It wrote the task messages, ran the workers, applied fixes and ran the browser checks.

Separate from the worker traces: two preparation subagents resumed on Claude Sonnet 5.5 after the proxy restart, with successful Anthropic requests confirmed by the presenter. The main coordinator session remained GPT-6 Sol and did not switch to Claude. The resumed subagents are not among the three traced workers and are not the source of the traced reviews.

## What each worker actually did

- **MiniMax (builder):** wrote `outputs/demo/index.html` and its own test files under `work/demo-tests/`. The worker had no way to run code, so it ran none of its own tests. It stopped at the 18-turn cap while still editing a test file. The widget file had already been written.
- **Sonnet (correctness):** read the source and hand-traced it. It had no execution tool and said so. Verdict: no blocking findings. It raised three low findings (overflow message, exponent display for results of 1e21 or more, binary rounding on exact half-cent ties) and noted the widget showed `$300.00` where the brief said CAD300.00.
- **GLM (frontend):** reviewed source only and made no claim of seeing a rendering. Verdict: no blocking findings. Suggestions were grey contrast, redundant `aria-live` on alert paragraphs, and non-standard font weight 650.

## Coordinator changes after the reviews

Intl currency formatting (`en-CA`, CAD, two decimals), clear overflow error text, higher-contrast greys, standard font weights and removal of the redundant `aria-live`. After that the obsolete Calculate button was removed. Totals update on every input, and Reset to defaults remains.

## Checks (real Edge via Playwright)

- Earlier run: defaults 4 / 30 / 150 = $300.00; 60 minutes = $600.00; zero duration = $0.00; fractional attendees rejected without NaN; 390 px layout.
- Re-run on this backup page (2026-11-10): banner visible, no Calculate button, Reset to defaults present and working, $300.00, then $600.00 at 60 minutes, 390 px with no horizontal scroll, zero network requests. Script: `work/demo-delivery/check-backup.mjs`.
- Not checked: the half-cent and overflow messages, because the calculation and message code was not changed for this backup.

## Open it offline

Double-click `index.html` in this folder, or run from the repository root in PowerShell:

```
Start-Process (Resolve-Path ./outputs/backup/index.html)
```

Say out loud that it is the completed earlier run.
