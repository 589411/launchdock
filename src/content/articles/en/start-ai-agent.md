---
title: "How Do You Ask AI to Be Your Assistant? Start by Letting It See Your Stuff"
description: "No coding needed. Start with one small job. Don't hand AI a big project on day one: pick a task that takes 10–20 minutes and whose result you can check yourself, let AI see your files, describe the work as steps, conditions, and loops, then save the rules. This guide walks you through your first small task, starting with a simple file upload."
contentType: "tutorial"
scene: "basics"
difficulty: "beginner"
createdAt: "2026-11-24"
verifiedAt: "2026-11-24"
archived: false
order: 2
prerequisites: ["chrome-ai-extensions"]
estimatedMinutes: 13
tags: ["Agent", "MCP", "Prompt", "設定"]
stuckOptions:
  "Picking a small task": ["What counts as a small task?", "What if I have no suitable file?"]
  "Letting AI see your stuff": ["Upload vs connector: what's the difference?", "Do I have to connect anything?", "What should I never share?"]
  "Being clear": ["What if I can't write steps?", "How long should the instructions be?"]
  "Checking the result": ["It sounds right. How do I know it isn't made up?"]
---

> **In one line**: Don't hand AI a big project on day one. Pick a job that takes 10–20 minutes and whose result you can check yourself, **drag the file into the chat so it can see it**, give instructions in a few lines, check the result, and save the rules. After one round, you have your first job delegated to AI.

**Keywords**: AI assistant, AI agent for beginners, let AI read files, connectors, least privilege, prompt, SOP

---

## Why does a big first project usually disappoint?

Many people give AI their most important project the first time they really use it. The result is half right, so they conclude, "AI isn't useful."

It's like a new intern. On day one you don't send them to negotiate a contract. You ask them to organize some files, make copies, check a list. Once they get that right, you hand over a bit more.

**An AI agent (an AI that can actually do tasks for you) is your intern.** What it needs from you isn't generosity. It needs four things that build slowly: trust, rapport, experience, and confidence. This guide covers just the first two steps of that climb.

![Trust ladder: small task, can see your files, becomes a habit, let go a little more](/images/articles/start-ai-agent/trust-ladder.svg)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: The goal isn't "how smart is the AI." It's "do I dare let go a little more?" Each small job you check and it passes, you let go a bit further.

---

## 1. Pick one small task

A good first job meets all three conditions:

1. **You can verify the result yourself**: you can tell if it's right (for example, by checking against the original).
2. **A mistake doesn't matter**: nothing involving payments, deleting, or sending to others.
3. **It takes 10–20 minutes**: if it takes longer, you haven't cut it small enough.

Some examples that fit:

- Turn meeting notes into 5 to-dos
- List the key points of a document in 5 bullets
- Compare two lists and find what's different
- Sort a pile of emails into "reply" and "no reply needed"
- Put specs from a few web pages into one table

**Don't pick yet**: emailing customers, editing accounting records, deleting files. A mistake there has a cost. Wait until you trust it.

This is the same spirit as "pick one verifiable thing" in [Everyone Using AI Sits in a Funnel](/articles/karpathy-ai-funnel/).

Now actually **pick one** and write it on a sticky note. Every section below uses it.

---

## 2. Why does AI need to "see" your stuff?

If you only chat with AI, it's like helping you read a document through a glass window: you have to read it aloud (copy and paste) before it knows what's in it. The longer or more numerous the files, the more tiring it gets for you, and the less it can see.

"Letting it see" simply means **letting AI read your file or data directly, instead of you pasting it piece by piece.** It isn't a tech show-off. It's what lets your first small job get finished.

---

## 3. Three paths to let it see (easy to harder)

![Three paths: direct upload, connectors, Chrome extension; setup and risk increase from left to right](/images/articles/start-ai-agent/three-paths.svg)

### Path 1: Upload directly (start here)

Drag the file into the chat box and AI can read it. No setup, no authorization, and it only covers this one time. For your first small task, **this is enough**.

### Path 2: Connectors, one at a time

A **connector** is an authorized channel that lets AI read a particular service (such as cloud storage or documents), so you don't have to drag files in every time.

Think of it as a **visitor pass that opens only a few specific doors** for your intern: they can enter the meeting room, but not the finance office.

The standard behind many connectors is called MCP. In plain words, it's the USB port of the AI world. Details are in [MCP Protocol: The USB Port for AI](/articles/mcp-protocol/). For how to connect and what to pick, see [Which MCP Servers Should You Install?](/articles/mcp-servers-picks/). For hands-on examples, see [Connect Grok to GitHub](/articles/grok-connect-github/) and [Connect ChatGPT to GitHub](/articles/chatgpt-connect-github/).

Two reminders:

- **Connect one at a time.** If you connect several, you won't know which one caused a problem.
- **Availability and required plans change often.** Go by each vendor's official pages, and see the tested results in the articles above.

### Path 3: Chrome extension

To let AI see the web pages you have open, or even click buttons for you, the easiest entry is installing its extension in Chrome. How to install each of the three, which plans apply, and how to set permissions are in [Let AI Use Websites for You](/articles/chrome-ai-extensions/). Here you only need to remember one thing: **set permissions to "ask me before every action" first.**

---

## 4. Least privilege: open only the doors you need

Whichever path you take, three principles:

1. **Open only what this small job needs**: to organize meeting notes, don't also let it see your whole cloud drive.
2. **Read-only first, not "do things"**: let it look and organize first. Don't let it edit, delete, or send at the start.
3. **Don't hand over sensitive data**: customer personal data, ID numbers, passwords. None of it. If you must use such a file, mask it yourself first.

For practice accounts and separate Chrome profiles, see the [Chrome extension guide](/articles/chrome-ai-extensions/).

---

## 5. Run your first small task, and write the rules down

![Same job, two order slips: unclear versus clear](/images/articles/start-ai-agent/brief-compare.svg)

### Step 1: Drag in the file and write 5 lines

Open the AI chat you normally use, drag the file in, and paste this format (swap in your own job):

```text
Background: These are this week's meeting notes.
What I want: Turn them into 5 to-dos.
Format: One line each, stating who, what, and when.
Limit: Use only what's in the file. Don't fill in anything yourself.
If you're unsure, ask me. Don't guess.
```

**A prompt (your instructions to AI) is like an order slip**: the clearer you write it, the closer the kitchen gets it. That last line, "If you're unsure, ask me," is the cheapest and most useful line on the whole slip.

### Step 2: You check the result first

Use the conditions from section 1 and **compare against the original yourself**. Also ask it to show its basis: "For each to-do, tell me which part of the file it came from." If it can't find the source, that item was probably made up.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: the person who checks the work is called the harness in the AI agent world. For now, that role is you. [Anatomy of an AI Agent](/articles/ai-agent-anatomy/) explains where it fits in the system.

### Step 3: Tell it what's wrong, then have it write the rules

If something is wrong, say so: "Item 3 isn't what I wanted. I wanted..." Then the key step:

```text
Please turn the rules we just agreed on into a note I can paste to you next time.
```

Save what it gives you in your notes.

**Why save it?** Because it won't remember on its own what you discussed last time. In a new chat it's on its first day of work again. The note you saved is the intern's work notebook. For a more advanced way of packaging instructions, read [Skills Are the Evolution of GPTs](/articles/from-prompt-to-skill/). Memory theory is in [The Missing Infrastructure of AI Memory](/articles/ai-agent-memory-guide/), which you can skip as a beginner.

---

## 6. Describe work as steps, conditions, and loops (no coding)

Once small tasks go smoothly, you'll want to hand over something bigger, like "organize 20 quotes." At that point, **being clear matters more than saying a lot.**

Programmers break work into three kinds of sentences. You don't need to code, but you can borrow these three forms when you speak:

| Form | Plain words | Everyday analogy | Quote example |
|---|---|---|---|
| Steps | First…then… | Recipe steps | First read the file, then pull out vendor, items, and amount |
| Condition | If…then…, otherwise… | No eggs, use tofu | If the amount is missing, mark "to confirm" and don't guess |
| Loop | For each one…until done | Every plate gets the same garnish | All 20 in the same format, stop only when all are done |

![Organizing 20 quotes: how steps, conditions, and loops fit together](/images/articles/start-ai-agent/flow-condition-loop.svg)

Put the three together into 5–8 lines and you have your SOP (standard operating procedure). The "loop" is the navigation described in [What Are Prompt Engineering, Context Engineering, Loop, and Harness?](/articles/ai-agent-jargon/): it doesn't reach the destination in one go, but takes a step, looks, and corrects.

Finally, add two lines of insurance:

- "If data is missing, flag it. Don't fill it in."
- "If you're unsure, stop and ask me."

---

## 7. Can't explain it clearly? Ramble by voice first

Many people get stuck at "I don't know how to write an SOP." Don't force it. Turn on voice and **talk through how you normally do this job, as if briefing a coworker, for 5–10 minutes**. Then say: "Turn what I just said into steps, and mark every 'if…then…'."

Edit what comes back. The reasoning behind this trick is in [Don't Rush to Craft the Prompt](/articles/voice-input-ai-context/).

---

## 🚨 Common stumbling blocks

### 🚨 AI says it can't read the file

First check that the file format is readable (text, PDF, and spreadsheets usually are) and that the file isn't too large. Scanned files (images) may be read poorly, so switch to a version with copyable text. For connectors, go back and check whether authorization succeeded.

### 🚨 The connector needs a paid plan

This is common, and it changes often, so don't make it your first step. Finish your first small task with an upload, then decide whether to connect.

### 🚨 A pile of permissions pops up on first authorization

Stop and read what it's asking for. **Don't grant what you don't need.** Better to open less and add later.

### 🚨 The result looks right but was made up

This is the most common AI problem. The fix is Step 2: ask it to point to "which part of the file," then spot-check two or three items. Anything it can't trace, have it redo.

---

## One thing you can do tomorrow

1. Pick a job you **already need to do, read-only** (meeting notes into 5 to-dos, or a document into 5 key points).
2. **Drag the file straight into the chat.** No connector needed first.
3. Write instructions in 5 lines or fewer: background, what you want, format, limits, and end with "If you're unsure, ask me. Don't guess."
4. **Check it yourself first**, tell it what's wrong, have it turn the rules into a note you can paste next time, and save it.
5. If you have energy left, **connect just one** connector or extension. Don't connect several at once.

If this small job needs doing every week, that's for the next article. For now, get the first small job right.
