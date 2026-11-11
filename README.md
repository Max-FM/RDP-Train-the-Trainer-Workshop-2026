# Model routing in Codex

A six-minute train-the-trainer session on using models from several providers and subscriptions in one Codex workflow, with a live demo. Codex coordinates the work, OpenCodex routes each request to the right provider, and three outside models build and review a small fictional app while the audience watches.

## What's here

| Path | What it is |
|---|---|
| [presentation/model-routing.pptx](presentation/model-routing.pptx) | The deck: seven timed slides (1–6 and 8, 6:00 total) and optional background on slide 7 |
| [presentation/presenter-guide.md](presentation/presenter-guide.md) | Timing, setup, and the two-minute demo walkthrough |
| [presentation/speaker-notes.md](presentation/speaker-notes.md) | The spoken script, with sources |
| [prompts/](prompts) | Prompts to paste into Codex to start the live demo |
| [demo/backup/](demo/backup) | A finished calculator from an earlier run, for use if the live demo stalls |
| [presentation/diagrams/](presentation/diagrams) | Editable draw.io diagrams used in the deck |
| [docs/](docs) | Technical documentation for the demo runner |

## Run the live demo

Open this folder in Codex with OpenCodex running locally, then paste one of the prompts:

- [prompts/demo-prompt.txt](prompts/demo-prompt.txt) runs the demo with the session's current model as coordinator.
- [prompts/demo-prompt-opus.txt](prompts/demo-prompt-opus.txt) runs it with Claude Opus 5.5 as coordinator and no OpenAI usage. Select `anthropic-apikey/claude-opus-5-5` in the Codex model picker before pasting.

You can also ask Codex to run `$workshop-live-demo`. A full run takes a few minutes. MiniMax builds a calculator from scratch, Claude Sonnet reviews the source, Z.ai reviews the source and Edge renderings, the coordinator decides which findings to apply, MiniMax revises, and Edge checks the result offline before it is published to `demo/live/index.html`. If anything fails, show the [backup](demo/backup/index.html) and say it's from an earlier run.

## Requirements

- The Codex desktop app on Windows. The demo uses the Node.js and Playwright runtime bundled with Codex, so no separate Node.js or npm install is needed.
- [OpenCodex](https://opencodex.me) running at `http://127.0.0.1:10100` with MiniMax, Anthropic, and Z.ai routes configured.
- Microsoft Edge, for the offline browser checks.

To check the setup without calling any model:

```powershell
powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode Preview
powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode CheckBackup
```

In a fresh checkout, add `-NodeExecutable <path>` with the bundled Node path from Codex's workspace dependencies, or save it in `demo/runner/local-runtime.json` (ignored by Git).

## Documentation

- [Architecture](docs/architecture.md): how the coordinator, proxy, and models fit together, and what each model receives.
- [Demo runner](docs/demo-runner.md): commands, stages, files, model settings, and failure handling.
- [Testing](docs/testing.md): the offline regression test and what it covers.

Agent instructions for this repository are in [AGENTS.md](AGENTS.md), and the demo runbook Codex follows is the [workshop-live-demo skill](.agents/skills/workshop-live-demo/SKILL.md).
