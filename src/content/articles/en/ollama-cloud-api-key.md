---
title: "Get an Ollama Cloud API Key: Open Models as a Backup Provider"
description: "Ollama isn't only for running models locally — it also offers cloud models and API keys. This shows you how to sign up for Ollama and create a cloud API key under Settings, so you can use Ollama as another LLM provider in Make, n8n, or code — a fallback for when your primary provider is down or rate-limited."
contentType: "tutorial"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 2
prerequisites: []
estimatedMinutes: 6
tags: ["Ollama", "API", "Setup", "LLM"]
stuckOptions:
  "Sign up and login": ["Do I have to use Google?", "Does it need phone verification?", "Isn't Ollama local — why log in?"]
  "Creating an API key": ["Where is Keys?", "Is the key shown only once?", "Device Keys vs. API Keys?"]
  "Where to use it": ["Can I connect it to Make?", "How is it different from OpenRouter?", "Do cloud models cost money?"]
---

> **In one line**: Go to [ollama.com](https://ollama.com), sign in with Google (phone verification possible), go to **Settings → Keys**, click **Add API Key**, name it, generate, and store this cloud API key safely — then you can use Ollama as another LLM provider in automation tools or code.

**Keywords**: Ollama, cloud API key, open models, backup provider, Settings, Keys, Device Keys

---

## Wait, isn't Ollama local?

Right — many people know Ollama as the tool for "running open models on your own computer" (see "Run OpenClaw with Ollama on Mac"). But Ollama now also has a **cloud service**: you can use its cloud models and get a **cloud API key** so external tools can call it over the network.

Why this key? Because in an automation flow, **another LLM provider is another life.** When your primary (say, OpenRouter) gets rate-limited or goes down someday, you can have the flow fall back to Ollama automatically instead of stalling entirely.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: An LLM provider is like a phone's dual SIM — you use one normally, and if that carrier's tower goes down, it auto-switches to the other and still connects. Automation's worst nightmare is "one provider down, everything dead," so keeping a second key from a different provider is cheap insurance.

---

## Step 1: Open the Ollama site

Open [ollama.com](https://ollama.com). The homepage highlights "one-line install, build with open models," with **Sign in** and **Download** top-right. We want to log in for a key — click **Sign in**.

![Ollama homepage](/images/articles/ollama-cloud-api-key/ollama-homepage.png)

---

## Step 2: Log in

The login page offers **Email, Continue with Google, Continue with GitHub**. **Google** is fastest.

![Ollama login page (Email / Google / GitHub)](/images/articles/ollama-cloud-api-key/ollama-signin.png)

### 🚨 It wants phone verification?

On first sign-up, Ollama may ask for a one-time **phone verification** (enter number, get an SMS code). That's a normal anti-bot step — verify once. For Taiwan numbers, choose **+886**.

---

## Step 3: Go to Settings, find Keys

After logging in, go to **Settings**. You'll see a Quickstart page with a left nav: **Usage / Keys / Billing / Profile**. The **Cloud API access** block at the bottom also has a **Create API key** entry.

![Ollama Settings / Quickstart page](/images/articles/ollama-cloud-api-key/ollama-settings.png)

Click the **Keys** tab on the left. There are two things here — don't confuse them:

- **API keys**: keys for external tools/programs to call cloud models (**this is what we're creating**).
- **Device Keys**: automatically added when you install the Ollama app on Mac/Windows/Linux or run `ollama signin`.

![Ollama Settings → Keys tab](/images/articles/ollama-cloud-api-key/ollama-api-keys.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: An **API key** is a pass for "other programs"; a **Device key** is for "this computer of yours." To let Make call Ollama's cloud, you need the **API key**.

---

## Step 4: Create an API key

In the **API keys** section, click **Add API Key**, and a form appears:

1. Give the key a recognizable label, e.g., `make-mail-tags` — the name is just for you to recognize which project it's for.
2. Click **Generate API Key**.

![Creating an API key, entering a name](/images/articles/ollama-cloud-api-key/ollama-create-key.png)

---

## Step 5: Copy the key (shown only once!)

After generating, the screen shows the full key value and warns **"This value can be viewed only once."**

So **copy it right then and store it somewhere safe** (a password manager or `.env`). Close it and you can never see it again.

![Ollama API key generated (shown only once)](/images/articles/ollama-cloud-api-key/ollama-key-created.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: "Shown only once" again — this is the rule for nearly every API service. An API key is a keycard, and the provider won't keep a plaintext copy for you (that would be dangerous). Didn't save it? Don't hunt for it — delete and reissue a new one.

### 🚨 The key name (label) is not the key itself

Note: the name you chose (like `make-mail-tags`) is **not** the key and not a secret — it's just a label to help you recognize "what this one is for" later. The real secret is the long string that appears only after `Generate`, shown only once.

---

## Done! How do you use this key?

You now have an Ollama cloud API key. You can:

- Put it into **Make / n8n** as another LLM provider (e.g., set Ollama as a **fallback** for OpenRouter in a Gmail auto-classification flow).
- Call Ollama's cloud models from your own code.

Paired with OpenRouter (see "OpenRouter Sign-Up"), you'll have keys from two different providers backing each other up — a big boost to automation reliability.

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **One last nudge from the Duck**: You should know the API-key routine well by now — sign up, go to Settings, Add Key, **copy it right away since it's shown only once**. Whether it's OpenRouter, Ollama, or anyone else, the pattern's the same. Build the reflex and you'll never panic connecting an AI service.
