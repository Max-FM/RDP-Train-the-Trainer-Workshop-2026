# Model routing in Codex

Start with the [PowerPoint](outputs/model-routing-demo-context.pptx). It includes the timed speaker notes. The talk targets 5:30, followed by an untimed production appendix.

- `outputs/routing-presenter-guide.md`: setup, timing, and the brief demonstration.
- `outputs/routing-speaker-notes.md`: the script and product sources.
- `outputs/demo-prompt.txt`: the prepared prompt for a single background launch.
- `outputs/backup/index.html`: the labelled earlier run. Open it directly in a browser.
- `outputs/diagrams/`: three editable draw.io files.

Before presenting, run `node outputs/demo-runner/run.mjs preview background` and approve the three exact requests together. Keep that preview's one-use launch command. At the opening, launch once and return to the deck. The runner replaces the previous live build, preserves the existing backup (or creates it if missing), and checks the fresh MiniMax build in Edge. The two reviewers check the fixed example from the preview. To have them review the fresh build instead, use the separate build and review steps in the prompt.

## Verify the demo locally

Open the offline backup directly, or run the automated check from the repository root with Node.js and Microsoft Edge installed:

```sh
npm install --no-save --package-lock=false playwright
node outputs/demo-runner/check.mjs outputs/backup/index.html
```

The check blocks network requests from the widget. To inspect the live build request without sending it, run `node outputs/demo-runner/run.mjs preview build`.
