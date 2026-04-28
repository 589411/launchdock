---
title: "Hermes Agent Quick Start | Windows + WSL2"
description: "Windows guide: run Hermes AI Agent on WSL2 + Ollama with one command. Experience cross-session memory and cloud model speed — no API key required."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-04-28"
verifiedAt: "2026-04-28"
archived: false
order: 2
series:
  name: "Hermes Series"
  part: 2
prerequisites: ["ollama-openclaw-windows", "windows-wsl-guide"]
estimatedMinutes: 15
tags: ["Ollama", "Hermes", "Agent", "安裝", "Windows", "WSL"]
stuckOptions:
  "WSL2 setup": ["wsl --install does nothing?", "Do I need to reboot after WSL2 install?"]
  "ollama launch hermes": ["Getting 'Error: unknown integration: hermes'?", "Stuck at the npm install step?"]
  "Model selection": ["Should I pick a cloud or local model?", "Can local models run on a Windows laptop GPU?"]
---

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **Quick summary**: Hermes requires WSL2 on Windows, but the process is straightforward:
>
> ```
> Install WSL2 → Install Ollama inside WSL → ollama launch hermes → pick a cloud model → start chatting
> ```

<!-- @img: hermes-windows-cover | Hermes Agent running on Windows WSL2 -->

---

## Why WSL2?

Hermes's install script is designed for Linux/macOS environments and does not run in native Windows PowerShell or CMD. WSL2 (Windows Subsystem for Linux 2) gives you a full Linux environment on Windows and solves this entirely.

> Already have WSL2 and Ollama set up? Jump straight to [Step 3: Launch Hermes](#step-3-launch-hermes).

---

## Step 1: Install WSL2

Open PowerShell **as Administrator** (search "PowerShell" in the Start menu → right-click → Run as administrator) and run:

```powershell
wsl --install
```

<!-- @img: wsl-install-powershell | PowerShell running wsl --install as Administrator -->

After installation completes, **reboot your computer**. On first boot, WSL2 finishes setup and asks you to create a Linux username and password.

<!-- @img: wsl-setup-username | WSL2 first-time username setup -->

> 🚨 **`wsl --install` does nothing?** Check that your Windows version is 21H2 or later (Start → Settings → Windows Update). Older Windows 10 builds require manually enabling the WSL feature.

---

## Step 2: Install Ollama Inside WSL

After rebooting, search for "Ubuntu" or "WSL" in the Start menu to open the Linux terminal. Install Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

<!-- @img: ollama-install-wsl | WSL terminal installing Ollama -->

Verify the installation:

```bash
ollama --version
```

<!-- @img: ollama-version-wsl | WSL terminal showing Ollama version -->

To update an existing Ollama installation, re-run the same install script.

---

## Step 3: Launch Hermes

Inside the WSL terminal, run:

```bash
ollama launch hermes
```

<!-- @img: hermes-launch-wsl | WSL terminal running ollama launch hermes -->

On the first run, Ollama asks whether to install Hermes — press Enter to confirm. Ollama then handles four steps automatically:

1. **Install** — installs Hermes Agent via npm
2. **Model** — opens the model selector
3. **Onboarding** — configures Ollama as the provider at `http://127.0.0.1:11434/v1`
4. **Launch** — starts the Hermes chat interface

<!-- @img: hermes-installing-wsl | Hermes installation progress in WSL -->

<!-- @img: hermes-onboarding-wsl | Hermes auto-configuring Ollama provider in WSL -->

> 🚨 **`Error: unknown integration: hermes`**: Your Ollama version is too old. Re-run the install script inside WSL to update, then try again.

---

## Step 4: Choose a Model

After installation, Hermes shows a model selector.

<!-- @img: hermes-model-selector-wsl | Hermes model selector in WSL -->

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **Recommended cloud models** (uses Ollama's free quota — no download, no GPU needed):
>
> | Model | Strengths |
> | --- | --- |
> | `minimax-m2.7:cloud` | 🥇 Fast and efficient, great for everyday tasks |
> | `kimi-k2.5:cloud` | Strong reasoning, supports subagents |
> | `glm-5.1:cloud` | Reasoning and code generation |
> | `qwen3.5:cloud` | Tool use + vision, great for agentic tasks |
>
> **Local models (require an NVIDIA GPU)**:
>
> | Model | Requirement |
> | --- | --- |
> | `gemma4` | ~16 GB VRAM |
> | `qwen3.6` | ~24 GB VRAM |
>
> For most Windows laptops, cloud models are the practical choice.

<!-- @img: hermes-setup-complete-wsl | Hermes setup complete in WSL -->

---

## Step 5: Your First Conversation

Once Hermes is running, type:

```
Hi! Please introduce yourself — who is Hermes, and what can you do?
```

<!-- @img: hermes-first-chat-wsl | Hermes first conversation in WSL -->

Hermes saves a memory summary after each session, so next time you launch it, it picks up where you left off.

---

## Step 6 (Optional): Connect a Messaging Platform

Inside the WSL terminal:

```bash
hermes gateway setup
```

<!-- @img: hermes-gateway-wsl | hermes gateway setup in WSL terminal -->

Supported platforms: Telegram, Discord, Slack, WhatsApp, Signal, Email. Once configured, message Hermes from your app without opening a terminal.

---

## Troubleshooting

### 🚨 Can't find Ubuntu after rebooting

Search for "Ubuntu" or "WSL" in the Start menu. You can also pin it to the taskbar for easy access.

### 🚨 Ollama won't start inside WSL

Verify you are on WSL2 (not WSL1):

```powershell
wsl --list --verbose
```

The VERSION column should show `2`. To upgrade:

```powershell
wsl --set-version Ubuntu 2
```

### 🚨 Node.js install fails

Hermes requires Node.js 18+. Inside WSL:

```bash
node --version
```

If missing:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 🚨 Want to reconfigure Hermes

```bash
hermes setup
```

---

## Appendix: Manual Installation

To install without `ollama launch`:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

To connect to Ollama during the setup wizard:

1. Select **More providers…**
2. Select **Custom endpoint (enter URL manually)**
3. Enter `http://127.0.0.1:11434/v1` as the API base URL
4. Leave the API key blank
5. Confirm the auto-detected model

---

## What's Next

- 🍎 [Hermes on macOS](/articles/hermes-agent)
- 🦀 [Meet OpenClaw: another AI Agent framework](/articles/why-openclaw)
- 📱 [Connect OpenClaw to Telegram](/articles/telegram-integration)

Questions? Join the discussion at the [homepage](/#discussion)!
