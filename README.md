# Model routing in Codex

Start with the [PowerPoint](outputs/model-routing-demo-context.pptx). It includes the timed speaker notes. The talk targets 5:30, followed by an untimed production appendix.

- `outputs/routing-presenter-guide.md`: setup, timing, and the brief demonstration.
- `outputs/routing-speaker-notes.md`: the script and product sources.
- `outputs/demo-prompt.txt`: the existing prepared prompt.
- `outputs/backup/index.html`: the labelled earlier run. Open it directly in a browser.
- `outputs/diagrams/`: three editable draw.io files.

Keep the folder structure intact if you use the demo runner. Preview the exact requests before intentionally starting a live run. The demo runs after the explanation; launch the build quietly after the opening if you want it to run in the background.

## Verify the demo locally

Open the offline backup directly, or run the automated check from the repository root with Node.js and Microsoft Edge installed:

```sh
npm install --no-save --package-lock=false playwright
node outputs/demo-runner/check.mjs outputs/backup/index.html
```

The check blocks network requests from the widget. To inspect the live build request without sending it, run `node outputs/demo-runner/run.mjs preview build`.
