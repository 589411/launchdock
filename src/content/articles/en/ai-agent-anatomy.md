---
title: "Dissecting an AI Agent: Skill, Tools, Harness — Why a Good Model Isn't Enough"
description: "The same Claude or GPT, dropped into different AI agents — one runs as steady as a seasoned chef, another keeps blowing itself up. The difference often isn't the model, but the layer you can't see: the Harness. Duck Editor takes apart the three layers of an agent."
contentType: "guide"
scene: "blog"
difficulty: "intermediate"
createdAt: "2026-05-30"
verifiedAt: "2026-05-30"
archived: false
order: 7
prerequisites: []
estimatedMinutes: 8
tags: ["Agent", "Skill", "MCP", "Harness", "OpenClaw"]
stuckOptions:
  "Can't tell the three layers apart": ["What's the difference between a Skill and a tool?", "What exactly is a Harness?"]
  "Why the Harness matters": ["Isn't a strong enough model all you need?", "Why does the same model perform so differently?"]
  "What's this got to do with me": ["I don't build agents — why learn this?", "How do I judge whether an agent is good?"]
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> This is Duck Editor's opinion. A question to chew on first: **why does the same Claude or GPT brain run smart and reliable in product A, but clumsy — and prone to breaking itself — in product B?** The answer often isn't the model itself.

---

## Let's Admit Something: We're All Too Obsessed With the "Brain"

When picking an AI tool, everyone's first question is "which model does it use?" "Is it the latest GPT / Claude?"

The model matters, of course — it's the brain. But after watching this for a while, Duck Editor noticed that **what really decides whether an AI agent is good often isn't that brain, but the structure wrapped around it that you can't see.**

An agent that gets work done *without* causing disasters is actually three layers stacked together:

```
┌──────────────────────────────────────────────┐
│  Harness (control): boundaries, verification,  │  ← most critical, most overlooked
│            error recovery, dispatch            │
├──────────────────────────────────────────────┤
│   Skill (instructions)  +  Tools/MCP (connect) │  ← capabilities & resources
├──────────────────────────────────────────────┤
│                Model (the brain)               │  ← all everyone looks at
└──────────────────────────────────────────────┘
```

Let Duck Editor take it apart layer by layer.

---

## Layer 1: Skill — Packaged Instructions and Knowledge

In [A Skill Is Really the Evolution of GPTs](/en/articles/from-prompt-to-skill), I explained: a Skill packages a set of instructions or knowledge so the AI can invoke it itself and load it on demand.

> 📌 **To be clear:** the "Skill" here means **Anthropic's official Agent Skills** — the kind the AI invokes on its own and loads into context on demand. It happens to share a name with the "hard-coded YAML workflows" in some frameworks, but it's not the same thing. Don't confuse them.

Skill answers one question: **"How is this task done?"** It's the agent's knowledge and methods.

---

## Layer 2: Tools / MCP — Hands and Feet Reaching Into the World

Knowing the method isn't enough — the agent has to **actually act**: read files, query databases, send messages, call APIs. That's the tool layer, and the [MCP protocol](/en/articles/mcp-protocol) is the standard that lets AI connect to all kinds of tools in one unified way.

The tool layer answers: **"What can I reach?"** It's the agent's hands, feet, and senses.

---

## A Quick Recap: So Far, It's All Just "Capability"

Put the first two layers together:

- **Skill** = I know how to do it (instructions, knowledge)
- **Tools / MCP** = I can act on it (connection, execution)

Together they answer the same question: **what the agent "can do."** They're capabilities and resources.

But notice something — **being able to do things, and doing them *correctly* without causing trouble, are two different matters.** Someone who can wield a knife and knows the recipe still might not plate a meal you'd feel safe eating. There's a role missing in between.

---

## Layer 3: Harness — The Layer That Manages

This is the **Harness** (literally the gear strapped onto a horse to steer it). It's the control and governance layer wrapped around the model, doing four things nobody usually notices — but whose absence causes accidents:

**1. Sets boundaries.** What must the agent never touch? (e.g., must not drop the database, must not edit its own core config.) The Harness is that guardrail.

**2. Verifies results.** The agent says it's done — is it really? Is the format right? The Harness checks before handing it off.

**3. Recovers from errors.** A tool call fails, or returns something weird — the Harness decides whether to retry, take another route, or stop and ask for help, instead of letting the whole flow crash.

**4. Dispatches.** The subtlest one: **when exactly should which Skill be invoked, which knowledge loaded, which tool called?** The thing making that decision is the Harness.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Here's a connection you might have missed:** last article I praised Skills because "the AI picks and loads them itself" — but that "**picks itself**" isn't actually the Skill's doing, it's the **Harness** deciding behind the scenes. The Harness is the hand that makes a Skill "move on its own."

---

## One Kitchen, Tying the Three Layers Together

Duck Editor's favorite metaphor: think of an agent as a restaurant kitchen.

- **Skill** = the recipes (the knowledge of how to make each dish)
- **Tools / MCP** = the stove and knives, plus the suppliers delivering ingredients from outside (the hands and feet reaching out)
- **Harness** = the **head chef**

The head chef doesn't necessarily cook every dish personally. What they do is: decide which dish a ticket needs and which supplier to order from (dispatch); rule that "expired ingredients are never used" (boundaries); taste and inspect every plate before it goes out (verification); swap the pan and start over when something burns, and soothe the customer (error recovery).

**Without that chef, you can have the best recipes and equipment and the kitchen will still descend into chaos and mistakes.** However smart the model is, without a Harness it's an unsupervised genius — it'll cause an accident sooner or later.

---

## Back to the Lobster That Blew Itself Up

Remember the lobster in [Tool Calling Is the Real Test](/en/articles/llm-tool-calling-era) — the one that "helpfully optimized your config and ended up unplugging its own power cord"?

That wasn't the model being dumb. That was the **Harness failing to set boundaries** — it let the agent have permission to edit its own core config. The model just followed instructions; the guardrail that should have blocked that action was never installed.

**The model didn't break — nobody was managing it.** That's the price of a missing Harness.

---

## So What's This Got to Do With You

Even if you don't build agents, this three-layer model gives you a **ruler for evaluating AI tools.**

Next time someone pitches you an AI agent, don't just ask "which model does it use." Ask three more questions:

1. **Does it have guardrails?** (Will it randomly delete, overwrite, or overspend?)
2. **Does it check its own results?** (Or does it hand over mistakes as-is?)
3. **How does it handle errors?** (Crash, or recover on its own?)

All three are questions about the Harness. And the Harness is the real answer to "why is the same model good in one agent and bad in another."

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> To close in one line: **the model decides how smart it is; the Harness decides how reliable it is.** And for real-world work, reliable is often worth more than smart.

---

## 🔗 Further Reading

- 🧩 **How the instruction layer evolved** → [A Skill Is Really the Evolution of GPTs](/en/articles/from-prompt-to-skill)
- 🔌 **The standard for the connection layer** → [MCP Protocol: AI's USB Port](/en/articles/mcp-protocol)
- 🦞 **A live example of Harness failure** → [Tool Calling Is the Real Test](/en/articles/llm-tool-calling-era)
- 🗺️ **Where each tool fits** → [The AI Tool Landscape](/en/articles/ai-tool-landscape)

Have a thought to discuss with Duck Editor? Join the [homepage discussion](/#discussion)!
