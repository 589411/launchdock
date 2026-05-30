---
title: "Docker + n8n on Windows: A Complete Pitfall Guide"
description: "A beginner-friendly guide to installing Docker, WSL2, and n8n on Windows. Covers the 5 most common failure points with step-by-step fixes, including corporate IT restrictions."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-05-30"
verifiedAt: "2026-05-30"
archived: false
order: 10
prerequisites: []
estimatedMinutes: 20
tags: ["Docker", "n8n", "Windows", "WSL", "安裝", "除錯"]
stuckOptions:
  "Installing Docker Desktop": ["Should I check the WSL 2 option?", "Do I need to restart after install?"]
  "WSL2 Permission Denied": ["PowerShell can't find the wsl command", "How do I use the nano editor?", "wsl --shutdown ran but Docker is still broken"]
  "Volume Mount Failed": ["n8n starts but browser can't open it", "Data disappeared after restart"]
  "Corporate Network Blocked": ["localhost:5678 keeps loading forever", "docker pull is stuck", "What do I ask IT for?"]
  "Port Conflict": ["Command ran with no output", "How do I find what's using the port?"]
---

> <img src="/images/dock_head_s.png" alt="LaunchDock" width="24" style="vertical-align: middle;"> **Why this guide exists**: A Docker Desktop update once completely broke WSL2 permissions. This SOP is the result of debugging that — so you don't have to.

> 📌 **Mac user?** This guide is Windows-only. For the much simpler Mac version, see: [Docker + n8n on Mac: Complete Setup Guide](/articles/docker-n8n-mac)

---

## 🛠️ Understanding the Tool Chain

Running Docker on Windows involves an unusual chain of tools. Understanding how they relate makes troubleshooting much easier:

| Tool | Role | Analogy |
|------|------|---------|
| **[WSL2](/articles/windows-wsl-guide)** | A Linux virtual environment inside Windows | A studio apartment built inside your house |
| **Docker Desktop** | GUI for managing containers; the actual engine runs inside WSL2 | The landlord living on the Windows floor |
| **n8n** | Automation tool running inside a Docker container | The tenant in the studio apartment |

<!-- @img: docker-architecture-diagram | Docker architecture on Windows diagram -->

---

## 💡 Core Concepts: Image vs Container

Before you run any commands, lock in these two ideas:

- **Image** = A recipe. Read-only, static, downloaded once.
- **Container** = A dish made from the recipe. Lives in memory, runs actively.

You can spin up multiple independent containers from the same n8n image. Just make sure these three parameters don't conflict:

| Parameter | Purpose | Conflict Result |
|-----------|---------|-----------------|
| `Port` | External access point | Two containers can't share the same Host Port |
| `Volume` | Data storage location | Pointing to the same folder causes data corruption |
| `Container Name` | Identifier | Names must be unique |

---

## 🚀 Installation Steps

### Step 1: Install Docker Desktop

1. Download from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. During install, select **Use WSL 2 instead of Hyper-V** (it's the default — keep it checked)
3. Restart your computer after installation

<!-- @img: docker-desktop-install-wsl2-option | Docker Desktop installation WSL2 option -->

### Step 2: Launch Your First n8n

Open PowerShell and create a clean folder for n8n data.

> 💡 **C drive or D drive?** Early Windows users frequently ran into boot failures caused by a full C drive. It's recommended to store Docker data on your **D drive** (or any drive with more space) if you have one. The C drive is your system drive — keep it lean.

```powershell
# Recommended: use D drive if available
mkdir D:\n8n_data

# If you only have a C drive: use root level, not inside Users folder
mkdir C:\n8n_data
```

Then run this command to start n8n (adjust the path to match what you just created):

```powershell
# Using D drive (recommended)
docker run -d --name n8n -p 5678:5678 -v "D:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# Using C drive
docker run -d --name n8n -p 5678:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n
```

<!-- @img: powershell-docker-run-n8n | Running docker run in PowerShell to start n8n -->

After a few seconds, open your browser and go to `http://localhost:5678`. If you see the n8n setup screen, you're done!

<!-- @img: n8n-first-run-browser | n8n initial setup screen in browser -->

---

## 🚨 The 5 Pitfalls and How to Fix Them

### Pitfall 1: WSL2 Permission Denied (Most Common After Updates)

**Symptom**: Docker Desktop fails to start with an error like:

```
CreateProcessCommon:818: execvpe(/mnt/wsl/docker-desktop/docker-desktop-user-distro) failed: Permission denied
```

**Cause**: After a Docker Desktop update, it needs to deploy a mount proxy at the Windows/WSL2 boundary. If Ubuntu's auto-mount doesn't include `metadata` permissions, Linux rejects it with Permission denied.

**Fix**:

1. Open PowerShell **as Administrator**
2. Run this command to open Ubuntu's config file:

```powershell
wsl -d Ubuntu-24.04 -u root nano /etc/wsl.conf
```

<!-- @img: powershell-wsl-nano-wslconf | PowerShell running wsl nano to open config file -->

> If your Linux version is different (e.g., Ubuntu-22.04), replace `Ubuntu-24.04` accordingly. Run `wsl -l -v` to see your installed versions. If you haven't installed WSL yet, start here: [WSL Complete Guide](/articles/windows-wsl-guide).

3. The nano editor opens. You'll see something like this:

```ini
[boot]
systemd=true
```

<!-- @img: nano-editor-wslconf-original | nano editor showing original wsl.conf content -->

4. Move to the end of the file and **add** the following:

```ini
[boot]
systemd=true

[automount]
enabled = true
options = "metadata,uid=1000,gid=1000,umask=22,fmask=11"
```

5. Save and exit:
   - Press `Ctrl + O` → Press `Enter` to confirm
   - Press `Ctrl + X` to exit

<!-- @img: nano-editor-wslconf-updated | nano editor showing updated wsl.conf with automount -->

6. Back in PowerShell, restart WSL:

```powershell
wsl --shutdown
```

7. Reopen Docker Desktop — issue resolved.

> 🚨 **If that doesn't work**: In Docker Desktop → Settings → Resources → WSL Integration, toggle Ubuntu-24.04 off, hit **Apply & restart**, then toggle it back on. This forces Docker to re-create its permission files.

---

### Pitfall 2: Wrong Slashes + Spaces in Paths (Volume Mount Fails)

**Symptom**: n8n appears to start normally, but all workflows disappear after a restart. Or it fails to start entirely.

**Cause**:
- Windows uses backslashes `\`; Docker containers (Linux) use forward slashes `/`. Mixing them breaks the mount.
- If your Windows username contains a space (e.g., `C:\Users\John Doe`), Docker splits the command at the space.

**Correct syntax**:

```powershell
# ✅ Correct: wrap the entire volume path in double quotes
docker run -d --name n8n -p 5678:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# ❌ Wrong: no quotes, space in path causes breakage
docker run -d --name n8n -p 5678:5678 -v C:\Users\John Doe\n8n:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

**Three rules to follow**:
1. Wrap the entire `-v` path in double quotes `""`
2. Prefer **D drive** (e.g., `D:\n8n_data`); if you only have C drive, use the root level (e.g., `C:\n8n_data`) — never a path like `C:\Users\Your Name` with spaces
3. The container-side path (after the colon) always uses forward slashes `/`

> ⚠️ **C drive space warning**: n8n workflows and logs accumulate over time. The C drive is already under pressure from Windows itself — storing data on D drive prevents the classic "C drive full, Windows won't boot" situation.

---

### Pitfall 3: Corporate IT Restrictions (The Invisible Blocker)

**Symptom**: Docker seems to be running fine, but `http://localhost:5678` just spins forever in the browser. Or `docker pull` hangs indefinitely.

**Cause**: Corporate machines are often locked down by:

| Restriction | Impact |
|-------------|--------|
| Firewall / Group Policy (GPO) | Blocks non-standard ports (like 5678), cuts off loopback connections between Windows and WSL2 |
| Security software (Zscaler, Trend Micro, GlobalProtect VPN) | Intercepts SSL certificates, causing `docker pull` to fail with `certificate signed by unknown authority` |
| IT policy | Blocks unauthorized software installation entirely |

**What to try**:

**First, try this**: Replace `localhost` with `127.0.0.1`:

```
http://127.0.0.1:5678
```

**If that doesn't work**, switch to a different port (port `8080` is commonly allowed in corporate environments):

```powershell
docker run -d --name n8n -p 8080:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n
```

Then open `http://localhost:8080` in your browser.

**If `docker pull` is hanging**, you need to configure a corporate proxy in Docker Desktop:
Settings → Resources → Proxies → Enter your company's HTTP/HTTPS Proxy address (ask IT for this)

<!-- @img: docker-desktop-proxy-settings | Docker Desktop proxy configuration screen -->

> 💡 **Pro tip**: Before installing Docker on a company machine, ask IT three questions: (1) Is Docker Desktop allowed? (2) Do I need a proxy? (3) Is port 5678 accessible locally? Getting authorized first saves you from a frustrating cycle of security blocks.

---

### Pitfall 4: WSL2 Quietly Eating Your C Drive

**Symptom**: A few weeks after installing Docker, your C drive is nearly full. Deleting images in Docker doesn't free up any space.

**Cause**: WSL2 stores its data in a virtual disk file called `ext4.vhdx`. This file **only grows — it never shrinks automatically** — even when you delete files inside Linux.

**Fix (recommended once a month)**:

1. Fully quit Docker Desktop, then run in PowerShell:

```powershell
wsl --shutdown
```

2. Open Windows search, type `diskpart`, and **run as Administrator**

3. In the diskpart window, run these commands in order (replace `YourUsername` with your actual Windows account name):

```
select vdisk file="C:\Users\YourUsername\AppData\Local\Docker\wsl\data\ext4.vhdx"
attach vdisk readonly
compact vdisk
detach vdisk
exit
```

<!-- @img: diskpart-compact-vhdx | diskpart compressing WSL2 virtual disk -->

> Compression time depends on file size — it may take a few minutes.

---

### Pitfall 5: Port Conflict (Easiest Fix)

**Symptom**: Running `docker run` gives you:

```
Bind for 0.0.0.0:5678 failed: port is already allocated
```

**Cause**: You already have an n8n container running (possibly stopped but not removed), or another program is using port 5678.

**Fix**:

```powershell
# Check all containers (including stopped ones)
docker ps -a

# If you see an old n8n container, remove it
docker rm -f n8n

# Check if another program is using port 5678
netstat -ano | findstr "5678"
```

<!-- @img: powershell-docker-ps-port-check | PowerShell checking containers and port usage -->

---

## 💡 Daily Habits That Prevent Problems

### Habit 1: Shut Down Gracefully

Before restarting or shutting down Windows, **right-click** the Docker Desktop icon in the system tray and select **Quit Docker Desktop**.

Force-shutting Windows while Docker is running can corrupt the WSL2 filesystem — and you'll spend the next morning fixing it.

### Habit 2: Read the Logs

When n8n's web UI won't load, don't immediately reinstall. Check the logs first:

```powershell
docker logs n8n
```

Logs usually tell you exactly what's wrong — "permission denied on folder" or "port already in use" — in plain language.

### Habit 3: Volume Is Sacred

**Containers are disposable. Your Volume is not.**

As long as `-v "C:\n8n_data:/home/node/.n8n"` is correct in your run command, your workflows and credentials will survive any Docker update, container deletion, or system restart.

---

## 🗺️ Quick Command Reference

```powershell
# Start n8n (D drive, recommended)
docker run -d --name n8n -p 5678:5678 -v "D:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# Start n8n (C drive)
docker run -d --name n8n -p 5678:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View n8n logs
docker logs n8n

# Stop n8n
docker stop n8n

# Remove n8n container (your data stays safe in the Volume)
docker rm n8n

# Force restart WSL2
wsl --shutdown
```

---

## 🔗 Further Reading

- **Mac makes this much easier** → [Docker + n8n on Mac: Complete Setup Guide](/articles/docker-n8n-mac)
- **Why does Windows need all this Linux plumbing?** → [Why We Don't Recommend Running OpenClaw Natively on Windows](/articles/why-not-windows-openclaw)
- **Want to go deeper on WSL2 management?** → [WSL Complete Guide](/articles/windows-wsl-guide)
- **Want to run an AI Agent on Windows?** → [Windows: Install OpenClaw from Scratch](/articles/install-openclaw-windows)
- **Want a free local LLM?** → [Ollama + OpenClaw Quick Start | Windows](/articles/ollama-openclaw-windows)
