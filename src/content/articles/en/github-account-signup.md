---
title: "Sign Up for GitHub: From the Homepage to Your Dashboard (with Device Email Verification)"
description: "Create a GitHub account step by step: fill in the sign-up form, complete email device verification, land on your Dashboard, and find the account menu. Many tutorials start by assuming a GitHub account — this one gets you past that first."
contentType: "tutorial"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-06-28"
verifiedAt: "2026-06-28"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 6
tags: ["GitHub", "Setup", "Integration"]
stuckOptions:
  "Filling in the sign-up form": ["It says my Username is taken", "Do I have to sign in with Google?", "What are the password requirements?"]
  "Device email verification": ["I didn't get the code email", "The code expired", "Did it go to spam?"]
  "Can't find things after login": ["Where is Settings?", "Where do I see my repositories?", "How do I sign out?"]
---

> **In one line**: Go to [github.com](https://github.com), click Sign up, fill in your email / password / username, then complete device verification with a code from your inbox — and you're in the GitHub dashboard.

**Keywords**: GitHub, sign up, create account, Create your free account, Username, Device verification, verification code, Dashboard, account menu, Settings

---

## Why do you need a GitHub account?

GitHub is the most widely used code-hosting platform in the world. On LaunchDock, the first step of many tutorials — deploying a site, wiring up a service, using the `gh` CLI, putting a project in the cloud — assumes you already have a GitHub account. This article clears that "prerequisite of prerequisites" once, so later tutorials can pick up right where this leaves off.

Signing up is completely free and takes about 5 minutes.

---

## Step 1: Go to the GitHub homepage and click Sign up

Open [github.com](https://github.com). The top-right has **Sign in** and **Sign up**. On your first visit, click **Sign up**.

![The GitHub homepage with the Sign up button in the top-right](/images/articles/github-account-signup/github-homepage.png)

---

## Step 2: Fill in the sign-up form

On the **Create your free account** page, fill in:

- **Email**: an inbox you check (you'll receive a verification code here).
- **Password**: at least 15 characters, or 8+ characters that include a number and a lowercase letter.
- **Username**: your public handle, unique across GitHub — it appears in your URL `github.com/your-name`.
- **Your Country/Region**: where you are (Taiwan in this example).

You can also click **Continue with Google／Apple** to sign up with an existing account and skip setting a password. When done, click **Create account**.

![The GitHub sign-up form with Email, Password, Username, and Country fields](/images/articles/github-account-signup/github-signup-form.png)

### 🚨 Username says "already taken"

GitHub usernames are globally unique, and common names are nearly all gone. Adding a number, an underscore, or a project suffix (e.g. `yourname-dev`) usually works. This name shows up in the URL of every repo you create, so pick one you're happy to keep long-term.

---

## Step 3: Complete device email verification

To confirm it's really you, GitHub emails a **verification code** to the address you just entered. Open your inbox, copy the code, paste it into the **Device Verification Code** field, and click **Verify**.

![The GitHub device verification page, entering the code sent to your email](/images/articles/github-account-signup/github-device-verification.png)

### 🚨 No verification email?

1. **Check spam / the Promotions tab first**: the sender is `noreply@github.com`, subject like "[GitHub] Please verify your device."
2. **Wait 1–2 minutes**: the email is occasionally delayed.
3. Still nothing → there's a **Re-send the authentication code** link near the bottom of the page.
4. The code **expires** (the page shows the expiry time) — if it lapses, request a fresh one rather than reusing the old code.

---

## Step 4: Land on your GitHub Dashboard

Once verified, you're logged in and see your **Dashboard**: "Create your first project" on the left, your activity feed in the middle. This is the starting point for everything you'll do next.

![The GitHub Dashboard home after logging in](/images/articles/github-account-signup/github-dashboard-home.png)

---

## Step 5: Get to know the account menu (top-right)

Clicking your **avatar** in the top-right opens the account menu — the place you'll come back to most:

- **Your repositories**: every project you create.
- **Settings**: account settings (change password, set up SSH/tokens, enable two-factor — all here).
- **Sign out**: log out.

![The GitHub account menu after clicking the top-right avatar](/images/articles/github-account-signup/github-account-menu.png)

> 💡 When a later tutorial says "go to Settings" or "in your repository," the entry point is this menu.

---

## Recap

- Go to [github.com](https://github.com), click **Sign up**, and fill in your email / password / **globally unique Username**.
- GitHub emails a **verification code**; enter it in **Device Verification Code** to finish device verification. No email? Check spam, then re-send.
- After login you see the **Dashboard** — everything starts here.
- The **avatar menu** in the top-right leads to Your repositories and Settings, the spots you'll return to most.
