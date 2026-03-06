---
title: "Deploy OpenClaw to the Cloud: One-Click Zeabur Deployment + KimiClaw Quick Start"
description: "Don't want to deal with local setup? Deploy OpenClaw to Zeabur with one click, or try KimiClaw for an instant cloud AI Agent experience."
contentType: "tutorial"
scene: "install"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 3
prerequisites: ["ai-api-key-guide"]
estimatedMinutes: 12
tags: ["OpenClaw", "Zeabur", "KimiClaw", "部署", "Docker"]
stuckOptions:
  "Zeabur one-click deployment": ["Don't know where to start after signing up for Zeabur", "Deployment failed with no error message", "Is the free tier enough?"]
  "KimiClaw": ["Can't find the OpenClaw entry after signing up", "What's different from the local version?"]
  "Docker self-hosted": ["docker-compose failed to run", "Don't know how to fill in environment variables", "Container started but web page won't open"]
  "How to choose": ["Not sure which option to use", "Can I switch to a different option later?"]
---

## Why Deploy to the Cloud?

While installing OpenClaw locally gives you maximum flexibility, you might run into these situations:

- 💻 **Hardware limitations**: OpenClaw plus models need a certain amount of computing resources
- 🌐 **Need 24/7 uptime**: Your Agent needs to be available around the clock
- 🚀 **Don't want to deal with setup**: Python versions and dependencies are giving you headaches
- 👥 **Team sharing**: Multiple people need to use the same OpenClaw instance

This article will walk you through two cloud options, from simplest to most flexible.

---

## Option 1: Zeabur One-Click Deployment (Recommended for Beginners)

### What is Zeabur?

[Zeabur](https://zeabur.com) is a cloud deployment platform built by a Taiwanese team, similar to Vercel / Railway, but more friendly for Chinese-speaking users. The biggest advantage is **virtually zero configuration**.

### Deployment Steps

#### Step 1: Sign Up for a Zeabur Account

1. Go to [zeabur.com](https://zeabur.com)
2. Sign in with your GitHub account (recommended) or register with Email
3. The free plan is enough for personal testing

<!-- 📸 Screenshot suggestion: Zeabur signup page -->
<!-- ![Zeabur Signup Page](/images/articles/deploy-cloud/zeabur-signup.png) -->

#### Step 2: Create a New Project

1. Click "Create Project"
2. Select the region closest to you (recommended: `Asia - Taiwan`)
3. Name your project, e.g., `my-openclaw`

#### Step 3: Deploy OpenClaw

You have two options:

**Option A: Deploy from Marketplace (Fastest)**

1. On the project page, click "Add Service"
2. Search for `OpenClaw`
3. Click "Deploy"
4. Wait about 2-3 minutes for deployment to complete

**Option B: Deploy from GitHub Repo (More Flexible)**

1. First, fork the OpenClaw GitHub repo to your account
2. In Zeabur, click "Add Service" → "Git"
3. Select your forked repo
4. Zeabur will automatically detect the Dockerfile and deploy

#### Step 4: Set Up Environment Variables

After deployment, you need to configure your API Key:

1. Click on your service → "Variables"
2. Add the following environment variables:

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
# Or the API Key for whichever LLM you're using
GOOGLE_API_KEY=your-google-api-key
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Quick reminder**: Not sure how to get an API Key? Check out the [AI Model API Key Guide](/en/articles/ai-api-key-guide) — Google AI Studio offers a free tier, perfect for beginners.

#### Step 5: Get Your Access URL

1. Click "Networking" → "Generate Domain"
2. You'll get a URL like `my-openclaw-xxxx.zeabur.app`
3. Open this URL — your OpenClaw is now live!

### Zeabur Pricing Reference

| Plan | Cost | Best for |
|---|---|---|
| Developer | Free | Testing, learning |
| Team | ~$5/month | Personal production use |
| Pro | Pay-as-you-go | Team use |

> ⚠️ The free plan has usage time limits. For production use, upgrading to the Team plan is recommended.

---

## Option 2: KimiClaw Cloud Experience

### What is KimiClaw?

KimiClaw is a cloud-based version built on the OpenClaw architecture, powered by Kimi AI (Moonshot AI). Think of it as **"OpenClaw without installation."**

### How Does It Compare to Self-Hosted OpenClaw?

| Comparison | Self-Hosted OpenClaw | KimiClaw |
|---|---|---|
| Installation difficulty | Requires environment setup | Zero install, works in browser |
| Customization | Full control | Limited |
| Model selection | Any LLM | Primarily Kimi |
| Cost | API usage fees | Per KimiClaw plan |
| Offline use | ✅ | ❌ |
| Custom Skills | Fully customizable | Basic Skills supported |

### Is It Right for You?

**Choose KimiClaw if you:**
- Want to quickly experience OpenClaw's concepts
- Don't want to deal with any technical setup
- Primarily work in Chinese-language scenarios

**Choose self-hosted OpenClaw if you:**
- Need to connect multiple LLMs (GPT-4, Claude, etc.)
- Need fully customized Skills
- Have data security concerns

### KimiClaw Quick Start

1. Go to the KimiClaw website and register an account
2. Enter the workspace — you'll see pre-built Agent templates
3. Select a template (e.g., "Information Organizer")
4. Type commands directly in the chat box to experience the Agent in action

<!-- 📸 Screenshot suggestion: KimiClaw workspace interface -->
<!-- ![KimiClaw Workspace](/images/articles/deploy-cloud/kimiclaw-dashboard.png) -->

---

## Option 3: Docker Self-Hosted (Advanced)

If you have your own server or want maximum control:

### Prerequisites

- A VPS (Linode, DigitalOcean, AWS EC2, etc.)
- Docker and Docker Compose installed
- Basic Linux command line skills

### Deployment Steps

```bash
# 1. Pull the OpenClaw Docker image
docker pull openclaw/openclaw:latest

# 2. Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  openclaw:
    image: openclaw/openclaw:latest
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
EOF

# 3. Create the .env file
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "GOOGLE_API_KEY=your-google-key" >> .env

# 4. Start
docker-compose up -d

# 5. Check status
docker-compose ps
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Security reminder**: For production deployment, make sure to set up HTTPS (you can use Nginx + Let's Encrypt) and firewall rules.

---

## How to Choose Between the Three Options?

```
Do you want a zero-install experience?
├── Yes → KimiClaw (fastest to get started)
└── No → Do you have your own server?
    ├── No → Zeabur (recommended, hassle-free)
    └── Yes → Docker self-hosted (maximum flexibility)
```

---

## Next Steps

After deployment, you can start learning OpenClaw's core features:

- ⚙️ [Set up model switching and fallback](/en/articles/openclaw-model-config)
- 🧩 [Skills: Teach AI repeatable workflows](/en/articles/openclaw-skill)
- 🤖 [Agent: Your AI alter ego](/en/articles/openclaw-agent)
- 🧠 [Soul: Give your Agent memory and personality](/en/articles/openclaw-soul)
- 📱 [Connect Telegram for on-the-go access](/en/articles/telegram-integration)

Have questions? Head over to the [Home Discussion section](/#discussion) to chat!
