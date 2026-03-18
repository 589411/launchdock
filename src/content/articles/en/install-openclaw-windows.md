---
title: "Install OpenClaw on Windows: A Complete Step-by-Step Guide"
description: "A step-by-step guide to installing OpenClaw on Windows 10/11, covering Python, WSL, dependencies, and your first launch."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-03-18"
archived: false
order: 2
prerequisites: ["install-openclaw"]
estimatedMinutes: 15
tags: ["OpenClaw", "Windows", "安裝", "Python", "WSL"]
stuckOptions:
  "Choose installation method": ["Should I use WSL or native Windows?", "What is WSL?"]
  "Install Python": ["Can I use Python from the Microsoft Store?", "What does adding to PATH mean?", "Installed but cmd can't find python"]
  "Install WSL": ["wsl --install doesn't respond", "How do I enable BIOS virtualization?", "What's the difference between WSL 1 and WSL 2?", "How do I check systeminfo?"]
  "Download OpenClaw": ["git clone shows an SSL error", "Is it normal for the download to be slow?"]
  "Install OpenClaw": ["pip install shows red error text", "What is VC++ Build Tools?", "It's been installing for a long time, is that normal?"]
  "First launch": ["Started but can't open the web page", "Windows Defender firewall alert popped up", "Not sure about the API Key format"]
---

## Before You Start

> This Duck Editor tutorial will walk you through installing OpenClaw on Windows via WSL, with screenshots for every step.

This tutorial is for installing OpenClaw on **Windows 10 (version 2004+) or Windows 11**.

> 💡 **Read this first**: [Why is installing OpenClaw natively on Windows not recommended?](/en/articles/why-not-windows-openclaw) — Learn why WSL is the best choice for Windows users.

If you're on Mac, check out the [macOS Installation Guide](/en/articles/install-openclaw-macos).
If you'd rather not install locally, consider the [Cloud Deployment Guide](/en/articles/deploy-openclaw-cloud).

### What You'll Need

- Windows 10 (version 2004 or above) or Windows 11
- At least 8GB RAM (16GB recommended)
- At least 5GB of free disk space
- A stable internet connection
- An API Key (at least one): OpenAI / Google / Anthropic, or the free **Ollama Cloud** option

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Check your Windows version**: Press `Win + R`, type `winver`, and press Enter. No API Key? No problem — there's a free Ollama Cloud option covered later.

---

## Choose Your Installation Method

There are two ways to install on Windows:

| Method | Difficulty | Best for | Advantage |
|---|---|---|---|
| **Method A: WSL 2** (Recommended) | ⭐⭐ Medium | Everyone | Linux environment, more stable, officially recommended by OpenClaw |
| **Method B: Native Windows** | ⭐ Easy | Quick tryout only | No setup required, but many gotchas |

**Duck Editor recommends going with Method A (WSL) from the start.** OpenClaw's CLI tools are more stable in a Linux environment, and native Windows installs frequently run into issues after prolonged use.

---

## Method A: WSL 2 Installation (Recommended)

WSL (Windows Subsystem for Linux) lets you run Linux inside Windows. OpenClaw's CLI tools and dependencies are more stable in a Linux environment.

> 📘 **Full tutorial**: For a deeper understanding of WSL, see the [Complete WSL Guide](/en/articles/windows-wsl-guide).

### Step 1: Verify BIOS Virtualization is Enabled

WSL 2 requires hardware virtualization support. First, check if your computer has it enabled:

Open Command Prompt as **Administrator** (`Win + R` → type `cmd` → `Ctrl + Shift + Enter`):

```cmd
systeminfo
```

Look at the last few lines and find the "Hyper-V Requirements" section:

```
Hyper-V Requirements:    A hypervisor has been detected. Features required for Hyper-V will not be displayed.
```

If it shows "Virtualization Enabled In Firmware: No", you need to enable it in BIOS:
1. Restart your computer, press `DEL` or `F2` to enter BIOS
2. Find `Intel VT-x` (Intel processors) or `AMD-V / SVM Mode` (AMD processors)
3. Set it to `Enabled`
4. Save and restart

### Step 2: Install WSL 2

Open PowerShell as **Administrator** (right-click → Run as administrator):

```powershell
wsl --install
```

**Restart your computer** after installation completes.

After restarting, Ubuntu will automatically open and ask you to set up a username and password.

> ⚠️ If `wsl --install` doesn't respond, go back and verify that BIOS virtualization is enabled (Step 1).

### Step 3: Install Node.js 24 (using nvm)

OpenClaw requires **Node.js 22.16 or above**; the official recommendation is **Node 24**. Open Ubuntu (launch it from the Start menu):

```bash
# Check existing Node version (if installed)
node -v

# If an old version is installed, remove it first
sudo apt remove nodejs -y
sudo apt autoremove -y
sudo apt update

# Install nvm (Node Version Manager)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

# Reload config (or exit and re-enter)
exit
```

Re-enter WSL:

```bash
wsl -d ubuntu
```

```bash
# Verify nvm
nvm --version

# Install Node.js 24 (officially recommended)
nvm install 24
nvm use 24

# Set as default
nvm alias default 24

# Verify
node -v   # Should show v24.x.x
which node  # Should be at ~/.nvm/versions/node/v24.x.x/bin/node
```

> 💡 Already have Node 22.16+? You can keep it (minimum supported version), but the official recommendation is to upgrade to Node 24 when you get a chance.

### Step 4: Install and Launch OpenClaw

```bash
# Option 1: Global npm install (recommended, easiest)
npm install -g openclaw
openclaw --version

# Option 2: Traditional git clone install
sudo apt install python3.11 python3.11-venv python3-pip git -y
mkdir -p ~/Projects && cd ~/Projects
git clone https://github.com/openclaw/openclaw.git
cd openclaw
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Set Up API Key

```bash
# npm install method: configure during first launch
openclaw start
# First run will guide you through API Key setup

# git clone method: edit .env
cp .env.example .env
nano .env  # Enter API Key, Ctrl+O to save, Ctrl+X to exit
python -m openclaw start
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Don't have an API Key yet?** Two free options:
>
> **Option 1: Ollama Cloud (Recommended)** — Sign up at [ollama.com](https://ollama.com), then in WSL run:
> ```bash
> ollama signin
> ollama launch openclaw
> # Select a cloud model (e.g., qwen3-coder:480b-cloud, deepseek-v3.1:671b-cloud) → no local GPU needed
> ```
>
> **Option 2: Google AI Studio** — Get a free API Key at [aistudio.google.com](https://aistudio.google.com/apikey).

WSL's `localhost:3000` is directly accessible from your Windows browser.

### 🛠️ Bonus Tool: OpenAI Codex CLI (Fix Errors with AI)

If you run into errors while installing OpenClaw in WSL, consider installing **OpenAI Codex CLI** — an AI coding agent that runs in your terminal and can help diagnose errors and suggest fixes:

```bash
# Install Codex CLI (requires Node 22.16+, already installed)
npm install -g @openai/codex

# Use it in your OpenClaw directory
cd ~/Projects/openclaw
codex "explain this error and how to fix it: [paste error message here]"
```

> 💡 Codex CLI requires an OpenAI API Key. If you have Ollama installed, it can also be configured to use local models. See [Codex CLI docs](https://github.com/openai/codex).

For more on Ollama, see [Ollama + OpenClaw Complete Guide](/en/articles/ollama-openclaw).

---

## Method B: Native Windows Installation (Not Recommended)

> ⚠️ **Method A (WSL) is recommended.** Native Windows installs frequently encounter path issues, C++ compiler errors, and other problems over time. The following is provided only for cases where WSL cannot be used.

### Step 1: Install Python 3.11+

1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Download the latest Python 3.11+ installer
3. Run the installer

> ⚠️ **Important! Make sure to check "Add Python to PATH" during installation** — many people forget this step!

<!-- 📸 Screenshot suggestion: Python installer screen, circle Add to PATH -->
<!-- ![Python Installation](/images/articles/install-windows/python-install-path.png) -->

4. After installation, open **Command Prompt** (press `Win + R`, type `cmd`):

```cmd
python --version
REM Should display Python 3.11.x or newer

pip --version
REM Should display pip 24.x.x
```

> If `python` doesn't work, try `python3` or `py`.

### Step 2: Install Git

1. Go to [git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and install (use the default settings)
3. Verify:

```cmd
git --version
REM Should display git version 2.x.x
```

### Step 3: Install Node.js 24

1. Go to [nodejs.org](https://nodejs.org)
2. Download **Node.js 24** (official recommendation) or the latest LTS version
3. Install (use the default settings)
4. Verify:

```cmd
node --version
REM Should be v24.x.x (minimum v22.16.0+)
```

### Step 4: Download OpenClaw

```cmd
REM Create a project directory
mkdir C:\Projects
cd C:\Projects

REM Download OpenClaw
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

### Step 5: Create a Virtual Environment

```cmd
REM Create the virtual environment
python -m venv .venv

REM Activate the virtual environment
.venv\Scripts\activate

REM Once activated, the prompt will show (.venv)
REM (.venv) C:\Projects\openclaw>
```

> ⚠️ **You need to re-activate every time you open a new Command Prompt**:
> ```cmd
> cd C:\Projects\openclaw
> .venv\Scripts\activate
> ```

### Step 6: Install OpenClaw

```cmd
REM Upgrade pip
pip install --upgrade pip

REM Install dependencies
pip install -r requirements.txt
```

> ⚠️ If you get a C++ compilation error, you need to install **Visual Studio Build Tools**:
> 1. Go to [visualstudio.microsoft.com/visual-cpp-build-tools/](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
> 2. Download and install
> 3. Select "Desktop development with C++"
> 4. Re-run `pip install -r requirements.txt`

### Step 7: Set Up API Key and Launch

```cmd
REM Copy the config template
copy .env.example .env

REM Edit with Notepad
notepad .env
```

Fill in at least one API Key in `.env`, then launch:

```cmd
python -m openclaw start
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> If Windows Defender pops up a firewall alert, click "Allow access."

---

## Common Issues

### `python` command not found

**Cause**: Forgot to check "Add Python to PATH" during installation.

**Solution**:
1. Re-run the Python installer
2. Select "Modify"
3. Make sure "Add Python to environment variables" is checked

Or manually add to PATH:
```cmd
setx PATH "%PATH%;C:\Users\YourUsername\AppData\Local\Programs\Python\Python311"
```

### pip install shows `Microsoft Visual C++ 14.0 is required`

Install Visual Studio Build Tools (see Step 6).

### Firewall blocking OpenClaw

Windows Defender may pop up a warning. Click "Allow" — this just lets Python listen on a local port.

### `localhost` won't open in WSL

Try using WSL's IP:
```bash
hostname -I
# Use the displayed IP instead of localhost
```

---

## Next Steps

Installation complete! Here's what you can do next:

- 🧩 [Learn about Skills: Teach AI repeatable workflows](/en/articles/openclaw-skill)
- 🤖 [Build your first Agent](/en/articles/openclaw-agent)
- 🔑 [Get a Google API Key to connect more services](/en/articles/google-api-key-guide)
- ☁️ [Don't want to manage servers? Try cloud deployment](/en/articles/deploy-openclaw-cloud)
