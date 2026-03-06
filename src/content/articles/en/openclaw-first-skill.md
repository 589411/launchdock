---
title: "Your First Skill: Build Your First Automation Task in 5 Minutes"
description: "Your OpenClaw can already chat, but its real power lies in Skills. Follow along and turn a manual task into a one-click automation."
contentType: "tutorial"
scene: "basics"
difficulty: "beginner"
createdAt: "2026-02-25"
verifiedAt: "2026-02-25"
archived: false
order: 2
pathStep: 6
series:
  name: "Getting Started"
  part: 6
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 10
tags: ["OpenClaw", "Skill", "Automation", "Beginner"]
stuckOptions:
  "Skill Concepts": ["How is this different from just chatting with AI?", "What can Skills do?"]
  "Creating a Skill File": ["Not sure where to put the file", "Can't understand YAML format", "Indentation keeps breaking"]
  "Running a Skill": ["Getting errors when running", "No output at all", "How do I see the results?"]
  "Modifying and Experimenting": ["Want to change the prompt but don't know how", "Can I add more steps?"]
---

## You've Reached the Final Step

> The last article in the Blue Duck beginner series! This tutorial will have you building your first Skill automation task in 5 minutes.

By now, your OpenClaw can already have a conversation with you. But that's just the beginning.

When you chat with AI directly, you have to describe the task from scratch every time. **Skills let you write tasks as workflows that you can repeat with a single command.**

> 🎯 **Goal of this article**: Build and run your first Skill in 5 minutes.

---

## Direct Chat vs Skills

Let's first clarify why this extra step is worth it:

| | Direct Chat | Using a Skill |
|---|---|---|
| **Each time you use it** | Describe the task from scratch | Trigger with one command |
| **Result consistency** | May vary each time | Same workflow every time |
| **Can connect to tools** | ❌ Chat only | ✅ Can search the web, read files, save to Drive |
| **Best for** | One-off questions | Tasks you repeat daily/weekly |

**Think of it this way**: Direct chat = verbally instructing a new employee every time. Skill = writing an SOP that the employee follows every time.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says**: You wouldn't explain "I want an egg crepe, no spice, add cheese, medium iced milk tea half sugar" from scratch every time at a breakfast shop — you'd just say "the usual." A Skill is your "the usual."

---

## What Are We Building?

A "**Daily News Summary**" Skill:

1. Search for the latest news on a specified topic
2. Use AI to organize it into 3 key highlights
3. Display the results

Once completed, you just say "run daily news summary" to get today's news digest.

---

## Step 1: Create the Skill File

A Skill is a YAML file placed in the `skills/` folder of your workspace directory.

### 1.1 Create the Folder

```bash
mkdir -p ~/.openclaw/workspace/skills
```

### 1.2 Create the File

Open your preferred editor and create `~/.openclaw/workspace/skills/daily-news.yaml`:

```bash
# Open with VS Code
code ~/.openclaw/workspace/skills/daily-news.yaml

# Or use nano (built-in terminal editor)
nano ~/.openclaw/workspace/skills/daily-news.yaml
```

<!-- @img: create-skill-file | Creating the Skill file -->

### 1.3 Paste the Following Content

```yaml
name: "Daily News Summary"
description: "Search for the latest news on a specified topic and organize into key highlights"

trigger:
  type: manual

inputs:
  - name: topic
    type: string
    description: "What topic do you want news about?"
    default: "AI Technology"

steps:
  - id: search
    action: web_search
    params:
      query: "{{topic}} latest news today"
      max_results: 5

  - id: summarize
    action: llm_generate
    params:
      prompt: |
        Here are the latest news search results about "{{topic}}":

        {{steps.search.output}}

        Please organize into 3 key highlights in this format:
        1. **Title**: One-sentence summary
        2. **Title**: One-sentence summary
        3. **Title**: One-sentence summary

        End with an "Overall Trend Observation."

output:
  result: "{{steps.summarize.output}}"
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Don't worry about typos.** The most common YAML error is **incorrect indentation**. Make sure to use spaces (not tabs), with 2 spaces per indentation level.

<!-- @img: skill-yaml-content | Complete contents of the Skill file -->

### Understanding This Skill

| Section | Description |
|---|---|
| `name` + `description` | The Skill's name and description |
| `trigger: manual` | Manually triggered (can be changed to scheduled later) |
| `inputs` | Parameters the user can provide |
| `steps` | Execution steps, run sequentially from top to bottom |
| `steps[0]: web_search` | Step 1: Search the web |
| `steps[1]: llm_generate` | Step 2: Use AI to organize the search results |
| `output` | What gets returned at the end |

Steps pass results to each other using `{{steps.search.output}}` — like passing a baton in a relay race.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: The entire Skill is like a factory assembly line — the first station gathers raw materials (searching news), the second station processes and packages (AI organization), and the final product ships out (displaying the summary). You just flip the switch and the line runs itself.

---

## Step 2: Run Your First Skill

### Option A: Run via Command Line

```bash
openclaw skill run daily-news
```

It will ask you for a topic (default is "AI Technology") — press Enter for the default, or type your preferred topic.

<!-- @img: skill-run-terminal | Running the Skill in the terminal -->

Wait 10-20 seconds and you'll see the organized news summary!

<!-- @img: skill-output | Skill execution results -->

### Option B: Run via Telegram

Message your OpenClaw bot directly:

```
Run daily news summary
```

Or specify a topic:

```
Run daily news summary, topic: electric vehicles
```

<!-- @img: skill-run-telegram | Running the Skill in Telegram -->

### Option C: Via Web Interface

Open `http://localhost:18789` and type the same command in the chat box.

---

## Step 3: Customize Your Skill

The power of Skills lies in their flexibility. Try modifying these:

### Change the Prompt

Replace `3 key highlights` with `5`, or add "present in a table format."

### Change the Search Scope

Change `max_results: 5` to `10` to search for more data.

### Add a Scheduled Trigger

Change the `trigger` to run automatically every day at 9 AM:

```yaml
trigger:
  type: schedule
  schedule: "0 9 * * *"  # Every day at 9 AM
```

### Save Results to a File

Add one more step to the end of `steps`:

```yaml
  - id: save
    action: file_write
    params:
      path: "~/Desktop/news-{{date}}.md"
      content: "{{steps.summarize.output}}"
```

---

## 🎉 Congratulations — You've Completed the Getting Started Path!

You've successfully:

1. ✅ Learned what OpenClaw is
2. ✅ Chosen and obtained an LLM API Key
3. ✅ Installed OpenClaw
4. ✅ Completed initial setup and heard AI's first response
5. ✅ **Built and ran your first Skill**

You're no longer just an AI tool user — you've started **automating your workflows**.

---

## What's Next?

### Dive Deeper into Skills
- 📖 [Skill Complete Guide](/en/articles/openclaw-skill) — More Action types, conditional logic, error handling

### Understand the Core Architecture
- 🤖 [Agent Complete Guide](/en/articles/openclaw-agent) — Let AI decide which Skill to use
- 🧠 [Soul Complete Guide](/en/articles/openclaw-soul) — Give AI memory and personality

### Practical Workflows
- 💬 [Telegram Integration](/en/articles/telegram-integration) — Use AI from your phone anytime
- 📚 [Knowledge Management System](/en/articles/pkm-system) — Automatically organize your knowledge

### Further Reading
- 🔗 [MCP Protocol](/en/articles/mcp-protocol) — Understand the underlying protocol for AI tool integration
- 💰 [Token Economics](/en/articles/token-economics) — Control your AI usage costs
- 🎯 [Prompt Engineering](/en/articles/prompt-engineering) — Get more precise responses from AI

---
