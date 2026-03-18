---
title: "Install OpenClaw on macOS: A Complete Step-by-Step Guide"
description: "A step-by-step guide to installing OpenClaw on Mac, covering Homebrew, Python environment, dependencies, and your first launch."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-03-18"
archived: false
order: 2
prerequisites: ["install-openclaw"]
estimatedMinutes: 15
tags: ["OpenClaw", "macOS", "安裝", "Python", "Homebrew"]
stuckOptions:
  "Homebrew": ["Homebrew install command is taking forever", "Terminal shows permission denied", "I don't know what Homebrew is"]
  "Python": ["I already have Python but wrong version", "After installing pyenv, python command didn't change", "Are there compatibility issues with M1/M2 chips?"]
  "Create virtual environment": ["What's the difference between virtualenv and venv?", "How do I confirm the virtual environment is active?"]
  "Install OpenClaw": ["pip install shows red error text", "Dependency conflicts", "Is it normal for the install to be slow?"]
  "First launch": ["ModuleNotFoundError after launch", "Started but can't open the web page", "Where do I enter my API Key?"]
---

## Before You Start

> This Duck Editor tutorial will walk you through installing OpenClaw on macOS from scratch, with screenshots for every step.

This tutorial is for installing OpenClaw on **macOS** (Intel or Apple Silicon M1/M2/M3).

If you're on Windows, check out the [Windows Installation Guide](/en/articles/install-openclaw-windows).
If you'd rather not install locally, consider the [Cloud Deployment Guide](/en/articles/deploy-openclaw-cloud).

### What You'll Need

- macOS 12 (Monterey) or newer
- At least 8GB RAM (16GB recommended)
- At least 5GB of free disk space
- A stable internet connection
- An OpenAI / Google / Anthropic API Key (at least one)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Not sure about your Mac model? Click the Apple icon in the top-left → "About This Mac" to check.

---

## Step 1: Install Homebrew

Homebrew is the package manager for macOS — almost every development tool is installed through it.

Open **Terminal** and paste this command:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

During installation, you may be asked to:
1. Enter your Mac login password (characters won't appear as you type — that's normal)
2. Press Enter to confirm

After installation, verify Homebrew is working:

```bash
brew --version
# Should display something like Homebrew 4.x.x
```

> ⚠️ **Apple Silicon (M1/M2/M3) users**: After installation, you may need to run these commands to make `brew` available:
> ```bash
> echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
> eval "$(/opt/homebrew/bin/brew shellenv)"
> ```

---

## Step 2: Install Python 3.11+

OpenClaw requires Python 3.11 or newer. We'll use `pyenv` to manage Python versions and avoid conflicts with the system Python.

```bash
# Install pyenv
brew install pyenv

# Configure your shell (zsh)
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# Reload the configuration
source ~/.zshrc

# Install Python 3.11
pyenv install 3.11
pyenv global 3.11

# Verify the version
python --version
# Should display Python 3.11.x
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Already have Python?** Run `python3 --version` to check. If it's 3.11 or above, you can skip this step.

---

## Step 3: Install Additional Dependencies

OpenClaw needs a few system tools:

```bash
# Git (version control, usually pre-installed on macOS)
git --version

# Node.js (needed for some features, official recommendation: Node 24, minimum 22.16)
brew install node@24

# Verify
node --version  # Should be v24.x.x (minimum v22.16+)
npm --version
```

---

## Step 4: Download OpenClaw

```bash
# Pick a directory you like
cd ~/Projects  # Or wherever you keep your projects
mkdir -p ~/Projects && cd ~/Projects

# Download OpenClaw
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

---

## Step 5: Create a Virtual Environment

A virtual environment prevents package conflicts — strongly recommended:

```bash
# Create the virtual environment
python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# Once activated, your terminal prompt will show (.venv)
# e.g.: (.venv) user@MacBook openclaw %
```

> ⚠️ **You need to re-activate the virtual environment every time you open a new Terminal window**:
> ```bash
> cd ~/Projects/openclaw
> source .venv/bin/activate
> ```

---

## Step 6: Install OpenClaw

```bash
# Make sure you're in the virtual environment (you should see .venv in the prompt)
pip install --upgrade pip

# Install OpenClaw and all dependencies
pip install -r requirements.txt

# Or install directly via pip (if published to PyPI)
# pip install openclaw
```

The installation may take 3-5 minutes depending on your internet speed.

---

## Step 7: Set Up Your API Key

OpenClaw needs at least one LLM API Key:

```bash
# Create the environment config file
cp .env.example .env
```

Open `.env` with your preferred editor and fill in your API Key:

```bash
# Fill in at least one
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
# or
GOOGLE_API_KEY=your-google-api-key
# or
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Don't have an API Key yet?** Check out the [AI Model API Key Guide](/en/articles/ai-api-key-guide) — Google AI Studio offers a free tier, perfect for beginners.

---

## Step 8: First Launch

```bash
# Start OpenClaw
python -m openclaw start

# Or
openclaw start
```

If everything goes well, you'll see output like this:

```
🐾 OpenClaw is starting...
✅ Server running at http://localhost:3000
✅ Dashboard available at http://localhost:3000/dashboard
```

Open your browser and go to `http://localhost:3000` — you should see the OpenClaw dashboard!

---

## Common Issues

### `pip install` shows red error text

This is usually caused by dependency version conflicts. Try:

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --force-reinstall
```

### Compilation errors on M1/M2 chips

Some Python packages require native compilation on Apple Silicon:

```bash
# Install build tools
xcode-select --install

# Retry the installation
pip install -r requirements.txt
```

### `localhost:3000` won't open after launch

1. Make sure OpenClaw started correctly (no red error text in the terminal)
2. Try `http://127.0.0.1:3000`
3. Check if port 3000 is occupied by another program: `lsof -i :3000`

### `ModuleNotFoundError`

You probably forgot to activate the virtual environment:

```bash
source .venv/bin/activate
python -m openclaw start
```

---

## Next Steps

Installation complete! Here's what you can do next:

- 🧩 [Learn about Skills: Teach AI repeatable workflows](/en/articles/openclaw-skill)
- 🤖 [Build your first Agent](/en/articles/openclaw-agent)
- 🔑 [Get a Google API Key to connect more services](/en/articles/google-api-key-guide)
- ☁️ [Don't want to manage servers? Try cloud deployment](/en/articles/deploy-openclaw-cloud)
