---
title: "The Reconciliation Workflow: Two Ledgers, Matched in One Click"
description: "Bank statement against internal books, platform payouts against orders, receivables against payments — normally you compare them line by line, and you still miss things. This automation workflow lets AI do the matching and flags whatever doesn't line up. Open the interactive demo and see how it works."
contentType: "guide"
scene: "integration"
difficulty: "advanced"
createdAt: "2026-07-22"
verifiedAt: "2026-07-22"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 5
tags: ["自動化工作流", "對帳", "財務", "Claude"]
modules: []
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> This is the first piece in the "automation workflow" series. Click through the sample data first to see how it runs, then try it with your own ledgers — and if you need it running on real company data every day, there's a local-only mode described at the end.

---

## A scene you have definitely lived through at month-end

Every morning, someone in marketing copies new leads from a Google Form into the CRM one row at a time. At month-end, accounting takes over: the bank statement and the internal ledger get opened side by side in two Excel windows, and the amounts are checked line by line.

A few hundred rows in, your eyes glaze over. Miss one bank fee, misread one digit, and the books don't balance — and finding it again burns another half day.

The problem isn't that people aren't careful. It's that **not one second of this task requires judgment**: it is simply comparing two lists and finding where they disagree. That is exactly the kind of work an automation workflow should take over.

---

## What this workflow does for you

Feed it two ledgers. The AI compares them row by row and sorts the result into four buckets: **matched**, **amount mismatch**, **only in the internal ledger**, and **only in the bank statement**. Anything that matches is let through; what's left is exactly what's keeping your books from balancing — each one with a plain-language note telling you why it needs a look.

<div style="margin:28px 0;padding:24px;border:1px solid var(--color-surface-lighter);border-radius:16px;background:color-mix(in srgb,var(--color-brand) 6%,transparent);text-align:center">
  <p style="font-weight:700;font-size:18px;margin:0 0 4px">▶ Open the interactive demo</p>
  <p style="color:var(--color-text-secondary);margin:0 0 16px">Click through the sample data, or swap in your own CSV (nothing is uploaded). The demo interface is in Chinese.</p>
  <a href="/workflows/reconcile/" style="display:inline-block;background:var(--color-brand);color:#fff;font-weight:700;padding:12px 26px;border-radius:12px">Start reconciling →</a>
</div>

---

## Understand it in the cloud, run it locally

The demo above runs in the cloud, and the point of it is simply to let you see how the workflow operates. When you're ready to run it against your company's real books, the same workflow also has a **local mode** — it executes on your own machine and not a single record leaves it. We won't go into that here; for now it's enough to know that the local path exists.
