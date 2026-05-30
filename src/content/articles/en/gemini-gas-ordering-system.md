---
title: "Build an AI Cloud Ordering System with Gemini: From Menu to Kitchen Display in 4 Steps"
description: "Write zero lines of code. Four prompts let Gemini build your Google Apps Script backend, an automated form, and a live kitchen ticket display. The point isn't just the code — it's learning to handle real dev problems: mismatched columns, missing permissions, and forgotten redeploys."
contentType: "tutorial"
scene: "integration"
difficulty: "intermediate"
createdAt: "2026-05-30"
verifiedAt: "2026-05-30"
archived: false
order: 4
prerequisites: []
estimatedMinutes: 25
tags: ["Gemini", "Google Apps Script", "整合", "自動化", "Prompt"]
stuckOptions:
  "Where to paste Gemini's code": ["Can't find the Google Apps Script editor", "Red error after pasting and running"]
  "Form isn't saving data": ["How do I set up the trigger?", "Sheet is empty after form submit"]
  "KDS kitchen screen won't open": ["Web app deployment failed", "Screen opens but shows no orders"]
  "Breaks when I change a column": ["KDS shows blank", "Status column does nothing"]
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's intro:** This builds a system that actually works — a cloud ordering + kitchen ticket setup where customers order via a form, data lands in a spreadsheet automatically, and the kitchen screen pops up pending tickets in real time. The coolest part: you **don't write a single line of code yourself** — Gemini does it all. But what matters more is that this teaches you the three things that trip everyone up in real development: mismatched columns, missing permissions, and forgotten redeploys. Solve those three and you can truly say you know how to code with AI.

---

## 🤔 What Problem Are We Solving

Ordering at small eateries and ramen shops often looks like this: the customer calls out, staff scribble a ticket, the kitchen can't read it, and the serving order gets messy. Want a POS system? The monthly fee isn't cheap, and you'll use less than half the features.

This builds a workable ordering backend using **completely free** Google tools (Forms + Sheets + Apps Script), with Gemini as your engineer.

The whole system looks like this:

```
Customer fills Google Form → auto-writes to the "Order Log" sheet → kitchen KDS screen shows live tickets → chef marks complete
```

Four steps follow. For each one you just **copy a prompt to Gemini**, then paste the code it generates back into Google Apps Script.

> 💡 **What is Google Apps Script (GAS)?** It's Google's built-in, free cloud coding environment that makes your sheets, forms, and docs "move on their own." No server to set up, nothing to pay — it runs under your Google account.

---

## Step 1: Menu Analysis and the Backend Brain (Code.gs)

First, let Gemini read your menu and write the core data-storage logic.

**Action:** Open [Gemini](https://gemini.google.com), upload a photo of your menu, and paste this prompt:

```
I'm building a ramen ordering system. Based on the menu image I uploaded, please
write the Google Apps Script (GAS) backend logic Code.gs. Don't generate Google
Sheets yet — I want to generate a Google Form first, then auto-convert it to a Sheet.

Requirements:
1. Write a saveToSheet(data) function that automatically stores data into a sheet
   named "Order Log".
2. Auto-check whether the sheet exists; if not, create it and set up a clean header
   row (headers should include: Time, Name, Table, Main, Combo, A La Carte, Toppings,
   Drink, Notes, Total, Status).
3. Add LockService to prevent data overwrite when multiple people order at once.
4. Finally, generate a createForm() function I can run directly in GAS to quickly
   build the matching Google Form.
```

**Paste the code into GAS:** Go to [script.google.com](https://script.google.com), click "New project," paste the entire `Code.gs` Gemini generated, and save.

<!-- @img: gas-new-project | Google Apps Script editor after creating a new project -->

**Run createForm():** In the function dropdown at the top of the editor, select `createForm` and click "Run." The first run asks for authorization — follow the prompts to allow it.

<!-- @img: gas-run-createform | Selecting and running the createForm function in the GAS editor -->

Once it finishes, an auto-built ordering form appears in your Google Drive.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor says:** Notice the order in the prompt — "generate the form first, then auto-convert to a sheet." Many people ask the AI to generate the sheet first and end up with a form whose fields don't line up. Let the form be the "source of the data" first, and you'll save a lot of alignment headaches later.

---

## Step 2: Automate the Form (Trigger)

The form is built, but it can't "talk" yet — when a customer submits, the data won't flow into the sheet on its own. We need it to auto-trigger the save on submit.

**Action:** Back in Gemini, paste:

```
I've already created the Google Form. Please write an onFormSubmit(e) function so
that when a user submits the form:
1. It automatically pulls data from e.response.
2. It organizes the data into an object and calls the saveToSheet(data) we wrote earlier.
3. Please remind me how to bind this function as "On form submit" in the GAS "Triggers"
   settings.
```

Paste the generated `onFormSubmit(e)` function into `Code.gs`.

**Set up the trigger** (this step is critical): In the GAS editor's left sidebar, click "Triggers" (the clock icon) → "Add Trigger," and choose:

- Function to run: `onFormSubmit`
- Event source: "From form"
- Event type: "On form submit"

<!-- @img: gas-trigger-setup | GAS trigger setup binding onFormSubmit to On form submit -->

After saving, have someone fill in the form once as a test, then check the "Order Log" sheet to see if a new row appears automatically.

> 🚨 **Common error: the sheet is still empty after submitting**
> 99% of the time the trigger isn't set up, or it's set to "From spreadsheet" instead of "From form." Go back and confirm the event source is "From form."

---

## Step 3: Build the Kitchen Display System (KDS)

Now that data flows in, the kitchen needs a **live ticket** web page — that's the KDS (Kitchen Display System).

**Action:** Back in Gemini, paste:

```
Now I need a Kitchen Display System (KDS) web page:
1. Add doGet() in Code.gs so it can be deployed as a web app.
2. Write a getActiveOrders() function that specifically fetches orders with status
   "Pending" from the sheet.
3. Write a completeOrder(rowNumber) function so that when the chef presses a button,
   that row's status changes to "Done".
4. Generate an index.html file with a card-style UI, large fonts, and a setInterval
   that auto-refetches the data every 10 seconds.
```

Paste `doGet()`, `getActiveOrders()`, and `completeOrder()` into `Code.gs`; then click "+" in the GAS editor to add an `index.html` file and paste in the HTML Gemini generated.

<!-- @img: gas-add-html | Adding an index.html file in the GAS editor -->

**Deploy as a web app:** Click "Deploy" (top right) → "New deployment" → choose type "Web app," set the permissions (see Principle 2 below), and deploy. You'll get a URL. Open it on a tablet or kitchen screen and you've got a live ticket display.

<!-- @img: gas-deploy-webapp | GAS deploy-as-web-app configuration screen -->

<!-- @img: kds-screen | Kitchen KDS screen showing pending order cards -->

---

## Step 4: Maximum-Flexibility Debugging (Dynamic Alignment)

This is the most valuable step in the whole article. Later, when you change a form question or reorder columns, the system will likely break — the KDS suddenly can't find orders. When that happens, don't panic and hunt for the bug yourself. Throw this "lifesaver prompt" at Gemini:

```
My spreadsheet column names changed, or a question got longer (e.g., "[Main] Please
choose your ramen"), so the KDS can't display. Please optimize the getActiveOrders
function:
1. Switch to "fuzzy matching" the header text to locate the column index (e.g., as
   long as the header contains the word "Main," map it to that column).
2. If the "Status" column is empty, automatically default it to "Pending".
3. Make sure the code is highly compatible and runs no matter which column position
   the field is in.
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's key point:** This step doesn't teach code — it teaches a **mindset**. Real systems always change. Instead of hard-coding "Main is in column 4," let the program "map to whatever header contains 'Main'." This "fuzzy-matching, fault-tolerant design" thinking is worth more than any single block of code.

---

## 💡 Three Principles From a Senior Engineer

The real value of this workflow isn't the code — it's that it forces you to face three walls every beginner hits. Remember these and save yourself three days of grief.

### Principle 1: "New version" is the cure-all

After every edit to `Code.gs` or `index.html`, the web page won't auto-update. You must redeploy, and the key is "**new version**":

"Deploy" → "Manage deployments" → "Edit" (pencil icon) → Version: "**New version**" → "Deploy."

> 🚨 **The most common complaint is "my change didn't take effect."** 99% of the time it's because they forgot to select "New version" and reused the old one.

### Principle 2: Set the permissions right

When deploying as a web app, two settings must be right:

- **Execute as:** choose "Me" (so the program uses your permissions to read/write your sheet)
- **Who has access:** be sure to choose "**Anyone**" (otherwise the kitchen tablet can't open it)

<!-- @img: gas-deploy-permissions | GAS deploy settings: Execute as "Me", access "Anyone" -->

### Principle 3: The secret of the "Status" column

The KDS only fetches orders where "Status = Pending." If the kitchen screen is blank:

Go to the sheet and check manually — is there a column titled "**Status**"? Does it contain "**Pending**"? Often tickets don't show up simply because the status column is empty (which is exactly why Step 4 makes empty default to "Pending").

---

## 🎯 What You Actually Learned

Gemini can write the code in seconds. But the real value of this lesson is that you learned how to **direct AI to assemble a real system** — and when it breaks, you know the problem is usually one of three things: columns, permissions, or version.

This mindset applies to any AI-coding scenario.

---

## 🔗 Further Reading

- ✍️ **Want to write better prompts?** → [Intro to Prompt Engineering](/en/articles/prompt-engineering)
- 🔑 **Want to use the Gemini API for more advanced integration?** → [Google API Key Setup Guide](/en/articles/google-api-key-guide)
- 🧩 **Want to connect more complex automation flows?** → [What Is n8n? The Enterprise Automation Pain Points It Solves](/en/articles/what-is-n8n)
- 🗺️ **Understand where each AI tool fits** → [The AI Tool Landscape](/en/articles/ai-tool-landscape)

Questions? Join the [homepage discussion](/#discussion) and let's talk!
