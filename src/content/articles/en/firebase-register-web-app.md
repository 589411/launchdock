---
title: "Register a Web App in Firebase to Get the SDK Config"
description: "Register your site as a Web app under your Firebase project and grab the firebaseConfig SDK snippet so your front-end can connect. Screenshots included, plus whether the apiKey is actually a secret and where to find the config again later."
contentType: "tutorial"
scene: "integration"
difficulty: "beginner"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 6
prerequisites: ["firebase-enable-google-login"]
estimatedMinutes: 5
tags: ["Firebase", "OAuth", "Setup", "Integration"]
stuckOptions:
  "Registering a Web app": ["Where is the </> web icon?", "Can the app nickname be anything?", "Should I check Firebase Hosting?"]
  "Getting the SDK config": ["Is the apiKey in firebaseConfig a secret?", "Where can I see this config again later?", "Which package does npm install?"]
---

> **In one line**: Click the **web `</>`** icon to register your site as a Web app, copy the `firebaseConfig` it gives you, paste it into your front-end code — and your site is connected to Firebase.

**Keywords**: Firebase Web app, firebaseConfig, apiKey, SDK, npm install firebase, project settings

---

## Why register a Web app?

You've created a project and turned on login, but your page still doesn't know *which* Firebase project to connect to. **Registering a Web app** is how you get that "connection address" — the `firebaseConfig`.

> Haven't enabled login yet? See [Enable Google Sign-In in Firebase](/articles/firebase-enable-google-login/).

---

## Step 1: Add a Web app

Back on **project settings / overview**, click the **web `</>`** icon to register your site as a Web app under this Firebase project.

![Adding a Web app to the project via the </> icon](/images/articles/firebase-register-web-app/firebase-add-web-app.png)

Enter an **app nickname** (just for you, anything works). Only check the Firebase Hosting box if you'll use it — skip it for a plain front-end. Click **Register app**.

![Entering the Web app nickname and registering](/images/articles/firebase-register-web-app/firebase-register-web-app.png)

---

## Step 2: Get the firebaseConfig

After registering, Firebase gives you an **SDK config**: first `npm install firebase`, then copy the `firebaseConfig` object (with `apiKey`, `authDomain`, `projectId`, `appId`, etc.) into your front-end code to connect.

![The Firebase Web SDK config with npm install firebase and firebaseConfig](/images/articles/firebase-register-web-app/firebase-sdk-config.png)

### 🚨 Is the apiKey in firebaseConfig a secret?

**Not in the traditional sense.** Firebase's Web `apiKey` is designed to live in the front-end where users can see it — it only identifies *which project* to connect to, it's not an authorization key. What protects your data is **Firestore Security Rules**, not hiding this.

> ⚠️ What you *must* keep secret are **service account private keys and backend Admin SDK keys** — those must never reach the front-end or git.

### 🚨 Can I see this config again later?

Yes. Go to **Project settings → General → Your apps** anytime to copy the `firebaseConfig` again.

---

## Recap

- Registering a Web app gets you the **`firebaseConfig`** — the "address" your front-end uses to reach Firebase.
- Flow: project overview → click **`</>`** → enter a nickname → register → copy `firebaseConfig`.
- The `apiKey` is **not a secret** and belongs in the front-end; keep service account / Admin SDK keys secret.
- The config is always retrievable under **Project settings → General**.

---

> **Next**: Once connected, if reading/writing data throws "Missing or insufficient permissions," that's the rules blocking you → [Fix Missing permissions: Deploy Firestore Security Rules](/articles/firebase-firestore-rules-deploy/)
