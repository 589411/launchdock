---
title: "對帳工作流：兩份帳，一鍵對完"
description: "銀行對帳單對內部帳、平台撥款對訂單、應收對收款——本來要逐筆用眼睛比、還會漏。這條自動化工作流讓 AI 幫你比對、把對不上的直接標出來。點開互動示範，看它怎麼運作。"
contentType: "guide"
scene: "自動化工作流"
difficulty: "進階"
createdAt: "2026-07-22"
verifiedAt: "2026-07-22"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 5
tags: ["自動化工作流", "對帳", "財務", "Claude"]
modules: ["M05"]
---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 這是「自動化工作流」系列的第一條。先用範例點一遍看它怎麼運作，再換你自己的帳試——真正要天天跑在公司資料上，文末有地端版。

---

## 一個你月底一定遇過的場景

行銷部小美每天早上把 Google 表單的新客戶一筆一筆貼進 CRM；到了月底，會計換上場：把「銀行對帳單」和「公司內部帳」兩份 Excel 並排開，一列一列核對金額。

幾百筆看到眼花。漏一筆手續費、看錯一個數字，帳就兜不平——然後重找又是半天。

問題不在人不認真，而是**這件事沒有一秒需要「判斷」**：它就是把兩份清單比對、找出對不上的地方。這正是自動化工作流該接手的活。

---

## 這條工作流幫你做什麼

丟兩份帳進去，AI 逐筆比對，把結果分成四類：**相符**、**金額不符**、**只在內部帳**、**只在銀行**。對得上的放過，剩下的就是月底兜不平的元凶，並附上白話解讀告訴你每一筆為什麼要看。

<div style="margin:28px 0;padding:24px;border:1px solid var(--color-surface-lighter);border-radius:16px;background:color-mix(in srgb,var(--color-brand) 6%,transparent);text-align:center">
  <p style="font-weight:700;font-size:18px;margin:0 0 4px">▶ 開啟互動示範</p>
  <p style="color:var(--color-text-secondary);margin:0 0 16px">用範例資料點一遍，也能換你自己的 CSV 試（不上傳）。</p>
  <a href="/workflows/reconcile/" style="display:inline-block;background:var(--color-brand);color:#fff;font-weight:700;padding:12px 26px;border-radius:12px">開始對帳 →</a>
</div>

---

## 雲端看懂，地端上線

上面的示範是雲端跑給你看的，重點是先看懂這條工作流怎麼運作。真正要跑在公司真實帳務上時，同一條工作流也有**地端模式**——在你自己的電腦上執行，資料一筆都不外流。這裡先不展開，知道「工作流也有地端這條路」即可。
