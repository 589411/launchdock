---
title: "OpenClaw Agent Complete Guide: Build Your AI Double"
description: "The Agent is the soul role of OpenClaw — it understands your intent, auto-selects Skills, and even decides what to do next on its own."
contentType: "guide"
scene: "core"
difficulty: "intermediate"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 2
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 8
tags: ["OpenClaw", "Agent", "AI Agent", "LLM"]
stuckOptions:
  "What is an Agent": ["What's the difference between an Agent and a Skill?", "Do I need my own API Key?"]
  "How it works": ["Can't understand the ReAct framework", "What is Tool Calling?"]
  "Building your first Agent": ["Followed the steps but Agent doesn't respond", "How to write a good system prompt?", "Skill connection failed"]
  "Multi-Agent collaboration": ["How do Agents pass data between each other?", "Can't understand the collaboration flow diagram"]
  "Memory system": ["What's the difference between memory and Soul?", "Will memory take up a lot of space?"]
  "Debugging tips": ["Don't know how to read logs", "Agent stuck in an infinite loop"]
---

## What Is an Agent? How Is It Different from a Chatbot?

Let's cut to the chase:

> **Chatbot = You ask a question, it answers**
> **Agent = You give a goal, it figures out how to accomplish it**

### An Example

**Chatbot mode (like ChatGPT):**

```
You: Help me look up the latest AI news
Bot: Here are some recent AI news stories... (lists results)
You: Organize these into a table
Bot: Sure, here's the table format... (outputs table)
You: Save it to my Google Drive
Bot: Sorry, I can't access your Google Drive
```

Every step requires you to **manually give instructions**, and the Chatbot can't access external tools.

**Agent mode (OpenClaw):**

```
You: Organize the latest AI news into a table and save to the "Weekly Reports" folder on Google Drive
Agent: Got it, I'll handle this.
  → Step 1: Search latest AI news ✅
  → Step 2: Organize into table format ✅
  → Step 3: Save to Google Drive "Weekly Reports" folder ✅
Agent: Done! File saved to Google Drive as "AI_News_Weekly_2026-02-24"
```

One sentence, done. The Agent **plans the steps, selects the tools, and executes to completion on its own**.

---

## How Agents Work

OpenClaw's Agent is based on the **ReAct (Reasoning + Acting)** framework:

```
                    ┌──────────────┐
                    │ Your Command  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Think        │ ← Understand intent, plan steps
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Act          │ ← Select Skill or tool
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Observe      │ ← Check results
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Done/Continue?│
                    └──────┬───────┘
                      ↙         ↘
                  Done          Continue → Back to "Think"
```

### Key Concept: The Agent Loop

An Agent doesn't just execute once and stop. It **keeps looping** until the task is complete:

1. **Think**: "What does the user want? How should I do this?"
2. **Act**: "I'll use web_search to look up the news"
3. **Observe**: "Found 10 results, quality looks good"
4. **Decide**: "That's enough, moving to next step" or "Results aren't good enough, trying different keywords"

This is why Agents are **smarter than Chatbots** — they adjust their behavior based on results.

---

## Build Your First Agent

### Agent Configuration File

```yaml
# 📄 my-agent.yaml
name: "Work Assistant"
description: "An all-around work assistant skilled in data organization, Email handling, and report writing"

# LLM the Agent uses
model:
  provider: openai
  name: gpt-4
  temperature: 0.7

# Skills the Agent can use
skills:
  - email-morning-summary
  - weekly-news-digest
  - meeting-notes-organizer
  - competitor-monitor

# Tools the Agent can use
tools:
  - web_search
  - google_drive
  - gmail
  - notion

# Agent behavior settings
behavior:
  # Maximum number of steps (prevents infinite loops)
  max_steps: 20
  # When encountering uncertainty...
  on_uncertainty: ask_user  # ask_user | best_guess | stop
  # Whether to show the thinking process
  verbose: true
```

### Configuration Breakdown

#### `model`: Choose the LLM

```yaml
model:
  provider: openai    # openai / anthropic / google / local
  name: gpt-4        # Specific model name
  temperature: 0.7    # 0 = precise, 1 = creative
```

| Model | Strengths | Best For |
|---|---|---|
| GPT-4 | Strongest reasoning | Complex task planning |
| GPT-4o | Fast, lower cost | Most daily tasks |
| Claude 3.5 | Excellent at long text | Document analysis, long reports |
| Gemini Pro | Google ecosystem integration | Google tool connections |
| Local models (Ollama) | Completely free, private | Sensitive data handling |

#### `skills`: The Agent's Skill Library

The Agent **automatically selects the appropriate Skill** based on your command. You don't need to specify "which Skill to use" — the Agent figures it out.

```
You: "Summarize today's important Emails for me"
Agent thinks: This is related to Email processing...
         → Selects "email-morning-summary" Skill
         → Execute!
```

#### `behavior`: The Agent's "Personality Settings"

```yaml
on_uncertainty: ask_user
```

This determines what the Agent does when it's unsure:

- `ask_user`: "I'm not sure which folder you want to save to, can you specify?"
- `best_guess`: Agent decides on its own, might be wrong but more efficient
- `stop`: Stops and waits for your decision

---

## Multi-Agent Collaboration

OpenClaw supports **multiple Agents working simultaneously**, each responsible for a different domain:

```yaml
# 📄 agent-team.yaml
agents:
  - name: "Researcher"
    speciality: "Data collection and analysis"
    skills: [web_search, document_analysis]
    
  - name: "Editor"
    speciality: "Content writing and polishing"
    skills: [content_writing, translation]
    
  - name: "Secretary"
    speciality: "Communication and schedule management"
    skills: [email_management, calendar]

# Collaboration mode
collaboration:
  mode: sequential  # sequential | parallel | hierarchical
  coordinator: "Secretary"  # Secretary coordinates
```

### Three Collaboration Modes

| Mode | Description | Best For |
|---|---|---|
| `sequential` | One finishes, then the next starts | Tasks with a specific order |
| `parallel` | Run simultaneously | Independent, non-dependent tasks |
| `hierarchical` | Manager Agent assigns work | Complex, large-scale tasks |

### Real-World Example: Weekly Industry Report

```
You: "Create this week's AI industry report for me"

Secretary (coordinator): Got it, assigning work
  → Researcher: Search this week's AI-related news and papers
  → Editor: After Researcher finishes, organize into report format
  → Secretary: Once report is done, send to team members
```

---

## The Agent's Memory System

Agents don't just "execute commands" — they have memory:

### Short-term Memory (Conversation Memory)

```
You: I'm working on a marketing project
Agent: Got it, what can I help with?

You: Help me search for relevant case studies
Agent: Sure, searching for "marketing project case studies" (remembers you're working on a marketing project)
```

### Long-term Memory (Persistent Memory)

```
Last week's conversation:
You: Our company's target audience is office workers aged 25-35

This week's conversation:
You: Help me write an ad copy
Agent: Based on the target audience you mentioned before (office workers aged 25-35),
       I've drafted a targeted copy for you...
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Want to dive deeper into the memory system? See [Soul: Give Your Agent Memory and Personality](/en/articles/openclaw-soul)

---

## Agent Debugging Tips

### 1. Enable Verbose Mode

```yaml
behavior:
  verbose: true
```

When enabled, the Agent shows its thinking process at every step, making it easier to find problems.

### 2. Check Execution Logs

```bash
# View logs from the most recent execution
openclaw logs --last

# View logs for a specific Agent
openclaw logs --agent "Work Assistant" --limit 5
```

### 3. Common Issue Troubleshooting

| Issue | Possible Cause | Solution |
|---|---|---|
| Agent keeps looping on the same step | `max_steps` too high or condition logic error | Set a reasonable `max_steps` |
| Agent picks the wrong Skill | Skill's description isn't clear enough | Improve the Skill description |
| Agent responds too slowly | Model too large or too many steps | Switch to a faster model |
| Agent doesn't understand the command | Instructions too vague | Describe what you want more clearly |

---

## Best Practices

### 1. Start Simple

Build a single-function Agent first, confirm it works, then gradually add more Skills.

### 2. Write Clear Skill Descriptions

The Agent chooses Skills based on their `description`. The clearer the description, the less likely the Agent is to pick the wrong one.

```yaml
# ❌ Bad description
description: "Handle Email"

# ✅ Good description
description: "Read unread Emails, classify by importance, organize into a daily summary"
```

### 3. Set Up Safety Guardrails

```yaml
behavior:
  max_steps: 20          # Limit step count
  on_uncertainty: ask_user  # Ask when unsure
  confirm_before:          # Confirm before these actions
    - gmail_send
    - google_drive_delete
```

---

## Next Steps

- 🧠 Dive into [Soul: Give Your Agent Memory and Personality](/en/articles/openclaw-soul)
- 🧩 Review [Skill: Repeatable Workflows](/en/articles/openclaw-skill)
- 🔗 [MCP Protocol: Connect Your Agent to External Tools](/en/articles/mcp-protocol)
- ⚙️ [Model Configuration: Use the Best Model for Your Agent](/en/articles/openclaw-model-config)
- 📱 [Connect Your Agent to Telegram](/en/articles/telegram-integration)
- ☁️ Deploy your Agent: [Cloud Deployment Guide](/en/articles/deploy-openclaw-cloud)
