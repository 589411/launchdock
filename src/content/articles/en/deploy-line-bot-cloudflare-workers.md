---
title: "Run Your LINE Bot Backend on Cloudflare Workers: Deploy the Worker + Set Up the Official Account Webhook"
description: "Deploy a Cloudflare Worker with one Claude Code command, then enable the Messaging API and Webhook in the LINE Official Account console — turning your LINE account into a 24/7 AI bot."
contentType: "tutorial"
scene: "integration"
difficulty: "intermediate"
createdAt: "2026-06-18"
verifiedAt: "2026-06-18"
archived: false
order: 2
prerequisites: ["telegram-integration"]
estimatedMinutes: 20
tags: ["LINE", "Cloudflare", "Webhook", "Deploy", "Integration"]
stuckOptions:
  "Why Cloudflare Workers": ["How is it different from running my own server?", "Is the free tier enough?", "Do I need to know how to code?"]
  "Deploying the Worker": ["What is wrangler?", "Where do I find the URL after deploy?", "What if deploy fails?"]
  "Enabling Messaging API": ["Where do I copy the Channel secret?", "Can't find the Messaging API tab", "What's the difference between Channel ID and secret?"]
  "Setting up the Webhook": ["Which part goes in the Webhook URL?", "Webhook is on but the Bot doesn't respond", "Verification keeps failing"]
  "Troubleshooting": ["Bot replies twice to one message", "Messages are heavily delayed", "Do I need to redeploy after editing code?"]
---

## Why Run Your LINE Bot Backend on Cloudflare Workers?

To make a LINE Official Account "reply on its own," you need a backend that is **online 24/7 and processes messages the instant they arrive**. The traditional approach is renting a cloud server — but for individuals or small projects that's expensive and a hassle to maintain.

**Cloudflare Workers makes this simple:**

| Comparison | Cloudflare Workers | Self-hosted server |
|---|---|---|
| Startup speed | Global edge nodes, millisecond cold starts | Pick a data center yourself |
| Cost | 100k requests/day free | Monthly rent at minimum |
| Maintenance | No OS, no updates to manage | You manage the OS and security |
| Deploy | One `wrangler deploy` | SSH and a pile of config |
| Public URL | HTTPS URL auto-assigned on deploy | Set up your own domain & cert |

In short: you only write the message-handling code; Cloudflare handles where it runs, whether it stays up, and the URL. That public HTTPS URL is exactly the **Webhook URL** LINE uses to push messages to you.

> 💡 New to the Bot Webhook concept? Start with the [Telegram Integration Complete Guide](/en/articles/telegram-integration) — it walks you through the same flow with the simpler BotFather first.

---

## Prerequisites

Before you start you'll need:

1. A **LINE Official Account** (create one free at [LINE Official Account Manager](https://manager.line.biz))
2. A **Cloudflare account** (free plan is fine)
3. **Claude Code** and **wrangler** (Cloudflare's CLI deploy tool) installed locally
4. A Worker script already written (receives LINE messages, calls the AI, returns the result)

The flow has two halves: **deploy the backend and get its URL**, then **go back to the LINE console to paste that URL in and turn on the Webhook**.

---

## Step 1: Deploy the Cloudflare Worker with Claude Code

Open Claude Code in your project directory and have it handle the Cloudflare setup and deploy. A complete deploy usually covers:

1. `wrangler login`: log into your Cloudflare account
2. Set up KV / R2 storage (if your Bot needs to remember conversations)
3. `wrangler secret put`: store secrets like the LINE Channel secret encrypted (**never hardcode them**)
4. `wrangler deploy`: push it live — when done it returns a **Webhook URL**

![Deploying a Cloudflare Worker with Claude Code in the project directory, setting up wrangler and the LINE webhook](/images/articles/deploy-line-bot-cloudflare-workers/claude-code-deploy-worker.png)

After a successful deploy, the terminal prints a URL like `https://your-worker.xxx.workers.dev`. **Write it down** — you'll paste it into the LINE console shortly.

> ⚠️ Secrets like the Channel secret and access token should always be stored with `wrangler secret put` — never commit them to Git.

---

## Step 2: Open the LINE Official Account Console

Go to [LINE Official Account Manager](https://manager.line.biz), log in, pick your official account, and land on the home page. Click "Settings" in the top right.

![LINE Official Account Manager home page, with the Settings entry in the top right](/images/articles/deploy-line-bot-cloudflare-workers/line-oa-home.png)

---

## Step 3: Enable the Messaging API and Grab the Channel Info

In the left menu of the settings page, find **Messaging API**. Three key pieces of info live here:

- **Channel ID**: the channel identifier
- **Channel secret**: the key used to verify request origin (the one you `wrangler secret put` in the previous step)
- **Webhook URL**: fill in the Worker URL from Step 1

![LINE Messaging API settings page showing Channel ID, Channel secret, and Webhook URL fields](/images/articles/deploy-line-bot-cloudflare-workers/line-messaging-api.png)

Fill the **Webhook URL** field with your Worker URL and click Save.

> 🚨 **Common mistake: the secret doesn't match**
> If the Bot receives messages but keeps returning 401 / verification failures, the Channel secret stored in your backend usually doesn't match the one shown here. Go back to Step 1 and re-store it with `wrangler secret put`.

---

## Step 4: Turn On Webhook in "Response Settings"

Filling in the URL isn't enough — you need to tell LINE to hand messages to the Webhook. Go to "Settings → Response settings." There are a few toggles here; set them like the screenshot below:

- **Chat**: off (no live human chat)
- **Webhook**: **on** (this is the key — only then does LINE POST message events to your Worker)
- Auto-reply messages: leave it on for now; the next step only disables the default canned message

![Response settings page with Chat off and the Webhook toggle enabled](/images/articles/deploy-line-bot-cloudflare-workers/line-oa-webhook-toggle.png)

> 💡 **(Optional) Let the Bot be invited into groups**: under "Settings → Features," you can enable "Accept invitations to groups and multi-person chats" so you can later add the Bot to group chats.
>
> ![Features page, allowing the account to accept group invitations](/images/articles/deploy-line-bot-cloudflare-workers/line-oa-group-invite.png)

---

## Step 5: Disable the Default Auto-Reply Message

By default LINE has a canned auto-reply that competes with your Bot, so users get two messages. Turn it off.

Under "Auto-reply messages," switch off the default one.

![Auto-reply messages list, with the default auto-reply toggle switched off](/images/articles/deploy-line-bot-cloudflare-workers/line-disable-auto-reply.png)

---

## Verify It Works

1. Add your official account as a friend on your phone
2. Send any message
3. Within seconds you get a reply processed and returned by your Worker — success!

If nothing happens, use `wrangler tail` to watch the Worker logs live and see whether messages are arriving and where it's failing.

---

## Troubleshooting

### 🚨 Bot replies twice to one message

The default auto-reply isn't off (see Step 5), or the response mode is still on "Chat" instead of Webhook (see Step 4).

### 🚨 Edited the code, but nothing changed on LINE

Cloudflare Workers don't auto-update — run `wrangler deploy` again after every change. The Webhook URL stays the same, so no need to touch the LINE console.

### 🚨 Receiving no messages at all

Check in order: is the Webhook toggle on (Step 4) → is the Webhook URL filled in correctly and saved (Step 3) → use `wrangler tail` to see whether requests reach the Worker.

---

## Next Steps

- Want the Bot to remember conversation context? Learn about [how AI Agents handle memory](/en/articles/ai-agent-memory-guide)
- Want to connect more services (calendar, databases, external APIs)? See how [the MCP protocol](/en/articles/mcp-protocol) wires tools into the AI
