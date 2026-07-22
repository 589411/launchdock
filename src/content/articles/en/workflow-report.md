---
title: "The Reporting Workflow: Turn Numbers into a Dashboard in One Click"
description: "Every week and every month you pull the data by hand, paste it into Excel, work out the period-over-period change, build a chart, then squint at it looking for what went wrong. This automation workflow computes the metrics, finds the trend, flags the outliers and draws the dashboard for you. Open the interactive demo and see how it works."
contentType: "guide"
scene: "integration"
difficulty: "intermediate"
createdAt: "2026-07-22"
verifiedAt: "2026-07-22"
archived: false
order: 2
prerequisites: []
estimatedMinutes: 5
tags: ["自動化工作流", "報表", "數據分析", "Claude"]
modules: []
---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Second piece in the "automation workflow" series. This is the pain companies name most often — 32 out of 90 are stuck on reporting and data analysis. Click through the sample data first to see how it runs.

---

## The pain everyone who builds reports knows

Every weekly or monthly report, you export the data out of some system, paste it into Excel, work out the period-over-period change, build a bar chart, then squint at it hunting for the month that dropped or the line that looks off. One report, one or two hours gone.

The thing is — **none of those steps needs your judgment**. Totals, deltas, highs and lows, flagging the periods that fell further than usual: all of it is mechanical work with clear rules. What actually needs you is the decision that comes *after* you spot the anomaly: why it dropped, and what to do about it.

This workflow takes over that whole mechanical stretch and leaves your time for the judgment at the end.

---

## What this workflow does for you

Feed it one raw data file. The AI computes totals and period-over-period changes in one pass, finds the highs and lows, flags periods that dropped unusually far or hit a new high, and draws it as a bar chart — then tells you in plain language what this data says and what's worth chasing.

<div style="margin:28px 0;padding:24px;border:1px solid var(--color-surface-lighter);border-radius:16px;background:color-mix(in srgb,var(--color-brand) 6%,transparent);text-align:center">
  <p style="font-weight:700;font-size:18px;margin:0 0 4px">▶ Open the interactive demo</p>
  <p style="color:var(--color-text-secondary);margin:0 0 16px">Click through the sample data, or swap in your own CSV (nothing is uploaded). The demo interface is in Chinese.</p>
  <a href="/workflows/report/" style="display:inline-block;background:var(--color-brand);color:#fff;font-weight:700;padding:12px 26px;border-radius:12px">Generate the report →</a>
</div>

---

## Understand it in the cloud, run it locally

The demo above runs in the cloud, and the point of it is simply to let you see how the workflow operates. When you're ready to run it against your company's real operating data, the same workflow also has a **local mode** — it executes on your own machine and not a single record leaves it. We won't go into that here; for now it's enough to know that the local path exists.
