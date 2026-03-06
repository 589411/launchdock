---
title: "OpenClaw Skill Complete Guide: Teach AI Repeatable Workflows"
description: "Skills are OpenClaw's core feature. Master Skills, and your AI can complete in one click what used to take 30 minutes."
contentType: "guide"
scene: "core"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 1
prerequisites: ["openclaw-first-skill"]
estimatedMinutes: 8
tags: ["OpenClaw", "Skill", "Automation", "Workflow"]
stuckOptions:
  "What is a Skill": ["How is it different from other automation tools?", "Do I need to know how to code?"]
  "Basic structure": ["Can't understand YAML format", "Indentation keeps breaking", "Confused about the relationship between action and input"]
  "Action list": ["Don't know which Action to use", "Can't find the Action I need"]
  "Email summary bot": ["Followed the steps but execution failed", "No output results", "How do I make it run automatically?"]
  "Advanced techniques": ["Can't understand conditional logic", "How does variable passing work?"]
---

## What Is a Skill? In One Sentence

**Skill = A fixed workflow you teach AI to follow.**

It's like training a new colleague on a task: do A first, then B, then C. A Skill writes this process down so OpenClaw's Agent can run it repeatedly.

---

## Why Do You Need Skills?

You might be thinking: "I can just tell ChatGPT directly, why bother writing a Skill?"

Great question. Here's the difference:

| Direct Chat | Using a Skill |
|---|---|
| Describe from scratch every time | Write once, use forever |
| Inconsistent results (prompt may vary) | Consistent results (fixed workflow) |
| Can't connect to other tools | Can connect to Google Drive, Notion, etc. |
| Only handles single steps | Can orchestrate multi-step workflows |

### An Analogy

- **Direct chat** = Verbally telling an assistant each time "look up XX, organize into a table, then email the boss"
- **Skill** = Writing an SOP for the assistant — from now on, just say "run the weekly report"

---

## Basic Structure of a Skill

A Skill consists of the following parts:

```yaml
# 📄 my-first-skill.yaml
name: "Weekly News Digest"
description: "Search for the latest news on a specified topic, organize into a summary, save to Google Drive"

# Trigger method
trigger:
  type: manual  # manual = manual trigger | schedule = scheduled trigger
  # schedule: "0 9 * * 1"  # Every Monday at 9 AM (cron format)

# Input parameters
inputs:
  - name: topic
    type: string
    description: "Topic to search for"
    default: "AI Technology Trends"

# Steps
steps:
  - id: search
    action: web_search
    params:
      query: "{{topic}} latest news this week"
      max_results: 10

  - id: summarize
    action: llm_generate
    params:
      prompt: |
        Please organize the following search results into a summary:
        {{search.results}}
        
        Format requirements:
        - One paragraph per news item
        - Include title, source, and key summary
        - End with a "Weekly Trend Summary"

  - id: save
    action: google_drive_create
    params:
      title: "Weekly_Report_{{topic}}_{{date}}"
      content: "{{summarize.output}}"
      folder: "Weekly Reports"
```

Looks like a lot? Don't worry, let's break it down step by step.

---

## Breaking Down Each Part of a Skill

### 1. Basic Info (name / description)

```yaml
name: "Weekly News Digest"
description: "Search for the latest news on a specified topic, organize into a summary, save to Google Drive"
```

- `name`: The Skill's name — used when you tell the Agent "run XX"
- `description`: Describes what the Skill does — the Agent references this to decide when to use it

### 2. Trigger Method (trigger)

```yaml
trigger:
  type: manual
```

| Trigger Type | Description | Example |
|---|---|---|
| `manual` | Manual trigger | You say "run weekly report" |
| `schedule` | Scheduled execution | Runs automatically every Monday at 9 AM |
| `event` | Event-driven trigger | Runs when a specific Email is received |

### 3. Input Parameters (inputs)

```yaml
inputs:
  - name: topic
    type: string
    description: "Topic to search for"
    default: "AI Technology Trends"
```

Parameters make your Skill flexible. The same Skill can run with different topics:

- "Run Weekly News Digest with AI Technology Trends"
- "Run Weekly News Digest with Blockchain"

### 4. Steps (steps)

This is the core of the Skill. Each step contains:

- `id`: Step identifier (subsequent steps can reference it)
- `action`: The action to execute
- `params`: Parameters for the action

Steps pass data between each other using `{{step_id.output}}` — like passing a baton in a relay race.

---

## Common Actions List

| Action | Description | Use Case |
|---|---|---|
| `web_search` | Web search | Gather data |
| `llm_generate` | Call LLM | Summarize, translate, analyze |
| `google_drive_create` | Create Google Drive file | Save results |
| `google_drive_read` | Read Google Drive file | Read existing data |
| `gmail_send` | Send Email | Deliver reports |
| `gmail_read` | Read Email | Fetch new messages |
| `notion_create` | Create Notion page | Note management |
| `notion_query` | Query Notion database | Data retrieval |
| `http_request` | HTTP request | Call any API |

---

## Your First Skill: Email Summary Bot

Let's start with a practical and simple Skill:

### Requirements

> Every morning, organize unread Emails into a summary so you know what's important in 30 seconds.

### Complete Skill

```yaml
name: "Email Morning Summary"
description: "Read unread Emails and organize into today's highlights"

trigger:
  type: schedule
  schedule: "0 8 * * *"  # Every day at 8 AM

steps:
  - id: fetch_emails
    action: gmail_read
    params:
      filter: "is:unread"
      max_results: 20

  - id: summarize
    action: llm_generate
    params:
      prompt: |
        Here are today's unread Emails ({{fetch_emails.count}} total):
        
        {{fetch_emails.results}}
        
        Please organize into the following format:
        
        ## 🔴 Needs Immediate Action
        (Emails that need a reply or action today)
        
        ## 🟡 Needs Attention
        (Important but not urgent)
        
        ## 🟢 Acknowledged
        (Notifications, no action needed)
        
        One-line summary per Email.

  - id: notify
    action: gmail_send
    params:
      to: "me"
      subject: "📬 Today's Email Summary ({{date}})"
      body: "{{summarize.output}}"
```

### What Does This Skill Do?

1. **Runs automatically at 8 AM every day**
2. **Reads all unread Emails** (up to 20)
3. **Uses LLM to classify and organize** into "Needs Action / Needs Attention / Acknowledged"
4. **Sends the summary to yourself**

Set it up once, and every morning the first thing in your inbox is today's summary.

---

## Advanced Techniques

### 1. Conditional Logic

```yaml
steps:
  - id: check
    action: llm_generate
    params:
      prompt: "Does this Email contain urgent keywords? Answer yes or no"
  
  - id: alert
    action: gmail_send
    condition: "{{check.output}} == 'yes'"
    params:
      to: "me"
      subject: "⚠️ Urgent Email Alert"
      body: "You received a potentially urgent Email"
```

### 2. Loop Processing

```yaml
steps:
  - id: process_each
    action: llm_generate
    loop: "{{fetch_emails.results}}"
    params:
      prompt: "Translate the following Email content to English: {{item.body}}"
```

### 3. Error Handling

```yaml
steps:
  - id: risky_step
    action: http_request
    params:
      url: "https://api.example.com/data"
    on_error:
      action: gmail_send
      params:
        to: "me"
        subject: "Skill Execution Failure Notification"
        body: "Step risky_step failed: {{error.message}}"
```

---

## Common Skill Examples

### 📰 Industry News Digest

Search → Summarize → Save to Notion → Email notification

### 📧 Auto-Classify Customer Emails

Read Emails → LLM classifies → Apply Gmail labels

### 📊 Competitor Monitoring

Search competitor news → Compare with last week → Generate report

### 📝 Meeting Notes Organizer

Read recording/transcript → Extract key points → List action items → Save to Notion

---

## FAQ

### Q: Can I share Skills with others?

Yes! A Skill is just a YAML file — you can share it directly. The OpenClaw community also has a [Skill Marketplace](/#discussion) where people share their Skills.

### Q: What if a Skill fails during execution?

OpenClaw logs every execution. You can see the execution status and error messages for each step in the admin interface.

### Q: What's the maximum number of steps in a Skill?

There's no technical limit, but we recommend keeping it under 10 steps. If the workflow is too complex, consider splitting it into multiple Skills and chaining them with a "main Skill."

---

## Next Steps

- 🤖 Learn about [Agent: Your AI Double](/en/articles/openclaw-agent) — let the Agent auto-select and combine Skills
- 🧠 Understand [Soul: Give Your Agent Memory and Personality](/en/articles/openclaw-soul)
- 💬 [Prompt Engineering: Write Better Skill Prompts](/en/articles/prompt-engineering)
- 🔗 [MCP Protocol: Connect Skills to External Tools](/en/articles/mcp-protocol)
- 📚 [Build a Knowledge Management System with Skills](/en/articles/pkm-system)
- ☁️ Haven't deployed yet? See the [Cloud Deployment Guide](/en/articles/deploy-openclaw-cloud)
