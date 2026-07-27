---
title: "Don't Agonize Over the Prompt: Ramble at Your AI by Voice for 10 Minutes Instead"
description: "Facing a complex problem? Don't fret over how to word the prompt. Ex-Tesla AI director and OpenAI founding member Karpathy's trick: switch to voice, ramble for ten minutes, and let the AI restructure your mess. The first-principle behind it is exactly what Duck Editor keeps teaching in class — voice is the lowest-effort way to feed an AI context."
contentType: "guide"
scene: "blog"
difficulty: "beginner"
createdAt: "2026-07-27"
verifiedAt: "2026-07-27"
archived: false
order: 99
prerequisites: []
estimatedMinutes: 6
tags: ["Prompt", "LLM", "語音輸入"]
stuckOptions:
  "Why speak instead": ["Isn't typing more precise?", "What if I stammer or go off-topic?"]
  "How to start": ["Where's the voice input button?", "How complete does it need to be?"]
  "Common mistakes": ["Do the speech-to-text typos matter?", "What should I never dictate?"]
---

## Facing a complex problem, do you first agonize over "how to word the prompt"?

Stop right there. That step might be your single biggest bottleneck with AI.

You've got a head full of background, constraints, and ideas — but the moment you have to "type them into one clean prompt," you start deleting and rewriting, get tired, and end up handing the AI a shrunken version. **The problem was never that you think unclearly; it's that moving the context from your head into the AI is slow and tiring when you type it.**

In my class in Taichung on July 9, I strongly recommended one move to my students: **don't type — talk.** When you need to dump a lot of background, just turn on voice input and say whatever comes to mind. What I didn't expect was that, shortly after, an AI heavyweight publicly described the exact same method.

## Karpathy: switch to voice, ramble for ten minutes

Andrej Karpathy — former Tesla AI director and an OpenAI founding member — recently shared a habit for working with AI: when the LLM needs more to understand what you're after, but you're "too lazy to type," he leans back, switches to voice, and **rambles for about ten minutes, full stream of consciousness, total mess, anything goes.** He even suggests opening with something like "switching to speech recognition, sorry for any typos."

His observation: today's LLMs are very good at reconstructing a messy monologue, and **the version they echo back is often cleaner than the tangle you started with.** That tightens the "mind meld" between you and the AI, and you have to correct far less from then on.

In one line: **rather than spending effort organizing your thoughts up front, dump them on the AI first and let it organize them for you.** (See [Karpathy's post](https://x.com/karpathy/status/2079610838143623371).)

## Why it works: three first principles

**1. Speaking is 3–4× faster than typing.** Most people type around 40 words a minute and speak well over 150. When your goal is to move a lot of background into the AI fast, your mouth beats your fingers.

**2. The real bottleneck is context transfer, not writing quality.** Nine times out of ten, a bad answer isn't because the AI is dumb — it's because you didn't give enough background. Voice lets you cheaply dump the details you "couldn't be bothered to type": who you are, what you're doing, where you're stuck, what you've tried. The more context, the better it gets you.

**3. LLMs are now excellent at organizing unstructured input.** This is the key shift. You used to have to tidy your thoughts before the machine could follow; now it's reversed — **"messy" is no longer the problem, "enough volume" is.** You do the dumping; the AI does the restructuring.

## The mental model: AI as a partner you think out loud with, not a search box

Most people still use AI like Google — craft one perfect query and fire it in. Rambling by voice forces a different mental model: **AI is a partner you can talk at, "wherever your mind goes," that converges your thoughts as it listens.**

It's the same logic as a [system prompt](/en/articles/set-system-prompt/) — both are about feeding the AI enough context. The only difference: a system prompt is background you **set once and keep**; a voice ramble is the **live context for the task in front of you**. You can even draft the system prompt itself by rambling first, then having the AI clean it into tidy paragraphs.

## How to do it (use this opener)

1. Open the AI you use (ChatGPT, Claude, Gemini all work) and tap the **microphone button** next to the input box.
2. **Declare one line up front** to set the AI's expectations:

```
I'm going to ramble by voice next. There may be typos and I may jump around —
just hear me out, and at the end organize it into clear key points.
```

3. **Then dump.** Say whatever comes up: the background, your goal, the constraints, what you've already tried, where you're stuck. Tangents, repetition, misspeaking-then-fixing — all fine.
4. When you're done, have the AI **restructure it** (outline, key points, to-dos — whatever you need).
5. **Refine** against its organized version — and you'll find there's far less to change than you expected.

### 🚨 Three mistakes to avoid

- **Don't aim to "speak perfectly."** This isn't a speech contest; the point is to get the context out, not to sound polished. The more natural, the better.
- **Ignore the speech-to-text typos.** The LLM will read your mind — it infers what you meant from context, so fixing typos is wasted effort.
- **Don't dictate sensitive info.** Keys, passwords, ID numbers, unpublished company data — you shouldn't type them either. Voice just makes it faster and easier to blurt everything out, so **watch that your mouth doesn't run ahead.** (Related: [share ≠ private](/en/articles/ai-share-link-not-private/).)

## Closing: in the Agent era, typing is the bottleneck

As AI gets stronger, the slowest link between you and it shifts from "the AI can't figure it out" to "you can't brief it fast enough." Voice is, so far, the lowest-effort way to widen that pipe.

Next time you hit a complex problem, don't rush to carve out a prompt — **ramble at your AI for ten minutes first.** You'll find the best prompt is often one you *spoke*, not one you *wrote*.
