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

## 1:35–2:45 — Two ways to use another model

**Action:** Use the two columns to explain what changes when you switch versus when you delegate.

There are two ways to use another model. The first is to switch. I stay in the same task and choose which model handles my next request. I might switch when I move from drafting to a harder question and want a different model to take the lead. The second is to delegate. The main agent stays in charge and gives another model a specific job, like checking a decision I’ve already made. That worker gets a brief and the context it needs, then reports back. The coordinator can also give two workers independent assignments at the same time. In both cases I keep the same workspace. The difference is whether I’m choosing who handles the next turn or adding a worker to do one part of the task.

- https://opencodex.me/guides/sub-agent-surface/
- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://opencodex.me/guides/model-routing/

## 2:45–3:55 — Making better use of your subscriptions

**Action:** Lead with spreading routine work across existing subscriptions. Treat usage limits, fallback and pooling as secondary use cases.

Once I can assign models by job, I can also make better use of the plans I already have. If a lower-cost route can handle routine work, I can save premium capacity for harder tasks. That may help me avoid upgrading one subscription to cover everything. I still check the costs, especially if a route bills API usage separately. If a route runs low, I can switch to another with available usage. A configured fallback can try the next eligible route on certain failures. Pooling is another option: Codex Pool mode can select another eligible Codex account, and there’s a separate experimental pool for eligible Claude Code workflows. The key is that each route still has its own account and limits.

- https://opencodex.me/guides/web-dashboard/#codex-auth-and-account-pools
- https://opencodex.me/guides/claude-code/#claude-oauth-account-pool-experimental
- https://opencodex.me/guides/providers/#claude-code-cli-subscription
- https://opencodex.me/guides/combos/
- https://opencodex.me/guides/codex-app-models/#native-quota-fallback-limitation

## 3:55–4:45 — Demo: one build, two reviews

**Action:** Point to the build and review branches, then briefly show Providers or Logs in OpenCodeX. Show which routes ran and where the findings came back. Use the labelled earlier run if needed. Return to the deck by 4:45.

Here’s that delegation pattern. MiniMax builds from a short brief. For this background run, Claude checks the logic and Z.ai reviews the interface of the same fixed example. The three routes run from one launch. Here’s where I can see the routes in OpenCodeX, and here’s where the results came back. If the live run is still going, I’ll show the earlier run, where the reviewers checked the actual build.

- https://opencodex.me/guides/web-dashboard/
- https://opencodex.me/guides/sub-agent-surface/

## 4:45–5:30 — Keep the work in one place

**Action:** Return to the final slide. Answer the opening question, then pause for questions. Appendix only if asked.

So, can those models work together without splitting the project? Yes. Keep the plan and files in Codex, assign each job to a model you already have access to, and have the coordinator bring the results back. Spreading routine work across plans can preserve premium capacity, but the reason I use this setup is that the workflow stays together. If you try it, start with one build and one independent review.

- https://opencodex.me/guides/model-routing/
- https://opencodex.me/guides/web-dashboard/#codex-auth-and-account-pools
- https://opencodex.me/guides/sub-agent-surface/

## Q&A

- **Does pooling combine quotas into one balance?** No. It selects among eligible accounts; each account still has its own limits. Accounts can also share an organization limit.
- **Is a Claude API key the same as a Claude subscription?** No. The routes use different credentials and billing. OpenCodeX documents experimental OAuth pooling for Claude Code and a separate single-login Claude CLI subscription route.
- **Will it always switch after a limit?** No. The route must be available and the request must reach the proxy. A combo has to be configured and applies only to eligible failures. Codex Desktop can lock the picker in native reserve mode.
- **Do providers share the chat?** Codex passes the relevant brief, files or findings to each worker. Each worker has its own context and reports back to the coordinator.

## Untimed appendix

Use only if asked. The architecture diagram records the workflow used to prepare the lesson and demo. The Z.ai slide review applies to the previous version.

Spoken script: 563 words, plus demo actions and pauses.
