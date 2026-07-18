---
title: "Your First Make Automation: Auto-Save New Gmail into Google Sheets"
description: "Use Make (formerly Integromat) to build your first no-code automation: whenever Gmail gets a new email, automatically write the sender, subject, and body as a row in a Google Sheet. This covers picking a ready-made template, authorizing the Google connection, and configuring the trigger and write modules — the foundation for adding AI auto-classification later."
contentType: "tutorial"
scene: "integration"
difficulty: "intermediate"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 12
tags: ["Make", "Automation", "Integration", "Gmail"]
stuckOptions:
  "Picking a template": ["Can't find a Gmail to Sheets template", "Do templates cost money?", "Is it normal my URL says eu1/eu2?"]
  "Authorizing the Google connection": ["Sign in with Google is stuck", "It asks for a lot of Gmail permissions — safe?", "Connection stuck on Creating a connection"]
  "Configuring the sheet write": ["Spreadsheet can't find my file", "How do I map the columns?", "What is Table contains headers?"]
---

> **In one line**: On [make.com](https://www.make.com), use the ready-made "Save a Gmail email to Google Sheets" template, authorize your Google account, configure the Gmail "Watch emails" trigger, then map Gmail fields into the Google Sheets "Add a Row" module — and a "new email auto-saved to a sheet" automation is running.

**Keywords**: Make, Integromat, automation, scenario, Gmail, Google Sheets, Watch emails, Add a Row, connection, module, field mapping

---

## What is Make, and how is it different from coding?

**Make** (formerly Integromat) is a **visual automation platform**: no coding — you connect services by chaining "module to module" so things run automatically. One such flow is a **scenario**.

The first scenario here is genuinely useful: **every time Gmail receives a new email → automatically turn its sender, subject, and body into a row in a Google Sheet**. You end up with a running log of all incoming mail, and you can add stats or AI classification on top.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Make is like a home automation combo — "detect someone at the door (new Gmail) → turn on the light (write to Sheets)." You just wire the "sensor" to the "appliance," and it runs itself. And you draw that wire with your mouse — no code.

---

## Step 1: Start from a template (don't build from scratch)

After logging into Make, click **Templates** in the left menu. Templates are scenarios others already built — apply one and tweak a few settings, far faster than a blank canvas.

Search **Gmail** or **Sheets** in the template gallery and find something like **"Save a Gmail email to Google Sheets as a new row."**

![Make template gallery, many ready-made automation templates](/images/articles/make-gmail-sheets-automation/make-templates-gallery.png)

Open the template and you'll see its pre-drawn flow: **Gmail "Watch Emails" → Google Sheets "Add a Row."** Click **"Start guided setup"** or **Create new scenario from template**.

![The Gmail → Google Sheets template, a two-module flow](/images/articles/make-gmail-sheets-automation/make-gmail-sheets-template.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: Starting from a template is like buying flat-pack furniture — the frame is assembled; you just add your own screws (your Gmail, your spreadsheet). Why start from a raw plank?

### 🚨 My URL starts with eu1 / eu2 / us1 — normal?

Normal. Make's URL prefix depends on your account's region (`eu1.make.com`, `eu2.make.com`…). Just follow your own account's URL; ignore which one the tutorial screenshots show.

---

## Step 2: Configure the Gmail trigger "Watch emails"

The flow's first module is **Gmail "Watch emails"** — a **trigger** that "watches" your inbox and kicks off the whole flow whenever a matching new email arrives.

Click it, and it asks **"Choose where to start."** Pick **From now on** — the simplest choice: process only emails that arrive afterward, without pulling in thousands of old messages.

![The Gmail Watch emails trigger, choosing to start from now on](/images/articles/make-gmail-sheets-automation/make-gmail-watch-emails.png)

---

## Step 3: Authorize the Google connection (Sign in with Google)

The first time you use the Gmail module, Make asks you to create a **connection** to Google:

1. Name the connection (default like "My Google connection").
2. Click **Sign in with Google**.
3. In the Google popup, pick your account, review the permissions, and consent.

![Creating a Google connection, clicking Sign in with Google](/images/articles/make-gmail-sheets-automation/make-create-google-connection.png)

During authorization Google lists the permissions Make wants (e.g., "read and compose Gmail") — these are necessary for automation to read/write mail. Confirm it's the official Make app and consent.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Gmail permissions look scary, but think about it — if you're hiring an assistant to "read mail, sort it, log it," you have to give them a key to the mailbox. What matters is trusting the assistant (official Make) and knowing the key can be revoked anytime (Google Account → Security → third-party access).

### 🚨 Connection stuck on "Creating a connection..."?

- Make sure the Google popup actually opened (it can get blocked by the browser).
- If your Gmail is a personal account and needs more sensitive scopes, Google may require stricter verification — that's when you build your own Google Cloud project + OAuth client. That's the advanced path; see "Google Cloud: Create a Project, Enable APIs, Configure the OAuth Consent Screen."

---

## Step 4: Configure the Google Sheets write module "Add a Row"

The second module, **Google Sheets "Add a Row,"** writes data as a spreadsheet row. Click it and fill:

- **Connection**: use the Google connection you just made.
- **Search Method**: `Search by path`.
- **Drive / Spreadsheet Name / Sheet Name**: pick the drive, spreadsheet file, and sheet to write to (e.g., `Sheet1`).
- **Table contains headers**: `Yes` (your sheet's first row is column headers).

![Google Sheets Add a Row module configuration](/images/articles/make-gmail-sheets-automation/make-sheets-add-row.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: First create a Google Sheet and type your headers in row 1 (e.g., `Date`, `Sender`, `Subject`, `Body`) so Make knows which columns to fill. **Prep the sheet, then configure the module** — much smoother.

---

## Step 5: Map Gmail fields to spreadsheet columns

This is the key — and most fun — step: **field mapping**.

In the module's **"Values in columns"** area, click a column's input and Make drops down a panel listing everything the previous Gmail module can output: **Subject, From, Date, Full text, Snippet…**. Click the data you want in that column — it becomes a colored "chip" inserted into the field.

![Mapping Gmail output fields into Sheets columns](/images/articles/make-gmail-sheets-automation/make-field-mapping.png)

For example: put Gmail's **Subject** into the "Subject" column, **From** into "Sender," and **Full text** into "Body."

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Field mapping is like connecting pipes — upstream (Gmail) pours out "subject, sender, body," and you decide which stream goes to which downstream (Sheets) faucet. Connect them right and the data flows neatly into the right cells.

---

## Step 6: Done! Look at your first scenario

With both modules set, the canvas shows a complete flow: **Gmail "Watch emails" → Google Sheets "Add a Row."**

At the bottom, **"Run once"** lets you test manually (send yourself a test email, click Run once, and check whether a row appears in the sheet). Once it works, turn on the schedule at the bottom-left (e.g., "Every 15 minutes") and the automation runs on its own.

![Overview of the finished Gmail → Sheets scenario](/images/articles/make-gmail-sheets-automation/make-scenario-overview.png)

---

## Next: let AI classify for you

You now have a "new email auto-saved to a sheet" flow. But with lots of mail, just saving isn't enough — you'll want to know **is each email support? sales? spam?**

That's when to add an AI module: between Gmail and Sheets, insert an LLM to read the email, auto-tag a category, and write it in alongside. See the next article: "Auto-Classify Gmail with an LLM in Make." And for the key that module needs, see "OpenRouter Sign-Up."

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **One last nudge from the Duck**: A first automation usually snags in two places — ① **the Google connection authorization** (personal accounts hitting strict verification must take the GCP OAuth route); ② **mismatched field mapping** (rows come out empty). Test with Run once first, confirm one row lands correctly, then enable the schedule. Don't switch on automation and let a pile of wrong rows fly.
