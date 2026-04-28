---
title: "Hermes Agent Quick Start | ollama launch hermes"
description: "Launch Hermes AI Agent with one command on macOS: automatic install, cloud model selection, and setup — experience an agent with cross-session memory and 70+ built-in skills in minutes."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-04-28"
verifiedAt: "2026-04-28"
archived: false
order: 1
series:
  name: "Hermes Series"
  part: 1
prerequisites: ["ollama-openclaw-mac"]
estimatedMinutes: 10
tags: ["Ollama", "Hermes", "Agent", "安裝", "LLM", "macOS"]
stuckOptions:
  "ollama launch hermes": ["Getting 'Error: unknown integration: hermes'?", "Stuck at the npm install step?"]
  "Model selection": ["Should I choose a cloud or local model?", "How long does gemma4 take to download?"]
  "First conversation": ["Hermes responds in English — how do I switch?", "How do I know Hermes is actually remembering my conversations?"]
---

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **Quick summary**: Hermes is an autonomous AI Agent by Nous Research — 70+ built-in skills, cross-session memory, and automatic skill creation. Launching it with Ollama is just one command:
>
> ```
> brew upgrade ollama → ollama launch hermes → pick a cloud model → start chatting
> ```

<!-- @img: hermes-cover | Hermes Agent launched via Ollama -->

---

## What is Hermes Agent?

[Hermes](https://github.com/NousResearch/hermes-agent) is an open-source AI Agent built by [Nous Research](https://nousresearch.com/). Unlike a plain chatbot, Hermes acts autonomously:

| Feature | Description |
| --- | --- |
| **Automatic skill creation** | Builds reusable skills on the fly when it encounters new tasks |
| **Cross-session memory** | Remembers what you've said even after the session ends |
| **70+ built-in skills** | Search, summarize, generate code, and more — out of the box |
| **Messaging integrations** | Connect Telegram, Discord, Slack, WhatsApp, Signal, or Email |

Best of all: **Ollama supports `ollama launch hermes` natively** — one command handles everything.

---

## Step 1: Verify Your Ollama Version

`ollama launch hermes` requires a recent Ollama build. Check first:

```bash
ollama --version
```

<!-- @img: ollama-version-check | Terminal showing Ollama version number -->

If you see `Error: unknown integration: hermes`, or your version is below `0.7.0`, update:

```bash
brew upgrade ollama
```

<!-- @img: brew-upgrade-ollama | Terminal running brew upgrade ollama -->

After updating, restart Ollama (click the menu-bar icon → Quit, then reopen it).

---

## Step 2: Launch Hermes in One Command

Open Terminal and run:

```bash
ollama launch hermes
```

<!-- @img: hermes-launch-command | Terminal with ollama launch hermes command -->

On the first run, Ollama asks if you want to install Hermes — press Enter to confirm:

<!-- @img: hermes-install-prompt | Hermes install confirmation prompt -->

Ollama then automatically runs four steps:

1. **Install** — installs Hermes Agent via npm
2. **Model** — opens the model selector
3. **Onboarding** — configures Ollama as the provider, pointing Hermes at `http://127.0.0.1:11434/v1`
4. **Launch** — starts the Hermes chat interface

<!-- @img: hermes-installing | Hermes installation progress -->

<!-- @img: hermes-onboarding | Hermes auto-configuring Ollama as the provider -->

---

## Step 3: Choose a Model

After installation, Hermes shows you a model selector.

<!-- @img: hermes-model-selector | Hermes model selector screen -->

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **Recommended cloud models** (uses Ollama's free quota — no local download needed):
>
> | Model | Strengths |
> | --- | --- |
> | `minimax-m2.7:cloud` | 🥇 Fast and efficient, great for everyday productivity |
> | `kimi-k2.5:cloud` | Strong reasoning, supports subagents |
> | `glm-5.1:cloud` | Reasoning and code generation |
> | `qwen3.5:cloud` | Tool use + vision, great for agentic tasks |
>
> Prefer to run fully offline? Local models require a GPU:
>
> | Model | Requirement |
> | --- | --- |
> | `gemma4` | ~16 GB VRAM |
> | `qwen3.6` | ~24 GB VRAM |

Select your model and Hermes finishes setup automatically.

<!-- @img: hermes-setup-complete | Hermes setup complete and ready -->

---

## Step 4: Your First Conversation

Once Hermes is running, type anything you'd like it to do:

```
Hi! Please introduce yourself — who is Hermes, and what can you do?
```

<!-- @img: hermes-first-chat | Hermes first conversation -->

The key difference from a regular chatbot: Hermes saves a summary of your conversation to memory, so the next time you start it up, it still knows what you talked about.

---

## Step 5 (Optional): Connect a Messaging Platform

Want to chat with Hermes from Telegram or Discord? Run:

```bash
hermes gateway setup
```

<!-- @img: hermes-gateway-setup | hermes gateway setup for connecting messaging platforms -->

Supported platforms: Telegram, Discord, Slack, WhatsApp, Signal, Email.

Once set up, you can message Hermes directly from your preferred app — no need to open a terminal.

---

## Troubleshooting

### 🚨 Error: unknown integration: hermes

Your Ollama version is too old. Run `brew upgrade ollama` to update, then try again.

### 🚨 Stuck at the npm install step

Hermes requires Node.js 18 or higher. Check:

```bash
node --version
```

If missing:

```bash
brew install node
```

### 🚨 Want to reconfigure the model or provider

Re-run the full setup wizard at any time:

```bash
hermes setup
```

<!-- @img: hermes-reconfigure | hermes setup reconfiguration screen -->

---

## Appendix: Manual Installation

Prefer to drive the setup yourself instead of using `ollama launch`? Install Hermes directly:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

The setup wizard launches automatically. To connect to Ollama:

1. Select **More providers…**
2. Select **Custom endpoint (enter URL manually)**
3. Enter the API base URL:

   ```
   http://127.0.0.1:11434/v1
   ```

4. Leave the API key blank (not required for local Ollama)
5. Hermes auto-detects your downloaded models — confirm and press Enter

> **Windows users**: Hermes on Windows requires WSL2. Install it with `wsl --install` and run everything from inside the WSL shell. See the [Windows guide](/articles/hermes-agent-windows).

---

## What's Next

- 🪟 [Hermes on Windows (WSL2)](/articles/hermes-agent-windows)
- 🦀 [Meet OpenClaw: another AI Agent framework](/articles/why-openclaw)
- 📱 [Connect OpenClaw to Telegram](/articles/telegram-integration)

Questions? Join the discussion at the [homepage](/#discussion)!
