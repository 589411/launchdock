---
title: "Essential Dev CLI Tools on Mac: Homebrew, GitHub CLI, Firebase CLI, Antigravity CLI"
description: "Install the developer command-line tools you actually use on Mac in one go. Lay the foundation with Homebrew, then add GitHub CLI, Firebase CLI, and Google's Antigravity CLI — with login and troubleshooting."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-06-25"
verifiedAt: "2026-06-25"
archived: false
order: 12
prerequisites: ["cli-guide"]
estimatedMinutes: 12
tags: ["macOS", "安裝", "Homebrew", "GitHub", "Firebase"]
stuckOptions:
  "Installing Homebrew": ["Can't find the brew command after install on Apple Silicon?", "Do I need Xcode Command Line Tools first?"]
  "command not found": ["Installed it but the shell says it's not found", "How do I set up my PATH?"]
  "Login is stuck": ["The browser didn't open automatically", "Terminal does nothing after I authorize"]
  "Updating tools": ["How do I update everything at once?", "How do I remove an old version?"]
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Install once, hit fewer snags**: On Mac, almost every developer CLI tool installs with a single [Homebrew](/articles/cli-guide) command. This guide lays the foundation first, then walks you through GitHub CLI, Firebase CLI, and Google's Antigravity CLI. About 12 minutes and your terminal will be fully equipped.

> 📌 **New to the terminal?** Start with the [CLI Starter Guide](/articles/cli-guide) to understand what "operating your computer by typing" means — it'll make this guide go much smoother.

---

## 🤔 Why use CLI tools?

Plenty of services have nice web dashboards, but when you're building, you'll notice that **commands are often faster, repeatable, and easier to automate**.

- `gh` (GitHub CLI): open PRs, browse issues, clone repos — all in the terminal, no constant browser switching.
- `firebase` (Firebase CLI): deploy sites, manage databases, run local emulators in one command.
- `agy` (Antigravity CLI): bring Google Antigravity's AI agent straight into your terminal.

On Mac, the common installer for all of these is **Homebrew**. Get that set up first and the rest is easy.

---

## 🍺 Step 0: Install Homebrew (the foundation)

Homebrew is the de-facto package manager for macOS — think of it as "the App Store for your Mac, but all via commands."

Open **Terminal** (search `terminal` in Spotlight) and paste the official install command:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

> 💡 On first run it'll ask for your Mac login password (characters won't show as you type — that's normal) and may also install the Xcode Command Line Tools. Just wait for it to finish.

After installing, **Apple Silicon (M1/M2/M3/M4) users** need to add brew to their PATH, otherwise you'll hit "command not found":

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify the install:

```bash
brew --version
```

If you see a version number, your foundation is set.

<!-- @img: brew-version-check | Terminal running brew --version showing the version number -->

---

## 🐙 Step 1: GitHub CLI (`gh`)

GitHub's official command-line tool, letting you work with repos, PRs, and issues right from the terminal.

### Install

```bash
brew install gh
```

### Log in

```bash
gh auth login
```

Follow the prompts: `GitHub.com` → `HTTPS` → authenticate Git with your credentials → `Login with a web browser`. The terminal gives you a one-time code and opens your browser — paste the code to authorize.

<!-- @img: gh-auth-browser | Browser showing the GitHub CLI device authorization page -->

### Verify and common commands

```bash
# Check who you're logged in as
gh auth status

# Clone a repo (no full URL needed)
gh repo clone 589411/launchdock

# Open a PR from the current repo
gh pr create

# List issues in the current repo
gh issue list
```

---

## 🔥 Step 2: Firebase CLI (`firebase`)

Google Firebase's command-line tool for deploying sites, managing Firestore, and running local emulators.

### Install

```bash
brew install firebase-cli
```

> 💡 **Prefer npm?** If you already have Node.js, you can use `npm install -g firebase-tools`. Pick one method — don't install both or versions will clash.

### Log in

```bash
firebase login
```

This opens your browser; choose your Google account and authorize, and the terminal will confirm a successful login.

<!-- @img: firebase-login-browser | Browser showing the Firebase CLI Google account authorization page -->

### Verify and common commands

```bash
# Check the version
firebase --version

# List projects you can access
firebase projects:list

# Initialize Firebase in your project folder
cd ~/your-project
firebase init

# Deploy
firebase deploy
```

---

## 🚀 Step 3: Antigravity CLI (`agy`)

The terminal version of Google Antigravity's AI coding agent, bringing the agent's reasoning and execution right into your command line.

### Install

```bash
brew install --cask antigravity-cli
```

> 💡 **Don't want Homebrew?** There's also an official install script:
> ```bash
> curl -fsSL https://antigravity.google/cli/install.sh | bash
> ```
> This installs `agy` to `~/.local/bin/agy` by default — make sure that path is on your PATH.

### First run and login

Just run:

```bash
agy
```

On first launch it guides you through signing in with your Google account, opening the browser for Google Sign-In (free, AI Pro, and Ultra accounts all work).

<!-- @img: antigravity-auth-browser | Browser showing the Antigravity CLI Google sign-in authorization page -->

Once authorized, return to the terminal and you can start chatting with the agent and assigning tasks from the command line.

---

## 🚨 Quick troubleshooting

### Issue 1: `command not found: brew` (or gh / firebase / agy)

**Symptom**: You installed it, but the shell says the command isn't found.

**Cause**: The tool's executable path isn't on your PATH — most common with Homebrew on Apple Silicon (installed under `/opt/homebrew`).

**Fix**: Run the PATH setup from Step 0, then **close and reopen a new Terminal window**. If you installed Antigravity via the script, make sure `~/.local/bin` is on your PATH too:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### Issue 2: The browser didn't open during login

Copy the URL the terminal printed and open it in your browser manually. After authorizing, return to the terminal — it usually detects it within a few seconds.

### Issue 3: `brew install` is stuck or very slow

Usually a network issue. Try `brew update` first, then retry. On a corporate network with a proxy, check the outbound allowlist with your IT team.

---

## 💡 Maintenance: update everything at once

The best part of Homebrew is that all your tools upgrade together:

```bash
# Refresh Homebrew's package list
brew update

# Upgrade every installed tool (including gh, firebase, antigravity)
brew upgrade

# Clean up old versions to free space
brew cleanup
```

```bash
# Upgrade a single tool
brew upgrade gh

# Remove a tool
brew uninstall firebase-cli
```

> 💡 Make `brew update && brew upgrade` an occasional habit and your tools stay current — fewer old-version snags.

---

## 🔗 Further reading

- **New to the command line?** → [CLI Starter Guide: What Is the Command Line?](/articles/cli-guide)
- **Want to run an AI agent on Mac?** → [Installing OpenClaw on macOS](/articles/install-openclaw-macos)
- **Want to run automation tools with Docker?** → [Docker + n8n on Mac: Complete Setup Guide](/articles/docker-n8n-mac)
