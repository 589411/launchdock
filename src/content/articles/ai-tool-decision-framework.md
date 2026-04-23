---
title: "我該用哪個 AI 工具？5 個問題讓你不再猜"
description: "工具選錯，事倍功半。用這個決策框架，5 個問題內找到最適合你任務的 AI 工具——再也不用靠感覺或 Google 亂找。"
contentType: "guide"
scene: "知識與進階"
difficulty: "入門"
createdAt: "2026-04-23"
verifiedAt: "2026-04-23"
archived: false
order: 2
prerequisites: ["ai-tool-landscape"]
estimatedMinutes: 8
tags: ["Agent", "LLM", "MCP", "OpenClaw", "Prompt"]
stuckOptions:
  "框架太抽象": ["可以給一個實際例子嗎？", "我的任務沒辦法套進去怎麼辦？"]
  "選了工具不知道怎麼用": ["哪篇文章介紹 MCP？", "OpenClaw 怎麼設定工具？"]
  "AI 判斷跟系統執行的界線": ["什麼時候該信任 AI 自己決定？", "怎麼判斷任務有沒有確定答案？"]
---

## 工具越多，選越亂

有人用 ChatGPT 做所有事。有人把 n8n 拉了一大堆流程，最後維護不來。也有人花幾個小時設定 Agent，結果發現直接 Prompt 就夠了。

問題不是哪個工具不好，而是**用錯場合**。

這篇文章給你一個決策框架：5 個問題，找到最適合的工具。

---

## 整門課最核心的一句話

在看框架之前，先記住這個原則：

> **不確定的事情 → 交給 AI 判斷**
>
> **確定的事情 → 交給系統執行**

AI 擅長在模糊情境下做判斷。系統（程式、自動化流程）擅長把確定的事情可靠地執行一千遍。

搞清楚哪些是模糊的、哪些是確定的，工具選擇就清楚了七成。

---

## 決策框架：5 個問題

### 1️⃣ 這件事需要重複做嗎？

**不需要** → 直接用 ChatGPT / Claude 聊天解決，不值得花時間設定工具。

**需要** → 繼續看下一題。

---

### 2️⃣ 流程是固定的嗎？

**固定**（每次步驟都一樣）→ 用 **n8n / Make** 或程式碼自動化。

> 例：每天早上 8 點抓一次 Google Sheets 的資料，傳到 Slack。這個流程是死的，不需要 AI 判斷，用 n8n 排程就好。

**不固定**（需要根據情況判斷） → 繼續看下一題。

---

### 3️⃣ 需要 AI 判斷嗎？

**不需要**（規則可以寫死）→ 用純自動化（程式、巨集、RPA）。

**需要**（有語意理解、分類、生成、推理的需求）→ 用 **LLM / Agent**。

> 例：幫我把這封客訴信分類成「退款」「換貨」「查詢」三類，並草擬回覆。
> → 規則寫不死，需要語意理解，用 LLM。

---

### 4️⃣ 需要操作工具或存取外部資料嗎？

**不需要**（只需要 AI 生成文字）→ 直接下 Prompt，任務在對話窗口內完成。

**需要**（查網路、讀資料庫、呼叫 API、操作系統）→ 用 **Function Call / MCP**。

> 例：「幫我查今天台幣匯率，換算成我設定的預算，然後存進 Notion。」
> → 需要查網路 + 寫入 Notion，這是工具調用，要設定 MCP 或 Function Call。

---

### 5️⃣ 需要存取你的本地或私有資料嗎？

**不需要**（資料是公開的或不敏感的）→ 雲端 AI 服務就夠了（ChatGPT、Claude API 等）。

**需要**（私人文件、工作系統、不能外傳的資料）→ 用 **OpenClaw / 本地 Agent**。

> 例：「幫我整理這三個月的所有客戶會議紀錄，找出共同的痛點。」
> → 會議紀錄是公司內部資料，不能丟上雲端，使用本地 Agent 處理。

---

## 快速對照：任務類型 → 工具

| 任務類型 | 推薦工具 |
|----------|----------|
| 一次性、不重複 | ChatGPT / Claude 直接用 |
| 重複、固定流程、不需 AI | n8n / Make / 程式 |
| 重複、需要 AI 判斷 | LLM + Prompt 模板 / Skill |
| 需要操作工具、呼叫 API | Function Call / MCP |
| 需要多步驟自主執行 | Agent（搭配 MCP） |
| 需要多個 Agent 分工 | Multi-Agent |
| 資料不可外傳 | OpenClaw / 本地 Agent |

---

## 一個完整的例子

**任務：** 每週自動整理我的 Obsidian 筆記，找出這週新增的知識點，產出一份摘要 Email 發給自己。

走一遍框架：

1. **需要重複嗎？** ✅ 每週一次
2. **流程固定嗎？** ❌ 摘要的方式不固定，需要判斷哪些是「新知識點」
3. **需要 AI 判斷嗎？** ✅ 需要語意理解
4. **需要操作工具嗎？** ✅ 需要讀取本地 Obsidian 資料夾、發送 Email
5. **需要私有資料嗎？** ✅ Obsidian 筆記在本機

**結論：** 用 **OpenClaw + MCP（Obsidian 工具 + Email 工具）**，設定 Skill 每週定時執行。

---

## 進一步學習

| 想了解 | 文章 |
|--------|------|
| 整張 AI 工具地圖 | [AI 工具全景地圖](/articles/ai-tool-landscape) |
| Prompt 技巧 | [Prompt Engineering](/articles/prompt-engineering) |
| MCP 是什麼 | [MCP 協定完整說明](/articles/mcp-protocol) |
| Agent 怎麼設定 | [OpenClaw Agent](/articles/openclaw-agent) |
| OpenClaw Skill | [Skill 技能系統](/articles/openclaw-skill) |
| n8n 整合 | 待補 |
