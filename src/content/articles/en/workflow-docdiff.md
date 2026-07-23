---
title: "The Document Diff Workflow: Two Versions, and Exactly What Changed"
description: "A contract comes back marked up, a quote gets revised, an SOP is updated — reading clause by clause to find what moved, and what now works against you, is exhausting and easy to miss. This automation workflow compares the two versions clause by clause, marks additions, deletions and edits, and points out the risky ones. Open the interactive demo and see how it works."
contentType: "guide"
scene: "automation"
difficulty: "advanced"
createdAt: "2026-07-22"
verifiedAt: "2026-07-22"
archived: false
order: 4
prerequisites: []
estimatedMinutes: 5
tags: ["自動化工作流", "文件比對", "合約", "Claude"]
modules: ["M05"]
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Fourth piece in the "automation workflow" series, aimed at "document handling / comparison" — a pain 25 companies named. Click through the sample data first to see how it runs.

---

## Can you really read every clause they changed?

Contracts go back and forth, suppliers send a new version of the quote, the company SOP gets updated — and every time, you open both side by side and read clause by clause looking for what was touched. The nightmare case is the other side quietly dropping the late-delivery penalty from clause 7, and you signing without noticing.

Clause-by-clause comparison is mechanical work with clear rules, but missing one clause can cost you a fortune. That's exactly the kind of thing to hand to a workflow, so your attention goes to the negotiation instead.

---

## What this workflow does for you

Feed it the old version and the new one. The AI compares them clause by clause and marks each as unchanged, edited, deleted or added, lays out "before → after" for every edit, calls out specifically the changes that work against you (payment, delivery, penalties, acceptance…), and closes with a plain-language list of what you must negotiate before signing.

<div style="margin:28px 0;padding:24px;border:1px solid var(--color-surface-lighter);border-radius:16px;background:color-mix(in srgb,var(--color-brand) 6%,transparent);text-align:center">
  <p style="font-weight:700;font-size:18px;margin:0 0 4px">▶ Open the interactive demo</p>
  <p style="color:var(--color-text-secondary);margin:0 0 16px">Click through the sample contract, or paste in your own two versions (nothing is uploaded). The demo interface is in Chinese.</p>
  <a href="/workflows/docdiff/" style="display:inline-block;background:var(--color-brand);color:#fff;font-weight:700;padding:12px 26px;border-radius:12px">Compare the two versions →</a>
</div>

---

## Understand it in the cloud, run it locally

The demo above runs in the cloud, and the point of it is simply to let you see how the workflow operates. When you're ready to run it against your company's real contract documents, the same workflow also has a **local mode** — it executes on your own machine and not a single record leaves it. We won't go into that here; for now it's enough to know that the local path exists.
