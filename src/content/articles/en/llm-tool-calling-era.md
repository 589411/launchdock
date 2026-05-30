---
title: "Tool Calling Is the Real Test: LLMs Move From Talk to Combat"
description: "OpenClaw completely changed how we compare LLMs. It's no longer about who writes the prettiest essay, but who dares to use tools — and uses them well. Duck Editor's frontline notes."
contentType: "guide"
scene: "blog"
difficulty: "beginner"
createdAt: "2026-03-04"
verifiedAt: "2026-03-04"
archived: false
order: 4
prerequisites: ["why-openclaw"]
estimatedMinutes: 6
tags: ["OpenClaw", "LLM", "Agent", "工具調用", "MCP"]
stuckOptions:
  "What is tool calling": ["What's the difference between Function Calling and MCP?", "Why don't all models support it?"]
  "Which model is best at tools": ["Claude vs GPT-4o — who's stronger?", "Can small models do it too?"]
  "Lobster self-destructed": ["How do I restore a broken config file?", "How do I stop the model from messing with settings?"]
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> These are Duck Editor's frontline notes. Not a tutorial — just an opinion.

---

## How We Used to Compare LLMs

Before agent frameworks went mainstream, the yardstick for measuring an LLM's ability looked something like this:

- Write an essay
- Summarize a meeting
- Translate a passage of English
- Solve a math problem

These tests share one thing in common: **they're all decided at the language level**.

Whichever model generates text that's more natural, more accurate, more logical — that one wins. The benchmarks compared the same things: MMLU, HumanEval, all kinds of reading-comprehension tests.

Organizing documents, writing summaries, playing secretary.

In that era, the lobster was a pet with a silver tongue.

---

## What OpenClaw Changed

The moment OpenClaw connected the LLM to tools, the rules of the game changed.

Now the lobster isn't just talking — it has to **get things done**.

```
Search the web → Read a file → Call an API → Write to a database → Send a notification
```

These actions don't need "sounding good." They need:

1. **Correctly understanding the intent** of the instruction
2. **Picking the right tool** (you have 30 tools — which one?)
3. **Filling in the right parameters** (format, type, required fields)
4. **Handling errors** (the tool failed — what's the next step?)
5. **Not getting lost in multi-step tasks** (on step 7, does it still remember the goal from step 1?)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says:** This is what "from talk to combat" means. The old test was an essay; the new test is whether you survive on the battlefield. A model's real ability only shows the instant it starts using tools.

---

## How Big Is the Gap in Tool-Calling Ability

Duck Editor tested it personally. The same task: "Look up today's exchange rate, convert it to TWD, and save it into my Notion database."

| Model | Performance |
|------|------|
| Top-tier (Claude / GPT-4o) | Done in three steps, correct parameters, Notion fields filled right |
| Mid-tier | Found the rate, but got the Notion API format wrong and got stuck |
| Entry-level | Thought the task was done — actually just printed the result as text and saved nothing |

The gap isn't about being clever. It's about **whether it can operate tools correctly**.

That's why the cloud models OpenClaw officially recommends are minimax-m2.5 and kimi-k2.5 — their tool-calling ability is excellent for their class, not just "smooth at conversation."

---

## The Lobster's Fatal Flaw: Self-Destruction

Speaking of tool calling, there's something Duck Editor both loves and fears:

**The lobster loves to edit its own config files.**

Once OpenClaw is running, its configuration lives in a few places — including the `gateway` (the entry point that connects to the LLM), the API key, and the parameters of various Skills. Sometimes the model will "helpfully" go and touch these files.

And then the lobster self-destructs.

```
✅ Task: Help me optimize my OpenClaw configuration
🦞 Lobster: Sure, let me adjust the gateway config...
💥 Error: Cannot connect to LLM, OpenClaw has stopped working
```

This isn't the model breaking. It just unplugged its own power cord.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's advice:** Don't give the lobster permission to modify its own core configuration. If you really need to adjust it, back up the `~/.openclaw/` folder first, then let it work. Even if it breaks something, recovery is quick.

---

## So What's the New Standard for Choosing a Model

It's not who writes the most beautiful essay. It's:

1. **Tool-selection accuracy** — faced with 30 tools, did it pick wrong?
2. **Parameter-filling accuracy** — did it get the format and types right?
3. **Stability across multi-step tasks** — on step 10, did it forget the goal from step 1?
4. **Error-recovery ability** — when a tool fails, does it know how to take another route?
5. **Not touching what it shouldn't** — does it understand boundaries and avoid doing harm out of good intentions?

These five points are how Duck Editor judges whether a lobster is up to the job.

---

## What This Means for You

If you're just starting with OpenClaw, one thing is worth remembering:

**Free models are fine for practice, but when you really want the lobster to do work, give it a good enough LLM brain.**

The API fees you save may come back as a pile of failed tool calls, broken configs, and tasks that stall halfway.

Tool calling is the first exam of the agent era. A player's real skill shows the moment they step onto the field.

---

## Further Reading

- 🧠 [Read Before Choosing an LLM Plan: 4 Options Compared](/en/articles/llm-guide)
- 🦞 [OpenClaw Quick Start (macOS)](/en/articles/ollama-openclaw-mac)
- 🪟 [OpenClaw Quick Start (Windows)](/en/articles/ollama-openclaw-windows)
- 🔧 [Model Configuration and Switching](/en/articles/openclaw-model-config)
