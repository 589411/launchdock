---
title: "Three AIs, One Shippable LINE Booking System: The Duck's Collaboration Log"
description: "Instead of asking 'which AI is strongest,' divide the labor: use Claude to write the dev plan, use Antigravity CLI (a Gemini agent) to actually build the code, then use Claude Opus to hunt bugs and iterate. This is the Duck's real log of using this 'AI division of labor' to build a working LINE course-booking PWA — it's about the mindset, not a step-by-step tutorial."
contentType: "guide"
scene: "blog"
difficulty: "intermediate"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 9
tags: ["Agent", "Automation", "Google"]
stuckOptions:
  "The idea of AI division of labor": ["Why not use one AI the whole way?", "Who does plan/build/review?", "How is this different from vibe coding?"]
  "Pairing the tools": ["What is Antigravity CLI?", "Why need a second AI to review?", "How do I pick the model?"]
---

> **In one line**: This isn't a step-by-step tutorial — it's a mindset. The Duck used a three-way split — **Claude writes the plan → Antigravity CLI (a Gemini agent) does the building → Claude Opus hunts bugs** — to build a genuinely usable LINE course-booking PWA. The point isn't which AI is strongest, but **letting different AIs each do their job.**

**Keywords**: AI division of labor, AI agent, Antigravity CLI, Gemini, Claude, dev plan, code review, vibe coding, LINE booking system

---

## A common trap: hunting for "the single strongest AI"

Many people coding with AI fixate on one question: "Is Claude stronger or Gemini? Which should I use?"

The Duck eventually realized — that's **the wrong question.** Just as you wouldn't ask "is a hammer or a screwdriver stronger," you'd ask "which tool for this screw." Building a project involves several **different kinds** of work, and different AIs suit each.

So the Duck ran an experiment: don't pick sides — **let three AIs divide the labor** to build something real that people would actually use — a **LINE course-booking system** (a booking PWA for a dance and yoga studio).

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Opening a restaurant, you wouldn't make one person the head chef, the buyer, and the food-safety inspector — they'd burn out and do none well. Same with AI. Rather than one "all-rounder that's mediocre at everything," three "specialists" dividing the work produce a sturdier result.

---

## The split: plan, build, review — three roles

The Duck's flow here breaks into three roles (with the Duck's own sticky-note reminder alongside):

1. **Use Claude to generate the dev plan** — don't rush to code. First let an AI good at "thinking clearly" write a plan: what to build, how many phases, and what to verify at each.
2. **Use Antigravity CLI (a Gemini agent) to actually run it** — take that plan and let a hands-on terminal AI agent really create files, write code, and run commands.
3. **Use Claude Opus to review the code and find bugs** — once it's built, switch to a "sharp-eyed, nitpicky" AI to catch bugs and security holes, then feed the findings back to improve the plan.

![Using Claude to review the agent's generated code, listing bugs by severity](/images/articles/ai-agents-build-line-booking-system/claude-code-audit.png)

The shot above is step 3 — Claude Opus scans the code Antigravity produced and lists "pitfalls sorted by severity": where a secret was put in the wrong place, where there's a race condition, where data goes stale… exactly what "one AI writing its own code and declaring 'done'" tends to miss.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: Asking the coder to check their own code is like asking a student to grade their own exam — they can't see their blind spots. Bring in an AI with "no emotional baggage" to nitpick, and it finds them. That's why you use a *different* AI to build vs. review.

---

## The builder: what is Antigravity CLI?

**Antigravity CLI** (the `agy` command) is an AI agent that runs in the terminal, switchable between Gemini, Claude, and other models behind it. Give it a sentence and it reads your project, drafts a plan, creates files, and runs commands — the hands-on type.

The Duck's first sentence to it was simple:

> Referring to the settings in the repo, walk me step by step through building a LINE membership course-booking platform.

![Issuing the first command via Antigravity CLI in the terminal](/images/articles/ai-agents-build-line-booking-system/antigravity-cli-prompt.png)

Rather than blindly writing, it first **explores the workspace** — reading the project's design docs, Firestore data model, and security rules to understand the whole before acting.

![Antigravity CLI first reads the project docs to understand the whole](/images/articles/ai-agents-build-line-booking-system/antigravity-agent-reading.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: A good AI agent is like a good intern — it doesn't barge in and improvise; it learns the company's SOP and the existing project first. That's why "give it a good plan first" matters so much: the plan is its SOP.

---

## So which model should you pick? "It depends on the task"

Along the way the Duck agonized too: Antigravity can switch to Gemini 3.5 Flash or Claude Sonnet — who's better at classification or coding?

So the Duck just **asked the AI itself** to lay out an objective comparison (pure coding, agentic tool use, speed and cost). The conclusion was pragmatic: **pick by task** — for fast, cheap bulk chores, use a fast, cheap one like Flash; for precise, complex reasoning, use a strong one like Sonnet/Opus.

![Having the AI objectively compare models' strengths per task](/images/articles/ai-agents-build-line-booking-system/model-comparison.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: Models are like different feed — feed the lobster premium stuff (a strong model) and it's smart but pricey; feed it instant noodles (a fast model) and it's quick and cheap but can't do fine work. The point isn't always eating the priciest — it's matching the meal to the job.

---

## The result: a real PWA that opens and works offline

After the three-way split, the result is a **LINE course-booking system** PWA — deployed on GitHub Pages with Firebase as the backend.

![GitHub Pages deployment succeeded](/images/articles/ai-agents-build-line-booking-system/github-pages-deployed.png)

Open it and you get a booking page you can "add to home screen" as an app, with PWA offline caching done. Not a toy demo — it went through the whole set: deployment, login, database rules, LINE login.

![The finished LINE course-booking PWA home page](/images/articles/ai-agents-build-line-booking-system/line-booking-pwa.png)

> Want the step-by-step "how to" for each piece? LaunchDock has them broken out: sign up for GitHub, create a Firebase project, enable Google login, deploy Firestore security rules, create a LINE Login channel and LIFF — this article is about the mindset of "how to stitch them together with AI."

---

## How is this different from "vibe coding"?

You may have heard of **vibe coding** — telling AI to keep writing and tweaking on feel. It's fast, but often "works well enough" while hiding a pile of pitfalls underneath.

The Duck's division of labor essentially adds two **guardrails** to vibe coding:

- **A "plan" up front**: think clearly before acting, not scribble as you go.
- **A "review" at the back**: after building, switch AIs to hunt bugs — not "it runs, so it's a success."

These two barely slow you down, but the result goes from "a working demo" to "something you'd dare hand to people."

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: The most dangerous sentence when using AI solo is "it says it's done." AI is great at saying "done," but it has blind spots just like you. The fix isn't distrusting AI — it's **letting another AI check it.** Three cobblers (AIs dividing the work) beat one Zhuge Liang (a single all-rounder AI), and for coding, that's especially true.

---

## The Duck's three-line summary

1. **Don't ask "which AI is strongest," ask "which AI for this piece of work"** — plan, build, and review are three different jobs.
2. **Always use different AIs to build vs. review** — grading your own exam hides blind spots.
3. **Match the model to the task** — fast and cheap for chores, strong for hard problems; you don't always eat the priciest feed.

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **One last nudge from the Duck**: You don't need many accounts or a pricey subscription to try this. The core is the **mindset** — separate plan, build, and review, and switch reviewers after building. Someday when you build something "real people will use" with AI, remember not to let one AI do it all end to end. Divide the labor — that's what makes it sturdy.
