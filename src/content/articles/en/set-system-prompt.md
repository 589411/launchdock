---
title: "How to Set a System Prompt in ChatGPT, Claude, Gemini & Grok"
description: "Stop re-explaining who you are every time you open an AI. A system prompt (custom instructions) is set once and applies to every chat after. This guide walks you through setting one in ChatGPT, Claude, Gemini, and Grok, with a copy-paste starter template."
contentType: "tutorial"
scene: "basics"
difficulty: "beginner"
createdAt: "2026-07-27"
verifiedAt: "2026-07-27"
archived: false
order: 2
prerequisites: []
estimatedMinutes: 9
tags: ["Prompt", "設定", "OpenAI", "Anthropic", "Google"]
stuckOptions:
  "What is a system prompt": ["How is it different from just asking?", "How long is it remembered?"]
  "ChatGPT": ["Can't find custom instructions", "Does the free plan support it?"]
  "Claude": ["Instructions for Claude is empty", "Where are the settings?"]
  "Gemini": ["Can't reach 'Saved info for Gemini'", "How is it different from a Gem?"]
  "Grok": ["Which Customize preset do I pick?", "Can I mix custom and preset?"]
  "What to write": ["Will writing too much backfire?", "Can I put personal data in it?"]
---

## Tired of re-explaining yourself to the AI?

Open ChatGPT, and first you spell it out: "Reply in Traditional Chinese, get to the point, skip the fluffy intro." Switch to Claude, say it again. Start a new chat tomorrow, and there you go again.

There's a fix, and you only do it once. It's called the **system prompt**. In consumer AI apps it usually goes by **custom instructions** or **saved instructions** — different names, exact same job:

> A standing instruction you **write once, and it applies automatically to every future conversation**, so the AI knows who you are and what you want the moment you start typing.

Think of it this way: a normal chat is like re-introducing yourself at every meeting; a system prompt is saving your details **into the AI's address book** so it remembers you every time. This is the first step from "chatting with AI" to "AI that actually gets you."

This guide finds that one field for you in the four most-used AIs and sets it once in each. The entry points differ, but you'll notice it's **the same thing everywhere**. A copy-paste starter template is at the end.

---

## ChatGPT: Personalization → Custom instructions

1. Click your avatar in the bottom-left corner, then choose **Personalization**.

![ChatGPT bottom-left avatar menu with Personalization](/images/articles/set-system-prompt/chatgpt-menu-personalization.jpg)

2. Scroll down the personalization panel to the **Custom instructions** field (described as preferences for behavior, style, and tone) and type in your standing instructions.

![The custom instructions field in ChatGPT's personalization panel](/images/articles/set-system-prompt/chatgpt-custom-instructions.jpg)

It takes effect immediately and is applied to every new chat. The free plan supports it too.

---

## Claude: Settings → Instructions for Claude

1. Click your avatar in the bottom-left → **Settings** → stay on the **General** tab.
2. Below Profile, find **Instructions for Claude** (the note says it applies across chats and Cowork) and fill it in.

![The Instructions for Claude field in Claude's settings](/images/articles/set-system-prompt/claude-instructions.jpg)

Claude's interface is in English, but you can absolutely **write the instructions in Chinese** (or any language you use).

---

## Gemini: Personalization → Saved instructions

Gemini buries the entry a little deeper — three steps:

1. Click the **gear (Settings)** in the bottom-left, then choose **Personalization**.

![Gemini settings menu with the Personalization option](/images/articles/set-system-prompt/gemini-menu-personalization.jpg)

2. At the bottom of the page, open **Saved instructions for Gemini**.

![The saved-instructions entry on Gemini's personalization page](/images/articles/set-system-prompt/gemini-instructions-entry.jpg)

3. Click **Add**, type your instruction into the "What would you like Gemini to remember?" box, and submit.

![Gemini's instruction input box](/images/articles/set-system-prompt/gemini-instruction-input.jpg)

> 🐤 Don't confuse this with a **Gem**: a Gem is a mini-assistant packaged for one specific task (like a GPT) that you open individually; "saved instructions for Gemini" here applies **globally** to all chats. Start with the global one.

---

## Grok: Settings → Customize

1. Click your avatar in the bottom-left → **Settings**.

![The Settings option in Grok's bottom-left menu](/images/articles/set-system-prompt/grok-menu-settings.jpg)

2. Switch to **Customize** on the left. Grok offers a few ready-made **presets** here: custom, concise, formal, mentor, comprehensive.

![The Customize tab in Grok's settings](/images/articles/set-system-prompt/grok-customize.jpg)

3. To write your own, stay on the **Custom** tab and type it in; if you'd rather not, just pick a preset (e.g. "Comprehensive" makes it answer more thoroughly, from multiple angles). Pick one or the other.

![Grok Customize showing the content a preset fills in](/images/articles/set-system-prompt/grok-customize-filled.jpg)

---

## So what should you actually write? Start with this template

A system prompt doesn't need to be poetic. Just write down "the few things you keep re-explaining to the AI." Here's a starter template for complete beginners — copy it and replace each `___` with your own:

```
[About me]
- I'm ___ (your role/job), and I mostly use AI to ___ (what you do most).
- Always reply in Traditional Chinese (Taiwan usage).

[How to answer]
- Conclusion first, then the reasoning; use bullet points, no rambling.
- Plain language, few jargon terms; if you must use one, explain it in a sentence.
- If you're unsure, say "not sure" — don't make things up.

[Tone]
- Like a friend who gets to the point, no polite filler intros or outros.
```

All four fields accept this. After setting it, open a new chat and ask one thing — feel the difference. That's the "set once, understood ever after" moment.

To push answer quality even higher (roles, examples, step-by-step reasoning), read [Prompt Engineering](/en/articles/prompt-engineering/) next.

### 🚨 Common mistakes

- **Putting a one-off task in it**: a system prompt holds preferences that are **always true** (language, tone, who you are). A one-off like "rewrite this email" belongs in the chat, not the standing setting.
- **Writing an essay**: too long dilutes the point. Start with 5–8 lines, add more only when you notice something missing.
- **Storing secrets**: this setting **lives on that AI provider's servers**. Never put passwords, API keys, ID numbers, or confidential company info in it.
- **Thinking each app is a fresh lesson**: the four names differ (Custom instructions / Instructions for Claude / Saved instructions / Customize), but it's **the same thing**. Recognize "this is the standing-instruction field" and you'll find it in any tool.

---

## This is just step one

Setting a system prompt is level ① of personalizing your AI. Above it: saving common instructions as templates (custom instructions, Projects, GPTs), letting AI run automations, and finally raising an [AI Agent](/en/articles/why-openclaw/) that works for you — where OpenClaw uses [Soul](/en/articles/openclaw-soul/) to give the AI a persona with memory and growth, essentially the evolved form of a system prompt.

For now, get your first system prompt set. Everything else builds on it.
