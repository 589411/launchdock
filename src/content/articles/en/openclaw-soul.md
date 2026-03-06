---
title: "OpenClaw Soul Complete Guide: Give Your Agent Memory, Personality, and Growth"
description: "Soul is OpenClaw's most powerful and unique feature. It turns your Agent from just a tool into an AI partner that truly 'knows you.'"
contentType: "guide"
scene: "core"
difficulty: "intermediate"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 3
prerequisites: ["openclaw-agent"]
estimatedMinutes: 8
tags: ["OpenClaw", "Soul", "Memory System", "Personalization"]
stuckOptions:
  "What is Soul": ["What's the difference between Soul and Agent?", "Can't the Agent work without Soul?"]
  "Four components": ["Memory / Persona / Preference / Growth is too much to grasp", "Which one should I set up first?"]
  "Memory system": ["What's the difference between Episodic and Semantic?", "Does memory auto-clear?", "Will more memory make the Agent slower?"]
  "Persona settings": ["How should I fill in tone and style?", "Can I change it later?"]
  "Growth system": ["How do levels increase?", "What does milestone unlock mean?"]
---

## What Is Soul? Why Does It Matter?

Have you ever experienced this:

- Chatted with ChatGPT all day, but the next day in a new conversation, it **remembers nothing**
- Had to re-explain to the AI every time: "my writing style is..." "my company does..."
- The same assistant gives everyone the exact same response, with no personalization

**Soul solves all of these problems.**

> **Soul = Agent's memory + personality + preferences + growth trajectory**

Think of the Agent as a new employee:
- **Without Soul**: Every day at work feels like day one — you have to re-teach everything
- **With Soul**: Gradually learns your habits, knows your preferences, gets smoother with every use

---

## The Four Components of Soul

```
┌────────────────────────────────────┐
│              Soul                   │
│                                    │
│  ┌──────────┐  ┌──────────┐       │
│  │  Memory   │  │ Persona  │       │
│  │           │  │          │       │
│  └──────────┘  └──────────┘       │
│                                    │
│  ┌──────────┐  ┌──────────┐       │
│  │ Preference│  │ Growth   │       │
│  │           │  │          │       │
│  └──────────┘  └──────────┘       │
│                                    │
└────────────────────────────────────┘
```

### 1. Memory

How the Agent remembers everything from your interactions.

### 2. Persona

The Agent's tone, style, and role identity.

### 3. Preference

Your work habits, format preferences, and frequently used tools.

### 4. Growth

How the Agent learns and improves from interactions.

---

## Memory: A Deep Dive

OpenClaw's memory system has three layers:

### Short-term Memory

```yaml
memory:
  short_term:
    type: conversation
    max_turns: 50        # Remember the last 50 conversation turns
    expire_after: "24h"  # Expires after 24 hours
```

Like "working memory" — it holds the context of the current conversation.

**Use cases**:
- Things mentioned "just now"
- Intermediate results of the current task
- Conversational context

### Long-term Memory

```yaml
memory:
  long_term:
    type: vector_store     # Uses a vector database
    provider: chromadb     # chromadb / pinecone / weaviate
    auto_memorize: true    # Automatically decide whether something is worth remembering
```

Like a "notebook" — stores important facts and information.

**Use cases**:
- What your company is called and what it does
- Your work habits and preferences
- Important tasks completed in the past

### Episodic Memory

```yaml
memory:
  episodic:
    enabled: true
    max_episodes: 100     # Remember up to 100 significant events
```

Like a "diary" — records important interaction events.

**Use cases**:
- "What method was used the last time a similar task was handled"
- "You mentioned last week that you'd do XX this week"
- "You usually do your weekly report on Friday afternoons"

### How the Three Work Together

```
You: Help me write a report for investors

Agent thinks:
  📌 Short-term memory: No investor info mentioned in this conversation yet
  📒 Long-term memory: User's company is "XX Tech," a SaaS product company
  📓 Episodic memory: Helped write one last month, the format was...

Agent: Based on XX Tech's information and using last time's format, I've drafted a report for you...
```

---

## Persona: Personality Settings

Persona defines "who" the Agent is.

### Basic Persona Setup

```yaml
persona:
  name: "Oz"
  role: "Senior Marketing Consultant"
  tone: "Professional but friendly, occasionally humorous"
  language: "English"
  
  # Role background
  background: |
    You are a digital marketing consultant with 10 years of experience,
    specializing in social media marketing, content strategy, and data analysis.
    Your communication style is to give the conclusion first, then explain why.
    
  # Behavioral guidelines
  guidelines:
    - Keep answers concise, avoid being verbose
    - Give actionable advice first, then explain the reasoning
    - Support your points with data
    - When unsure, say "I'm not certain, but I'd suggest..."
```

### Why Persona Matters

**Without Persona:**
```
You: How's this ad copy?
Agent: The copy looks okay, but could use some improvements in certain areas...
(Too generic, reads like a textbook)
```

**With Persona (Senior Marketing Consultant):**
```
You: How's this ad copy?
Agent: Straight up — the opening is weak. If you can't grab attention in the first 3 seconds, CTR will likely be under 1%.
      I'd suggest leading with the core pain point. For example:
      ❌ "Want better work efficiency?"
      ✅ "Wasting 2 hours a day on copy-paste?"
      The second version typically boosts click-through rates by 30-50%.
```

Feel the difference?

---

## Preference: Personal Settings

Let the Agent know your "usage habits."

```yaml
preference:
  # Format preferences
  format:
    report_style: "bullet_points"     # Reports in bullet format
    code_language: "python"           # Prefer Python
    date_format: "YYYY-MM-DD"        # Date format
    
  # Tool preferences
  tools:
    note_taking: "notion"             # Use Notion for notes
    file_storage: "google_drive"      # Files on Google Drive
    communication: "gmail"            # Communicate via Gmail
    
  # Work habits
  work_habits:
    active_hours: "09:00-18:00"       # Work hours
    timezone: "Asia/Taipei"           # Timezone
    weekly_report_day: "friday"       # Weekly report on Friday
    
  # Notification preferences
  notifications:
    urgent: "email + push"            # Urgent: Email + push notification
    normal: "email"                   # Normal: Email only
    low: "none"                       # Low priority: no notification
```

### Benefits of Preferences

After setting preferences:

```
You: Help me organize today's meeting notes

Agent:
(🧠 Preferences say you use Notion, prefer bullet format, timezone is Taipei)

Done, I've organized the meeting notes in bullet format
and saved them to your Notion "Meeting Notes" folder.
Link: https://notion.so/meeting-xxxx
```

You don't need to specify "where to save" or "what format" every time — the Agent handles it automatically based on your preferences.

---

## Growth: The Learning System

This is the coolest part of Soul — your Agent **gets better over time**.

### How It Works

```yaml
growth:
  enabled: true
  
  # Learn from interactions
  learn_from:
    - user_feedback      # Your feedback (good/bad)
    - task_success_rate   # Task success rate
    - correction_patterns # Patterns you frequently correct
    
  # Self-improvement
  self_improve:
    review_interval: "weekly"    # Review once a week
    optimize_skills: true        # Auto-optimize Skills
    suggest_new_skills: true     # Suggest new Skills
```

### The Learning Process in Action

**Week 1:**
```
You: Help me write a weekly report
Agent: (writes a very formal report)
You: Too formal, use a more casual tone
Agent: Got it, adjusted.
(🧠 Records: "User prefers casual tone for weekly reports")
```

**Week 2:**
```
You: Help me write the weekly report
Agent: (writes directly in casual tone)
You: (No need to remind anymore)
```

**Week 4:**
```
Agent: I've noticed you ask me to write the weekly report
      every Friday afternoon. Want me to prepare it
      automatically every Friday at 4 PM?
You: Sure!
(🧠 Suggests new Skill: "Auto-prepare weekly report every Friday")
```

---

## Complete Soul Configuration Example

```yaml
# 📄 my-soul.yaml
soul:
  persona:
    name: "Oz"
    role: "All-around Work Assistant"
    tone: "Concise and effective, like a capable colleague"
    language: "English"
    background: |
      You are a highly efficient work assistant.
      Your style: do first, report when done.
      If the user doesn't specify details, judge based on past preferences.
    guidelines:
      - Keep answers to 3-5 sentences unless the user asks for detail
      - Include result links or screenshots when completing tasks
      - Ask directly about uncertain things, don't guess

  memory:
    short_term:
      max_turns: 30
      expire_after: "12h"
    long_term:
      type: vector_store
      provider: chromadb
      auto_memorize: true
    episodic:
      enabled: true
      max_episodes: 200

  preference:
    format:
      report_style: "bullet_points"
      language: "en"
    tools:
      primary_storage: "google_drive"
      note_taking: "notion"
    work_habits:
      timezone: "Asia/Taipei"
      active_hours: "09:00-22:00"

  growth:
    enabled: true
    learn_from:
      - user_feedback
      - task_success_rate
    self_improve:
      review_interval: "weekly"
      suggest_new_skills: true
```

---

## Soul vs Other Frameworks

| Feature | OpenClaw Soul | LangChain Memory | AutoGPT | Custom GPTs |
|---|---|---|---|---|
| Short-term memory | ✅ | ✅ | ✅ | ✅ |
| Long-term memory | ✅ | ✅ | ⚠️ Limited | ❌ |
| Episodic memory | ✅ | ❌ | ❌ | ❌ |
| Persona settings | ✅ Full | ❌ | ⚠️ Basic | ✅ |
| Preference learning | ✅ | ❌ | ❌ | ❌ |
| Auto growth | ✅ | ❌ | ❌ | ❌ |

---

## FAQ

### Q: Where is Soul's memory data stored?

By default, it's stored in a local ChromaDB vector database. You can also configure it to use:
- Pinecone (cloud, great for large amounts of memory)
- Weaviate (self-hosted, ideal for teams with security requirements)

### Q: Can I reset the Soul?

```bash
# Clear all memory
openclaw soul reset --agent "Work Assistant"

# Clear only short-term memory
openclaw soul reset --agent "Work Assistant" --type short_term

# Export memory (backup)
openclaw soul export --agent "Work Assistant" --output soul-backup.json

# Import memory
openclaw soul import --agent "Work Assistant" --input soul-backup.json
```

### Q: Can multiple users share the same Soul?

Not recommended. Soul is personalized — each user should have their own Soul configuration. For teams, it's best to create independent Agent + Soul combos for each person.

### Q: How much extra does Soul cost in terms of compute?

Memory queries add roughly 100-200ms of latency per call. Cost-wise, it's mainly the storage cost of the vector database, which is typically negligible.

---

## Next Steps

- 🧩 Haven't learned about Skills yet? Start with [Skill: Repeatable Workflows](/en/articles/openclaw-skill)
- 🤖 Set up your Agent: [Agent Complete Guide](/en/articles/openclaw-agent)
- 💬 [Prompt Engineering: The Underlying Technique Behind Soul Configuration](/en/articles/prompt-engineering)
- 💰 [Slim Down Soul to Save Tokens: Token Economics](/en/articles/token-economics)
- ☁️ Deploy to the cloud: [Cloud Deployment Guide](/en/articles/deploy-openclaw-cloud)
- 💬 Share your Soul configuration: [Homepage Discussion](/#discussion)
