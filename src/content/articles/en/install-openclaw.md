---
title: "Installation Guide: Choose Your Platform"
description: "OpenClaw installation entry page. Choose the installation tutorial for your operating system."
contentType: "guide"
scene: "install"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 1
pathStep: 4
series:
  name: "Getting Started"
  part: 4
prerequisites: ["ai-api-key-guide"]
estimatedMinutes: 3
tags: ["OpenClaw", "Installation", "Beginner"]
stuckOptions:
  "Choosing an installation method": ["I don't know which one to pick", "Can I install it on a tablet or phone?", "My computer is old, can it handle it?"]
---

## Choose Your Installation Method

> LaunchDock has prepared illustrated tutorials for all three platforms — pick your environment and get started.

Based on your environment, choose the best option to begin:

<div class="install-platform-cards">

<a href="/articles/install-openclaw-macos" class="install-card install-card--macos">
  <div class="install-card__icon">🍎</div>
  <div class="install-card__content">
    <h3>macOS</h3>
    <p>For macOS 13 Ventura and above</p>
    <ul>
      <li>Install via Homebrew</li>
      <li>Manage Python with pyenv</li>
      <li>Terminal operations</li>
    </ul>
  </div>
  <span class="install-card__arrow">→</span>
</a>

<a href="/articles/install-openclaw-windows" class="install-card install-card--windows">
  <div class="install-card__icon">🪟</div>
  <div class="install-card__content">
    <h3>Windows</h3>
    <p>For Windows 10 / 11</p>
    <ul>
      <li>Native CMD installation</li>
      <li>WSL 2 advanced option</li>
      <li>Build Tools setup</li>
    </ul>
  </div>
  <span class="install-card__arrow">→</span>
</a>

<a href="/articles/deploy-openclaw-cloud" class="install-card install-card--cloud">
  <div class="install-card__icon">☁️</div>
  <div class="install-card__content">
    <h3>Cloud Deployment</h3>
    <p>No local installation needed</p>
    <ul>
      <li>One-click deploy on Zeabur</li>
      <li>KimiClaw — zero config</li>
      <li>Docker container</li>
    </ul>
  </div>
  <span class="install-card__arrow">→</span>
</a>

</div>

---

## Not Sure Which One to Choose?

| Scenario | Recommendation |
|---|---|
| First time, just want to try it out | ☁️ **Cloud Deployment** (fastest) |
| Want a free experience without applying for an API Key | 🦙 **[Ollama Quick Start](/articles/ollama-openclaw)** (`ollama launch openclaw` — one command to launch) |
| Want long-term use and deeper learning | 🍎 **macOS** or 🪟 **Windows + WSL** local installation |
| Have Linux development experience | 🪟 **Windows WSL 2** or follow the macOS tutorial |
| Computer is struggling | ☁️ **Cloud Deployment** |

> 💡 **Windows users, heads up**: OpenClaw relies heavily on CLI tools, and CLI works best in a Linux environment. We strongly recommend Windows users install via [WSL (Windows Subsystem for Linux)](/articles/windows-wsl-guide). For details, see [Why Not Install on Native Windows?](/articles/why-not-windows-openclaw)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says**: Cloud deployment is like ordering takeout — no cooking required, food arrives fast. Local installation is like learning to cook — takes time, but you can make whatever you want anytime. Both are valid — it depends on how hungry you are right now.

---

## System Requirements

Regardless of platform, the minimum requirements are:

- **Python** 3.11 or above
- **Node.js** 18 or above
- **RAM** 8GB (16GB recommended)
- **Disk space** 5GB or more
- **Network** Stable internet connection (needed to call the AI API)
- **API Key** At least one: OpenAI / Google / Anthropic

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Don't have an API Key yet? Check out [AI Model API Key Guide](/articles/ai-api-key-guide) first — Google AI Studio has a free tier and is the best option for beginners.

---

## After Installation

All set? Continue learning:

- 📖 [Why You Need OpenClaw](/articles/why-openclaw)
- ⚙️ [Configure Models & API Keys](/articles/openclaw-model-config)
- 💰 [Understanding Token Billing](/articles/token-economics)
- 🧩 [Build Your First Skill](/articles/openclaw-skill)
- 🤖 [Create an Automated Agent](/articles/openclaw-agent)
- 👻 [Design AI's Personality: Soul](/articles/openclaw-soul)
