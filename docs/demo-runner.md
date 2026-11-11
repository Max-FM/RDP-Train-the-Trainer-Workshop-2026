# Demo runner

The runner lives in `demo/runner/`. Codex normally drives it through the [workshop-live-demo skill](../.agents/skills/workshop-live-demo/SKILL.md), but each stage can also be run by hand from the repository root.

## Files

| File | Purpose |
|---|---|
| `demo.ps1` | PowerShell launcher. Finds the bundled Node.js, checks the runner version, and starts a stage in the foreground. |
| `run.mjs` | The runner: route preflight, model requests, reply validation, file writes, and the publication gate. |
| `tasks.json` | Model IDs, reasoning effort, output caps, and the brief or review prompt for each route. `run.mjs` refuses to run if these differ from its own route table. |
| `check.mjs` | Offline Edge check of one HTML file using the bundled Playwright. |
| `render.mjs` | Offline Edge rendering of the draft to desktop (1280px) and mobile (390px) PNGs in `demo/live/`. |
| `local-runtime.json` | Optional, ignored by Git. Stores `nodeExecutable` and `nodeModules` paths for this machine. |

## Commands

```powershell
# Show the route plan and prompt templates. Sends nothing.
powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode Preview

# Check the backup page offline. Sends nothing.
powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode CheckBackup

# Stage 1: build and review. Prints "Ready for coordinator: <run-id>".
powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode Prepare

# Stage 2: after demo/live/coordination.json is written.
powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode Revise -RunId <run-id>
```

Add `-NodeExecutable <path>` if `local-runtime.json` isn't set up.

## Stages

**Prepare** checks Edge against the backup and confirms that OpenCodex lists all three model IDs and image input for the Z.ai model. Only then does it clear the previous generated files. It asks MiniMax for a fresh draft. Claude reviews the source, Edge checks the draft and renders it at 1280px and 390px, and Z.ai reviews the same source together with both renderings. It ends by recording file hashes in `review-ready.json`. If either preflight fails, no model is called and earlier files stay in place.

**Coordinator decision.** The coordinator reads the draft, both reviews, and `draft-check.json`, then writes `coordination.json`:

```json
{
  "runId": "<run ID from review-ready.json>",
  "decisions": [
    {"source": "correctness", "finding": "...", "disposition": "apply", "rationale": "..."},
    {"source": "frontend", "finding": "...", "disposition": "skip", "rationale": "..."}
  ]
}
```

The runner requires at least one decision for each reviewer, and an applied `browser` decision if the draft check failed. Findings and rationales must each be under 500 characters.

**Revise** confirms the run ID is the latest attempt and that the draft and reviews are unchanged. It sends MiniMax only the applied findings and the draft check result. If MiniMax's reply can't be parsed, or the revised app fails Edge, the runner sends MiniMax the exact problem once for a repair. The app is published to `index.html` only if the final check passes. Each run can be revised once.

## Model settings

| Route | Model | Effort | Output cap |
|---|---|---|---|
| Build, revision, repair | `minimax/MiniMax-M3` | low | 32,000 |
| Correctness review | `anthropic/claude-sonnet-5-5` | high | 64,000 |
| Visual design review | `zai/glm-5.3` | high | 64,000 |

Reasoning tokens count against the output cap, so the high-effort reviewers get more room. Each request times out after 210 seconds. OpenCodex's own provider timeout is 200 seconds, so a slow request fails with the proxy's error first.

## Run files

All files are written to `demo/live/`, which is ignored by Git.

| File | Written by | Contents |
|---|---|---|
| `run-attempt.json` | Prepare | ID of the latest run; older runs can't be revised |
| `draft.html`, `build-trace.json` | Prepare | MiniMax's draft and its request/response trace |
| `correctness.md`, `frontend.md` and traces | Prepare | The two reviews |
| `draft-check.json` | Prepare | Edge result for the draft |
| `draft-desktop.png`, `draft-mobile.png` | Prepare | Edge renderings of the draft, the same images Z.ai received. The Z.ai trace records their hashes, not the image data. |
| `review-ready.json` | Prepare | Run ID and hashes of the evidence |
| `coordination.json` | Coordinator | Apply and skip decisions |
| `revised.html`, `revision-trace.json`, `revised-check.json` | Revise | MiniMax's revision and its first check |
| `repaired.html`, `repair-trace.json` | Revise | Present only if a repair was needed |
| `revision-notes.md` | Revise | Decisions, MiniMax's change report, and any repair |
| `live-check.json`, `index.html` | Revise | Final check result and the published app |

## Troubleshooting

| Message | Meaning |
|---|---|
| `Proxy catalog does not list image input for ...` | The Z.ai route can't take images, so the visual review would run blind. No model was called. |
| `Rendering the draft in Edge failed` | Edge couldn't render the draft. The Z.ai review is skipped and Prepare stops. Use the backup. |
| `Backup/browser preflight failed` | Edge or the bundled Playwright isn't available. No model was called. |
| `Proxy catalog is missing ...` | OpenCodex isn't running or lacks a route. No model was called. |
| `A newer Prepare attempt superseded this run` | Revise was given an old run ID. Start a new run. |
| `This run already attempted its revision stage` | Each run revises once. Start a new run. |
| `A job is already active or its lock needs inspection` | `demo/live/.runner.lock` exists. Remove it only after confirming no runner process is active. |
| `Revised app did not pass Edge` | The revision and its one repair both failed. Use the backup. |
