---
title: "Ollama + OpenClaw Quick Start | macOS"
description: "A macOS-only guide: use Ollama's free cloud quota to get OpenClaw talking in minutes — no API key setup required at all."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-03-02"
verifiedAt: "2026-03-04"
archived: false
order: 4
prerequisites: ["llm-guide"]
estimatedMinutes: 8
tags: ["OpenClaw", "Ollama", "安裝", "LLM", "macOS"]
stuckOptions:
  "Installing Ollama": ["Won't open after download", "What if macOS security blocks it?"]
  "Launching OpenClaw": ["Picked a model but nothing happens", "Ollama is running but OpenClaw can't connect"]
  "First conversation": ["What if the model replies in English?", "Is it normal for replies to be slow?"]
---
![Ollama + OpenClaw — happily working alongside AI](/images/articles/ollama-openclaw/happy-bros.webp)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor, straight to the point:** Ollama + OpenClaw needs no API key setup at all. Use the free cloud quota from your Ollama account, pick a model, and start chatting. The whole flow looks like this:
>
> ```
> Install Ollama → ollama launch openclaw → Pick a cloud model → Start chatting
> ```

---

## Step 1: Install Ollama

1. Go to [ollama.com/download](https://ollama.com/download)
2. Click "Download for macOS"
3. Open the downloaded `.dmg` and drag Ollama into your Applications folder
4. Open Ollama

![Ollama download page (macOS)](/images/articles/ollama-openclaw/ollama-download-mac.png)

![Dragging the Ollama installer into the Applications folder](/images/articles/ollama-openclaw/ollama-downloaded.png)

![Ollama first-launch setup screen on macOS](/images/articles/ollama-openclaw/ollama-setup-mac.png)

> 🚨 **macOS security prompt:** If you see "Ollama can't be opened because it is from an unidentified developer," go to "System Settings → Privacy & Security," scroll to the bottom, and click "Open Anyway."

Confirm the install succeeded:

```bash
ollama --version
```

If you see a version number, you're good: `ollama version 0.6.x`

---

## Step 2: Launch OpenClaw With One Command

Open Terminal:

![Terminal screen](/images/articles/ollama-openclaw/ollama-version-check.png)

Type:

```bash
ollama launch openclaw
```

![OpenClaw installing](/images/articles/ollama-openclaw/openclaw-installing.png)

The first run installs automatically. When it asks whether to install via npm, press Enter to confirm:

![Terminal output of running ollama launch openclaw](/images/articles/ollama-openclaw/ollama-launch-terminal.png)

![Terminal showing the OpenClaw install process](/images/articles/ollama-openclaw/install-openclaw-terminal.png)

![OpenClaw install success message](/images/articles/ollama-openclaw/openclaw-install-success.png)

After installation, pick a model. Just choose "**Cloud**" — there's no need to download a model to your machine.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Recommended cloud models** (use Ollama's free quota, no download):
>
> | Model            | Strengths                                                   |
> | ---------------- | ----------------------------------------------------------- |
> | `minimax-m2.5` | 🥇 **Tested pick:** best tool-calling ability, excellent on Agent tasks |
> | `kimi-k2.5`    | 1T parameters, strong conversation quality                  |
> | `glm-4.7`      | General-purpose, stable and reliable                        |
>
> **One note though:** these models are fine for playing around, but if you want to **roll them into a real workflow**, it's still better to switch to mainstream models like Claude or GPT-4o — there's a clear gap in stability and tool-use reliability.

macOS may show a security prompt (Node.js is OpenClaw's runtime); just click "Allow":

![macOS security setting allowing Node](/images/articles/ollama-openclaw/macos-security-allow.png)

![OpenClaw getting ready to start](/images/articles/ollama-openclaw/openclaw-launched.png)

![Assistant initializing](/images/articles/ollama-openclaw/openclaw-agent-init.png)

![System ready to use](/images/articles/ollama-openclaw/openclaw-ready.png)

When the ready screen appears, you've launched it successfully!

---

## Step 3: Your First Conversation — Name Your Lobster 🦞

Try typing:

```
Hi! I'm the owner here. Please introduce yourself in English — who you are and what you can do.
Also, pick a distinctive name for yourself!
```

![First conversation with OpenClaw via Ollama](/images/articles/ollama-openclaw/openclaw-ollama-first-chat.png)

![AI suggesting a name for the lobster](/images/articles/ollama-openclaw/openclaw-lobster-name.png)

Congratulations 🎉 Your lobster is officially up and running!

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> If the model replies in a language you don't want, just tell it: "Please reply in English," and it'll switch.

---

## About the Free Quota

Ollama's cloud models come with a free quota ([official details](https://ollama.com/pricing)). To check your usage:

1. Go to [ollama.com/settings](https://ollama.com/settings) and sign in with your Google account

![Ollama login page](/images/articles/ollama-openclaw/ollama-login.png)

![Ollama account settings page showing free quota](/images/articles/ollama-openclaw/ollama-settings-tokens.png)

Out of quota? You can switch to the [Gemini Flash cloud API](/en/articles/gemini-api-setup/), or download an open-source model locally (see the section below).

---

## FAQ

### 🚨 OpenClaw Can't Connect to Ollama

```bash
# Confirm Ollama is running
ollama ps

# Confirm the API is healthy
curl http://localhost:11434/api/tags
```

Make sure the Ollama icon is in your menu bar. If it isn't, reopen the Ollama app.

### 🚨 The Model Responds Slowly

Cloud models aren't affected by your machine's specs; speed differences only appear once you switch to a local model.

### 🚨 I Want to Switch Models

Re-run `ollama launch openclaw`, or switch from the settings page:

```bash
ollama launch openclaw --config
```

---

## Bonus: Download an Open-Source Model Locally (Optional)

> Want to go fully offline, save cloud quota, or just curious? Here's the quick version.

Check your specs (local models need at least 8 GB RAM):

| Your hardware           | Recommended model | Expected speed   |
| ----------------------- | --------------- | ---------------- |
| 8GB RAM, no GPU         | `llama3.2:3b` | 5–10 tokens/sec  |
| 16GB RAM, Apple M1      | `qwen2.5:7b`  | 15–25 tokens/sec |
| 32GB+ RAM, Apple M series | `qwen2.5:14b` | 30+ tokens/sec   |

```bash
# Download (recommended for Chinese users)
ollama pull qwen2.5:7b

# Test
ollama run qwen2.5:7b
```

![Terminal showing model download progress](/images/articles/ollama-openclaw/ollama-pull-model.png)

Apple Silicon (M1/M2/M3/M4) enables GPU acceleration automatically — no extra setup needed.

---

## Next Steps

- ⚙️ [Model Configuration and Switching](/en/articles/openclaw-model-config/)
- 🧩 [Build Your First Skill](/en/articles/openclaw-first-skill/)
- 📱 [Connect Telegram](/en/articles/telegram-integration/)

Questions? Join the [homepage discussion](/#discussion) and let's talk!
