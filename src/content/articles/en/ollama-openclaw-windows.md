---
title: "Ollama + OpenClaw Quick Start | Windows"
description: "A Windows-only guide: using WSL + Node 22 and Ollama's free cloud quota to get OpenClaw talking — no API key setup required at all."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-03-04"
verifiedAt: "2026-03-04"
archived: false
order: 5
prerequisites: ["llm-guide"]
estimatedMinutes: 15
tags: ["OpenClaw", "Ollama", "安裝", "LLM", "Windows", "WSL"]
stuckOptions:
  "Installing WSL": ["The WSL install command does nothing", "How do I enable virtualization in BIOS?", "Do I redo it after rebooting?"]
  "Installing Node 22": ["nvm command not found", "Installed the version but it still shows the old one", "npm command doesn't exist"]
  "Installing OpenClaw": ["npm install is stuck", "What about Permission denied?"]
  "Ollama connection": ["ollama launch openclaw won't run", "Can't connect to localhost:11434"]
  "Login authentication": ["The browser won't open", "Can't see the QR code"]
  "First conversation": ["The model replies in English", "Is it normal for replies to be slow?"]
---

![Ollama + OpenClaw — happily working alongside AI](/images/articles/ollama-openclaw/happy-bros.webp)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Windows users, read this first:** On Windows, OpenClaw runs through WSL (Windows Subsystem for Linux). This is Microsoft's officially supported approach and is far more stable than a native Windows environment. The whole process takes about 15 minutes — just follow along and you'll be fine.

---

## Prerequisites

- Windows 10 (version 2004 or later) or Windows 11
- An internet connection
- No API key needed

---

## Step 1: Install WSL

Open **PowerShell** as Administrator (search for PowerShell in the Start menu, right-click, and choose "Run as administrator"):

![Opening PowerShell as administrator](/images/articles/ollama-openclaw-windows/windows-powershell-admin.png)

Type the install command:

```powershell
wsl --install
```

![PowerShell running the wsl --install command](/images/articles/ollama-openclaw-windows/wsl-install-command.png)

When it finishes, **reboot**.

![Reboot prompt screen](/images/articles/ollama-openclaw-windows/wsl-install-reboot.png)

After rebooting, WSL automatically continues installing Ubuntu. During this step it asks you to set a Linux username and password (these credentials are only used inside WSL — set anything you like, but remember it):

![WSL Ubuntu first-launch setup for username and password](/images/articles/ollama-openclaw-windows/wsl-ubuntu-setup.png)

> 🚨 **If `wsl --install` does nothing,** you may need to enable Virtualization in your BIOS first. For detailed steps, see the [Windows WSL Setup Guide](/en/articles/windows-wsl-guide/).

Confirm WSL installed successfully:

```bash
wsl --version
```

<!-- @img: wsl-version-check | Terminal showing WSL version info -->

---

## Step 2: Install Node.js 22 in WSL

**Be sure to install Node 22** — too old a version will stop OpenClaw from working properly.

In the WSL terminal (Ubuntu), first install nvm (the Node version manager):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

![WSL terminal running the nvm install command](/images/articles/ollama-openclaw-windows/nvm-install-command.png)

Once installed, close and reopen the terminal (so nvm takes effect), then install Node 22:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

![WSL terminal installing Node 22](/images/articles/ollama-openclaw-windows/node22-install.png)

Confirm the version is correct — it **must be v22.x.x**:

```bash
node --version
```

![Terminal showing node --version as v22.x.x](/images/articles/ollama-openclaw-windows/node-version-check.png)

> 🚨 **If it shows an old version,** run `nvm use 22` and check again. If the nvm command isn't found, close and reopen the terminal and try again.

---

## Step 3: Install OpenClaw

In the WSL terminal, run:

```bash
npm install -g openclaw
```

![WSL terminal running npm install -g openclaw](/images/articles/ollama-openclaw-windows/openclaw-npm-install.png)

Verify after installation:

```bash
openclaw --version
```

![Terminal showing the openclaw version number](/images/articles/ollama-openclaw-windows/openclaw-version-check.png)

---

## Step 4: Install Ollama in WSL

Run the one-line install script directly in the WSL terminal:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

<!-- @img: ollama-install-wsl | WSL terminal running the Ollama install script -->

Confirm the version after installation:

```bash
ollama --version
```

<!-- @img: ollama-version-wsl | WSL terminal showing ollama --version output -->

Confirm the Ollama service is running (it starts automatically after install):

```bash
curl http://localhost:11434/api/tags
```

<!-- @img: ollama-api-check-wsl | WSL terminal showing the Ollama API returning JSON -->

If you see a JSON response, Ollama is running fine.

---

## Step 5: Run ollama launch openclaw

In the WSL terminal, type:

```bash
ollama launch openclaw
```

![WSL terminal running ollama launch openclaw](/images/articles/ollama-openclaw-windows/ollama-launch-openclaw-windows.png)

---

## Step 6: Authenticate Your Ollama Account

The first run asks you to log in to your Ollama account to use the free cloud quota. The screen shows a verification link or a QR code:

![Terminal showing the Ollama login prompt and link](/images/articles/ollama-openclaw-windows/ollama-auth-prompt.png)

1. Copy the URL shown in the terminal and open it in your Windows browser (or scan the QR code)
2. Sign in to Ollama with your Google account

![Browser opening the Ollama login page](/images/articles/ollama-openclaw-windows/ollama-login-browser.png)

![Browser showing authentication success — you can close this page](/images/articles/ollama-openclaw-windows/ollama-auth-success.png)

Back in the terminal, the launch process continues once authentication is done.

---

## Step 7: Pick a Model and Start Chatting

When the model menu appears, choose "**Cloud**" to use Ollama's free cloud models — no local download required:

![OpenClaw model selection list (choose Cloud)](/images/articles/ollama-openclaw-windows/openclaw-model-select-windows.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Recommended cloud models:**
>
> | Model | Strengths |
> |------|------|
> | `minimax-m2.5` | 🥇 **Tested pick:** best tool-calling ability, excellent on Agent tasks |
> | `kimi-k2.5` | 1T parameters, strong conversation quality |
> | `glm-4.7` | General-purpose, stable and reliable |
>
> **Note:** these models are fine for playing around, but if you want to roll them into a real workflow, it's better to switch to mainstream models like Claude or GPT-4o — there's still a clear gap in stability and tool-use reliability.

![OpenClaw ready screen](/images/articles/ollama-openclaw-windows/openclaw-ready-windows.png)

When the ready screen appears, you've launched it successfully!

Try typing:

```
Hi! I'm the owner here. Please introduce yourself in English — who you are and what you can do.
Also, pick a distinctive name for yourself!
```

![OpenClaw first conversation screen (Windows)](/images/articles/ollama-openclaw-windows/openclaw-first-chat-windows.png)

Congratulations 🎉 Your lobster is officially up and running on Windows!

---

## FAQ

### 🚨 curl to Ollama Gets No Response

The Ollama service may not have started yet. Start it manually:

```bash
ollama serve &
```

Then re-run `curl http://localhost:11434/api/tags` to confirm.

### 🚨 nvm Command Not Found

```bash
# Reload your shell config
source ~/.bashrc
# or
source ~/.zshrc
```

### 🚨 npm install Shows Permission Denied

Don't use `sudo npm install -g`. Use the Node installed via nvm and you won't have permission problems.

### 🚨 The Model Replies in a Language You Don't Want

Just tell it: "Please reply in English," and it'll switch.

---

## About the Free Quota

Ollama's cloud models come with a free quota ([official details](https://ollama.com/pricing)):

1. Go to [ollama.com/settings](https://ollama.com/settings) and sign in with your Google account
2. There you can see your remaining free quota and usage

Out of quota? You can switch to the [Gemini Flash cloud API](/en/articles/gemini-api-setup/).

---

## Next Steps

- ⚙️ [Model Configuration and Switching](/en/articles/openclaw-model-config/)
- 🧩 [Build Your First Skill](/en/articles/openclaw-first-skill/)
- 📱 [Connect Telegram](/en/articles/telegram-integration/)

Questions? Join the [homepage discussion](/#discussion) and let's talk!
