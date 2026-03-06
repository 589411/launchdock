---
title: "Ollama + OpenClaw: No API Key Needed — Start Chatting with AI in Minutes"
description: "No API Key setup required. Use Ollama's free cloud credits to get OpenClaw talking in minutes. Want to run open-source models locally? Full instructions at the end."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 4
prerequisites: ["llm-guide"]
estimatedMinutes: 10
tags: ["OpenClaw", "Ollama", "Install", "LLM", "Deploy", "macOS", "Windows", "Linux"]
stuckOptions:
  "Ollama installation": ["Can't open after downloading", "macOS security warning — what do I do?", "Do I need WSL on Windows?"]
  "Cloud model selection": ["Are the free credits enough?", "Which model has the best response quality?", "What if I run out of credits?"]
  "OpenClaw connection": ["How do I edit the config file?", "Ollama is running but OpenClaw can't connect", "Is slow model response normal?"]
  "First conversation": ["The model responds in the wrong language", "Is slow response normal?", "How do I switch to a different model?"]
  "Local models": ["Download is really slow", "Not enough disk space", "Is the GPU being used?"]
---

![Ollama + OpenClaw — Working happily with AI](/images/articles/ollama-openclaw/happy-bros.webp)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Where are you in your journey?**
>
> | My Situation | Recommended Path |
> |---------|----------|
> | 🐣 **Haven't installed anything, starting from scratch** | Follow Step 1 → 2 → 3 in order — about 10 minutes to start chatting |
> | ✅ **Already have Ollama, want to connect OpenClaw** | Jump to [Step 2: Install OpenClaw](#step-2-install-openclaw-and-launch) |
> | 🚀 **Both installed, just want to start** | Jump to [Step 3: First Conversation](#step-3-first-conversation--name-your-lobster-) |

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's quick take**: Ollama + OpenClaw has one amazing advantage — **absolutely no API Key setup required**. Use Ollama's free cloud credits, pick a model from the menu, and start chatting. You can be up and running in minutes with Lobster 🦞. Want to run open-source models on your own machine? That's an advanced option covered at the end of this article.

---

## What's Special About Ollama + OpenClaw?

Ollama was originally a tool for running open-source AI models locally, but it also has an incredibly useful feature: **built-in cloud model support with no API Key required**.

With just an Ollama account, you can directly use its free cloud model credits. Combined with `ollama launch openclaw`, the entire flow looks like this:

```
Install Ollama → ollama launch openclaw → Choose a cloud model → Start chatting
```

No API Key applications, no payments, no downloading multi-GB models — **get OpenClaw talking in minutes**.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> You can also run open-source models on your own machine (completely offline, completely free), but that's an advanced option that requires checking specs and downloading models. This article's main path takes you through the "fastest way to get started" route. Full local model instructions are in the [appendix section](#appendix-running-open-source-models-locally) at the end.

---

## What Is Ollama?

[Ollama](https://ollama.com) is a local AI model management tool that also supports cloud models. Think of it as a "local AI Studio" — whether running online or downloaded to your machine, one tool handles it all.

```
Ollama = Model Manager (cloud + local)
OpenClaw = AI Agent Framework (skills, automation, conversations)
```
![ollama launch openclaw website page](/images/articles/ollama-openclaw/ollama-launch-openclaw.png)

---

## Step 1: Install Ollama

### macOS

1. Go to [ollama.com/download](https://ollama.com/download)
2. Click "Download for macOS"
3. Open the downloaded `.dmg` file and drag Ollama to the Applications folder
4. Open Ollama

![Ollama website download page (macOS)](/images/articles/ollama-openclaw/ollama-download-mac.png)

![Drag Ollama installer to Applications folder](/images/articles/ollama-openclaw/ollama-downloaded.png)

![Ollama first launch macOS setup screen](/images/articles/ollama-openclaw/ollama-setup-mac.png)

> 🚨 **macOS Security Note**: If you see "Ollama can't be opened because it is from an unidentified developer," go to "System Settings → Privacy & Security," scroll to the bottom, and click "Open Anyway."

### Windows

1. Go to [ollama.com/download](https://ollama.com/download)
2. Click "Download for Windows" and run the `.exe` installer
3. Follow the installation wizard. After installation, Ollama will start automatically in the background

<!-- @img: ollama-download-windows | Ollama website download page (Windows) --><!-- ⚠️ Unmatched -->

### Linux

```bash
sudo apt install -y zstd
curl -fsSL https://ollama.com/install.sh | sh
```

### Verify Installation

```bash
ollama --version
```

Seeing a version number means installation was successful:

```
ollama version 0.6.x
```

---

## Step 2: Install OpenClaw and Launch

### One-Click Launch

Open your terminal
![Terminal window](/images/articles/ollama-openclaw/ollama-version-check.png)

Enter:

```bash
ollama launch openclaw
```

![OpenClaw installing](/images/articles/ollama-openclaw/openclaw-installing.png)

### First-Time Installation Auto-Detects and Starts Setup

![Terminal running ollama launch openclaw output](/images/articles/ollama-openclaw/ollama-launch-terminal.png)

When asked whether to install via npm, press Enter to confirm.

![Terminal running OpenClaw installation process](/images/articles/ollama-openclaw/install-openclaw-terminal.png)

Automatic download and installation complete.

![OpenClaw installation success message](/images/articles/ollama-openclaw/openclaw-install-success.png)

### Choose a Cloud Model — Quick Start

After installation, a model selection menu will appear. Choose "**Cloud**" — no need to download a model locally.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Recommended cloud models** (using Ollama's free credits, no download needed):
>
> | Model | Highlights |
> |------|------|
> | `kimi-k2.5` | 1T parameters, strongest for Agent tasks |
> | `minimax-m2.5` | Latest version, great for coding & productivity |
> | `glm-4.7` | General purpose, stable and reliable |


![macOS security settings allowing Node](/images/articles/ollama-openclaw/macos-security-allow.png)

macOS may show a security prompt — click "Allow." (Node.js is the actual runtime for OpenClaw.)

![OpenClaw preparing to launch](/images/articles/ollama-openclaw/openclaw-launched.png)

![Assistant initializing](/images/articles/ollama-openclaw/openclaw-agent-init.png)

![System ready to use](/images/articles/ollama-openclaw/openclaw-ready.png)

When you see the ready screen, OpenClaw has launched successfully!

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Community reports say cloud models work well** — they can directly help you set up Telegram, Email, and other features. If the AI says "please do it yourself," try being patient: "Please help me set it up, I don't know how" — it usually cooperates.

---

## Step 3: First Conversation — Name Your Lobster 🦞

OpenClaw is up and running! Time for the first important thing: **say hello to your AI assistant and let it introduce itself**.

Try typing:

```
Hi! I'm the owner here. Please introduce yourself — who are you
and what can you do?
Also, come up with a cool nickname for yourself!
```

Or more directly:

```
Hello, tell me:
1. What are you best at helping people with?
2. If you could pick a nickname, what would it be?
```

![First conversation with OpenClaw via Ollama](/images/articles/ollama-openclaw/openclaw-ollama-first-chat.png)

![AI suggesting a nickname for the lobster](/images/articles/ollama-openclaw/openclaw-lobster-name.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Cloud model response speed is similar to using an API Key — but you didn't have to configure anything. If the model responds in the wrong language, just tell it: "Please reply in English" (or your preferred language) and it will switch.

Congratulations 🎉 Your Lobster is officially live! You can keep chatting, or read on for Ollama free credits info and advanced setup.

---

## Ollama Free Credits Explained

Ollama's cloud models come with free credits ([official info](https://ollama.com/pricing)). To check your current usage:

1. Go to [ollama.com/settings](https://ollama.com/settings)
2. Log in with your Google account

![Ollama login page](/images/articles/ollama-openclaw/ollama-login.png)

3. View your remaining free credits and usage

![Ollama account settings showing free credits](/images/articles/ollama-openclaw/ollama-settings-tokens.png)

What if you run out of credits? You can switch to other [cloud APIs (like Gemini Flash)](/articles/gemini-api-setup), or refer to the appendix for running open-source models locally.

---

## Advanced: Manual Config Setup (Optional)

> `ollama launch openclaw` already gets you chatting.
> You only need this step if you want to **manually control model selection, mix local and cloud models, or integrate existing API Keys**.

### Verify Ollama API Is Available

```bash
# Test if Ollama API is accessible
curl http://localhost:11434/api/tags
```

<!-- @img: ollama-api-check-terminal | Terminal showing curl localhost:11434/api/tags returning JSON --><!-- ⚠️ Unmatched -->

If it returns JSON (containing a model list), Ollama is running properly.

> 🚨 **Can't connect?**
> - macOS / Windows: Make sure the Ollama app is running (you should see its icon in the system tray)
> - Linux: Run `ollama serve` to start the service

### Configure OpenClaw config.yaml

Add Ollama to OpenClaw's config file `config.yaml`:

```yaml
providers:
  ollama:
    type: ollama
    base_url: http://localhost:11434
    # Ollama doesn't require an API Key — leave empty or omit

models:
  default:
    provider: ollama
    model: qwen2.5:7b
    temperature: 0.7
```

<!-- @img: openclaw-config-ollama | OpenClaw config.yaml configured for Ollama --><!-- ⚠️ Unmatched -->

> 💡 If you just want to open the settings page without starting immediately, use `ollama launch openclaw --config`.

### Mix with Existing Cloud APIs

If you've previously configured cloud APIs, you can keep them and add Ollama as an extra option:

```yaml
providers:
  google:
    type: google
    api_key: ${GOOGLE_API_KEY}
  ollama:
    type: ollama
    base_url: http://localhost:11434

models:
  default:
    provider: google
    model: gemini-2.0-flash
  local:
    provider: ollama
    model: qwen2.5:7b
    temperature: 0.7
```

This lets you choose between cloud or local models for different Skills.

### Test the Connection

```bash
# Start OpenClaw
openclaw start

# Send a test message
openclaw chat "Say hello to me"
```

If you see the model's response, your config is correct and Ollama is connected ✅

---

## Advanced: Ollama + Cloud API Hybrid Setup

The smartest approach is to **use both** — local models for everyday tasks (free), cloud APIs for important work (higher quality).

### Set Up Fallback in OpenClaw

```yaml
providers:
  ollama:
    type: ollama
    base_url: http://localhost:11434
  google:
    type: google
    api_key: ${GOOGLE_API_KEY}

models:
  default:
    provider: ollama
    model: qwen2.5:7b
    fallback:
      provider: google
      model: gemini-2.0-flash

  heavy:
    provider: google
    model: gemini-1.5-pro
```

This configuration means:
- **Default uses Ollama (free)** — if Ollama goes down or is too slow, automatically falls back to Google
- **Heavy tasks use the `heavy` profile** — goes directly to cloud

### Specify Models in Skills

```yaml
# skills/daily-summary.yaml
name: Daily Summary
model: default  # Uses local Ollama (free)

# skills/code-review.yaml
name: Code Review
model: heavy  # Uses cloud Gemini Pro (smarter)
```

---

## Troubleshooting

### 🚨 OpenClaw can't connect after Ollama starts

**Symptom**: OpenClaw reports `Connection refused` or `Cannot connect to Ollama`

**Solution**:

```bash
# 1. Confirm Ollama is running
ollama ps

# 2. Verify the API port
curl http://localhost:11434/api/tags

# 3. If running OpenClaw in Docker, change to
base_url: http://host.docker.internal:11434
```

### 🚨 Model response is very slow

**Possible causes**:
- Model too large for your RAM → Switch to a smaller model
- Running inference on CPU → Check if GPU acceleration is enabled
- Computer is doing other things → Close those 87 Chrome tabs 😅

**Recommendation**: First test the speed directly with `ollama run model-name`. If it's slow natively, that's not an OpenClaw issue.

### 🚨 Poor quality responses in your language

**Solutions**:
1. Switch to `qwen2.5:7b` or `qwen2.5:14b` (best choice for Chinese)
2. Explicitly specify response language in your Soul settings
3. Provide few-shot examples to help the model learn your preferred style

### 🚨 Not enough disk space

```bash
# Check model disk usage
ollama list

# Delete models you don't need
ollama rm llama3.1:70b
```

---

## Appendix: Running Open-Source Models Locally

> Run out of credits, want to go fully offline, or just curious about open-source models? This section explains how to download models to your computer.
> **If you just want to keep using Ollama's free cloud credits, you can skip this entire section.**

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> A full tutorial on local models (covering GPU acceleration, model tuning) is planned as a separate article. Below is the quick reference version.

### Check Your Computer Specs First

| Item | Minimum Requirement | Recommended |
|---|---|---|
| RAM | 8 GB | 16 GB or more |
| Disk Space | 10 GB available | 20 GB or more |
| GPU | Not required (CPU works too) | NVIDIA / Apple Silicon GPU for better speed |
| OS | macOS 12+ / Windows 10+ / Linux | Latest version |

<!-- @img: check-system-specs | Checking computer specs (macOS About This Mac / Windows System Info) --><!-- ⚠️ Unmatched -->

### Recommended Models (March 2026)

| Rank | Model | Why Choose It |
|---|---|---|
| 🥇 Top Pick | `qwen2.5:7b` | Strongest multilingual capabilities, medium size (~5 GB) |
| 🥈 Lightweight | `llama3.2:3b` | Smallest and fastest, runs on low-spec machines (~2 GB) |
| 🥉 Balanced | `gemma2:9b` | Made by Google, excellent English (~5 GB) |

More models available at [ollama.com/search](https://ollama.com/search).

### Download and Test a Model

```bash
# Download (using Qwen 7B as an example)
ollama pull qwen2.5:7b
```

The download takes a few minutes to over ten minutes depending on your internet speed.

![Terminal showing model download progress](/images/articles/ollama-openclaw/ollama-pull-model.png)

```bash
# Test
ollama run qwen2.5:7b
```

Once you see the chat interface, type a greeting and the model will start responding. Type `/bye` to exit.

![Testing model conversation response](/images/articles/ollama-openclaw/ollama-test-chat.png)

### Use Local Models with OpenClaw

Change your `config.yaml` to use the local model:

```yaml
models:
  default:
    provider: ollama
    model: qwen2.5:7b
```

### Verify GPU Acceleration

#### Apple Silicon (M1/M2/M3/M4)

Good news: Ollama automatically uses Apple GPU acceleration — no extra setup needed.

```bash
# Check model runtime info to verify GPU usage
ollama ps
```

<!-- @img: ollama-ps-terminal | Terminal showing ollama ps with running models and GPU info --><!-- ⚠️ Unmatched -->

If you see `gpu` related info, GPU acceleration is enabled.

#### NVIDIA GPU (Windows / Linux)

You need to install the [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-toolkit):

```bash
# Verify NVIDIA driver
nvidia-smi
```

If the command returns GPU info, Ollama will automatically detect and use the NVIDIA GPU.

#### No GPU?

It still works! Just a bit slower. Recommendations:
- Use smaller models (`llama3.2:3b` is quite fast on CPU)
- Lower `temperature` to reduce inference time
- Close other memory-hungry apps

### Memory Management

Ollama automatically unloads models from memory after 5 minutes of inactivity. If you want to manage manually:

```bash
# View currently loaded models
ollama ps

# Manually stop a model (free up memory)
ollama stop qwen2.5:7b
```

### Local Model Speed Reference

Choose the best combination based on your hardware:

| Your Setup | Recommended Model | Expected Speed |
|---|---|---|
| 8GB RAM, no GPU | `llama3.2:3b` | 5-10 tokens/sec |
| 16GB RAM, Apple M1 | `qwen2.5:7b` | 15-25 tokens/sec |
| 16GB RAM, NVIDIA RTX 3060 | `qwen2.5:14b` | 20-30 tokens/sec |
| 32GB+ RAM, NVIDIA RTX 4090 | `llama3.1:70b` | 30+ tokens/sec |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **For reference**: The average person reads at about 5-8 words per second. So as long as the model can reach 10+ tokens per second, the experience is already quite good.

---

## Local vs Cloud vs Hybrid: Which Should You Choose?

| Use Case | Recommended Approach | Reason |
|---|---|---|
| Learning, experimenting | Ollama Cloud (free credits) | Zero setup, ready immediately |
| Light daily use | Ollama + Qwen 7B (local) | Free, acceptable speed |
| Heavy multilingual use | Cloud API (Gemini Flash) | Great quality, low cost |
| Privacy-sensitive data | Ollama (local) | Data never leaves your machine |
| Production workflows | Hybrid mode | Save money while maintaining quality |
| 24/7 Agent | Cloud deployment | Your computer can be turned off |

---

## Next Steps

You now have an AI Agent you can chat with! Here's what to do next:

- ⚙️ [Model Configuration & Switching](/articles/openclaw-model-config) — Learn finer control over model behavior
- 🧩 [Build Your First Skill](/articles/openclaw-first-skill) — Teach AI repeatable workflows
- 🤖 [Understanding Agents](/articles/openclaw-agent) — Evolve from chatbot to autonomous agent
- 📱 [Connect Telegram](/articles/telegram-integration) — Call your local AI from your phone anytime

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Pro tip**: Once you have Ollama installed, you can use it with other AI tools too (like Obsidian Copilot, Continue.dev) — it's not exclusive to OpenClaw!

Questions? Head to the [homepage discussion area](/#discussion) to chat!