---
title: "Choose Your AI Brain: A Complete Comparison of 4 LLM Options"
description: "OpenClaw needs an LLM to work. Understand the differences between ChatGPT subscriptions, OpenRouter, and various APIs to pick the best option for you."
contentType: "guide"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-02-25"
verifiedAt: "2026-02-25"
archived: false
order: 2
pathStep: 2
series:
  name: "Getting Started"
  part: 2
prerequisites: ["why-openclaw"]
estimatedMinutes: 8
tags: ["LLM", "ChatGPT", "Claude", "Gemini", "OpenRouter", "API", "OpenClaw"]
stuckOptions:
  "What is an LLM": ["How is an LLM different from ChatGPT?", "Why does OpenClaw need a separate LLM?", "Can't OpenClaw answer questions on its own?"]
  "Choosing a plan": ["I don't know which one to choose", "Which one is cheapest?", "I want to try it for free first", "I already have ChatGPT Plus"]
  "Cost concerns": ["Could API costs accidentally get really high?", "How do I set a spending limit?", "What is a Token?"]
  "Model differences": ["What's the difference between GPT-4o and Claude Sonnet?", "There are so many models, how do I choose?", "Can I switch later?"]
---
## First, Let's Clear Something Up: OpenClaw ≠ AI

> This LaunchDock tutorial helps you understand LLM options — after installing OpenClaw, the next step is picking a brain for it.

Many beginners think that once they install OpenClaw, they can start chatting with AI. **Not quite.**

OpenClaw is a **framework** — it helps you manage tools, automate workflows, and connect services. But it doesn't "think" on its own.

You need to connect it to a "brain," and that brain is an **LLM (Large Language Model)**.

> 🧠 **Simple analogy**: OpenClaw is a car; the LLM is the engine. Without an engine, the car can't move.

---

## What Is an LLM?

An LLM is the core technology behind ChatGPT, Claude, and Gemini. It has been trained on massive amounts of text data and learned to understand and generate language.

The services you've been using are all powered by different companies' LLMs:

| Service you've used | Underlying LLM | Developer |
| --- | --- | --- |
| ChatGPT | GPT-4o, GPT-4o mini | OpenAI |
| Claude | Claude Opus, Sonnet, Haiku | Anthropic |
| Gemini | Gemini 2.0 Flash, Gemini Pro | Google |

OpenClaw can connect to **any** of these LLMs. And you can switch anytime.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: ChatGPT, Claude, and Gemini are like different engine brands — Toyota, BMW, Tesla. OpenClaw is the car chassis. You can swap the engine whenever you want, and you don't have to re-learn how to drive.

---

## Complete Comparison of 4 Options

### Overview

| Option | Monthly Cost | Billing | Difficulty | Best For |
| --- | --- | --- | --- | --- |
| **A. Google AI Studio** | Free to start | Pay-per-use | ⭐ Easy | 🏆 **Best for beginners** |
| **B. OpenRouter** | Free to start | Pay-per-use | ⭐ Easy | People who want to try multiple models |
| **C. OpenAI API** | Pay-per-use | Pay-per-use | ⭐⭐ Medium | People who mainly use GPT |
| **D. Anthropic API** | Pay-per-use | Pay-per-use | ⭐⭐ Medium | People who want the best quality |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Not sure? Go with A (Google AI Studio).** It has the highest free tier, doesn't require a credit card, and is the best way to get started.

---

### Option A: Google AI Studio (Gemini API) 🏆 Recommended for Beginners

| Item | Details |
| --- | --- |
| **Cost** | Very generous free tier (15 requests per minute), charges only after exceeding |
| **Credit card required** | ❌ No |
| **Supported models** | Gemini 2.0 Flash (fast and cheap), Gemini Pro (more powerful) |
| **Key format** | Starts with `AIzaSy...` |

**Why is it recommended for beginners?**

- Free tier is enough for several weeks of use
- No credit card required — no risk of surprise bills
- Gemini Flash is fast with good quality
- Easiest application process (done in 3 minutes)

**Note: This is NOT the same as Google Cloud Console API!**

> 🚨 **Common confusion**: Google AI Studio is for using Gemini models (i.e., getting an AI brain). Google Cloud Console API is for connecting Google Drive, Gmail, and similar services. They're completely different, with different application processes.
>
> - **Gemini AI brain** → Apply at Google AI Studio → This article teaches you how
> - **Connect Google Drive/Gmail** → Apply at Google Cloud Console → See [Google API Key Guide](/articles/google-api-key-guide)

---

### Option B: OpenRouter

| Item | Details |
| --- | --- |
| **Cost** | Small free credit on signup, then pay-per-use |
| **Credit card required** | Not for free tier; required to add funds |
| **Supported models** | GPT-4o, Claude Sonnet, Gemini, Llama… **all of them** |
| **Key format** | Starts with `sk-or-...` |

**Pros**: One key gives you access to dozens of models. Want to try Claude? Just change the model name. No need to register separately with each provider.

**Best for**: People who want to experiment with different models, or don't want to manage multiple keys.

---

### Option C: OpenAI API

| Item | Details |
| --- | --- |
| **Cost** | Pay-per-use, minimum top-up $5 USD |
| **Credit card required** | ✅ Yes |
| **Supported models** | GPT-5-mini, 5.3-Codex |
| **Key format** | Starts with `sk-...` |

**Pros**: The GPT ecosystem is the most mature, with the most examples available online.

**Note**: The API and ChatGPT Plus subscription are billed **separately**. Having ChatGPT Plus doesn't mean you have API credits.

---

### Option D: Anthropic API

| Item | Details |
| --- | --- |
| **Cost** | $5 free credit on first signup |
| **Credit card required** | Not for free tier; required afterwards |
| **Supported models** | Claude Opus, Sonnet, Haiku |
| **Key format** | Starts with `sk-ant-...` |

**Pros**: Claude excels at long-form comprehension, writing quality, and code. Many developers consider Opus to be the strongest all-around model available.

**Best for**: People who want the best response quality, or who need help with coding.

---

## How Does Pricing Actually Work?

All API plans are billed by **Tokens**. A Token is the smallest unit of text that AI processes:

- English: roughly 4 characters = 1 Token
- Chinese: roughly 1 character = 1–2 Tokens

### Real-World Cost Reference

| Use Case | Approx. Tokens | Gemini Flash Cost | Claude Opus Cost |
| --- | --- | --- | --- |
| Ask a simple question | ~500 | < $0.001 | ~$0.02 |
| Organize a page of notes | ~2,000 | < $0.001 | ~$0.08 |
| Write a full report | ~5,000 | < $0.001 | ~$0.20 |
| Normal daily usage | ~20,000 | ~$0.003 | ~$0.80 |
| Normal monthly usage | ~600,000 | ~$0.10 | ~$24.00 |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Bottom line**: With a cheap model (Gemini Flash), less than $1/month. With a top-tier model (Claude Opus), about the price of a coffee to a lunch per month.
>
> For a deep dive, check out [Token Economics](/articles/token-economics).

### How to Avoid Bill Shock?

**You won't.** Every provider lets you set a spending limit:

- **OpenAI**: Settings → Billing → Usage limits → Set a Hard cap
- **Anthropic**: Settings → Plans & Billing → Usage limit
- **Google AI Studio**: The free tier has built-in limits and won't auto-charge

Once you hit the limit, it automatically stops — no further charges.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says**: Bill shock is like an all-you-can-eat buffet where you forgot to set a headcount limit — set a safety threshold first, auto-lock when reached, and you can relax.

---

## So Many Models — How to Choose?

For beginners, just remember this quick reference:

| Your Need | Recommended Model | Reason |
| --- | --- | --- |
| Just trying it out, don't want to spend money | Gemini 2.0 Flash | Largest free tier |
| Daily Q&A, simple tasks | GPT-4o mini / Gemini Flash | Cheap and fast |
| Writing reports, analysis, coding | Claude Sonnet / GPT-4o | Best quality |
| Processing very long documents | Gemini 1.5 Pro | ~1 million Token context window |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Can I switch later?** Absolutely. OpenClaw supports configuring multiple Providers at the same time, and you can switch anytime. For advanced settings, see [Model Configuration & Switching](/articles/openclaw-model-config).

---

## Make Your Choice

By now, you should have a plan in mind. If you're still unsure:

- **Complete beginner, don't want to spend money** → Choose **A. Google AI Studio**
- **Want to try different things** → Choose **B. OpenRouter**
- **Already have a preferred model** → Choose **C or D**

Made your decision? Next step — let's go get your API Key 👉 [Apply for an API Key](/articles/ai-api-key-guide)
