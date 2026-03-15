---
title: "AI Model API Key Guide: OpenAI, Anthropic, Google, OpenRouter — All in One Place"
description: "Step-by-step guide to applying for AI model API Keys. No matter which provider you choose, follow along and get the key that powers OpenClaw."
contentType: "tutorial"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-02-25"
verifiedAt: "2026-03-15"
archived: false
order: 3
pathStep: 3
series:
  name: "Getting Started"
  part: 3
prerequisites: ["llm-guide"]
estimatedMinutes: 10
tags: ["API Key", "OpenAI", "Anthropic", "Google AI Studio", "OpenRouter", "Gemini", "Claude", "GPT"]
stuckOptions:
  "Which provider": ["I haven't decided which provider to use yet", "Can I add more providers later?"]
  "Google AI Studio": ["Can't find the API Key button", "What's the difference between Google AI Studio and Google Cloud Console?", "It says my region isn't supported"]
  "OpenRouter": ["Can't find the key after signing up", "How much free credit do I get?", "How do I add funds?"]
  "OpenAI": ["Is the API separate from ChatGPT Plus?", "My credit card was declined", "I can't see the full key after creating it"]
  "Anthropic": ["How do I activate the $5 free credit?", "What does the key format look like?"]
  "Key security": ["What if I accidentally expose my key?", "Where should I store my key?"]
---

## What's This Article About?

> This LaunchDock tutorial walks you through getting your API Key as quickly as possible so OpenClaw can connect to AI.

In the previous step, you [chose your LLM plan](/articles/llm-guide). Now it's time to **get the key (API Key)** that lets OpenClaw call AI models.

The entire process takes about 3–10 minutes, depending on which plan you chose.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **You only need to pick one.** You can always add other providers later.

---

## 🚨 Important Concept: An API Key Is Like a Password

An API Key is like the key to your home. Whoever has it can call AI using your account — **and spend your money**.

**Three basic rules:**
1. **Don't screenshot and share** your Key
2. **Don't post it anywhere public** (GitHub, forums, chat rooms)
3. **If it leaks, revoke it immediately** and create a new one

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: An API Key is your front door key. You wouldn't post a photo of your key on Instagram, right? Same logic — if a Key leaks, it's like leaving your door wide open for anyone to come in and charge your credit card.

---

## Option A: Google AI Studio (Recommended for Beginners)

The simplest option — done in 3 minutes, no credit card needed.

### Step 1: Go to Google AI Studio

1. Open your browser and go to Google AI Studio (search "Google AI Studio")
2. Sign in with your Google account

![Google AI Studio homepage](/images/articles/ai-api-key-guide/003.png)

### Step 2: Get Your API Key

1. After signing in, find "**Get API key**" in the left sidebar
2. Click "**Create API key**"

![Click Get API key](/images/articles/ai-api-key-guide/005.png)

3. Select a Google Cloud project (if you don't have one, it will create one for you automatically)
4. Click "**Create API key in new project**"

![Create API Key](/images/articles/ai-api-key-guide/006.png)

5. Your Key will appear on screen in this format:

```
AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **Copy this Key and store it somewhere safe** (e.g., a password manager or a private note)

![API Key created successfully](/images/articles/ai-api-key-guide/007.png)

### Step 3: Verify the Key Works

On the Google AI Studio page, you can test it directly:

1. Go back to the main page
2. Type "Hello" in the chat box
3. If the AI responds, your account is working and the Key is valid

![Testing in Google AI Studio](/images/articles/ai-api-key-guide/008.png)

> ✅ **Done!** You've got your Gemini API Key. Jump to [Next step: Install OpenClaw](/articles/install-openclaw).

### (Optional) Set a Spending Limit — Finally Safe to Add a Card

Before, many users hesitated to link a credit card to Gemini because there was no way to cap spending. Google AI Studio now supports **spending limits**, so you can safely upgrade to a paid plan!

1. Go to the [AI Studio Spend Management page](https://aistudio.google.com/spend)
2. The page shows all your projects (Free tier, Tier 1, etc.)
3. Select a project and set your monthly spending cap

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> With a cap set, even if OpenClaw goes wild calling the API, you'll never spend more than the limit you defined. No more bill shock!

### 🚨 Common Issues

**Q: It says "Google AI Studio is not available in your region"?**

Some regions may have restrictions. Solutions:
- Check your Google account's region settings
- Try using a different Google account

**Q: Is this the same as a Google Cloud Console API Key?**

**No!** These are two completely different things:

| | Google AI Studio | Google Cloud Console |
|---|---|---|
| **Purpose** | Call Gemini AI models | Connect Google Drive / Gmail |
| **Key format** | `AIzaSy...` | OAuth Client ID + Secret |
| **Cost** | Generous free tier, with spending limit support | Requires a billing account |
| **Tutorial** | This article | [Google API Key Guide](/articles/google-api-key-guide) |

---

## Option B: OpenRouter

One Key to access dozens of models.

### Step 1: Create an Account

1. Go to the OpenRouter website
2. Click "**Sign Up**"
3. You can sign up directly with your Google account

![OpenRouter signup page](/images/articles/ai-api-key-guide/016.png)

### Step 2: Get Your API Key

1. After signing in, click your avatar in the top right → "**Keys**"
2. Click "**Create Key**"
3. Enter `openclaw` as the name (or whatever you like)
4. Click "**Create**"

![Create OpenRouter API Key](/images/articles/ai-api-key-guide/017.png)

5. The Key will appear once, in this format:

```
sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **Copy it immediately!** You won't be able to see the full Key after closing this dialog

![Copy API Key](/images/articles/ai-api-key-guide/024.png)

### Step 3: Add Credits (Optional)

- The free credit can be used for testing first
- Need more credit: Click "**Credit**" → Choose an amount → Pay

> ✅ **Done!** Jump to [Next step: Install OpenClaw](/articles/install-openclaw).

---

## Option C: OpenAI API

### Step 1: Create an OpenAI Platform Account

1. Go to OpenAI Platform (search "OpenAI API")
2. Click "**Sign up**" to create an account (or sign in with your existing ChatGPT account)

![OpenAI Platform signup](/images/articles/ai-api-key-guide/027.png)

> ⚠️ **Note**: The API and ChatGPT Plus are billed **separately**. Having ChatGPT Plus doesn't mean you have API credits — you need to add funds separately.

### Step 2: Add Funds

1. After signing in, go to "**Settings**" → "**Billing**"
2. Click "**Add payment method**" to add a credit card
3. Add at least $5 USD

![OpenAI billing page](/images/articles/ai-api-key-guide/030.png)

4. **Strongly recommended: Set a spending limit**: In Billing → Usage limits → Set a **Hard cap** (e.g., $10/month)

![Set spending limit](/images/articles/ai-api-key-guide/031.png)

### Step 3: Create an API Key

1. Go to the "**API keys**" page
2. Click "**Create new secret key**"
3. Enter `openclaw` as the name
4. Click "**Create secret key**"

![Create OpenAI API Key](/images/articles/ai-api-key-guide/032.png)

5. The Key format looks like this:

```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **Copy it immediately!** This Key is only shown once

![Copy API Key](/images/articles/ai-api-key-guide/033.png)

> ✅ **Done!** Jump to [Next step: Install OpenClaw](/articles/install-openclaw).

### 🚨 Common Issues

**Q: I forgot to copy the Key after creating it?**

No worries — just create a new one. You can delete the old one.

**Q: My credit card was declined?**

OpenAI doesn't accept some prepaid cards and virtual cards. Try a regular credit card or debit card.

---

## Option D: Anthropic API

### Step 1: Create an Account

1. Go to Anthropic Console (search "Anthropic Console")
2. Click "**Sign Up**"
3. Register with email and complete verification

![Anthropic Console signup](/images/articles/ai-api-key-guide/047.png)

### Step 2: Get Your Free Credit

- New accounts receive **$5 USD free credit**
- No credit card required to use it

### Step 3: Create an API Key

1. After signing in, go to the "**API Keys**" page
2. Click "**Create Key**"
3. Enter `openclaw` as the name
4. Click "**Create Key**"

![Create Anthropic API Key](/images/articles/ai-api-key-guide/048.png)

5. The Key format looks like this:

```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **Copy it immediately!**

![Copy API Key](/images/articles/ai-api-key-guide/051.png)

> ✅ **Done!** Jump to [Next step: Install OpenClaw](/articles/install-openclaw).

---

## Got Your Key — What's Next?

You now have an API Key in hand. **Store it securely** — you'll need it during the OpenClaw setup wizard after installation.

**Next step: Install OpenClaw → Choose your operating system**

👉 [Install OpenClaw](/articles/install-openclaw)

---
