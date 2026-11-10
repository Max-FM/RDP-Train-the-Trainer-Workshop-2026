# Model routing in Codex

Start with the [PowerPoint](outputs/model-routing-demo-context.pptx). It includes the timed speaker notes. The talk targets 5:30, followed by an untimed production appendix.

- `outputs/routing-presenter-guide.md`: setup, timing, and the brief demonstration.
- `outputs/routing-speaker-notes.md`: the script and product sources.
- `outputs/demo-prompt.txt`: the prepared prompt for a single background launch.
- `outputs/backup/index.html`: the labelled earlier run. Open it directly in a browser.
- `outputs/diagrams/`: three editable draw.io files.

At the opening, paste the prepared prompt into Codex or run `powershell.exe -NoProfile -NonInteractive -File outputs/demo-runner/demo.ps1`. The launcher returns immediately. The runner checks the proxy routes, replaces the previous live build, preserves the existing backup (or creates it if missing), and checks the fresh MiniMax build in Edge. The two reviewers check the same fixed example. No input is needed after launch.

## Verify the demo locally

Open the offline backup directly, or run the automated check from the repository root with Codex's bundled runtime and Microsoft Edge:

```powershell
powershell.exe -NoProfile -NonInteractive -File outputs/demo-runner/demo.ps1 -Mode CheckBackup
```

The check blocks network requests from the widget. To inspect the exact demo batch without sending anything, use `-Mode Preview`. The launcher reads the bundled runtime path from the local `outputs/demo-runner/local-runtime.json` when configured. In a fresh checkout, pass `-NodeExecutable` with the full Node path from Codex workspace dependencies. No separate Node.js or npm install is needed.
