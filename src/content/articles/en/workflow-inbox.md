---
title: "The Inbox Structuring Workflow: Scattered Messages into a Tracking Table"
description: "Reading emails one by one and copying the to-dos into a list by hand? This automation workflow pulls out the counterparty, the action, the due date and the amount from your emails and messages, then builds a structured tracking table sorted by urgency. Open the interactive demo and see how it works."
contentType: "guide"
scene: "integration"
difficulty: "beginner"
createdAt: "2026-07-22"
verifiedAt: "2026-07-22"
archived: false
order: 3
prerequisites: []
estimatedMinutes: 4
tags: ["自動化工作流", "收件匣", "重複輸入", "Claude"]
modules: []
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Third piece in the "automation workflow" series, aimed at "repetitive data entry / copy-paste" — a pain 24 companies named. Click through the sample data first to see how it runs.

---

## You spend your mornings as a human transcription machine

You open the inbox and read them one by one: a manager wants a quote back, accounting reminds you about a payment, support forwards a complaint. Then you transcribe "who, what, by when" into your to-do list or a spreadsheet, one row at a time.

The worst part isn't the time — it's the **misses**. One email's deadline never made it into the list, and by the time you remember, it's already overdue. And the transcription itself needs zero seconds of your judgment.

This workflow takes over the whole read-extract-fill loop. You just look at the finished table and decide what to do first.

---

## What this workflow does for you

Feed it a batch of emails or messages. For each one the AI extracts the counterparty, the action you owe, the due date, the amount and the type, assembles them into a tracking table, and pushes anything with a hard deadline — or due this week — to the top.

<div style="margin:28px 0;padding:24px;border:1px solid var(--color-surface-lighter);border-radius:16px;background:color-mix(in srgb,var(--color-brand) 6%,transparent);text-align:center">
  <p style="font-weight:700;font-size:18px;margin:0 0 4px">▶ Open the interactive demo</p>
  <p style="color:var(--color-text-secondary);margin:0 0 16px">Click through the sample messages, or paste in a few of your own (nothing is uploaded). The demo interface is in Chinese.</p>
  <a href="/workflows/inbox/" style="display:inline-block;background:var(--color-brand);color:#fff;font-weight:700;padding:12px 26px;border-radius:12px">Build the tracking table →</a>
</div>

---

## Understand it in the cloud, run it locally

The demo above runs in the cloud, and the point of it is simply to let you see how the workflow operates. When you're ready to run it against your company's real correspondence, the same workflow also has a **local mode** — it executes on your own machine and not a single record leaves it. We won't go into that here; for now it's enough to know that the local path exists.
