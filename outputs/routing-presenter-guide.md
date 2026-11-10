# Presenter guide: Model routing in Codex

**Target: 5:30.** Six timed slides, one untimed appendix. Follow the spoken script in the deck or in [Speaker notes](routing-speaker-notes.md).

| Time | Slide | What to do |
|---|---|---|
| 0:00–0:45 | Model routing | Start with the problem of using models from different subscriptions without splitting the workflow. Launch the approved background job and return immediately to the deck. |
| 0:45–1:35 | The solution: keep Codex | Walk one request through the local proxy. Explain the OpenCode choice here. |
| 1:35–2:45 | Two ways to use another model | Explain when to switch the lead model and when to delegate a focused job. |
| 2:45–3:55 | Making better use of your subscriptions | Explain how assigning routine work to suitable routes preserves premium capacity. Cover limits, fallback and pooling as secondary use cases. |
| 3:55–4:45 | Demo: one build, two reviews | Use the diagram to introduce the three assignments. Show the dashboard briefly, then the returned findings. The widget is quick evidence that the work came back together. |
| 4:45–5:30 | Keep the work in one place | Answer the opening question and conclude. Use the appendix only if asked. |

## Before the talk

- Open the PowerPoint, a Codex chat rooted in the project or kit folder, the OpenCodeX dashboard, and the [labelled offline backup](backup/index.html).
- Follow the [prepared prompt](demo-prompt.txt). Run `node outputs/demo-runner/run.mjs preview background` from the same project folder you’ll use in the talk. If it only lists `build` and `reviews`, that folder has the old runner. Verify the model destinations in OpenCodeX and approve the three full requests together before presenting. Keep the one-use launch command printed by that preview. The runner removes only generated live results and leaves the existing offline backup alone. Before launch, make sure Playwright and Edge are available for the automatic browser check.
- Keep the [earlier-run record](backup/run-record.md) open with the backup. It records what each provider did during preparation.

## The 50-second demo

1. Point to the build and two review branches on slide 5, then show Providers or Logs in OpenCodeX for about 10 seconds. Keep account identifiers and credentials off screen.
2. Show which routes handled the build and two reviews, and where the results came back. Say that MiniMax built a fresh widget and both reviewers checked a fixed example. This made it possible to approve all three exact requests before the talk. A direct routed worker does not appear as a native Codex subagent.
3. If the live build has passed the browser check, briefly show it. Otherwise open the offline backup and say: “This is the calculator from an earlier run.” Return to the conclusion by 4:45.

Show the routed handoffs. There’s no need to trigger a quota failure live.
