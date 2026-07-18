---
title: "Google Cloud: Create a Project, Enable APIs, Configure the OAuth Consent Screen"
description: "When tools like Make/n8n need sensitive Google permissions (read/write Gmail, Sheets, Drive), 'Sign in with Google' isn't enough — you must create your own Google Cloud project, enable the matching APIs, and set up the OAuth consent screen and client credentials. This breaks down that slightly daunting path step by step."
contentType: "tutorial"
scene: "integration"
difficulty: "advanced"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 2
prerequisites: ["make-gmail-sheets-automation"]
estimatedMinutes: 15
tags: ["Google", "API", "Setup", "OAuth"]
stuckOptions:
  "Creating a project": ["Project name vs. project ID?", "What do I pick for parent resource?", "I already have tons of projects — new one?"]
  "Enabling APIs": ["Can't find Gmail API", "What do I do after enabling?", "Why enable both Sheets and Drive?"]
  "OAuth consent screen": ["Internal or External?", "What does testing mode mean?", "Web application or desktop?"]
---

> **In one line**: In the [Google Cloud Console](https://console.cloud.google.com), create a new project → enable the Gmail/Sheets/Drive APIs in the API Library → configure the OAuth consent screen (pick "External," fill app name and contact email) → create a "Web application" OAuth client to get a Client ID/Secret — so external tools like Make are allowed to use your sensitive Google permissions.

**Keywords**: Google Cloud, GCP, project, API Library, Gmail API, Sheets API, Drive API, OAuth consent screen, OAuth client, Client ID, Client Secret

---

## Why this step? (Understand before you dive in)

In the previous article, "Your First Make Automation," we connected Gmail with just **Sign in with Google**. That's usually enough for "read personal Gmail."

But when the permissions you need are **sensitive** (letting automation "read, compose, even delete" your Gmail), or you want to avoid the limits of Make's shared built-in connection, Google requires: **this external app must access those APIs using "your own Google Cloud project + OAuth credentials."**

In other words, you open a proper "address plate" in Google Cloud for this integration before Google grants sensitive permissions.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Sign in with Google is like tapping a transit card at the subway gate — fine for daily use. But to enter a "vault-grade" area (high-privilege stuff like deleting mail), the guard says: "Show your company's official ID badge." Creating a Google Cloud project + OAuth client is getting that official badge. More paperwork, but do it once and it's valid long-term.

There are quite a few steps, but the logic is clear, in three parts: **① create a project → ② enable APIs → ③ set up OAuth.**

---

## Part 1: Create a Google Cloud project

### Step 1: New project

Open the [Google Cloud Console](https://console.cloud.google.com), use the project menu at the top → **New Project**.

- **Project name**: pick a name you'll recognize (e.g., `my-project-make`). The name can be changed later.
- **Project ID**: auto-generated from the name and **cannot be changed after creation**; globally unique.
- **Parent resource**: for personal use, "No organization" is fine.

Fill it in and click **Create**.

![Creating a new project in Google Cloud Console](/images/articles/google-cloud-oauth-api-setup/gcp-create-project.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: A **project** is a folder that holds all the APIs, credentials, and billing for this integration. Later, different automations get different projects, keeping the books cleanly separated.

### 🚨 After creating, remember to "switch" to it

The Console doesn't always auto-switch to a new project. Use the **project selector** up top to confirm you're working in the **project you just created** — otherwise the APIs you enable land in a different project and you've wasted the effort.

---

## Part 2: Enable the APIs you need

A new project has no APIs enabled by default. For each feature you want, go to the **API Library** and "enable" the matching API.

### Step 2: Search the API Library

Left menu → **APIs & Services** → **Library**. Type the API name in the search box, e.g., **gmail**.

![Searching gmail in the Google Cloud API Library](/images/articles/google-cloud-oauth-api-setup/gcp-api-library-search.png)

### Step 3: Enable the Gmail API

Open the **Gmail API** product page and click **Enable**.

![Gmail API product page, click Enable](/images/articles/google-cloud-oauth-api-setup/gcp-gmail-api.png)

After enabling, you land on the Gmail API management page, which also hints "you may need to create credentials to call this API" — those credentials are the OAuth client in Part 3.

![Gmail API enabled](/images/articles/google-cloud-oauth-api-setup/gcp-enable-gmail-api.png)

### Step 4: Also enable Google Sheets API and Google Drive API

For a Gmail → Sheets automation, you'll also use:

- **Google Sheets API** (read/write spreadsheets)
- **Google Drive API** (Sheets files live in Drive; used to find files)

Back in the Library, search each, open its page, and click **Enable**.

![Enable Google Sheets API](/images/articles/google-cloud-oauth-api-setup/gcp-enable-sheets-api.png)

![Enable Google Drive API](/images/articles/google-cloud-oauth-api-setup/gcp-enable-drive-api.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Enabling APIs is like activating extensions at a switchboard — to call "Sales (Gmail), Finance (Sheets), Warehouse (Drive)," you activate each one first, or the call won't connect. Activation is free; you only pay for what you use.

---

## Part 3: Set up the OAuth consent screen and client

The final and most crucial part: tell Google "an app wants to access these APIs on behalf of a user."

### Step 5: Fill OAuth app info

Left → **APIs & Services** → **OAuth consent screen** (the new version is "Google Auth Platform"). Start configuring:

- **App name**: this app's name (e.g., `make`), shown when users authorize.
- **User support email**: pick your email.

![Configuring OAuth app info](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-app-info.png)

### Step 6: Choose "External" user type

Next it asks for **audience**:

- **Internal**: only people inside your organization (Google Workspace).
- **External**: anyone with a Google account (including your personal account), but it starts in "testing mode" — only people you add to the "test users" list can access it.

For a personal account integrating with Make, choose **External**.

![OAuth choosing External user type](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-external.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: "Testing mode + External" means the app hasn't been submitted for Google's formal review, so only accounts you specifically add to the test list can use it. That's plenty for solo use — no waiting for review. Review is only needed to open it to the general public.

### Step 7: Create the OAuth client (choose Web application)

With the consent screen set, create an **OAuth client ID**. It asks for the **application type**:

- **Web application**: services that run on the web and need a "redirect URL" to send you back, like Make or Notion ← choose this for Make.
- **Desktop application**: programs running locally on your computer (localhost).

![Choosing the OAuth client's application type](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-client-type.png)

Pick "Web application" and name the client. Under **Authorized redirect URIs**, enter the callback URL Make gives you (e.g., `https://www.make.com/oauth/cb/...` — use exactly what Make's connection screen shows).

![Configuring the web application OAuth client](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-web-client.png)

### Step 8: Get the Client ID and Client Secret

Click Create, and Google issues a **Client ID** and **Client Secret** (also downloadable as JSON). Paste these two values back into Make's connection settings, and the integration is wired.

![OAuth client created, obtaining the Client ID/Secret](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-client-created.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: The **Client ID** is the app's "ID number" (can be public); the **Client Secret** is its "seal/password" (must stay secret). Just like this article's screenshot blacks out the Secret — a leaked Secret means someone can impersonate your app to request Google permissions.

### 🚨 Configured but it fails immediately? Might not have propagated

Google sometimes warns "settings may take 5 minutes to a few hours to take effect." If you integrate right after creating and hit an error, wait a bit and retry — it's not necessarily a misconfiguration.

---

## Done! Back to your automation

Three parts complete, you now have: **a Google Cloud project, enabled Gmail/Sheets/Drive APIs, and an OAuth client credential.** Paste the Client ID/Secret back into Make's (or n8n's) Google connection, and the sensitive permission that was stuck now goes through.

Return to "Your First Make Automation" to finish the Gmail → Sheets flow, or continue to "Auto-Classify Gmail with an LLM in Make" to add AI.

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **One last nudge from the Duck**: This path has a lot of steps; the three easiest traps are — ① **forgetting to switch to the new project after creating it** (APIs land in the wrong project); ② **a wrong redirect URI** (paste Make's callback URL character-for-character); ③ **leaking the Client Secret** (it's a secret like an API key — don't screenshot or upload it). Clear these three and the rest is smooth.
