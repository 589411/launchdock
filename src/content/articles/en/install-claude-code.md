---
title: "How to Install Claude Code on Windows and Mac: One Command, Login, First Launch"
description: "Claude Code is an AI coding assistant that runs in your terminal. This walkthrough uses the official native installer on both Mac and Windows: open a terminal, paste one command, check the version, log in, and launch it for the first time, plus the most common snags (command not found, the && error in PowerShell, whether you need Git for Windows)."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-10-22"
verifiedAt: "2026-10-22"
archived: false
order: 7
prerequisites: ["cli-guide"]
estimatedMinutes: 10
tags: ["Anthropic", "安裝", "macOS", "Windows", "WSL"]
stuckOptions:
  "Opening a terminal": ["I don't know where the terminal is", "PowerShell vs CMD?", "How do I open Terminal on Mac?"]
  "Pasting the install command": ["Nothing happens after I paste", "The token '&&' is not a valid statement separator", "'irm' is not recognized"]
  "Checking the install": ["claude: command not found", "claude is not recognized as a cmdlet", "It only works in a new window"]
  "Logging in": ["Can I use it without a paid plan?", "The browser didn't open", "Terminal does nothing after login"]
---

> **In one line**: Claude Code no longer needs Node.js or npm. The recommended native install is **one pasted command**: on Mac, `curl -fsSL https://claude.ai/install.sh | bash`; on Windows PowerShell, `irm https://claude.ai/install.ps1 | iex`. Then **open a new terminal window**, run `claude --version` to confirm, and run `claude` to log in through the browser.

**Keywords**: install Claude Code, Claude Code Windows, Claude Code Mac, claude command not found, install.sh, install.ps1, Git for Windows, claude --version, claude doctor

---

## What is Claude Code? Know it before you install it

Claude on the web is a chat in your browser. **Claude Code puts the same Claude inside your terminal**: it can read files in your folder, edit them, and run commands to take a task from start to finish.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Web Claude is like photographing a document and asking a consultant over the phone. Claude Code is the consultant **sitting at your computer**, seeing your folder and able to make the changes. More power means a bit more care on first use. We'll flag that in the first-launch step.

New to terminals? Spend 10 minutes on [What is a CLI?](/en/articles/cli-guide/) first. Optional: every step here says which window to open and what to paste.

> 💡 **Rather avoid the terminal?** Anthropic also offers a **Claude desktop app** (Mac and Windows) that can run Claude Code with a graphical interface. This article covers the terminal version because it is the most universal.

---

## Before you start: three checks

| Item | Requirement |
|------|-------------|
| **OS** | macOS 13+; Windows 10 (1809)+ or Windows Server 2019+; Ubuntu 20.04+/Debian 10+ |
| **Hardware** | 4 GB+ RAM, x64 or ARM64 processor (any recent Mac or Windows PC qualifies) |
| **Account** | A **paid** Claude **Pro, Max, Team, or Enterprise** plan, or an Anthropic Console (API) account. **The free claude.ai plan does not include Claude Code** |

You also need an internet connection and to be in an [Anthropic supported country/region](https://www.anthropic.com/supported-countries).

> ⚠️ The account is the step people skip, then get blocked after installing. If you don't have a plan yet, see [How to set up a Claude Team plan](/en/articles/claude-team-setup/) or check claude.ai. **Plan prices change, so check the official site.** We don't list prices here.

---

## Which install method?

| Your situation | Recommendation |
|----------------|----------------|
| Most people (Mac/Windows/Linux) | ✅ **Native install** (one command, auto-updates), the main path here |
| Mac user who likes Homebrew | `brew install --cask claude-code` (no auto-update) |
| Windows user who likes WinGet | `winget install Anthropic.ClaudeCode` (no auto-update) |
| Need a Linux toolchain or sandboxing | Install inside WSL 2 (see the end) |

---

## Mac install (about 3 minutes)

### Step 1: Open Terminal

Press `⌘ + Space`, type **Terminal**, press Enter.

### Step 2: Paste the install command

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**It shows no download progress**, so it can look stuck. That's normal. Wait until you get your prompt back.

### Step 3: Open a new window and check the version

**Close this terminal and open a new one** so the PATH is reloaded, then run:

```bash
claude --version
```

A version like `2.1.211 (Claude Code)` means it worked (your number will differ, since versions update constantly).

### Prefer Homebrew?

```bash
brew install --cask claude-code
```

There are two casks: `claude-code` (stable, typically about a week behind and skipping releases with major regressions) and `claude-code@latest` (new versions immediately). Homebrew installs **do not auto-update**; run `brew upgrade claude-code` yourself.

---

## Windows install (about 5 minutes)

Windows has two similar-looking windows: **PowerShell** and **CMD**. Their commands differ, and pasting the wrong one errors out. How to tell:

- Prompt looks like `PS C:\Users\YourName>` → **PowerShell**
- Prompt looks like `C:\Users\YourName>` (no `PS`) → **CMD**

**We recommend PowerShell.** You do not need to run as Administrator.

### Step 1: Open PowerShell

Press the Windows key, type **PowerShell**, press Enter.

### Step 2: Paste the install command

```powershell
irm https://claude.ai/install.ps1 | iex
```

Again, **no progress is shown**. Wait for the `PS C:\...>` prompt to return.

> In CMD, paste this instead:
>
> ```batch
> curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
> ```

### Step 3: Open a new window and check the version

Close PowerShell, **open a new window**, and run:

```powershell
claude --version
```

Seeing `2.1.xxx (Claude Code)` means success.

### Do you need Git for Windows?

**Optional, not required.**

- **Without it**: Claude Code uses PowerShell as its command-running tool and works fine.
- **With it**: Claude Code can use Git Bash, which is better supported. If you already use Git/GitHub (see [What is Git?](/en/articles/git-guide/)), installing it costs nothing.

If Git is installed but Claude Code can't find Git Bash, set the path in `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

### Prefer WinGet?

```powershell
winget install Anthropic.ClaudeCode
```

WinGet installs **do not auto-update**; run `winget upgrade Anthropic.ClaudeCode` periodically.

---

## Log in (same on Mac and Windows)

### Step 1: Go to your project folder and run `claude`

Use `cd` to enter the folder you want Claude to work in (e.g. `cd ~/Documents/my-project`; on Windows `cd C:\Users\YourName\Documents\my-project`), then:

```bash
claude
```

### Step 2: Follow the browser prompt

On first launch you choose a login method. It usually opens your browser: sign in to claude.ai with the **account that has the subscription** and approve. Back in the terminal you'll see Claude Code's interactive screen.

> If the browser doesn't open, the terminal usually prints a URL. Copy it into your browser manually.

### Step 3: Claude asks whether you trust this folder

This is a safety mechanism: since Claude Code can read, write, and run commands, it asks before working in a new folder.

**Only trust your own project folders.** Don't trust Downloads, your Desktop, or a project from a stranger.

---

## Health check: `claude doctor`

```bash
claude doctor
```

It prints install health, settings errors, and auto-update status with suggested fixes. It is **read-only** and doesn't start a session.

---

## 🚨 Common errors

### 🚨 `claude: command not found` / "claude is not recognized"

**Cause**: the install worked, but your terminal hasn't picked up the new PATH.
**Fix**:
1. **Close all terminals and open a new one**, then retry `claude --version`. This fixes most cases.
2. Still failing means the install directory isn't on your PATH. Follow the official [Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install).

### 🚨 `The token '&&' is not a valid statement separator` (Windows)

**Cause**: you pasted the **CMD** command into **PowerShell**.
**Fix**: in PowerShell use `irm https://claude.ai/install.ps1 | iex`.

### 🚨 `'irm' is not recognized as an internal or external command` (Windows)

**Cause**: the reverse, a PowerShell command pasted into **CMD**.
**Fix**: use the CMD `curl ... install.cmd` line, or open PowerShell.

### 🚨 `syntax error near unexpected token '<'` or `403` (Mac)

**Cause**: you downloaded an error page instead of the script. Common behind corporate networks, VPNs, or proxies, or in an unsupported region.
**Fix**: try another network (e.g. phone hotspot); if it still fails, match your error in the official troubleshooting page.

### 🚨 Installed, but login says I lack access

**Cause**: the free claude.ai plan doesn't include Claude Code.
**Fix**: log in with a Pro/Max/Team/Enterprise account, or a Console (API) account. If you were invited to a team, see [How to join a Claude Team](/en/articles/join-claude-team/) for switching accounts.

### 🚨 You previously installed with `npm install -g @anthropic-ai/claude-code`

npm is now a **secondary option** (needs Node.js 22+). If it works, leave it. To switch to the native installer, first `npm uninstall -g @anthropic-ai/claude-code`, then run the one-line command above, so you don't end up with two `claude` installs.

---

## Updating and uninstalling

- **Update**: native installs **auto-update in the background**; the new version applies next launch. Run `claude update` to update right away. Homebrew/WinGet need manual updates.
- **Uninstall (native)**:
  - Mac: `rm -f ~/.local/bin/claude` and `rm -rf ~/.local/share/claude`
  - Windows (PowerShell): `Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force` and `Remove-Item -Path "$env:USERPROFILE\.local\share\claude" -Recurse -Force`
- ⚠️ Settings and history live in `~/.claude`; the commands above **don't touch it**. Delete it separately only if you want everything gone. It can't be recovered.

---

## Advanced: install in WSL 2 on Windows

If your project uses a Linux toolchain, or you want Claude Code's **sandboxing** (not supported on native Windows, supported on WSL 2), install inside WSL. Set up WSL via [What is WSL?](/en/articles/windows-wsl-guide/), then paste the Mac/Linux `curl ... | bash` line **inside the WSL terminal**, and run `claude` from there, not from PowerShell.

---

## Next step: one thing to do tomorrow

1. Install, and confirm `claude --version` shows a version.
2. In a **test folder you're fine with it touching** (copy a backup first), run `claude` and ask: "List the files in this folder and describe each in one sentence."
3. Keep it **read-only** at first. Get used to how it answers and asks permission before handing it edits.

For team use, continue with [How to set up a Claude Team plan](/en/articles/claude-team-setup/).
