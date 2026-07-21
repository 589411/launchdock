---
title: "Connect ChatGPT to GitHub: How to Set It Up, and What the Free Tier Actually Did"
description: "Find GitHub in ChatGPT's Plugins page, install it, and finish the authorization — three minutes end to end. But what can it do once connected? Tested 2026-07-21 on the free tier: connecting and reading works; getting it to actually create a repo and push files did not. Here are the steps and the honest results."
contentType: "tutorial"
scene: "integration"
difficulty: "beginner"
createdAt: "2026-07-21"
verifiedAt: "2026-07-21"
archived: false
order: 9
prerequisites: ["github-account-signup"]
estimatedMinutes: 8
tags: ["ChatGPT", "GitHub", "Integration", "Setup"]
stuckOptions:
  "Can't find the Plugins page": ["No 'Plugins' in my sidebar", "How is it different from Codex?", "Is it on mobile?"]
  "Install and authorization": ["Install button does nothing", "What do the three notices in the popup mean?", "Why is it asking me to verify with Google?"]
  "What it can do once connected": ["Can it create a repo for me?", "What are those four Skills?", "Do I need to pay for it to be useful?"]
  "Deciding whether to use it": ["How does it compare to Grok's GitHub connector?", "How is it different from Codex?", "I just want to get files onto GitHub"]
---

> **In one line**: On [chatgpt.com/plugins](https://chatgpt.com/plugins), click **Plugins** in the sidebar → find **GitHub** under Featured → open it and click **Install** → confirm in the "Connect to GitHub" popup. Setup is quick, but **on the free tier the connector did not actually carry out GitHub tasks in testing** — whether this is useful to you depends on your plan and what you want done.

**Keywords**: ChatGPT, GitHub, plugins, connector, authorization, Skills, Codex, free tier

---

## The conclusion first, to save you three minutes

Most people connect GitHub hoping for one thing: **"I ask the AI to build something, and it puts it on GitHub for me."**

Here's what a test on 2026-07-21 found:

- ✅ **The free ChatGPT tier can install and authorize the connector.** The flow is smooth and takes under three minutes.
- ❌ **But asking the free-tier model to actually execute GitHub tasks — create a repo, push the files — did not complete successfully.** Reliable use requires a paid plan.
- 📌 ChatGPT's own description of the connector tells you the intent: **"Triage PRs, issues, CI, and publish flows."** **That's built for people who already have a repo and need to keep up with it — not for people who want one conjured from nothing.**

If your goal is "one sentence, one new repo," read [Connect Grok to GitHub](/en/articles/grok-connect-github/) instead — tested the same day, and the free tier completed the whole run. This article sets up the ChatGPT route and explains what it's genuinely good at.

> <img src="/images/dock_head_s.png" alt="Blue Duck" width="24" style="vertical-align: middle;"> **Duck's note**: Both products "connect to GitHub," but they're solving different problems. The Grok route is like hiring an assistant who goes and puts the boxes on the shelf when you ask. The ChatGPT route is more like a project coordinator whose strength is watching the PRs already in flight and telling you why CI went red. **Decide which one you need before you connect anything.**

---

## Before you start

- A **GitHub account** ([Sign up for GitHub](/en/articles/github-account-signup/) if you don't have one)
- A **ChatGPT account** (the free tier is enough for the setup steps in this article)

---

## Step 1: Find "Plugins" in the sidebar

Log in to [chatgpt.com](https://chatgpt.com) and look at the left sidebar. Below New chat, Library, and Projects there's **Plugins** (some interfaces label it Apps or Connectors). Click it.

![The Plugins entry in ChatGPT's left sidebar](/images/articles/chatgpt-connect-github/chatgpt-plugins-menu.jpg)

Inside you'll see an **Installed** section and category lists: Featured, Productivity, Creativity, and so on.

---

## Step 2: Find GitHub under Featured

**GitHub** sits first in the right-hand column of **Featured**, subtitled *Triage PRs, issues, CI, and publish flows*.

![The Featured section of ChatGPT's Plugins page with GitHub at the top of the right column](/images/articles/chatgpt-connect-github/chatgpt-plugins-github.jpg)

Click the card itself (not the `+` on the right) to open its detail page.

---

## Step 3: Read what the detail page is telling you

The page describes the connector's scope clearly, and it's worth pausing on:

- **Official description**: use GitHub to inspect repositories, review pull requests, address feedback, debug failing Actions checks, and prepare code changes for review through a connector-first workflow with targeted CLI fallbacks.
- **Apps**: GitHub and GitHub Enterprise.
- **Four Skills**: **Review Follow-up**, **CI Debug**, **GitHub**, and **Publish Changes**.

![ChatGPT's GitHub connector detail page showing the apps and four Skills](/images/articles/chatgpt-connect-github/chatgpt-github-connector.jpg)

**Those four Skill names are the positioning statement**: every one of them assumes a project that's already running. None of them is called "Create Repository."

If you want it, click **Install** in the top right.

---

## Step 4: Complete the "Connect to GitHub" authorization

Installing opens the **Connect to GitHub** popup, with the developer listed as **OpenAI**. The three notices, in plain English:

| What the popup says | What it means |
|---|---|
| **Permissions are always respected** | ChatGPT only uses the permissions you explicitly grant, and you can disable or revoke them at any time |
| **Everything stays under your control** | Your data isn't used to train models; data from GitHub is used only to give you the answers you asked for |
| **Connectors can introduce risk** | The connector respects your permissions, but external sites may try to steal your data — a nod to prompt-injection style risks |

Below that, Google suggests enabling **multi-factor authentication (MFA)** on your Google or ChatGPT account. A connector opens a door to an external service, so **this suggestion is worth taking**.

![ChatGPT's "Connect to GitHub" authorization popup, developer listed as OpenAI](/images/articles/chatgpt-connect-github/chatgpt-github-authorize.jpg)

Click **Continue to GitHub** and finish authorizing on GitHub's side (it will ask which repositories to expose and may require email verification). You're returned to ChatGPT with the connector under Installed.

---

## 🚨 Common mistakes and judgment calls

### Expecting it to create a repo from scratch

This is the big expectation gap. The connector is designed for **triage and review**: read the repo, follow PRs, work out why CI is red, prepare changes for review. **"Create a new repo and push files to it" isn't in its advertised capabilities**, and none of the four Skills covers it.

If that's what you want: take [the Grok route](/en/articles/grok-connect-github/) (which the free tier completed in testing), or use **Codex** inside the ChatGPT ecosystem — a separate sidebar entry and a different coding-agent path, requiring the corresponding paid plan.

### Pushing through on a free-tier model

In testing, the free-tier model did not complete GitHub tasks. Installing the connector ≠ finishing the job — **whether it can actually act depends on your model and plan.** If you conclude you need it, it's a paid capability; decide accordingly.

### Granting access to every repo at once

GitHub's authorization page lets you pick all repos or specific ones. If work projects and client code live in the same account, **tick one test repo first**. To revoke: GitHub → Settings → Applications → Installed GitHub Apps.

---

## So which route should you take?

| What you want | Go with |
|---|---|
| One sentence → a website/tool published to GitHub | **Grok's connector** ([tested walkthrough](/en/articles/grok-connect-github/)) |
| Follow PR progress, debug failing CI, triage issues | **ChatGPT's GitHub connector** (this article) |
| Heavy coding work on an existing project | **Codex** or a dedicated coding agent, on a paid plan |
| Just publishing a static site you already built | No AI connector needed — see [GitHub Pages deployment](/en/articles/deploy-to-github-pages/) |

---

## What to do next

1. **Work out which row you're in** (the table above). Don't connect things because connecting is fun — every connector is another slice of exposed permission.
2. **If the goal is "get the AI to publish for me"**: try [Grok + GitHub](/en/articles/grok-connect-github/) today; the free tier runs a full experiment in about ten minutes.
3. **If you already have a live project**: connect ChatGPT, point it at a real PR, and ask "what does this PR change and what's risky about it." Let the answer decide whether it stays.
4. **Understand the shared machinery**: read [the MCP protocol](/en/articles/mcp-protocol/). Once that clicks, "connecting an AI to tools" stops being vendor-specific magic.
