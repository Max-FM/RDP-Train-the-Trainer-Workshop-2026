# Model routing in Codex: speaker notes

**Target: 5:30.** Six timed slides, plus one untimed appendix.

## 0:00–0:45 — Model routing

**Action:** Ask the opening question. After stating the problem, submit the prepared prompt in a preloaded Codex window if doing it live. Immediately return to the deck; save the walkthrough for slide 5.

Say I want one model to build a small feature and two other models to review it. I already have access to all three, but through different subscriptions. If I open a separate app for each model, I have to repeat the brief, move the files around, and stitch the answers together. I want those models to contribute to one task in Codex. How do I choose which model handles each job and keep the results in one place?

## 0:45–1:35 — The solution: keep Codex

**Action:** Follow the diagram from Codex to the proxy to the provider. Mention OpenCode here once.

I keep working in Codex and install OpenCodeX as a local proxy. When I select a model, the configured model request goes from Codex to the proxy on my machine. The proxy sends it to the configured provider and returns the reply. The route can use a subscription login or an API key, depending on the provider. That choice determines which allowance or bill the request uses. OpenCode also connects to multiple providers, but it’s its own coding environment. I chose OpenCodeX because I wanted to keep the Codex app and the plugins I already use.

- https://opencodex.me/getting-started/how-it-works/
- https://opencodex.me/guides/model-routing/
- https://opencodex.me/guides/providers/
- https://opencode.ai/docs/
- https://opencode.ai/docs/plugins/

## 1:35–2:30 — Two ways to use another model

**Action:** Use the two columns to explain what changes when you switch versus when you delegate.

There are two ways to use another model. The first is to switch. I stay in the same task and choose which model handles my next request, for example when I move from drafting to a harder question. The second is to delegate. The main agent stays in charge and gives another model a specific job, like checking a decision I’ve already made. That worker gets a brief and the context it needs, then reports back. In both cases I keep the same workspace.

- https://opencodex.me/guides/sub-agent-surface/
- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://opencodex.me/guides/model-routing/

## 2:30–3:05 — Making better use of your subscriptions

**Action:** Lead with spreading routine work across existing subscriptions. Treat usage limits, fallback and pooling as secondary use cases.

Once I can assign models by job, I can make better use of the plans I already have. Routine work can go to a lower-cost route, which saves premium capacity for harder tasks. If a route runs low, I can switch to another, or let a configured fallback take over. OpenCodeX can also pool eligible accounts, but each account keeps its own limits. I still check the costs.

- https://opencodex.me/guides/web-dashboard/#codex-auth-and-account-pools
- https://opencodex.me/guides/claude-code/#claude-oauth-account-pool-experimental
- https://opencodex.me/guides/providers/#claude-code-cli-subscription
- https://opencodex.me/guides/combos/
- https://opencodex.me/guides/codex-app-models/#native-quota-fallback-limitation

## 3:05–4:45 — Demo: one build, two reviews

**Action:** Show the draft, both reviews, the coordinator’s decisions, MiniMax’s changes and the offline browser check (Edge). Briefly show Providers or Logs in OpenCodeX. If the run is still going, open the backup. Return to the deck by 4:45.

Here’s that delegation pattern. MiniMax builds from a short brief. Claude checks the logic and Z.ai suggests visual improvements to that same draft. In the same Codex session, the coordinator decides which findings apply and sends those changes back to MiniMax. An offline browser check then verifies the revised app. In OpenCodeX, the logs show which route handled each request. If the run is still going, I’ll show the calculator from an earlier run.

- https://opencodex.me/guides/web-dashboard/
- https://opencodex.me/guides/sub-agent-surface/

## 4:45–5:30 — Many models, one workflow

**Action:** Return to the final slide. Answer the opening question, then pause for questions. Appendix only if asked.

Back to the question: how do you build and review with different models without moving the work between apps? Keep the task in Codex, send each job to the model that suits it, and let the coordinator decide which findings to apply. You just saw that with a build, two reviews and a verified fix. Your next step: pick one small task, give the build to one model and the review to another, and decide what to apply.

- https://opencodex.me/guides/model-routing/
- https://opencodex.me/guides/web-dashboard/#codex-auth-and-account-pools
- https://opencodex.me/guides/sub-agent-surface/

## Q&A

- **Does pooling combine quotas into one balance?** No. It selects among eligible accounts; each account still has its own limits. Accounts can also share an organization limit.
- **Is a Claude API key the same as a Claude subscription?** No. The routes use different credentials and billing. OpenCodeX documents experimental OAuth pooling for Claude Code and a separate single-login Claude CLI subscription route.
- **Will it always switch after a limit?** No. The route must be available and the request must reach the proxy. A combo has to be configured and applies only to eligible failures. Codex Desktop can lock the picker in native reserve mode.
- **Do providers share the chat?** Codex passes the relevant brief, files or findings to each worker. Each worker has its own context and reports back to the coordinator.

## Untimed appendix

Use only if asked. Slide 7 shows how the lesson was produced: Codex coordinated and called four plugins, a project skill and AGENTS.md kept each run consistent, and the models went through OpenCodeX. GPT-6.1 Sol coordinated first, until usage limits ran out, and then Claude Opus, Sonnet and Haiku took over, matched to task complexity. MiniMax built, and Claude Sonnet and Z.ai reviewed. The coordinator ran on different models without any change to the workflow.





Spoken script: 479 words, plus demo actions and pauses.
