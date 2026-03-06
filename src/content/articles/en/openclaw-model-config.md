---
title: "Model Configuration & Switching: Let OpenClaw Auto-Select the Best AI Model"
description: "Different tasks call for different models. Learn to configure Providers, model routing, and Fallback mechanisms — save money and boost efficiency."
contentType: "tutorial"
scene: "basics"
difficulty: "intermediate"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 3
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 10
tags: ["OpenClaw", "Models", "GPT", "Gemini", "Claude", "Configuration"]
stuckOptions:
  "Why switch models": ["Can't I just use one model for everything?", "Are models really that different?"]
  "Provider setup": ["Where do I put the API Key?", "How do I set env variables?", "Connection test failed"]
  "Model routing config": ["How do I write routing patterns?", "How do I specify a model in a Skill?"]
  "Fallback mechanism": ["When does Fallback trigger?", "How do I set the Fallback order?"]
  "Advanced strategies": ["How do I estimate cost budgets?", "How do I compare model performance?"]
---

## One Model to Rule Them All? Not Quite

You might be using GPT-4o (or Gemini Flash) for everything. Most of the time, that's fine.

But consider these scenarios:

| Scenario | Using GPT-4o | Better Choice |
|---|---|---|
| Simple classification, format conversion | Overkill, wasting Tokens | GPT-4o mini (20x cheaper) |
| Complex mathematical reasoning | Sometimes gets it wrong | o1 (specialized for reasoning) |
| Very long documents (100K+ words) | Hits context limits | Gemini 1.5 Pro (1M Token window) |
| API goes down | Entire system stops | Auto-switch to Claude (Fallback) |

**Model switching isn't an advanced feature — it's the basics of saving money and staying reliable.**

---

## Provider Setup

### What Is a Provider?

Provider = the "vendor" of AI models.

```
OpenAI    → GPT-4o, GPT-4o mini, o1
Google    → Gemini 2.0 Flash, Gemini 1.5 Pro
Anthropic → Claude 3.5 Sonnet, Claude 3 Haiku
```

### Set Up API Keys

Configure each Provider's Key in OpenClaw's `.env` file:

```bash
# Set at least one
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Don't have an API Key yet? Check the [AI Model API Key Guide](/en/articles/ai-api-key-guide) first — Google AI Studio has a free tier, perfect for beginners.
>
> Note: The key you enter here is the **AI model Key** (for calling LLMs), not the [Google Drive/Gmail OAuth Key](/en/articles/google-api-key-guide) — those are different.

### Test Connections

```bash
# Test all configured Providers
openclaw provider test

# Example output:
# ✅ OpenAI: Connected (GPT-4o, GPT-4o-mini)
# ✅ Google: Connected (Gemini-2.0-Flash, Gemini-1.5-Pro)
# ❌ Anthropic: No API key configured
```

---

## Model Routing: Auto-Select the Best Model

### Core Concept

Model routing = an AI version of "smart call forwarding." Based on the task characteristics, it automatically assigns the most suitable model.

```
Simple Q&A        → GPT-4o mini (cheap & fast)
Writing/Analysis  → Claude Sonnet (best quality)
Long documents    → Gemini Pro (ultra-long context)
Math reasoning    → o1 (specialized reasoning)
```

### How to Configure

In `config.yaml`:

```yaml
models:
  # Default model (used when nothing else is specified)
  default: gpt-4o-mini

  # Model routing rules
  routing:
    # High-quality tasks
    - pattern: "write|create|compose|analyze|report"
      model: gpt-4o
      reason: "Requires higher generation quality"

    # Reasoning tasks
    - pattern: "calculate|prove|math|reasoning"
      model: o1
      reason: "Complex reasoning needs a specialized model"

    # Long document tasks
    - pattern: "summarize_long|full_text|long_form"
      model: gemini-1.5-pro
      reason: "Requires ultra-long context window"

  # Everything else
  fallback: gpt-4o-mini
```

### Specify a Model in a Skill

You can also specify a model for each step within a [Skill](/en/articles/openclaw-skill):

```yaml
name: weekly-report
steps:
  # Step 1: Gather data (use cheap model)
  - action: llm_generate
    config:
      model: gpt-4o-mini
    input:
      prompt: "Extract key facts from the following news..."

  # Step 2: Write analysis (use premium model)
  - action: llm_generate
    config:
      model: gpt-4o
    input:
      prompt: "Based on the following facts, write an in-depth analysis report..."

  # Step 3: Translate to English (cheap model is enough)
  - action: llm_generate
    config:
      model: gpt-4o-mini
    input:
      prompt: "Translate the following report into English..."
```

This way, for one report: Steps 1 and 3 use the cheap model, and only Step 2 uses the premium one. Over 60% cheaper than using GPT-4o for the entire process.

---

## Fallback Mechanism: Don't Fear Downtime

### What Is Fallback?

API services occasionally go down (rate limits, server maintenance…). The Fallback mechanism lets OpenClaw automatically switch to a backup model so your work isn't interrupted.

### Configure Fallback

```yaml
models:
  default: gpt-4o

  fallback_chain:
    - gpt-4o           # First choice
    - claude-3.5-sonnet # If OpenAI is down, use Claude
    - gemini-2.0-flash  # If Claude is also down, use Gemini
    - gpt-4o-mini       # Last resort

  # When to trigger Fallback
  fallback_triggers:
    - error: rate_limit     # API rate limiting
    - error: server_error   # Server error
    - error: timeout        # Timeout (>30 seconds)
    - error: context_length # Context limit exceeded
```

### How It Works in Practice

```
Trying GPT-4o... → 429 Rate Limit
Auto-switching: Trying Claude 3.5 Sonnet... → ✅ Success
Work continues, user notices nothing
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Fallback is the biggest benefit of having multiple Providers. With only one Provider, you don't have this safety net.

---

## Model Comparison: Which Model for Which Scenario?

### Quick Selection Guide

```
💰 Most affordable:    GPT-4o mini / Gemini Flash
📝 Best writing:       Claude 3.5 Sonnet
🧮 Best reasoning:     o1
📚 Longest documents:  Gemini 1.5 Pro (1M tokens)
⚡ Fastest response:   Gemini 2.0 Flash
🎨 Best multimodal:    GPT-4o / Gemini Pro
```

### Detailed Comparison

| Feature | GPT-4o | GPT-4o mini | Claude Sonnet | Gemini Flash | o1 |
|---|---|---|---|---|---|
| Speed | Medium | Fast | Medium | Fastest | Slow |
| Quality | High | Medium | Highest (writing) | Medium | Highest (reasoning) |
| Price | Medium | Lowest | Medium-high | Free/Low | High |
| Context Window | 128K | 128K | 200K | 1M | 200K |
| Tool Use | Best | Good | Good | Good | Limited |

### My Recommended Combos

**Beginner (zero cost):**
```yaml
default: gemini-2.0-flash
```

**Daily use (low cost):**
```yaml
default: gpt-4o-mini
fallback: gemini-2.0-flash
```

**Professional work (quality first):**
```yaml
default: gpt-4o
routing:
  - pattern: "write|analyze"
    model: claude-3.5-sonnet
  - pattern: "math|reasoning"
    model: o1
fallback: gpt-4o-mini
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Not sure how to estimate costs? See [Token Economics](/en/articles/token-economics) for detailed cost calculations.

---

## Advanced: Cost Budget Controls

### Set Daily/Monthly Budget Limits

```yaml
budget:
  daily_limit: 1.00    # Max $1 USD per day
  monthly_limit: 20.00 # Max $20 USD per month

  # What happens when over budget
  over_budget_action: downgrade  # Auto-downgrade to cheapest model
  # Other options: block (stop entirely), warn (just warn)
```

### Track Usage

```bash
# View today's usage
openclaw usage today

# Output:
# 📊 Today's Usage Stats
# ├─ GPT-4o:     2,340 input / 1,560 output = $0.021
# ├─ GPT-4o-mini: 15,200 input / 8,900 output = $0.008
# └─ Total: $0.029 / $1.00 daily limit (2.9%)

# View monthly report
openclaw usage monthly
```

---

## FAQ

### I set up multiple Providers but only one gets used?

Check the routing rules in `config.yaml`. Without routing configured, only the `default` model is used.

### Model response quality is inconsistent?

Fallback might be triggering and switching to a lower-quality model. Check the logs:

```bash
openclaw logs --filter model
# Shows which model was actually used for each request
```

### Can anyone see my API Key?

No. API Keys are stored in the `.env` file and only used on the local server side. The frontend (browser) never sees the Key.

If you're using [cloud deployment](/en/articles/deploy-openclaw-cloud), Keys are stored in environment variables and are equally secure.

---

## Next Steps

Now that your models are configured:

- 🧩 [Use different models for different steps in your Skills](/en/articles/openclaw-skill)
- 🤖 [Let Agents auto-select models to complete tasks](/en/articles/openclaw-agent)
- 💬 [Master Prompts to get great results from cheap models](/en/articles/prompt-engineering)
- 💰 [Calculate your Token costs precisely](/en/articles/token-economics)
- 🔗 [Connect more external tools with MCP](/en/articles/mcp-protocol)
