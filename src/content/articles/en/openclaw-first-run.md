---
title: "First Launch of OpenClaw: Set Up Your API Key and Hear AI's First Words"
description: "Installation done — now let's bring OpenClaw to life. Follow the setup wizard to initialize everything and get AI to respond within 3 minutes."
contentType: "tutorial"
scene: "basics"
difficulty: "beginner"
createdAt: "2026-02-25"
verifiedAt: "2026-02-25"
archived: false
order: 1
pathStep: 5
series:
  name: "Getting Started"
  part: 5
prerequisites: ["install-openclaw"]
estimatedMinutes: 10
tags: ["OpenClaw", "Setup", "Launch", "Gateway", "API Key", "Beginner"]
stuckOptions:
  "Starting the setup wizard": ["Can't find the openclaw command", "Getting 'command not found'", "The wizard is stuck"]
  "Entering the API Key": ["Nothing shows up after pasting the key", "It says 'Invalid API Key'", "Not sure which Provider to choose"]
  "Choosing a model": ["Too many models, don't know which to pick", "Can I change it later?"]
  "Starting the Gateway": ["Gateway failed to start", "Port is already in use", "Can't see the dashboard"]
  "First conversation": ["Telegram bot isn't responding", "Waited more than 1 minute with no reply", "The response is garbled"]
---

## Your Progress So Far

> Congrats on making it this far! This LaunchDock tutorial walks you through OpenClaw's first launch — entering your API Key and hearing AI's first words.

By this point, you should have completed:

- ✅ [Understanding what OpenClaw is](/articles/why-openclaw)
- ✅ [Choosing your LLM plan](/articles/llm-guide)
- ✅ [Getting your API Key](/articles/ai-api-key-guide)
- ✅ [Installing OpenClaw](/articles/install-openclaw)

What you need to do now is simple: **Enter your API Key and hear AI's first response.**

---

## Step 1: Launch the Setup Wizard

Open your terminal (Terminal on macOS, WSL or PowerShell on Windows) and type:

```bash
openclaw onboard --install-daemon
```

<!-- @img: onboard-start | Setup wizard launch screen -->

You'll see an interactive setup screen. Don't worry — just follow along and make your selections.

### 1.1 Security Warning

The wizard will first remind you that OpenClaw is a powerful tool that can perform actions on your behalf.

- Use the arrow keys to select **Yes**
- Press Enter to confirm

### 1.2 Choose Installation Mode

Select **QuickStart** (recommended for beginners).

It will use safe default settings, all of which can be changed later.

<!-- @img: onboard-quickstart | Selecting QuickStart mode -->

---

## Step 2: Configure the LLM Provider

### 2.1 Choose Your Provider

The wizard will ask which LLM you want to use. Select based on the Key you obtained in the previous step:

| Your Key starts with | Choose |
|---|---|
| `AIzaSy...` | Google (Gemini) |
| `sk-or-...` | OpenRouter |
| `sk-...` (without `ant`) | OpenAI |
| `sk-ant-...` | Anthropic |

<!-- @img: onboard-provider | Choosing the LLM Provider -->

### 2.2 Paste Your API Key

Copy the API Key you saved earlier and paste it into the terminal.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **You might not see any characters after pasting — this is normal!** The terminal hides password-type input for security. Just press Enter.

<!-- @img: onboard-api-key | Entering the API Key -->

### 2.3 Choose a Model

The wizard will list the models supported by your chosen Provider. **Recommendations for beginners:**

| Provider | Recommended Model | Reason |
|---|---|---|
| Google | `gemini-2.0-flash` | Free, fast |
| OpenRouter | `anthropic/claude-3.5-sonnet` | Good quality, reasonable price |
| OpenAI | `gpt-4o-mini` | Cheap, fast |
| Anthropic | `claude-sonnet-4-5` | Balance of quality and speed |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Don't overthink it — you can always change this later in the config file.

<!-- @img: onboard-model | Selecting a model -->

### 2.4 Confirm Settings

The wizard will show a summary of your settings. If everything looks good, press Enter.

You should see:

```
✅ Configuration saved successfully
```

If you see a red error, the most common cause is the Key was pasted incorrectly. Use the arrow keys to go back and re-enter it.

---

## Step 3: Set Up a Messaging Platform (Telegram)

Next, the wizard will ask which platform you want to use to chat with OpenClaw.

**Telegram is recommended for beginners** — it's the simplest, free, and works on both mobile and desktop.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> If you don't want to set up a platform yet, you can skip this step and use the Web interface (`http://localhost:18789`) to chat with OpenClaw instead.

### 3.1 Create a Telegram Bot

1. Open Telegram (mobile or desktop)
2. Search for `@BotFather` and start a conversation
3. Send `/newbot`
4. Enter a name (e.g., `My OpenClaw`)
5. Enter a username (must end with `bot`, e.g., `my_openclaw_bot`)

<!-- @img: botfather-newbot | Creating a new bot with BotFather -->

6. BotFather will reply with a **Token** in this format:

```
123456789:ABCdefGHIjklMNOpqrSTUvwxyz
```

7. **Copy this Token**

### 3.2 Paste the Token into the Wizard

Go back to the terminal, paste the Token, and press Enter.

<!-- @img: onboard-telegram-token | Pasting the Telegram Bot Token -->

### 3.3 Pair Your Account

1. Find the bot you just created in Telegram → Click "**Start**"
2. Send any message (e.g., `hello`)
3. The terminal will display a pairing code

```bash
# Follow the displayed command:
openclaw pairing approve telegram <pairing-code>
```

<!-- @img: onboard-pairing | Pairing confirmation -->

---

## Step 4: Start the Gateway

The Gateway is OpenClaw's core service that ties everything together.

If you selected `--install-daemon` in the wizard, it's already started automatically. Verify it:

```bash
openclaw gateway status
```

You should see:

```
✅ Gateway is running on port 18789
```

<!-- @img: gateway-status | Gateway running status -->

If it didn't start automatically, start it manually:

```bash
# Foreground start (shows real-time logs)
openclaw gateway start

# Or background start (recommended for daily use)
openclaw gateway start --daemon
```

### Verify the Web Interface

Open your browser and go to `http://localhost:18789`

You should see the OpenClaw dashboard.

<!-- @img: gateway-web-ui | OpenClaw Web dashboard -->

---

## Step 5: Your First Message 🎉

Now, the most exciting moment —

### Option A: Using Telegram

In your Telegram bot, send:

```
Hello, please briefly introduce yourself
```

Wait 5–10 seconds (it may be slower the first time), and you should receive a reply from AI!

<!-- @img: first-message-telegram | Receiving AI's first reply on Telegram -->

### Option B: Using the Web Interface

1. Open `http://localhost:18789`
2. Type a message in the chat box
3. Click send

<!-- @img: first-message-web | Receiving AI's reply on the Web interface -->

> 🎉 **Congratulations!** If you see AI's response, everything is set up correctly!
>
> Your OpenClaw is now up and running. Next, let's try something more powerful —
>
> 👉 [First Skill: Complete Your First Automation Task](/articles/openclaw-first-skill)
> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says**: How does it feel hearing AI respond for the first time? It's like building a PC from scratch and pressing the power button — the screen lights up, and it was all worth it. Next, we'll teach you to put it to work, not just chat.
---

## 🚨 Common Troubleshooting

### Gateway Failed to Start

**"Port 18789 already in use"**

```bash
# Find the process using the port
sudo lsof -i :18789
# Kill it, then restart
openclaw gateway start
```

**"Gateway failed to start"**

```bash
# Use the doctor command to diagnose
openclaw doctor
```

It will check all settings and tell you what's wrong.

### API Key Issues

**"Invalid API Key"**

- The Key may not have been copied completely — go back to the provider's website and copy it again
- Make sure there are no extra spaces in the Key
- If it's OpenAI, confirm that your account has been funded

**"Connection timeout"**

- Check your internet connection
- Confirm your chosen Provider is not under maintenance

### Telegram Issues

**"The bot isn't responding"**

1. Confirm the Gateway is running: `openclaw gateway status`
2. Confirm pairing was completed: Did you send the pairing code?
3. Confirm the Bot Token is correct: Go back to BotFather and retrieve it again

**"It takes a very long time to respond"**

The first response usually takes 10–30 seconds because the model needs to "warm up." Subsequent responses will be much faster. If every response takes over 1 minute:

- Switch to a faster model (e.g., `gemini-2.0-flash`)
- Check your internet speed

---

## Where Are the Config Files?

If you need to manually edit settings later:

```
~/.openclaw/
├── openclaw.json    ← Main config file
├── workspace/       ← Working directory
│   ├── USER.md      ← AI's understanding of you (editable)
│   └── ...
└── logs/            ← Error logs
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> For advanced settings (model routing, fallback mechanisms), see [Model Configuration & Switching](/articles/openclaw-model-config).

---
