---
title: "Auto-Classify Gmail with an LLM in Make: Just Add One AI Module"
description: "Level up the previous 'Gmail → Google Sheets' automation: insert an OpenRouter LLM module in the middle so AI reads each email, auto-tags it 'support / sales / spam / urgent,' and writes the label into the sheet. This shows you how to wire the OpenRouter connection, pick a free model, and write a solid classification prompt."
contentType: "tutorial"
scene: "integration"
difficulty: "intermediate"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 3
prerequisites: ["make-gmail-sheets-automation", "openrouter-free-llm-api-key"]
estimatedMinutes: 14
tags: ["Make", "LLM", "Automation", "OpenRouter"]
stuckOptions:
  "Adding the OpenRouter module": ["Can't find OpenRouter", "Which action do I pick?", "How do I create the OAuth connection?"]
  "Model and prompt": ["Which model is free?", "System vs. User message?", "Why does the AI return rambling text?"]
  "Writing the label into Sheets": ["Which column does the label map to?", "How do I grab the AI's output?", "The label comes out empty"]
---

> **In one line**: Insert an **OpenRouter "Create a Chat Completion"** module in the middle of the previous Gmail → Sheets flow: build the OpenRouter connection via OAuth, pick a free model, write a System prompt that "returns only the label," feed Gmail's subject + body as the User message, then map the AI's returned label to the Google Sheets category column — and you have an auto-classifying email pipeline.

**Keywords**: Make, LLM, auto-classification, OpenRouter, Create a Chat Completion, System prompt, User message, free model, Gmail, Google Sheets

---

## What are we building? (See the whole picture)

The flow from "Your First Make Automation" was: **new Gmail → write to Google Sheets.**

This article **inserts an AI in the middle**, making it:

**new Gmail → 🤖 OpenRouter LLM reads and classifies → write to Google Sheets with the label**

Now your sheet has not just "who sent what" but an extra column: "is this support? sales? spam? urgent?" — when mail piles up, that column sorts it instantly.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: This is like adding an "AI sorter" to a mail conveyor belt. Each email passes by, the sorter glances and slaps on a label — support to the left, sales to the right, spam in the bin. All you do is teach the sorter "how to classify, and which labels are allowed."

**Before you start**: ① the Gmail → Sheets flow from the previous article; ② an OpenRouter API key (see "OpenRouter Sign-Up").

---

## Step 1: Add the OpenRouter module between Gmail and Sheets

In the scenario editor, click the "+" after the Gmail module to add a new one, type **openrouter** in the app search, and pick **OpenRouter ✓ Verified**.

![Searching and adding the OpenRouter module in Make](/images/articles/make-llm-email-auto-tagging/make-add-openrouter.png)

It lists OpenRouter's Actions — choose **"Create a Chat Completion"** (send some text to the AI, get a reply back).

![The OpenRouter module's Actions list](/images/articles/make-llm-email-auto-tagging/make-openrouter-actions.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: "Chat Completion" is the same action as your usual chat with ChatGPT — you say something, it replies. The difference: Make does the "saying" automatically (sends the email content in) and uses the "reply" (the label) downstream.

---

## Step 2: Build the OpenRouter connection via OAuth

First time using the OpenRouter module, you build a **connection**. Make sends you to OpenRouter's **authorization screen** asking whether to let make.com access your account and create an API key.

![OpenRouter OAuth authorization screen](/images/articles/make-llm-email-auto-tagging/make-openrouter-oauth.png)

Confirm the URL is official OpenRouter and click **Authorize**. Once authorized, the module's **Connection** field is your new OpenRouter connection.

![OpenRouter connection created](/images/articles/make-llm-email-auto-tagging/make-openrouter-connection.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: OAuth authorization is safer than pasting an API key by hand — you don't copy the key around (fewer chances to paste it wrong or leak it); OpenRouter issues one directly to Make. Of course, pasting a key manually works too — your call.

---

## Step 3: Pick a free model

In the module's **Model** field, search `free` to filter free models. The example picks **`Google: Gemma 4 26B A4B (free)`**.

![Picking an OpenRouter free model in Make](/images/articles/make-llm-email-auto-tagging/make-select-free-model.png)

There's usually an **"Enable automatic Fallback?"** option — set **Yes** so that if your chosen model is unavailable at the moment, OpenRouter auto-switches to a similar one and the flow won't break.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: Classifying email isn't hard, so a free model (like Gemma) is plenty — no need to burn money on the priciest one upfront. If you find the free model isn't accurate enough, upgrade later. Getting the flow working on free is the smart move.

---

## Step 4: Write the "classification prompt" — the soul of this article

How accurately the AI classifies comes down to your instructions. In the **Messages** area, set two messages:

### First: System — tell the AI its role and rules

Set Role to **System** and spell out three things: **who it is, which labels it may pick, and the output format.** The example prompt reads (translated):

> You are an email classification assistant. Read the subject and body below and strictly choose the single best-fitting label from these categories: [Support] [Sales/Procurement] [Spam] [Urgent]. Note: return ONLY the label text (e.g., Support), with no other explanation or punctuation.

![Setting the System classification prompt](/images/articles/make-llm-email-auto-tagging/make-classify-prompt.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: This prompt has three key designs worth copying — ① **fixed labels** ("strictly choose from these," no freewheeling invented terms); ② **fixed format** ("return only the label, no explanation, no punctuation," so you don't get a rambling paragraph that ruins the clean label downstream); ③ **an example** ("e.g., Support"). These three make even small models behave.

### Second: User — feed in the actual email content

Add a message with Role **User**, and use **field mapping** to connect the Gmail module's output: drag in **Subject** and **Full text**.

![Feeding Gmail subject and body as the User message](/images/articles/make-llm-email-auto-tagging/make-user-message-mapping.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: **System** is the "work rulebook" you give the sorter in advance (same for every email); **User** is "this email's actual content" (different each time). Fixed rules, varying content — so the AI applies one consistent standard to every email.

### 🚨 The AI returns rambling text, not just the label?

Usually the System prompt didn't nail down "return only the label, no explanation." Make the rule blunter (like the example: "return ONLY," "no other explanation or punctuation") and add a sample output — it converges a lot.

---

## Step 5: Write the label into Google Sheets

Finally, back to the **Google Sheets "Add a Row"** module. Besides the mapped subject, sender, and body, map one more column, "Category" — connect it to the **OpenRouter module's output** (the text the AI returned, which is the label).

![Configuring the Google Sheets write, including the Category column](/images/articles/make-llm-email-auto-tagging/make-sheets-destination.png)

---

## Step 6: Done! A three-stage AI pipeline

Your scenario is now three complete modules:

**Gmail "Watch emails" → OpenRouter "Create a Chat Completion" → Google Sheets "Add a Row"**

![The finished three-module AI classification pipeline](/images/articles/make-llm-email-auto-tagging/make-final-pipeline.png)

Click **Run once** to test (send yourself a test email) and check the sheet: does the new row have the "Category" column auto-filled? Once it's right, enable the schedule, and this "AI auto-classify email" pipeline runs itself 24/7.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: What you just built is a prototype of the "smart support triage" that many companies pay for. The principle isn't magic — trigger → let AI judge → save the result. Learn this skeleton and you can swap the task: auto-detect sentiment, auto-summarize, auto-translate… same bones, different skin.

---

## Want it more robust? Add a backup provider

If this flow is critical and can't go down, wire in an **Ollama** cloud key as a fallback (see "Get an Ollama Cloud API Key") — it auto-switches when OpenRouter is rate-limited, for another level of reliability.

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **One last nudge from the Duck**: The trickiest part here isn't the wiring — it's "a poorly written prompt making the AI's output a mess." Remember the three moves: **fix the labels, fix the format, give an example.** With a good prompt, even a free small model becomes your sorter; with a bad one, even the priciest model slaps on wrong labels.
