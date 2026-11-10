# Presenter guide: Model routing in Codex

**Target: 5:30.** Six timed slides, one untimed appendix. Follow the spoken script in the deck or in [Speaker notes](speaker-notes.md).

| Time | Slide | What to do |
|---|---|---|
| 0:00–0:45 | Model routing | Start with the problem of using models from different subscriptions without splitting the workflow. Paste the demo prompt into Codex and keep that window alongside the deck. |
| 0:45–1:35 | The solution: keep Codex | Walk one request through the local proxy. Explain the OpenCode choice here. |
| 1:35–2:30 | Two ways to use another model | Explain when to switch the lead model and when to delegate a focused job. |
| 2:30–3:05 | Making better use of your subscriptions | Explain how assigning routine work to suitable routes preserves premium capacity. Cover limits, fallback and pooling as secondary use cases. |
| 3:05–4:45 | Demo: one build, two reviews | Show the draft, both reviews, the coordinator’s decisions, the changes applied, and the offline browser check. |
| 4:45–5:30 | Many models, one workflow | Show the question, the answer and the one next step. Use the appendix only if asked. |

## Before the talk

- Open the PowerPoint, a Codex chat rooted in the project or kit folder, the OpenCodeX dashboard, and the [labelled offline backup](../demo/backup/index.html).
- Use the [prepared prompt](../prompts/demo-prompt.txt) from the same project folder you’ll use in the talk. Keep Codex and the foreground tool output visible. The project skill handles both stages and the coordinator’s decisions between them. GPT-6.1 Sol coordinates the live demo and coordinated the backup run, but the coordinator can be any model. To run without OpenAI usage, select Claude Opus in Codex and use the [Opus prompt](../prompts/demo-prompt-opus.txt). To inspect the plan without sending model requests, run `powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode Preview`.
- Read the [backup notes](../demo/backup/README.md) beforehand. They explain how the backup was made.

## The demo (slide 5, about 100 seconds)

1. Point to the build and two review branches on slide 5, then show Providers or Logs in OpenCodeX for about 10 seconds. Keep account identifiers and credentials off screen.
2. Show that both reviewers received the fresh draft, and that Z.ai also received Edge renderings of it (`demo/live/draft-desktop.png`). Point to a coordinator decision and an applied change in `demo/live/revision-notes.md`. MiniMax receives only the accepted changes and the draft check. A direct routed worker does not appear as a native Codex subagent.
3. If the revised app has passed the browser check, briefly show it. If the run is still going or failed, open the offline backup and say: “This is the calculator from an earlier run.” Return to the conclusion by 4:45.

Show the routed handoffs. There’s no need to trigger a quota failure live.
