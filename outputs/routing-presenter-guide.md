# Presenter guide: Model routing in Codex

**Target: 5:30.** Six timed slides, one untimed appendix. Follow the spoken script in the deck or in [Speaker notes](routing-speaker-notes.md).

| Time | Slide | What to do |
|---|---|---|
| 0:00–0:45 | Model routing | Start with the problem of using models from different subscriptions without splitting the workflow. Launch in a visible terminal and keep it alongside the deck. |
| 0:45–1:35 | The solution: keep Codex | Walk one request through the local proxy. Explain the OpenCode choice here. |
| 1:35–2:45 | Two ways to use another model | Explain when to switch the lead model and when to delegate a focused job. |
| 2:45–3:55 | Making better use of your subscriptions | Explain how assigning routine work to suitable routes preserves premium capacity. Cover limits, fallback and pooling as secondary use cases. |
| 3:55–4:45 | Demo: one build, two reviews | Show the draft, both reviews, GPT’s decisions, the changes applied, and the final Edge check. |
| 4:45–5:30 | Keep the work in one place | Answer the opening question and conclude. Use the appendix only if asked. |

## Before the talk

- Open the PowerPoint, a Codex chat rooted in the project or kit folder, the OpenCodeX dashboard, and the [labelled offline backup](backup/index.html).
- Use the [prepared prompt](demo-prompt.txt) from the same project folder you’ll use in the talk. Keep Codex and the foreground tool output visible. The project skill handles both stages and GPT’s decisions between them. To inspect the plan without sending model requests, run `powershell.exe -NoProfile -NonInteractive -File outputs/demo-runner/demo.ps1 -Mode Preview`.
- Keep the [earlier-run record](backup/run-record.md) open with the backup. It records what each provider did during preparation.

## The 50-second demo

1. Point to the build and two review branches on slide 5, then show Providers or Logs in OpenCodeX for about 10 seconds. Keep account identifiers and credentials off screen.
2. Show that both reviewers received the fresh draft. Point to a GPT decision and an applied change in `live-demo/revision-notes.md`. MiniMax receives only the accepted changes and the draft check. A direct routed worker does not appear as a native Codex subagent.
3. If the revised app has passed the browser check, briefly show it. If the run is still going or failed, open the offline backup and say: “This is the calculator from an earlier run.” Return to the conclusion by 4:45.

Show the routed handoffs. There’s no need to trigger a quota failure live.
