# Existing tools for model routing and agent workflows

Research checked on 10 November 2026 against the projects' own documentation. The talk teaches model routing through a proxy server. This optional reference separates routing tools from agent workflow frameworks for follow-up questions. It is a documentation comparison, not a hands-on evaluation or a recommendation to migrate. The working demo stays as it is.

## Why we chose this setup

We used Codex and OpenCodex because those were the tools we knew existed and already used. Keeping the Codex application and its plugins was useful. We did not compare all available products before choosing this setup, and familiarity does not establish that it is the best or only option.

## Three different jobs

| Job | What it controls | Examples |
|---|---|---|
| Coding environment | Conversation, workspace, tools and agent sessions | Codex, OpenCode |
| Routing and credentials | Destination model, provider connection and the credentials used for a request | OpenCodex, CLIProxyAPI, LiteLLM, OpenRouter |
| Workflow orchestration | Task order, what each worker receives, feedback, revision and acceptance | Our demo runner, CrewAI, LangGraph |

These categories describe the roles relevant to this workshop. Products can cover more than one role, and a framework can use a proxy underneath it. They are not all interchangeable competitors.

## The closest existing capabilities

### OpenCodex already supports cross-model subagents

OpenCodex exposes model selection through Codex's collaboration tools. Its v1 surface allows a spawn to select another model directly. It also documents configurable worker fallback chains. The main agent still decides when and what to delegate. A custom runner is therefore unnecessary just to call another model from Codex. [Subagent documentation](https://opencodex.me/guides/sub-agent-surface/)

Our runner uses explicit model requests through the proxy rather than native Codex worker sessions. We fix the stages and give each call a narrow input. The outer Codex session remains responsible for accepting or rejecting findings. This is a particular implementation of delegation, not a capability we added to OpenCodex itself.

### OpenCode: a coding environment with configurable workers

OpenCode defines primary agents and subagents with their own prompts, model preferences and permissions. Its documentation includes a read-only code-review agent. It can supply the coding environment and delegation layer together. [Agent documentation](https://opencode.ai/docs/agents/)

Its provider documentation covers account connections, compatible endpoints and ChatGPT-plan sign-in. Moving to it would mean configuring and using its environment. Our reason for staying with Codex was familiarity, rather than a demonstrated capability gap in OpenCode. [Provider documentation](https://opencode.ai/docs/providers/)

### CLIProxyAPI: a close alternative at the proxy layer

CLIProxyAPI documents compatible endpoints for multiple model providers, OAuth access for Codex and Claude Code, multimodal requests, and round-robin selection across accounts. It is a concrete counterexample to any claim that only OpenCodex can expose multiple subscription-backed routes to a client. [Project README, Overview](https://github.com/router-for-me/CLIProxyAPI#overview)

Replacing OpenCodex with it would require checking client integration, credential handling, exact model identifiers and multimodal compatibility. Its advertised proxy capabilities alone do not reproduce our application-specific review and browser-check sequence. That distinction is our assessment of the documented scope, not a migration test.

### LiteLLM: routing, gateway controls and documented subscription connections

LiteLLM's request architecture includes credential and budget checks, rate limiting, load balancing, retries, fallbacks and provider translation. It overlaps with routing and logging code that applications often build themselves. [Request architecture](https://docs.litellm.ai/docs/proxy/architecture)

It also documents subscription connections for Codex, Claude and GitHub Copilot, so describing it as API-key-only would be inaccurate. [Subscription overview](https://docs.litellm.ai/docs/subscriptions)

There are important boundaries. In the Claude Code setup, the client keeps and refreshes its login, and LiteLLM forwards the caller's subscription token on supported direct Anthropic routes. Other deployments use their own credentials. This is not evidence that any subscription can fund any provider's model. [Claude subscription setup](https://docs.litellm.ai/docs/tutorials/claude_code_max_subscription)

### OpenRouter: hosted model access and API-key routing

OpenRouter offers a unified hosted API with credits and provider routing. It also documents bringing provider API keys and configuring key priority and shared-capacity fallback. [FAQ](https://openrouter.ai/docs/faq), [BYOK](https://openrouter.ai/docs/guides/overview/auth/byok)

Those documented mechanisms address API access and billing. They should not be presented as equivalent to combining existing ChatGPT and Claude consumer-plan allowances. OpenRouter also does not define our calculator's review sequence merely by routing its requests.

### CrewAI: manager and worker orchestration

CrewAI supports sequential processes and hierarchical processes. In hierarchical mode, a manager model or custom manager agent assigns work, reviews outputs and assesses completion. That directly overlaps with the coordinator-and-reviewers pattern we implemented. [Processes](https://docs.crewai.com/en/concepts/processes)

CrewAI also documents multiple model providers and custom compatible endpoints. It could express a similar set of roles without us writing all of the orchestration primitives. We would still have to supply the calculator requirements, screenshot operation, feedback policy and acceptance tests. Compatibility with our precise proxy routes would need testing. [Model configuration](https://docs.crewai.com/en/concepts/llms)

### LangGraph: the closest documented pattern to our fixed feedback loop

LangGraph distinguishes predetermined workflows from agents that choose their own process. It documents parallel workers, orchestrator/worker patterns and an evaluator/optimizer loop in which feedback returns to the generator. It also provides persistence and streaming. Our build, parallel reviews, decision and revision stages closely match these patterns. [Workflows and agents](https://docs.langchain.com/oss/javascript/langgraph/workflows-agents)

Using LangGraph would move state transitions and branching onto a general framework. We would still implement our screenshot capture, artifact rules, model configuration and Edge assertions. This is a likely design fit inferred from its documented patterns, not a tested replacement for this repository.

## Did we reinvent the wheel?

We reimplemented a small set of established workflow mechanisms: parallel model calls, structured handoffs, stored state, review decisions and a bounded repair loop. Existing frameworks can provide those building blocks. We should not claim that model routing or manager/worker collaboration is a new invention.

Our repository adds the application-specific policy and evidence for this workshop:

| Runner responsibility | What remains specific even with an existing framework |
|---|---|
| Fresh build | Which live artifacts can be replaced and which backup must be preserved |
| Focused reviews | The same source for both reviewers, plus exact draft renderings for the visual reviewer |
| Feedback decisions | Which findings the coordinator accepts, with a rationale for each |
| Revision and repair | Only accepted findings go to the builder, with one bounded repair attempt |
| Final verification | Our calculator assertions, offline browser configuration and publication gate |
| Evidence | Requested/response model IDs, image hashes and decisions saved for the audience |

This is useful demo plumbing. It required more code than basic cross-model delegation alone. Calling it a small workshop workflow describes its contribution accurately.

## What would justify evaluating another tool later?

These are investigation criteria, not migration recommendations:

- For everyday coding with configurable model-specific workers, compare OpenCode with Codex plus OpenCodex.
- For multiple account-backed routes, compare OpenCodex with CLIProxyAPI and the documented LiteLLM client integrations.
- For a shared gateway with access controls and operational accounting, examine LiteLLM's deployment requirements.
- For an explicit, reusable feedback workflow, assess LangGraph's state and branching model.
- For manager-led role assignment, assess CrewAI's hierarchical process.
- For hosted API access and centralised API billing, examine OpenRouter's credits and BYOK behaviour.

Check the exact client, route, credential type, tools, image handling, failure behaviour and applicable account rules. A compatible request format does not establish identical behaviour. No alternative was installed or tested for this comparison.

## How to explain this in the talk

Slide 2 briefly names other routing options, gives the actual selection reason and explains one request through the proxy. Keep workflow frameworks and implementation details in this document for Q&A. The spoken script is in [speaker-notes.md](../presentation/speaker-notes.md).

If asked about reinvention: “Existing tools already support this. The lesson is how a proxy lets us use different models within one workflow. The calculator gives us a concrete example to follow.”
