---
title: "Enable Google Sign-In in Firebase"
description: "Add 'Sign in with Google' to your site using Firebase Authentication: open Authentication, pick the Google provider, and set a project support email. Screenshots included, plus the most common support-email warning and how to clear it."
contentType: "tutorial"
scene: "integration"
difficulty: "beginner"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 5
prerequisites: ["firebase-create-project"]
estimatedMinutes: 5
tags: ["Firebase", "Google", "OAuth", "Setup", "Integration"]
stuckOptions:
  "Can't find Authentication": ["It's not in the left menu", "How do I find it via search?", "What do I click on first?"]
  "Enabling Google sign-in": ["What sign-in methods are available?", "A warning about a support email appeared", "What do I do after enabling?"]
---

> **In one line**: Open **Authentication → Google** in your Firebase project and set a project support email — your site can then use "Sign in with Google" to get the user's identity, with no account system of your own.

**Keywords**: Firebase Authentication, Google sign-in, Sign-in method, project support email, OAuth

---

## Why use Firebase's login?

To "know who the user is," rolling your own accounts / passwords / OAuth is fiddly and error-prone. Firebase Authentication lets you **wire up Google sign-in in one click** — users log in with an existing Google account and you get their identity directly, skipping the whole credential system.

> No Firebase project yet? Start with [Create Your First Firebase Project](/articles/firebase-create-project).

---

## Step 1: Open Authentication

In the Firebase Console, type **`authentication`** in the top-left search box and open the Authentication product.

![Searching for authentication in the Firebase top-left search](/images/articles/firebase-enable-google-login/firebase-search-authentication.png)

On your first visit you'll see the product intro page — click **Get started**.

![The Authentication intro page, click Get started](/images/articles/firebase-enable-google-login/firebase-auth-get-started.png)

---

## Step 2: Pick and enable Google sign-in

In the **Sign-in method** list you'll see Email/password, Google, Anonymous, Apple, and more. Select **Google**.

![The Authentication sign-in method list, selecting Google](/images/articles/firebase-enable-google-login/firebase-enable-google-provider.png)

Flip the **Enable** toggle in the top-right, then click **Save**.

![Enabling Google sign-in and saving](/images/articles/firebase-enable-google-login/firebase-google-enable-save.png)

---

## Step 3: Set the project support email

### 🚨 A "set a project support email" warning appears

When enabling Google sign-in, Firebase asks for a **public-facing project name** and a **support email** — shown on the Google sign-in screen so users know who's asking them to log in. Pick one of your Google emails from the dropdown; without it you're stuck on this warning.

![Setting the public project name and support email](/images/articles/firebase-enable-google-login/firebase-support-email.png)

---

## Recap

- Firebase Authentication means no credential system of your own — **Google sign-in in one click**.
- Path: search **Authentication → Get started → Sign-in method → Google → Enable → Save**.
- Enabling Google sign-in **requires a project support email**, or you're stuck on the warning.

---

> **Next**: With login on, register your site as a Web app and grab the SDK config it needs → [Register a Web App in Firebase to Get the SDK Config](/articles/firebase-register-web-app)
