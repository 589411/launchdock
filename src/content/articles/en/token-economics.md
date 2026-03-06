---
title: "Token Economics: Understanding How AI Bills You (So Your Invoice Doesn't Explode)"
description: "What are tokens? How do different models charge? Learn to precisely control your AI usage costs and get the most value for your money."
contentType: "guide"
scene: "intro"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 2
prerequisites: ["llm-guide"]
estimatedMinutes: 8
tags: ["Token", "LLM", "Cost Control"]
stuckOptions:
  "What is a Token": ["How are tokens different from characters?", "Do Chinese characters use more tokens?", "Why not just charge by word count?"]
  "Model pricing": ["Which is cheaper, OpenAI or Google?", "What happens when free credits run out?", "How do I check my billing details?"]
  "Cost estimation": ["How much will I spend per month?", "What if I go over budget?"]
  "Money-saving tips": ["How can I reduce token usage?", "Will downgrading models make a big difference?", "What does caching mean?"]
---
## Why Do You Need to Understand Tokens?

You've already [applied for an API Key](/en/articles/ai-api-key-guide) and started using OpenClaw. Then one day, you receive a bill—

> "This month's API usage fee: $47.82"

Wait, I only used it for a few days! How is it already almost $50?

The problem is: you didn't know what tokens are, and you had no idea how much each API call was costing you.

---

## What Is a Token?

**A token is AI's "unit of measurement," like kilowatt-hours for electricity.**

But tokens ≠ words. AI breaks text into small pieces (called tokens), and each piece might be a word, half a word, or even a punctuation mark.

### English vs Chinese

```
English: "Hello world" → 2 tokens (each word = 1 token)
Chinese: "你好嗎？"    → 4-6 tokens (each character may be 1-2 tokens)
```

> ⚠️ **Important: Chinese costs about 1.5-2x more than English**, because Chinese characters break into more tokens.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: Tokens are like a taxi meter. You're not charged per trip — the meter ticks with every small increment. The more you say and the longer the AI responds, the more ticks on the meter.

### How Tokenization Actually Works

Using OpenAI's tokenizer as an example:

| Text               | Token Count | Explanation                      |
| ------------------- | ----------- | -------------------------------- |
| `Hello`           | 1           | Common English word = 1 token    |
| `你好`            | 2-3         | Each Chinese character ≈ 1-2 tokens |
| `OpenClaw`        | 2-3         | Uncommon compound words get split |
| `2024年2月24日`   | 5-7         | Mixed numbers + Chinese          |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Try it yourself**: Go to [OpenAI Tokenizer](https://platform.openai.com/tokenizer), paste in your text, and see the actual token count.

---

## Input Tokens vs Output Tokens

Every AI call has two cost components:

```
Your question    → Input Tokens
AI's response    → Output Tokens
```

**Output tokens are typically 2-4x more expensive than input tokens.**

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says**: Why are outputs more expensive than inputs? Imagine going to a restaurant — ordering a dish (input) only takes a few words, but the chef has to buy ingredients, prep, cook, and plate it (output). Of course the chef's side costs more.

### Cost Structure

```
Total Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

---

## Pricing by Model

Major model prices as of early 2026 (per million tokens):

### OpenAI

| Model       | Input Price | Output Price | Best For                     |
| ----------- | ----------- | ------------ | ---------------------------- |
| GPT-4o      | $2.50       | $10.00       | Daily conversations, medium-complexity tasks |
| GPT-4o mini | $0.15       | $0.60        | Simple tasks, high-volume calls |

### Google

| Model            | Input Price        | Output Price       | Best For          |
| ---------------- | ------------------ | ------------------ | ----------------- |
| Gemini 2.0 Flash | Free (with quota)  | Free (with quota)  | Best for beginners! |
| Gemini 1.5 Pro   | $1.25              | $5.00              | Long documents, multimodal |

### Anthropic Claude

| Model             | Input Price | Output Price | Best For                    |
| ----------------- | ----------- | ------------ | --------------------------- |
| Claude 3.7 Sonnet | $3.00       | $15.00       | Writing, analysis, coding   |
| Claude 3.5 Haiku  | $0.80       | $4.00        | Fast responses, low cost    |
| Claude 3 Opus     | $15.00      | $75.00       | Highest quality, complex reasoning |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Beginner recommendation**: Start with **Gemini 2.0 Flash** (free quota). Once you're comfortable, consider paid models.
> That's also why we first teach you to [apply for a Google API Key](/en/articles/google-api-key-guide).

---

## Real-World Cost Estimation

### Scenario 1: Using OpenClaw Daily to Summarize News

Suppose you have your Agent run a "news summary" once per day:

- Search + input: ~2,000 tokens
- Summary + output: ~1,500 tokens
- Model: GPT-5 Nano

```
Daily cost = (2,000 × $0.05 / 1M) + (1,500 × $0.40 / 1M)
           = $0.0001 + $0.0006
           = $0.0007

Monthly cost = $0.0007 × 30 = $0.021 (less than 1 TWD)
```

**Less than 1 TWD per month.** Using Nano-tier models for simple tasks is incredibly cost-effective.

### Scenario 2: Writing 5 Long Articles Per Day

Suppose each article requires substantial context:

- Input: ~10,000 tokens × 5
- Output: ~3,000 tokens × 5
- Model: Claude Sonnet 4.5

```
Daily cost = (50,000 × $3.00 / 1M) + (15,000 × $15.00 / 1M)
           = $0.15 + $0.225
           = $0.375

Monthly cost = $0.375 × 30 = $11.25 (about 370 TWD)
```

Upgrading to Claude Opus 4.6 would cost ~$45/month. Downgrading to Gemini 2.5 Flash would bring it down to ~$1.5/month.

### Scenario 3: Why Did My Bill Explode?

Common culprits:

| Cause                                      | Solution                      |
| ------------------------------------------ | ----------------------------- |
| Conversations too long, sending full history every time | Limit conversation memory length |
| Using flagship models for simple tasks      | Downgrade to Flash / Nano     |
| A Skill bug causing infinite loops          | Set token limits              |
| Forgetting System Prompt also counts as tokens | Streamline System Prompt    |

---

## Money-Saving Tips

### 1. Choose the Right Model (Most Important)

**80% of tasks work fine with the cheapest model.**

```
Simple Q&A, classification, summaries  → GPT-5 Nano / DeepSeek V3
Writing articles, analysis reports     → Gemini 2.5 Flash / Claude Haiku 4.5
Code, complex reasoning                → Claude Sonnet 4.5 / GPT-4.1
Very long documents (>200K tokens)     → Gemini 2.5 Pro / Gemini 3.1 Pro
Best possible quality                  → Claude Opus 4.6
```

In OpenClaw, you can [assign different models to different Skills](/en/articles/openclaw-model-config).

### 2. Streamline Your System Prompt

The System Prompt is sent with every call — it's a "hidden cost."

```
❌ 500-token System Prompt × 100 calls/day = 50,000 tokens/day
✅ 100-token System Prompt × 100 calls/day = 10,000 tokens/day
```

That's an 80% reduction! Check the [Soul Configuration Guide](/en/articles/openclaw-soul) to learn how to write concise, effective personas.

### 3. Use Caching

Both OpenAI and Anthropic support Prompt Caching:

- Repeated prefix portions are only counted once
- Can save 50-80% on input token costs
- OpenClaw has built-in support — no extra configuration needed

### 4. Limit Output Length

Add `max_tokens` limits in your Skills:

```yaml
# In Skill configuration
config:
  max_tokens: 500  # Generate at most 500 tokens in the response
```

### 5. Set Budget Alerts

In the OpenAI Dashboard:

1. Settings → Billing → Usage limits
2. Set a Hard limit and a Soft limit (alert threshold)

Recommended settings:

- Soft limit: $5 (alerts you)
- Hard limit: $20 (forces a stop)

---

## How OpenClaw Saves You Money

OpenClaw has several built-in cost-saving mechanisms:

1. **Model routing**: Automatically selects models based on task complexity (configured in [Model Settings](/en/articles/openclaw-model-config))
2. **Agent memory compression**: Doesn't send the entire history — only retains the important parts
3. **Skill caching**: Identical inputs won't trigger duplicate calls
4. **Token budgets**: Each Skill can have its own limit

---

## FAQ

### What if my free credits run out?

- Google Gemini Flash has a daily free quota (usually enough for personal use)
- New OpenAI accounts get $5 in free credits (good for trying things out)
- After that, you'll need to top up — we recommend starting with $10

### My monthly budget is only about $3 USD

Totally doable! With GPT-5 Nano ($0.05/$0.40) or DeepSeek V3 ($0.27/$1.10), typical usage won't even reach $1/month. If you use OpenRouter's free models (200 requests/day), it costs almost nothing.

### Do tokens expire?

Tokens aren't prepaid credits — you pay for what you use. Your API balance doesn't expire (unless it's a time-limited promotion).

---

## Next Steps

Now that you understand tokens, you can:

- 🔑 [Apply for an API Key and start using AI](/en/articles/ai-api-key-guide)
- ⚙️ [Set up model switching strategies](/en/articles/openclaw-model-config)
- 🧩 [Set token budgets when writing Skills](/en/articles/openclaw-skill)
- 💬 [Prompt Engineering: Better results with fewer tokens](/en/articles/prompt-engineering)
