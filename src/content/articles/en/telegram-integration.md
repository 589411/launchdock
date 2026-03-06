---
title: "Telegram Integration Complete Guide: Turn OpenClaw Into Your Personal AI Assistant"
description: "From creating a bot with BotFather to connecting OpenClaw — turn Telegram into your anywhere, anytime AI entry point."
contentType: "tutorial"
scene: "integration"
difficulty: "intermediate"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 1
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 15
tags: ["Telegram", "Bot", "MCP", "Integration"]
stuckOptions:
  "Why use Telegram": ["Can't I use LINE instead?", "Why not Discord?", "Telegram isn't popular in my country"]
  "Creating a Bot": ["Can't find BotFather", "What does a Token look like?", "What's the difference between a Bot and a regular account?"]
  "Connecting OpenClaw": ["How do I install the MCP Server?", "What is a Webhook URL?", "Setup is done but Bot doesn't respond"]
  "Advanced features": ["How do I use it in a group?", "Can I send images?", "How to set permissions so only certain people can use it?"]
  "Troubleshooting": ["Bot suddenly stopped responding", "What if the Webhook goes down?", "Messages are delayed"]
---

## Why Is Telegram the Best AI Entry Point?

You've already installed OpenClaw and it runs great on your computer. But you can't sit in front of your computer all day.

**Telegram lets your AI follow you everywhere:**

| Scenario | What You Do |
|---|---|
| See a good article while commuting | Send the link to your Bot → automatically organized into your [knowledge base](/articles/pkm-system) |
| Need a quick translation | Send text to the Bot → instant translation reply |
| Need to look up info during a meeting | Secretly message the Bot → quietly receive the answer |
| Get an idea before bed | Voice message to the Bot → auto-transcribed and saved as a note |

### Why Telegram Instead of Other Messaging Apps?

| Feature | Telegram | LINE |
|---|---|---|
| Bot API | Free, unlimited | 500 free messages per month |
| Webhook | Native support | Requires extra setup |
| Message format | Markdown, HTML | More limited |
| Group features | Can be admin | No Bot admin |
| API documentation | Very comprehensive | Relatively basic |
| Developer friendliness | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## Step 1: Create a Bot on Telegram

### 1.1 Find BotFather

Search for `@BotFather` in Telegram (look for the blue verification checkmark).

<!-- 📸 Screenshot suggestion: BotFather search result -->

### 1.2 Create a New Bot

Chat with BotFather:

```
You: /newbot
BotFather: Alright, a new bot. How are we going to call it?
You: My OpenClaw AI (enter whatever name you want)
BotFather: Good. Now let's choose a username...
You: my_openclaw_bot (must end with _bot)
BotFather: Done! ... Use this token to access the HTTP API:
         7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **That Token is extremely important!** Don't share it with anyone. It's like a password.

### 1.3 Configure Bot Info (Optional)

```
/setdescription  → Set the Bot's description
/setabouttext    → Set the "About" text
/setuserpic      → Set the avatar
/setcommands     → Set the command list
```

Recommended command setup:

```
/setcommands
start - Get started
help - Usage instructions
ask - Ask a question
capture - Save an article
status - Check status
```

---

## Step 2: Install the Telegram MCP Server

### 2.1 Installation

```bash
# Install via npm
npm install -g @openclaw/mcp-server-telegram

# Or use OpenClaw's built-in command
openclaw mcp install telegram
```

### 2.2 Set Environment Variables

Add to OpenClaw's `.env`:

```bash
# Telegram Bot Token (obtained in Step 1)
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your Telegram User ID (restricts usage to you only)
TELEGRAM_ALLOWED_USERS=123456789
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **How to find your User ID?** Chat with `@userinfobot` and it will tell you.

### 2.3 Configure config.yaml

```yaml
mcp_servers:
  telegram:
    command: mcp-server-telegram
    env:
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      TELEGRAM_ALLOWED_USERS: ${TELEGRAM_ALLOWED_USERS}
    
    # Choose connection mode
    mode: webhook  # or polling

    # Webhook settings (recommended)
    webhook:
      url: "https://your-domain.com/telegram/webhook"
      port: 8443
    
    # Polling settings (for development)
    # polling:
    #   interval: 2  # Check every 2 seconds
```

### Webhook vs Polling

| Method | Pros | Cons | Best For |
|---|---|---|---|
| **Webhook** | Real-time, resource-efficient | Requires public URL + HTTPS | Production |
| **Polling** | No public URL needed | Has latency, consumes resources | Local development |

**Use Polling during development, switch to Webhook for production.**

---

## Step 3: Set Up the AI Agent

Create a dedicated Agent for Telegram:

### AGENTS.md

```markdown
## Telegram Agent

You are a Telegram AI assistant that interacts with users through messages.

### Capabilities
- Use all installed Skills
- Access the knowledge base (MCP: Google Drive / Notion)
- Search the web (MCP: Web Search)

### Behavior Rules
- Keep replies concise (Telegram is best for short messages)
- Break long replies into sections, each no more than 200 words
- Use Markdown formatting (bold, lists, code)
- When receiving a link → automatically use the capture Skill to organize and save
- When receiving voice → automatically transcribe + reply with summary

### Security
- Only respond to messages from TELEGRAM_ALLOWED_USERS
- Never execute high-risk operations like deletion or transfers
```

---

## Step 4: Testing

### 4.1 Start Up

```bash
# Start OpenClaw (automatically connects all MCP Servers)
openclaw start

# Confirm Telegram is connected
openclaw mcp status
# ✅ telegram: Connected (Bot: @my_openclaw_bot)
```

### 4.2 Chat with the Bot

Open Telegram, find your Bot, and start a conversation:

```
You: /start
Bot: 👋 Hi there! I'm your OpenClaw AI assistant.
     You can ask me questions, send links for me to organize,
     or give me direct commands.
     Type /help to see all features.

You: Give me a summary of the latest AI Agent trends
Bot: 🔍 Searching...

     📊 AI Agent Trends in 2026:
     
     1. **Multi-Agent collaboration** is becoming mainstream
        - No longer a single Agent doing everything
        - Specialized division of labor + result aggregation
     
     2. **MCP protocol** is rapidly gaining adoption
        - Tool connection standardization
        - Ecosystem expanding quickly
     
     3. **Local deployment** demand is increasing
        - Growing privacy awareness
        - Corporate intranet requirements
     
     Want me to dive deeper into any topic?
```

### 4.3 Auto-Capture from Links

```
You: https://openai.com/blog/some-article
Bot: 📰 Article captured:
     
     **Title:** Some Important AI Article
     **Summary:** OpenAI released...
     **Tags:** #AI #OpenAI #LLM
     
     ✅ Saved to Notion knowledge base
```

---

## Advanced Features

### Group Usage

Add the Bot to a group and have it respond only when mentioned or replied to:

```yaml
# config.yaml
mcp_servers:
  telegram:
    group_mode:
      trigger: mention  # Only respond when @mentioned
      # Other options: always, command (only accept /commands)
```

### Multimedia Processing

```
You: [send an image] What does this image say?
Bot: 📷 Image recognition result:
     This is a product spec sheet containing the following information...
```

Supported: Images (OCR + understanding), Voice (transcription), Documents (PDF extraction)

### Scheduled Pushes

Combined with the [PKM system](/articles/pkm-system), have the Bot send scheduled updates:

```yaml
# Push a news digest every day at 8 AM
name: telegram-daily-digest
trigger:
  - schedule: "0 8 * * *"
steps:
  - action: run_skill
    skill: daily-knowledge-feed
    output: digest
  - action: mcp_call
    server: telegram
    tool: send_message
    input:
      chat_id: "{{user_telegram_id}}"
      text: "{{digest}}"
```

### Access Control

```yaml
# Restrict to specific users
telegram:
  allowed_users:
    - 123456789  # yourself
    - 987654321  # your partner
  
  # Or restrict to specific groups
  allowed_groups:
    - -100123456789  # your work group
  
  # Per-user hourly limit
  rate_limit:
    messages_per_hour: 60
```

---

## Troubleshooting

### Bot is created but doesn't respond

**Checklist:**

1. Is the Token correct?
   ```bash
   # Test the Token
   curl https://api.telegram.org/botYOUR_TOKEN/getMe
   # Should return Bot info
   ```

2. Is OpenClaw running?
   ```bash
   openclaw status
   ```

3. Is the Webhook configured correctly?
   ```bash
   curl https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo
   ```

4. Is your User ID in the allowed list?

### Webhook setup failed

Common causes:
- URL is not HTTPS → Must have an SSL certificate
- Wrong port → Telegram only supports 443, 80, 88, 8443
- Firewall blocking → Open the corresponding port

**Just use Polling during development:**
```yaml
telegram:
  mode: polling
```

### Response delay

- Polling mode: 1-3 seconds delay is normal
- Webhook mode: Should be within 1 second
- If over 5 seconds: Check model response speed, the AI inference might be taking longer

Use a [faster model](/articles/openclaw-model-config) (like Gemini Flash) to reduce latency.

### Bot blocked by Telegram

- Sending more than 30 messages per second will cause temporary restrictions
- No more than 20 messages per minute in groups
- Set up rate limits properly and you won't have to worry

---

## Next Steps

With your Telegram Bot set up, you can:

- 📚 [Build a PKM system — let the Bot auto-collect and organize for you](/articles/pkm-system)
- 🧩 [Write Skills to have the Bot execute automated tasks](/articles/openclaw-skill)
- 🔗 [Connect more tools via MCP](/articles/mcp-protocol)
- ⚙️ [Choose a fast and affordable model for your Bot](/articles/openclaw-model-config)
- 💬 [Share your Bot setup in the homepage discussion](/#discussion)