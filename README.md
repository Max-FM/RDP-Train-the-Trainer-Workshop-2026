# Model routing in Codex

Start with the [PowerPoint](outputs/model-routing-demo-context.pptx). It includes the timed speaker notes. The talk targets 5:30, followed by an untimed production appendix.
For the current GPT decision and revision loop, use the standalone [speaker notes](outputs/routing-speaker-notes.md) and presenter guide. The slide 5 diagram shows the initial build and reviews.

- `outputs/routing-presenter-guide.md`: setup, timing, and the brief demonstration.
- `outputs/routing-speaker-notes.md`: the script and product sources.
- `outputs/demo-prompt.txt`: the prepared prompt for the foreground demo.
- `outputs/backup/index.html`: the labelled earlier run. Open it directly in a browser.
- `outputs/diagrams/`: three editable draw.io files.

Open the project in Codex and paste the prepared prompt, or ask it to run `$workshop-live-demo`. [AGENTS.md](AGENTS.md) sets the project scope; the [skill](.agents/skills/workshop-live-demo/SKILL.md) owns the runbook. MiniMax builds a fresh draft; Claude and Z.ai review it while Edge checks it. GPT evaluates the findings, records what to apply or skip, and sends accepted changes to MiniMax. Edge verifies the result before it becomes the live app. The existing backup stays in place. The project also provides an optional `workshop_evidence_reviewer` Codex agent for read-only checks outside the live run.

## Verify the demo locally

Open the offline backup directly, or run the automated check from the repository root with Codex's bundled runtime and Microsoft Edge:

```powershell
powershell.exe -NoProfile -NonInteractive -File outputs/demo-runner/demo.ps1 -Mode CheckBackup
```

The check blocks other requests from the widget. To inspect the route plan and message templates without sending anything, use `-Mode Preview`. The launcher reads the bundled runtime path from the local `outputs/demo-runner/local-runtime.json` when configured. In a fresh checkout, pass `-NodeExecutable` with the full Node path from Codex workspace dependencies. No separate Node.js or npm install is needed.

For a regression check after changing the runner, run `tests/mock-demo.test.mjs` with the Codex bundled Node executable. It exercises the foreground stages with fake provider responses and real Edge, including a revision that must be withheld.
