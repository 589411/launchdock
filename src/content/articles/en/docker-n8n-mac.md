---
title: "Docker + n8n on Mac: Complete Setup Guide"
description: "The simplest way to run n8n with Docker on macOS. No WSL2, no slash confusion, no line-ending issues — just three commands."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-05-30"
verifiedAt: "2026-05-30"
archived: false
order: 11
prerequisites: []
estimatedMinutes: 10
tags: ["Docker", "n8n", "macOS", "安裝"]
stuckOptions:
  "Installing Docker Desktop": ["Which version for Apple Silicon?", "Can't find the Docker icon after install?"]
  "docker pull is stuck": ["Network is fine but Image won't download", "SSL certificate error on company laptop"]
  "n8n won't open": ["localhost:5678 not connecting", "Terminal shows an Error — what now?"]
  "Port conflict": ["5678 is already in use", "How do I change the port?"]
---

> <img src="/images/dock_head_s.png" alt="LaunchDock" width="24" style="vertical-align: middle;"> **Good news for Mac users**: Installing Docker + n8n on a Mac is significantly simpler than on Windows. No WSL2 permission traps, no path slash confusion, no line-ending headaches. You can be up and running in about 10 minutes.

> 📌 **Windows user?** This guide is Mac-only. For the Windows pitfall guide, see: [Docker + n8n on Windows: A Complete Pitfall Guide](/articles/docker-n8n-windows)

---

## 🤔 Why Is Mac So Much Easier?

If you've read the [Windows pitfall guide](/articles/docker-n8n-windows), you'll know Windows users face a long list of obstacles. These problems stem from the fundamental difference between Windows and Linux environments. For a deeper explanation, see: [Why We Don't Recommend Running OpenClaw Natively on Windows](/articles/why-not-windows-openclaw)

| Issue | Windows | Mac |
|-------|---------|-----|
| Requires [WSL2](/articles/windows-wsl-guide) virtual environment | ✅ Required, often breaks | ❌ Not needed |
| Path slash direction | ⚠️ `\` vs `/` constantly conflicts | ✅ All `/`, Unix-native |
| PowerShell line-ending issues | ⚠️ Multi-line commands often break | ✅ Not a problem in Terminal |
| Spaces in volume paths | ⚠️ Requires `""` workarounds | ✅ Generally not an issue |
| Permission explosion after updates | ⚠️ Requires editing `/etc/wsl.conf` | ❌ Doesn't happen |

Mac is Unix-based. Docker's underlying runtime is Linux. The two speak the same language natively — no translation layer needed.

---

## 🚀 Installation (Three Steps)

### Step 1: Install Docker Desktop

Download from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).

> ⚠️ **Pick the right version**: Mac has two builds — check your chip first:
> - **Apple Silicon (M1/M2/M3/M4)** → Download the Apple Silicon version
> - **Intel Mac** → Download the Intel Chip version
>
> Not sure? Click the Apple menu (top-left) → **About This Mac**.

<!-- @img: docker-desktop-download-mac | Docker Desktop download page for Mac -->

After installation, open Docker Desktop. When you see the whale icon 🐳 in the menu bar, Docker is running.

<!-- @img: docker-desktop-running-mac | Docker whale icon in Mac menu bar -->

### Step 2: Create a Data Folder

Open **Terminal** (search `terminal` in Spotlight) and create a folder for n8n's data. If you're new to Terminal, check out: [CLI Beginner's Guide](/articles/cli-guide).

```bash
mkdir ~/n8n_data
```

> 💡 `~` is shorthand for your home directory (`/Users/your-account-name`). Keeping data here makes it easy to find and back up.

### Step 3: Start n8n

```bash
docker run -d --name n8n -p 5678:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

Docker will download the n8n image and start the container (first run takes 1–2 minutes). Then open your browser:

```
http://localhost:5678
```

If you see the n8n setup screen, you're done.

<!-- @img: n8n-first-run-browser-mac | n8n initial setup screen in browser -->

---

## 🧐 What Does That Command Actually Do?

```bash
docker run -d --name n8n -p 5678:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

| Part | What it does |
|------|-------------|
| `run` | Create and start a new container |
| `-d` | Run in the background (doesn't block your Terminal) |
| `--name n8n` | Name the container so you can reference it later |
| `-p 5678:5678` | Connect Mac's port 5678 to the container's port 5678 |
| `-v ~/n8n_data:/home/node/.n8n` | Mount your local folder into the container — data persists here |
| `docker.n8n.io/n8nio/n8n` | The image to use |

---

## 🚨 Quick Troubleshooting

### Issue 1: docker pull is stuck / SSL certificate error

**Symptom**: The image download freezes mid-progress, or you see `certificate signed by unknown authority`.

**Cause**: Corporate security software (e.g., Zscaler) is intercepting outbound connections.

**Fix**: Docker Desktop → Settings → Resources → Proxies → Enter your company's proxy address, or ask IT to whitelist Docker's registry.

### Issue 2: localhost:5678 won't load

First confirm the container is actually running:

```bash
docker ps
```

If n8n appears in the list, check the logs for the actual error:

```bash
docker logs n8n
```

### Issue 3: Port 5678 is already in use

```bash
# Check for old containers
docker ps -a

# Remove the old one
docker rm -f n8n

# Or switch to a different port
docker run -d --name n8n -p 5679:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

---

## 💡 Daily Commands

```bash
# Start n8n (when container exists but is stopped)
docker start n8n

# Stop n8n
docker stop n8n

# View running containers
docker ps

# View logs
docker logs n8n

# Remove container (data stays safe in ~/n8n_data)
docker rm n8n

# Update n8n (remove and re-run)
docker stop n8n && docker rm n8n
docker pull docker.n8n.io/n8nio/n8n
docker run -d --name n8n -p 5678:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

> 💡 **Updating n8n won't lose your data** — everything lives in `~/n8n_data`. The container is just a shell. Delete and recreate it for the cleanest possible update.

---

## 🔗 Further Reading

- **Want to run an AI Agent on Mac?** → [macOS: Install OpenClaw from Scratch](/articles/install-openclaw-macos)
- **Want a free local LLM with OpenClaw?** → [Ollama + OpenClaw Quick Start | macOS](/articles/ollama-openclaw-mac)
- **Want to deploy OpenClaw to the cloud?** → [Deploy OpenClaw to the Cloud: Zeabur One-Click](/articles/deploy-openclaw-cloud)
- **Also have a Windows machine?** → [Docker + n8n on Windows: A Complete Pitfall Guide](/articles/docker-n8n-windows)
