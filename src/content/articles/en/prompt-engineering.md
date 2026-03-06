---
title: "Prompt Engineering: Making AI Understand You and Give the Answers You Want"
description: "Master the core techniques of prompt engineering — from role-setting to chain-of-thought — and improve the same model's output quality by 10x."
contentType: "guide"
scene: "advanced"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 1
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 10
tags: ["Prompt", "LLM"]
stuckOptions:
  "Why Prompt matters": ["Can't I just ask casually?", "Isn't AI supposed to be smart?"]
  "Basic Prompt structure": ["How do I separate role, task, and format?", "Do I have to write a long prompt every time?"]
  "Five key techniques": ["What is Few-shot?", "I don't understand chain-of-thought", "When should I use which technique?"]
  "Applying in OpenClaw": ["How do I write an Agent's System Prompt?", "How do I use prompt techniques in Skills?"]
  "Common pitfalls": ["What if AI keeps hallucinating?", "Responses are too long or too short", "How do I make AI admit it doesn't know?"]
---

## Why "How You Ask" Matters More Than "What You Ask"

The same question, asked differently, produces wildly different results:

**❌ Mediocre prompt:**
```
Help me write a letter
```
→ AI returns a generic template, and you still have to rewrite 80%.

**✅ Well-crafted prompt:**
```
You are a senior marketing manager. Please write a year-end partnership review letter to a client.
- Tone: Professional but warm
- Length: Under 300 words
- Must include: This year's collaboration results with data, next year's outlook, a thank you message
- Format: Paragraphs with subheadings
```
→ AI delivers a ready-to-use piece.

What's the difference? That's **prompt engineering**.

---

## The Basic Structure of a Prompt

A good prompt has four parts (you don't always need all of them):

```
┌─────────────────────────────────────┐
│ 1. Role                              │
│    You are a senior marketing manager │
├─────────────────────────────────────┤
│ 2. Task                              │
│    Write a year-end review letter     │
├─────────────────────────────────────┤
│ 3. Constraints                        │
│    300 words, professional tone, paragraphs │
├─────────────────────────────────────┤
│ 4. Format                            │
│    Markdown, tables, JSON...          │
└─────────────────────────────────────┘
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: Writing a prompt is like filling out an order slip. If you tell the waiter "bring me something good," they have no idea what to serve. But if you say "not spicy, one rice one meat one soup, under $7" — the meal arrives exactly right.

### 1. Role Setting

Telling AI "who you are" can significantly improve response quality.

```
You are a Python engineer with 10 years of experience.
You are a science writer who writes for elementary school kids.
You are a strict code reviewer.
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Role setting shares the exact same concept as OpenClaw's [Soul persona](/en/articles/openclaw-soul).

### 2. Clear Task Description

Don't be vague. The more specific, the better the result.

```
❌ "Help me organize this"
✅ "Take the following 10 key points, rank them by importance, and organize them into a table with columns: Summary, Responsible Person, Deadline"
```

### 3. Constraints

Limiting AI's creative freedom actually produces better results.

```
- Keep the answer under 200 words
- Use English
- Don't use transition words like "first," "next," "finally"
- If you're unsure, say "I'm not sure" instead of guessing
```

### 4. Output Format

Specify the format you want, and AI won't go off the rails.

```
Please respond in the following JSON format:
{
  "summary": "Brief summary",
  "key_points": ["Point 1", "Point 2"],
  "action_items": ["To-do 1", "To-do 2"]
}
```

---

## Five Key Prompt Techniques

### Technique 1: Zero-shot (Just Ask)

The simplest approach, suitable for simple tasks.

```
Translate the following sentence to Chinese: "The weather is great today"
```

### Technique 2: Few-shot (Give Examples)

Give AI a few examples so it understands the "pattern" you want.

```
Please classify new customer complaints based on the following example format:

Example 1:
Complaint: "Order arrived three days late" → Category: Logistics Issue, Urgency: Medium
Complaint: "Product was broken on arrival" → Category: Quality Issue, Urgency: High

New complaint: "Website keeps crashing, can't place an order" →
```

AI will learn the format and respond: `Category: Technical Issue, Urgency: High`

> 🔑 **Few-shot is a core technique for OpenClaw Skills.** In your [Skill YAML](/en/articles/openclaw-skill), use the `examples` field to define examples.

### Technique 3: Chain of Thought / CoT

Make AI "think it through" instead of jumping straight to the answer.

```
❌ "Mike has 5 apples, gave 2 to Jane, then bought 3 more. How many does he have?"

✅ "Mike has 5 apples, gave 2 to Jane, then bought 3 more. How many does he have?
   Please reason step by step, showing each calculation."
```

Chain-of-thought is especially effective for complex reasoning tasks, improving accuracy by 20-40%.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says**: CoT is like when your math teacher tells you to "show your work." Writing the answer directly leads to careless mistakes, but writing out each step actually prevents errors. AI works the same way — when you tell it to think slowly, it actually gets smarter.

### Technique 4: Role Play

Have AI answer from a specific perspective.

```
You are about to interview for a software engineering position at Google.
I am the interviewer and will ask you technical questions.
Please answer as if in a real interview — you can take time to think, and you can say you're unsure.
```

### Technique 5: Self-Consistency

Have AI answer 3 times and pick the most consistent answer.

```
Please solve this problem in three different ways, then compare the results
from all three approaches and pick the answer you're most confident in.
```

---

## Applying Prompt Techniques in OpenClaw

### System Prompt = The Agent's "Soul"

OpenClaw's [Soul settings](/en/articles/openclaw-soul) are the long-running System Prompt:

```markdown
# SOUL.md
You are an AI assistant focused on marketing analysis.
- Always cite data sources in your answers
- Use English
- When unsure, ask for clarification rather than guessing
```

### Skill Prompt = The Task's "SOP"

In a [Skill](/en/articles/openclaw-skill), your prompt is the workflow instruction:

```yaml
name: weekly-news-summary
steps:
  - action: llm_generate
    input:
      prompt: |
        You are a senior tech journalist.
        Please organize the following news into a table with:
        - Title
        - One-sentence summary
        - Impact level (High/Medium/Low)
        
        News content:
        {{news_content}}
      model: gpt-4o-mini
      max_tokens: 800
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Cost reminder**: Streamlining your prompts can significantly reduce [token costs](/en/articles/token-economics). Every 100 tokens saved, with 100 calls per day, saves 10,000 tokens.

### Agent Prompt = The Decision-Making "Compass"

An [Agent's](/en/articles/openclaw-agent) prompt determines how it thinks and selects Skills:

```markdown
# AGENTS.md - Marketing Analysis Agent
You have the following tools:
1. News Search Skill
2. Data Analysis Skill
3. Report Generation Skill

Decision principles:
- Gather data first, then analyze
- Proactively search for more data when insufficient
- Automatically send email after report is complete
```

---

## Common Pitfalls and Solutions

### Pitfall 1: AI Hallucination (Making Things Up)

AI can state incorrect facts with great confidence.

**Solution:**
```
If you're unsure of the answer, clearly say "I'm not sure" instead of guessing.
For factual questions, include your sources.
```

### Pitfall 2: Responses Too Long

AI tends toward verbose responses.

**Solution:**
```
Answer in 3 sentences or less.
Use bullet points instead of paragraphs.
Don't repeat my question back to me.
```

### Pitfall 3: Wrong Tone

The default tone might be too formal or too casual.

**Solution:**
```
Tone: Like a friend chatting, use "you" not "one."
Avoid transition words like "firstly," "subsequently," "in conclusion."
```

### Pitfall 4: Losing Context

In long conversations, AI forgets what was discussed earlier.

**Solutions:**
- Place important information at the beginning of the prompt (AI remembers the beginning best)
- Use OpenClaw's [Agent memory system](/en/articles/openclaw-agent) to automatically manage context
- Wrap critical information in `<important>` tags to make it stand out

---

## Prompt Template Library

Here are several ready-to-use templates:

### Summary Template

```
Please organize the following content into a structured summary:

## Rules
- List 3-5 key findings first
- Describe each finding in one sentence
- End with a summary of 50 words or less
- Flag any items that need follow-up

## Content
{{paste_content_here}}
```

### Meeting Notes Template

```
You are a professional meeting note-taker. Please organize the following meeting transcript into meeting notes.

## Format Requirements
- Date and attendees
- List of agenda items
- Key discussion points for each item (bullet points)
- Decisions made
- Action items (table: Item / Owner / Deadline)

## Transcript
{{meeting_transcript}}
```

### Debugging Template

```
I've encountered a bug. Please help me analyze it.

## Language: {{language}}
## Error Message:
{{error_message}}

## Relevant Code:
{{code}}

## Please answer in order:
1. What is the root cause of this error?
2. How do I fix it? (Provide specific code)
3. How can I prevent this in the future?
```

---

## FAQ

### Do I have to write such long prompts every time?

No. Save your frequently used prompts as OpenClaw [Skills](/en/articles/openclaw-skill), and you can launch them with a single command. That's the ultimate goal of prompt engineering: **write once, reuse forever**.

### Do prompt techniques work with all models?

Basically, yes. Role-setting, few-shot, and CoT are effective across all major models. However, different models vary in how well they follow formatting instructions, so some fine-tuning may be needed. See the [Model Configuration Guide](/en/articles/openclaw-model-config) for model selection tips.

### Any recommended learning resources?

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- Or just experiment directly in OpenClaw — every Skill is a prompt engineering exercise

---

## Next Steps

Now that you've mastered prompt techniques, you can:

- 🧩 [Turn great prompts into automated workflows with Skills](/en/articles/openclaw-skill)
- 🤖 [Write effective Agent decision-making prompts](/en/articles/openclaw-agent)
- 👻 [Make AI personas more precise: Soul settings](/en/articles/openclaw-soul)
- 💰 [Achieve the same results with fewer tokens](/en/articles/token-economics)
- 🔗 [Understand MCP Protocol: How AI connects to external tools](/en/articles/mcp-protocol)
