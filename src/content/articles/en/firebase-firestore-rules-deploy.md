---
title: "Fix \"Missing or insufficient permissions\": Deploy Firestore Security Rules with the Firebase CLI"
description: "Wired a front-end-only site to Firestore but the cloud connection test throws \"Missing or insufficient permissions\"? That's Firestore's default lock-down rules. This article deploys your firestore.rules with the Firebase CLI, verifies in the Console, and checks authorized domains — with full screenshots."
contentType: "troubleshoot"
scene: "integration"
difficulty: "intermediate"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 7
prerequisites: ["firebase-register-web-app"]
estimatedMinutes: 12
tags: ["Firebase", "Firestore", "Deploy", "Troubleshoot", "Integration"]
stuckOptions:
  "Why Missing permissions": ["I'm logged in but it still fails", "What exactly do the default rules block?", "Edit rules in the Console, or deploy them?"]
  "Installing and logging into the Firebase CLI": ["I've never installed firebase-tools", "npx vs global install?", "login is stuck on browser authorization"]
  "Deploying firestore.rules": ["What does the deploy command look like?", "I only want to deploy rules, nothing else", "How long until deploy takes effect?"]
  "Still can't connect after deploy": ["Check Authorized domains", "Are the rules written correctly?", "Did the data actually get written?"]
---

> **In one line**: `Missing or insufficient permissions` is almost always **Firestore Security Rules** blocking reads/writes. Write your `firestore.rules`, deploy it with `npx firebase-tools deploy --only firestore:rules`, and it's fixed.

**Keywords**: Firestore, Security Rules, Missing or insufficient permissions, Firebase CLI, firebase-tools, firebase login, deploy, firestore.rules, Authorized domains

---

## The problem: the cloud connection test fails

Your front-end-only site is already wired to Firebase (you have the `firebaseConfig`), but clicking "test cloud connection" throws a red error:

```
✗ Connection test failed
Missing or insufficient permissions.
```

![The PWA cloud connection test failing with Missing or insufficient permissions](/images/articles/firebase-firestore-rules-deploy/pwa-missing-permissions.png)

> Haven't grabbed the SDK config yet? See [Register a Web App in Firebase to Get the SDK Config](/articles/firebase-register-web-app) (the whole Firebase series starts at [Create Your First Firebase Project](/articles/firebase-create-project)).

### Why? Because Firestore defaults to "deny all"

This isn't a bug in your code — **Firestore's Security Rules** deny all reads and writes by default. That's a deliberate safe default so your database isn't wide open the moment you create it. To let the front-end read and write, you must **deploy rules that allow specific access**.

You can edit rules directly in the Console web UI, but the more repeatable, version-controllable approach is to keep them as a `firestore.rules` file in your project and deploy with the **Firebase CLI**.

---

## Step 1: Install the Firebase CLI (firebase-tools)

No global install needed — just run it via `npx`. In your project directory:

```bash
npx firebase-tools --version
```

The first time, it asks whether to allow downloading and running the `npx` package — allow it.

![The terminal asking whether to allow running npx firebase-tools](/images/articles/firebase-firestore-rules-deploy/install-firebase-tools-npx.png)

---

## Step 2: Log in to Firebase

```bash
npx firebase-tools login
```

This opens a browser for authorization (just like a Google login). After authorizing, the browser shows **"Firebase CLI Login Successful"** and you can return to the terminal.

![The browser showing Firebase CLI login successful](/images/articles/firebase-firestore-rules-deploy/firebase-cli-login-success.png)

### 🚨 Can't log in from a background / non-interactive environment?

If you're running inside an AI agent or a background process (non-interactive mode), `login` can't pop a browser. The fix: **open a separate terminal yourself** and run `npx firebase-tools login` to authorize — the login state is shared, then return to your original flow to deploy.

---

## Step 3: Deploy the Firestore rules

With your `firestore.rules` written (and `.firebaserc` pointing at the project), deploy just the rules:

```bash
npx firebase-tools deploy --only firestore:rules
```

`--only firestore:rules` means "touch only the rules, leave Hosting/Functions/etc. alone" — the safest scope.

![The terminal running firebase-tools deploy --only firestore:rules](/images/articles/firebase-firestore-rules-deploy/deploy-firestore-rules-command.png)

---

## Step 4: Confirm the rules are live in the Console

Back in the [Firebase Console](https://console.firebase.google.com) → **Firestore Database → Rules** tab, you should see the rules you just deployed (starting with `rules_version = '2'`). Seeing them here means they're in effect.

![The Firestore Rules tab in the Firebase Console showing the deployed rules](/images/articles/firebase-firestore-rules-deploy/firestore-rules-deployed.png)

> Common patterns are "only logged-in users can read/write" or "only a specific admin email can write." Your `apiKey` is not your defense — **these rules are** what actually decide who can touch your data.

---

## Step 5: Verify the data really gets written

Click "test cloud connection" again on your site — it should succeed now. In **Firestore Database → Data** you'll also see the corresponding collection/document written.

![The Firestore Data tab in the Firebase Console confirming data was written](/images/articles/firebase-firestore-rules-deploy/firestore-data-verified.png)

---

## 🚨 Rules deployed but still can't connect? Check authorized domains

If the rules are fine but it still fails (especially for **login**-related features), it's usually that your site's domain isn't in the **Authorized domains** list. Go to **Authentication → Settings → Authorized domains** and make sure your domain is listed:

- `localhost` (for local dev, there by default)
- `<your-project>.firebaseapp.com`, `<your-project>.web.app` (default Firebase Hosting domains)
- **Your own domain** (e.g. a GitHub Pages `xxx.github.io` or a custom domain) — this one is often forgotten; add it to allow access.

![The Authorized domains settings page in the Firebase Console](/images/articles/firebase-firestore-rules-deploy/firebase-authorized-domains.png)

---

## Recap

- `Missing or insufficient permissions` = **Firestore Security Rules** blocking you, not broken code.
- Use `npx firebase-tools` (no global install); if `login` can't run in a background environment, **open a separate terminal** to authorize.
- Deploy rules only: `npx firebase-tools deploy --only firestore:rules`.
- Double-check in the Console's **Rules** and **Data** tabs.
- Rules correct but still failing → check **Authorized domains** includes your domain (the most-forgotten step).
- What protects your data is the **Security Rules**, not hiding your `apiKey`.

---

> **Next**: With the cloud backend sorted, publish the site itself for free → [Deploy a Static Site / PWA to GitHub Pages](/articles/deploy-to-github-pages)
