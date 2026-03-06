---
title: "Complete WSL Guide: Give Your Windows Linux Superpowers"
description: "WSL (Windows Subsystem for Linux) is the best way for Windows users to install OpenClaw. From installation to configuration to daily use — all in one guide."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 1
prerequisites: ["cli-guide"]
estimatedMinutes: 20
tags: ["WSL", "Windows", "Linux", "安裝", "OpenClaw"]
stuckOptions:
  "What is WSL": ["How is WSL different from a virtual machine?", "Will WSL slow down my computer?", "Is WSL free?"]
  "Install WSL": ["wsl --install doesn't respond", "How do I enable BIOS virtualization?", "Is it normal to be asked to restart?"]
  "Using WSL": ["How do I access Windows files from WSL?", "Where are WSL files in Windows?", "Can I use VS Code to edit WSL files?"]
  "Install OpenClaw": ["Error installing Python in WSL", "Is it normal for pip install to be slow?"]
---

## What is WSL?

WSL stands for **Windows Subsystem for Linux**.

Simply put: **It lets you run a real Linux environment inside Windows — no virtual machine needed, no system reinstallation required.**

<!-- @img: wsl-terminal | WSL Ubuntu terminal screen -->

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's take**: Imagine your Windows computer is like a building. Before, you could only live on the "Windows floor." WSL adds a "Linux floor" to the building — you can take the elevator between them whenever you want, and use facilities on both sides.

---

## Why Use WSL?

If you've read [Why is installing OpenClaw natively on Windows not recommended?](/en/articles/why-not-windows-openclaw), you know that OpenClaw relies heavily on CLI tools, and these tools work best on Linux.

WSL gives you the best of both worlds:

| | Native Windows | WSL | Virtual Machine (e.g., VirtualBox) |
|---|---|---|---|
| CLI tool support | ❌ Lacking | ✅ Complete | ✅ Complete |
| Performance impact | None | Almost none | Noticeable slowdown |
| Memory usage | None | ~300MB | 2-4GB |
| Integration with Windows | — | ✅ Shared files | ❌ Requires setup |
| Startup speed | — | Instant | 1-2 minutes |
| Installation difficulty | — | One command | Multi-step setup |

---

## WSL 1 vs WSL 2

WSL currently has two versions:

| | WSL 1 | WSL 2 |
|---|---|---|
| Kernel | Translation layer | Real Linux kernel |
| Compatibility | Mostly works | Fully compatible |
| File performance | Slower in Linux | Very fast in Linux |
| Memory | Less | Dynamic allocation |
| Docker support | ❌ | ✅ |

**Bottom line: Use WSL 2.** It's the default version and offers better performance and compatibility.

---

## System Requirements

Before starting the installation, make sure your system meets the following:

- **Windows 10** version 2004 (Build 19041) or above, or **Windows 11**
- At least **4GB RAM** (8GB or more recommended)
- **Virtualization technology** enabled in BIOS

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Check your Windows version**: Press `Win + R`, type `winver`, press Enter. The version number should be ≥ 2004.

<!-- @img: winver-check | winver command showing Windows version info -->

---

## Step 1: Install WSL

### 1.1 Open PowerShell (Administrator)

1. Press the `Win` key, type `PowerShell`
2. Right-click on "Windows PowerShell"
3. Select "**Run as administrator**"

<!-- @img: powershell-admin | Open PowerShell as Administrator -->

### 1.2 Run the Installation Command

```powershell
wsl --install
```

This single command will automatically:
- Enable the WSL feature
- Enable the Virtual Machine Platform
- Download the Linux kernel
- Install Ubuntu (default distribution)

<!-- @img: wsl-install-command | wsl --install command execution screen -->

> After installation completes, you'll be asked to **restart your computer** — this is normal.

### 1.3 Restart Your Computer

Click "Restart now," or manually reboot.

---

## Step 2: Set Up Ubuntu

After restarting, Ubuntu will open automatically (or find it from the Start menu).

### 2.1 Set Up Username and Password

Ubuntu will ask you to configure:

```
Enter new UNIX username: your-name
New password: ********
Retype new password: ********
```

<!-- @img: wsl-setup-user | WSL first launch username setup screen -->

> ⚠️ **Note**:
> - Use lowercase English for the username, no spaces
> - **No characters will be displayed** when typing the password (not even `***`) — this is normal
> - You'll need this password when using `sudo` later, so remember it

### 2.2 Update the System

Once setup is complete, update the system to the latest version:

```bash
sudo apt update && sudo apt upgrade -y
```

You'll be asked to enter the password you just set.

> This step may take a few minutes, depending on your internet speed.

---

## Step 3: Learn Basic WSL Operations

### 3.1 Starting and Stopping WSL

```powershell
# Start WSL from PowerShell or CMD
wsl

# Start a specific distribution
wsl -d Ubuntu

# Shut down all WSL instances
wsl --shutdown

# List installed distributions
wsl --list --verbose
```

### 3.2 File Sharing Between WSL and Windows

WSL and Windows files are accessible from both sides, but the path syntax differs:

#### Access Windows Files from WSL

Your Windows drives are mounted under `/mnt/`:

```bash
# Your C drive
ls /mnt/c/

# Your Windows Desktop
ls /mnt/c/Users/YourUsername/Desktop/

# Your Windows Documents
ls /mnt/c/Users/YourUsername/Documents/
```

#### Access WSL Files from Windows

In Windows File Explorer, type this in the address bar:

```
\\wsl$\Ubuntu\home\your-username
```

<!-- @img: wsl-file-access | Access WSL files from Windows File Explorer -->

> ⚠️ **Important performance note**:
> - Operating on WSL files from within WSL → **Fast**
> - Operating on Windows files from within WSL (`/mnt/c/`) → **Slow**
> - It's recommended to keep your OpenClaw project in WSL's home directory, not in `/mnt/c/`

### 3.3 Launch Windows Programs from WSL

You can call Windows programs directly from WSL:

```bash
# Open a URL in the Windows browser
explorer.exe https://localhost:3000

# Open a file with Windows Notepad
notepad.exe somefile.txt

# Open the current directory in VS Code
code .
```

---

## Step 4: Install Development Tools

### 4.1 Install Basic Tools

```bash
# Install common CLI tools
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  jq \
  tree \
  unzip \
  htop
```

### 4.2 Install Python

```bash
# Install Python 3.11 and related tools
sudo apt install -y python3.11 python3.11-venv python3-pip

# Verify the version
python3.11 --version
# Should display Python 3.11.x
```

> If `python3.11` is not found, add the deadsnakes PPA first:
> ```bash
> sudo add-apt-repository ppa:deadsnakes/ppa -y
> sudo apt update
> sudo apt install python3.11 python3.11-venv -y
> ```

### 4.3 Install Node.js

```bash
# Install the latest LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Verify the version
node --version
# Should be v18 or above
```

---

## Step 5: Install OpenClaw in WSL

Now your WSL has a complete Linux environment — installing OpenClaw is exactly the same as on Mac/Linux:

```bash
# Create a project directory
mkdir -p ~/Projects && cd ~/Projects

# Download OpenClaw
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# Create a Python virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy the config file
cp .env.example .env
```

### Set Up Your API Key

```bash
# Edit the config file with nano
nano .env
```

Fill in at least one API Key:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

> In nano: `Ctrl + O` to save, `Ctrl + X` to exit.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Don't have an API Key yet?** Check out the [AI Model API Key Guide](/en/articles/ai-api-key-guide) — Google AI Studio offers a free tier, perfect for beginners.

### Launch OpenClaw

```bash
python -m openclaw start
```

If you see the following message, you're all set:

```
🐾 OpenClaw is starting...
✅ Server running at http://localhost:3000
```

Open your Windows browser and go to `http://localhost:3000` — WSL's `localhost` is directly accessible from your Windows browser!

---

## Step 6: Use with VS Code (Highly Recommended)

VS Code has an excellent WSL extension that lets you edit WSL files directly from VS Code on Windows.

### 6.1 Install the VS Code WSL Extension

1. Open VS Code on Windows
2. Install the extension: **WSL** (by Microsoft)

<!-- @img: vscode-wsl-extension | VS Code WSL extension installation screen -->

### 6.2 Open VS Code from WSL

```bash
# In the WSL terminal, navigate to the OpenClaw directory
cd ~/Projects/openclaw

# Open with VS Code
code .
```

The first time, it will automatically install VS Code Server. After that, you can edit WSL files and use the WSL terminal directly from VS Code.

<!-- @img: vscode-wsl-remote | VS Code opening a project via WSL -->

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's take**: Once you have VS Code + WSL set up, your development experience is virtually identical to Mac/Linux users. This is the best combo for Windows developers.

---

## Common Issues

### 🚨 `wsl --install` Doesn't Respond

**Possible cause**: Windows version is too old.

**Solution**:
1. Press `Win + R` → type `winver` → verify version ≥ 2004
2. If the version is too old, update via Windows Update first

### 🚨 "Please enable the Virtual Machine Platform Windows feature"

**Cause**: Virtualization technology (Intel VT-x or AMD-V) is not enabled in BIOS.

**Solution**:
1. Restart your computer, enter BIOS (usually by pressing `F2`, `F12`, or `Delete`)
2. Find "Virtualization Technology" or "Intel VT-x"
3. Set to `Enabled`
4. Save and restart

<!-- @img: bios-virtualization | Enabling virtualization technology in BIOS -->

> Every motherboard's BIOS interface is different. If you can't find it, search for your computer model + "enable virtualization."

### 🚨 Slow Network in WSL

**Solution**: Configure DNS

```bash
# Edit WSL config
sudo nano /etc/wsl.conf

# Add the following
[network]
generateResolvConf = false
```

```bash
# Set DNS
sudo rm /etc/resolv.conf
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

Restart WSL:
```powershell
# In PowerShell
wsl --shutdown
wsl
```

### 🚨 Not Enough Disk Space

WSL is installed on the C drive by default. If you're running low on space, you can move the entire WSL installation:

```powershell
# In PowerShell
# Export
wsl --export Ubuntu D:\backup\ubuntu.tar

# Unregister
wsl --unregister Ubuntu

# Import to D drive
wsl --import Ubuntu D:\WSL\Ubuntu D:\backup\ubuntu.tar
```

### 🚨 WSL's `localhost` Won't Open in Windows

WSL 2 usually auto-maps `localhost` to Windows. If it won't open:

```bash
# Check the IP in WSL
hostname -I
```

Use the displayed IP instead of `localhost`, e.g., `http://172.x.x.x:3000`.

---

## Daily Usage Tips

### Set WSL Default Startup Directory

By default, WSL opens in the Windows user directory. Change it to home:

```bash
# Edit .bashrc
echo 'cd ~' >> ~/.bashrc
```

### Set Up Aliases for Faster Operations

```bash
# Edit .bashrc or .zshrc
nano ~/.bashrc

# Add common aliases
alias ll='ls -la'
alias oc='cd ~/Projects/openclaw && source .venv/bin/activate'
alias ocstart='cd ~/Projects/openclaw && source .venv/bin/activate && python -m openclaw start'
```

Now you can just type `ocstart` to launch OpenClaw in one step.

### Install Zsh + Oh My Zsh (Optional)

Make your terminal more useful and better looking:

```bash
# Install Zsh
sudo apt install zsh -y

# Install Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

---

## In One Sentence

> **WSL adds a complete Linux environment to your Windows computer. With WSL installed, your OpenClaw runs in the most comfortable environment possible.**

---

## Next Steps

WSL is all set! Here's what you can do next:

- 🐾 [First time launching OpenClaw](/en/articles/openclaw-first-run) — Set up your API Key and hear AI's first words
- 🧩 [Learn about Skills](/en/articles/openclaw-skill) — Teach AI repeatable workflows
- 🤖 [Build your Agent](/en/articles/openclaw-agent) — Your AI alter ego goes live
- 🔑 [Apply for an API Key](/en/articles/ai-api-key-guide) — Free Google API Key is perfect for beginners
