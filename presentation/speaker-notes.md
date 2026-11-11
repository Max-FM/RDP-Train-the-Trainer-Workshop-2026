# Model routing in Codex: speaker notes

**Target: 6:00.** Seven timed slides (1–6 and 8), plus optional background on slide 7.

## 0:00–0:40 — Model routing

**Action:** Ask the opening question. After stating the problem, submit the prepared prompt in a preloaded Codex window if doing it live. Immediately return to the deck; save the walkthrough for slide 6.

Say I want one model to build a small feature and two other models to review it. I already have access to all three, but through different subscriptions. If I open a separate app for each model, I have to repeat the brief, move the files around, and stitch the answers together. I want those models to contribute to one task in Codex. How do I choose which model handles each job and keep the results in one place?

## 0:40–1:10 — My chosen solution: keep Codex

**Action:** Briefly acknowledge the alternatives and the familiarity-based choice, then introduce the proxy. Trace the request on the next slide; keep the detailed comparison for Q&A.

OpenCodex was one option among tools that already existed. We picked it because we knew it and already worked in Codex. CLIProxyAPI and LiteLLM also provide routing, while OpenCode offers its own coding environment. The concept is the same: use models from different providers within one workflow. OpenCodex is our local proxy, and we keep Codex and its plugins. The next slide follows one request through that proxy.

- https://opencodex.me/getting-started/how-it-works/
- https://opencodex.me/guides/model-routing/
- https://opencodex.me/guides/sub-agent-surface/
- https://opencode.ai/docs/agents/
- https://github.com/router-for-me/CLIProxyAPI
- https://docs.litellm.ai/docs/subscriptions
- https://docs.litellm.ai/docs/proxy/architecture
- https://docs.crewai.com/en/concepts/processes
- https://docs.langchain.com/oss/javascript/langgraph/workflows-agents

## 1:10–1:55 — How the proxy routes a request

**Action:** Follow the orange request arrows, then the dashed reply path. Point out the boundary between this computer and the provider.

A model proxy sits between the application and the provider. Here, Codex sends a model request to OpenCodex on this computer. The proxy reads the model ID and context, resolves the provider and its configured credentials, and translates the request into the format that provider accepts. The provider runs the model remotely. OpenCodex then streams the reply back in the format Codex expects. Codex still coordinates the work and runs local tools. When the coordinator delegates, the worker request takes the same route with its own brief and context. The proxy routes requests; the coordinator decides which jobs to delegate.

Simplified example for a translated provider route. Native Responses routes can pass through without full protocol conversion. API-key routes and subscription logins have different billing and availability; only configured, supported credentials are used. The local proxy does not mean model inference is local.

Sources checked 11 November 2026:
https://opencodex.me/getting-started/how-it-works/
https://opencodex.me/reference/architecture/
https://opencodex.me/guides/model-routing/
https://opencodex.me/guides/sub-agent-surface/
Logos reused from the existing presentation's original assets.

## 1:55–2:40 — Two ways to use another model

**Action:** Use the two columns to explain what changes when you switch versus when you delegate.

There are two ways to use another model. The first is to switch. I stay in the same task and choose which model handles my next request, for example when I move from drafting to a harder question. The second is to delegate. The main agent stays in charge and gives another model a specific job, like checking a decision I’ve already made. That worker gets a brief and the context it needs, then reports back. In both cases I keep the same workspace.

- https://opencodex.me/guides/sub-agent-surface/
- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://opencodex.me/guides/model-routing/

## 2:40–3:15 — Making better use of your subscriptions

**Action:** Lead with spreading routine work across existing subscriptions. Treat usage limits, fallback and pooling as secondary use cases.

Once I can assign models by job, I can make better use of the plans I already have. Routine work can go to a lower-cost route, which saves premium capacity for harder tasks. If a route runs low, I can switch to another, or let a configured fallback take over. OpenCodex can also pool eligible accounts, but each account keeps its own limits. I still check the costs.

- https://opencodex.me/guides/web-dashboard/#codex-auth-and-account-pools
- https://opencodex.me/guides/claude-code/#claude-oauth-account-pool-experimental
- https://opencodex.me/guides/providers/#claude-code-cli-subscription
- https://opencodex.me/guides/combos/
- https://opencodex.me/guides/codex-app-models/#native-quota-fallback-limitation

## 3:15–5:15 — Demo: one build, two reviews

**Action:** Show the draft, both reviews, the coordinator’s decisions, MiniMax’s changes and the offline browser check (Edge). Briefly show Providers or Logs in OpenCodex. If the run is still going, open the backup. Return to the deck by 5:15.

Here’s that delegation pattern. GPT-6.1 Sol coordinates this run and coordinated the earlier one, but the coordinator can be any model you choose. MiniMax builds from a short brief. Claude checks the logic and Z.ai suggests visual improvements to that same draft. In the same Codex session, the coordinator decides which findings apply and sends those changes back to MiniMax. An offline browser check then verifies the revised app. In OpenCodex, the logs show which route handled each request. If the run is still going, I’ll show the calculator from an earlier run.

- https://opencodex.me/guides/web-dashboard/
- https://opencodex.me/guides/sub-agent-surface/

## 5:15–6:00 — Many models, one workflow

**Action:** Skip optional slide 7 and close on slide 8. Answer the opening question, then pause for questions. Show the background diagram only if asked.

Back to the question: how do you build and review with different models without moving the work between apps? Keep the task in Codex, send each job to the model that suits it, and let the coordinator decide which findings to apply. You just saw that with a build, two reviews and a verified fix. Your next step: pick one small task, give the build to one model and the review to another, and decide what to apply.

- https://opencodex.me/guides/model-routing/
- https://opencodex.me/guides/web-dashboard/#codex-auth-and-account-pools
- https://opencodex.me/guides/sub-agent-surface/

## Q&A

- **Does pooling combine quotas into one balance?** No. It selects among eligible accounts; each account still has its own limits. Accounts can also share an organization limit.
- **Is a Claude API key the same as a Claude subscription?** No. The routes use different credentials and billing. OpenCodex documents experimental OAuth pooling for Claude Code and a separate single-login Claude CLI subscription route.
- **Will it always switch after a limit?** No. The route must be available and the request must reach the proxy. A combo has to be configured and applies only to eligible failures. Codex Desktop can lock the picker in native reserve mode.
- **Do providers share the chat?** Codex passes the relevant brief, files or findings to each worker. Each worker has its own context and reports back to the coordinator.

- **Why OpenCodex rather than another tool?** We chose tools we knew and already used. CLIProxyAPI and LiteLLM also provide routing. OpenCode provides its own coding environment.
- **Do I need to build a framework to route models?** No. OpenCodex already exposes cross-model delegation in Codex. The lesson is routing requests through a proxy. See the [existing-tools research](../docs/existing-tools.md) for optional detail.

## Optional background — slide 7

Use only if asked. Slide 7 shows how the lesson was produced: Codex coordinated and called four plugins, a project skill and AGENTS.md kept each run consistent, and the models went through OpenCodex. GPT-6.1 Sol coordinated first, until usage limits ran out, and then Claude Opus, Sonnet and Haiku took over, matched to task complexity. MiniMax built, and Claude Sonnet and Z.ai reviewed. The coordinator ran on different models without any change to the workflow.





The spoken script is supported by demo actions and pauses; rehearse to the six-minute timings above.
