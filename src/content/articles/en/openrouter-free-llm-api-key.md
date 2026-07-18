---
title: "OpenRouter Sign-Up: One Key for Every Big Model (Free Models Included)"
description: "OpenRouter is an LLM gateway — one API to reach every major model. Sign up in minutes with a Google account, get an API key, and use a pile of free models. This walks you from homepage sign-up, to choosing an account type, to grabbing your key, to finding free models — ready to plug into Make, n8n, OpenClaw, or your own code."
contentType: "tutorial"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 7
tags: ["OpenRouter", "API", "Setup", "LLM"]
stuckOptions:
  "Sign up and login": ["Do I have to use Google?", "Individual or Organization?", "Do I need a credit card first?"]
  "Getting the API key": ["What does 'shown only once' mean?", "I closed the key by accident", "Where do I store the key safely?"]
  "Choosing a model": ["Which ones are free?", "Free vs. paid models?", "How do I write the model name?"]
---

> **In one line**: Go to [openrouter.ai](https://openrouter.ai), click Sign Up, log in with Google, choose Individual, generate an API key on the Keys page (**shown in full only once — copy it right then**), and any tool that takes that key can call GPT, Claude, Gemini, Llama and more — plus a bunch of models tagged `(free)`.

**Keywords**: OpenRouter, API Key, LLM gateway, free models, free, Gemma, Individual, Sign in with Google, model routing

---

## What is OpenRouter, and why does it exist?

Say you want to wire up AI models, but out there you've got OpenAI, Anthropic, Google, Meta… each with different API formats, accounts, and billing. Applying to each and integrating each is a pain.

**OpenRouter** solves exactly that — it's an **LLM gateway**: you get one API key from OpenRouter and call **400+ models across 70+ providers** through a single interface. Want to switch models? Change one string; no new account needed. And it hosts plenty of free models — plenty for practice and small projects.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: OpenRouter is like a "carrier-agnostic phone line" — instead of a separate SIM per carrier, one card dials them all. Want a different provider? Don't swap cards; just prefix a code before dialing. Here that "code" is the model name (like `google/gemma-4`).

![OpenRouter homepage: One API for Any Model](/images/articles/openrouter-free-llm-api-key/openrouter-homepage.png)

---

## Step 1: Click Sign Up on the site

Open [openrouter.ai](https://openrouter.ai). Top-right is a purple **Sign Up**, and the hero has a **Get API Key** button. Click either to start.

---

## Step 2: Choose a login method (Google recommended)

A **"Sign in to OpenRouter"** card appears with SSO icons (GitHub, Google…) and an email + password option. **Google** is fastest — click the Google icon, pick your account, and consent.

![OpenRouter sign-in card with several login methods](/images/articles/openrouter-free-llm-api-key/openrouter-signin.png)

First-time sign-up also shows a **Legal consent** checkbox page — tick it and click Continue.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: Signing in with Google uses your Google account as a keycard. OpenRouter only gets your name and email — never your password. Saves you another password to remember.

---

## Step 3: Pick account type — Individual

In onboarding, OpenRouter asks **"How will you be using OpenRouter?"** with two options:

- **Individual**: build side projects, explore models, prototype ← choose this for personal use
- **Organization**: collaborate with a team, manage usage centrally

For learning, tinkering, or small tools, **Individual** is right.

![OpenRouter onboarding: choose Individual or Organization](/images/articles/openrouter-free-llm-api-key/openrouter-onboarding.png)

It may then ask where you heard about OpenRouter — pick anything (e.g., YouTube) and click Continue; it doesn't affect features.

![OpenRouter survey: where did you hear about us](/images/articles/openrouter-free-llm-api-key/openrouter-survey.png)

### 🚨 It wants a credit card / billing address — is that required?

Sign-up may show an "Add a payment method / billing address" step, but there's usually an **"I'll do this later"** link. **Free models don't need a card** — to practice on free ones, click "later" and skip payment setup. Come back and add a card when you want paid models.

---

## Step 4: Finish setup, go to the Dashboard

Seeing **"You're all set!"** means your account is created. Click **Go to Dashboard** (or Read the Docs).

![OpenRouter: You're all set completion screen](/images/articles/openrouter-free-llm-api-key/openrouter-all-set.png)

---

## Step 5: Generate your API key (shown only once!)

On the **Keys** (API Keys) page, generate a new key. The screen shows a string starting `sk-or-v1-...` with a copy button.

**The single most important line here**: the screen usually warns *"This is the only time your full key will be shown."* So **copy it right then and store it somewhere safe** (a password manager, or your `.env` file). Once you close this screen, you can never see the full key again.

![OpenRouter API key generation (full key shown only once)](/images/articles/openrouter-free-llm-api-key/openrouter-api-key.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: An API key is like your home keycard. No card, no entry — and anyone who gets your card can walk in. So never paste an API key anywhere public (GitHub, chat, screenshots)! That's exactly why the key is blacked out in this article's screenshot.

### 🚨 Closed the key by accident and didn't save it?

Don't panic, and don't try to "recover" it — you can't. Just **delete the old one and generate a new key**. Keys are meant to be revoked and reissued anytime; it's good hygiene: suspect a leak, rotate immediately.

---

## Step 6: Meet the free models

Many models on OpenRouter are tagged **`(free)`** — these are free (rate-limited, but plenty for practice). When you pick an OpenRouter model in a tool (e.g., Make, n8n), search `free` to filter them, such as **`Google: Gemma 4 26B A4B (free)`**.

![OpenRouter free models list (filtered by searching free)](/images/articles/openrouter-free-llm-api-key/openrouter-free-models.png)

Model names use the format **`provider/model`**, e.g., `google/gemma-4`, `anthropic/claude-opus-4.6`. Write model names in that format.

![Selecting a free model (Gemma 4 free)](/images/articles/openrouter-free-llm-api-key/openrouter-model-selected.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Free models are like food samples — enough to judge whether they suit your taste and can do the job. When your project needs to ship, stay stable, and run fast, upgrade to paid models (Claude, GPT). Getting the flow working on free models first is the cheapest way to learn.

---

## Done! Where can this key go?

You now hold an OpenRouter API key. Feed it to almost any tool that supports a custom LLM:

- Automation platforms like **Make / n8n** (e.g., "auto-classify incoming Gmail with AI")
- AI agent frameworks like **OpenClaw**
- Your own Python / JavaScript code

One key, every model. Switching models or comparing price/performance later needs no new account.

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **One last nudge from the Duck**: Signing up is easy — only two things truly matter: ① **the key is shown once, copy it right then**; ② **the key is a keycard, don't leak it, and rotate if you suspect a leak**. Make these two reflexes, and you'll never slip up with any API service.
