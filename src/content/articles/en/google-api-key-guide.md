---
title: "Google API Key Complete Guide: Essential for Connecting OpenClaw to Google Drive / Gmail"
description: "A step-by-step guide to applying for a Google Cloud API Key — solving the most common sticking point when connecting OpenClaw to Google services."
contentType: "tutorial"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 1
prerequisites: ["ai-api-key-guide"]
estimatedMinutes: 10
tags: ["OpenClaw", "Google API", "Google Drive", "Gmail", "申請"]
stuckOptions:
  "Enter Google Cloud Console": ["Can't find the Google Cloud Console entrance", "The screen looks different from the article after logging in"]
  "Create a new project": ["Don't know what to name the project", "Can't find the 'Create Project' button"]
  "Enable required APIs": ["Not sure which APIs to enable", "Can't find the API by name"]
  "OAuth consent screen": ["The OAuth consent screen setup is really confusing", "Don't know what to put for 'Test users'", "Does the review take a long time?"]
  "Create credentials": ["Don't know whether to choose API Key or OAuth Client", "Confused between Client ID and Client Secret", "What should I put for the redirect URI?"]
  "Configure in OpenClaw": ["Can't find the OpenClaw settings page", "Nothing happened after pasting the Key"]
  "Verify success": ["Test failed but don't know what went wrong", "Getting an insufficient permissions error"]
---

## Why Are You Reading This?

You want to use OpenClaw to connect to Google Drive or Gmail, but you got stuck at the API Key setup step.

That's completely normal. The Google Cloud Console interface is very unfriendly for people without a technical background, and many video tutorials either skip this step or rush through it.

This article will walk you through it step by step, including the **5 most common mistakes**.

---

## What You'll Need

- A Google account (your regular Gmail works fine)
- About 15-20 minutes
- OpenClaw already installed (if not, check out the [Installation Guide](/en/articles/install-openclaw) first)

---

## Step 1: Enter Google Cloud Console

1. Open your browser and go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. If this is your first time, you'll see a "Terms of Service" screen — check the box and click "Agree and Continue"

![Google Cloud Console home screen](/images/articles/google-api-key-guide/001.gif)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Quick tip**: If you have multiple Google accounts, make sure you're using the right one. You can switch accounts from the profile icon in the top-right.

---

## Step 2: Create a New Project

1. Click the project selector at the top (it may show "My First Project" or "Select a project")

![Click the project selector at the top](/images/articles/google-api-key-guide/002.gif)

2. Click "New Project"

![New Project button](/images/articles/google-api-key-guide/003.gif)

3. For the project name, enter: `openclaw-integration` (or any name you like)
4. Click "Create"

![Enter project name and create](/images/articles/google-api-key-guide/004.png)

5. Wait a few seconds — once the project is created, it should switch automatically

### 🚨 Common Mistake #1: Not Switching to the New Project

After creating the project, the project name at the top may **not switch automatically**. Manually click the project selector and confirm you're under the `openclaw-integration` project.

![Confirm you've switched to the correct project](/images/articles/google-api-key-guide/005.png)

---

## Step 3: Enable the Required APIs

Depending on which services you want to connect, you'll need to enable different APIs:

### Connecting Google Drive

1. In the left menu, find "APIs & Services" → "Library"

   ![Enable Google Drive API](/images/articles/google-api-key-guide/007.png)

   ![Enable Google Drive API](/images/articles/google-api-key-guide/009.png)

<!-- @img: api-library-menu | Find the API Library in the left menu -->

2. Search for `Google Drive API`
3. Click into it and press "Enable"

![Enable Google Drive API](/images/articles/google-api-key-guide/011.png)

![Enable Google Drive API](/images/articles/google-api-key-guide/012.png)

![Enable Google Drive API](/images/articles/google-api-key-guide/013.png)

### Connecting Gmail

1. Same as above, search for `Gmail API`
2. Click into it and press "Enable"

![Enable Gmail API](/images/articles/google-api-key-guide/016.png)

![Enable Gmail API](/images/articles/google-api-key-guide/017.png)

![Enable Gmail API](/images/articles/google-api-key-guide/018.png)

<!-- @img: enable-gmail-api | Enable Gmail API -->

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Need both?** Just enable both — they don't conflict.

### 🚨 Common Mistake #2: Enabling the Wrong API

Google has many APIs with similar names. Make sure you enable:

- ✅ `Google Drive API` (NOT Google Drive Activity API)
- ✅ `Gmail API` (NOT other Google Workspace APIs)

---

## Step 4: Set Up the OAuth Consent Screen

This is the step many people find most confusing, but just follow along and you'll be fine.

1. In the left menu, find "APIs & Services" → "OAuth consent screen"
2. Select "External," then click "Create"
3. Fill in the following information:

- **App name**: `OpenClaw` (name it whatever you like)
- **User support email**: Select your Gmail
- **Developer contact information**: Enter your Gmail

4. Leave other fields empty and click "Save and Continue"

5. On the "Scopes" page, just click "Save and Continue"
6. On the "Test users" page:
   - Click "Add users"
   - Enter **your own Gmail address**
   - Click "Save and Continue"

<!-- @img: add-test-user | Add a test user -->

7. Review the summary page and finish

### 🚨 Common Mistake #3: Forgetting to Add a Test User

If you don't add your own email as a test user, you'll get a `403 access_denied` error later. **Make sure to add it!**

---

## Step 5: Create Credentials (API Key + OAuth Client)

### Create an OAuth Client ID

1. In the left menu, go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"

<!-- @img: create-credentials-menu | Create Credentials menu -->
![Select External user type](/images/articles/google-api-key-guide/022.png)
![Select External user type](/images/articles/google-api-key-guide/023.png)
![Select External user type](/images/articles/google-api-key-guide/024.png)
![Select External user type](/images/articles/google-api-key-guide/025.png)
![Select External user type](/images/articles/google-api-key-guide/026.png)
![Select External user type](/images/articles/google-api-key-guide/027.png)
![Select External user type](/images/articles/google-api-key-guide/028.png)
![Select External user type](/images/articles/google-api-key-guide/029.png)
![Select External user type](/images/articles/google-api-key-guide/031.png)
![Select External user type](/images/articles/google-api-key-guide/032.png)
![Select External user type](/images/articles/google-api-key-guide/034.png)
![Select External user type](/images/articles/google-api-key-guide/036.png)
![Select External user type](/images/articles/google-api-key-guide/037.png)
3. For application type, select "Desktop app"

<!-- @img: select-desktop-app | Select Desktop app type -->

4. Enter any name, then click "Create"
5. A dialog will appear showing:
   - **Client ID**
   - **Client secret**
6. **Copy both of these!** Even better, click "Download JSON" to download a `credentials.json` file

<!-- @img: oauth-client-created | OAuth client created, copy the ID and secret -->
![Select External user type](/images/articles/google-api-key-guide/039.png)
![Select External user type](/images/articles/google-api-key-guide/040.png)
![Select External user type](/images/articles/google-api-key-guide/041.png)
![Select External user type](/images/articles/google-api-key-guide/043.png)


### 🚨 Common Mistake #4: Selecting the Wrong Application Type

If you select "Web application" instead of "Desktop app," OpenClaw won't be able to complete the OAuth flow locally.

---

## Step 6: Configure in OpenClaw

1. Place the downloaded `credentials.json` in OpenClaw's config folder
2. Add the following to OpenClaw's config file:

```json
{
  "google": {
    "credentials_path": "./credentials.json",
    "scopes": [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/gmail.readonly"
    ]
  }
}
```

3. Restart OpenClaw
4. The first time you use it, a browser window will pop up asking you to authorize — just click "Allow"

<!-- @img: google-auth-allow | Google authorization screen, click Allow -->

### 🚨 Common Mistake #5: Scope Too Broad or Too Narrow

- `drive.readonly` = Can only read Google Drive files (safe)
- `drive` = Can read, write, and delete all files (higher risk)
- Start with `readonly`, and expand permissions once you've confirmed it works

---

## Done! Verify It Works

Try this command in OpenClaw:

```
List the 5 most recently modified files in my Google Drive
```

<!-- @img: openclaw-drive-success | OpenClaw successfully listing Google Drive files -->

If you see a file list, congratulations 🚀 **Launch successful!**

If you're still having issues, here are the common debugging steps:

1. Confirm the `credentials.json` path is correct
2. Confirm the APIs are enabled (Step 3)
3. Confirm you added yourself as a test user (Step 4)
4. Confirm the application type is "Desktop app" (Step 5)
5. Try deleting `token.json` and re-authorizing

---

## Next Steps

Now that your API Key is set up, here's what's next:

- 💰 [Understand Token pricing so you don't get surprised by bills](/en/articles/token-economics)
- ⚙️ [Set up model switching strategies to save money and stay stable](/en/articles/openclaw-model-config)
- 🧩 [Write your first Skill](/en/articles/openclaw-skill)
- 💬 [Learn Prompt techniques for better AI responses](/en/articles/prompt-engineering)

---

## Still Stuck?

Click the "😵 I'm stuck" button below to let us know, or head to the [Home Discussion section](/#discussion) to ask a question — include any error messages and we'll help you figure it out!
