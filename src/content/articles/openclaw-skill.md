---
title: "OpenClaw Skill 完全指南：讓 AI 學會可重複的工作流"
description: "Skill 是 OpenClaw 的核心功能。學會寫 Skill，你的 AI 就能一鍵完成原本需要 30 分鐘的工作。"
contentType: "guide"
scene: "核心功能"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 1
prerequisites: ["openclaw-first-skill"]
estimatedMinutes: 8
tags: ["OpenClaw", "Skill", "自動化", "工作流"]
stuckOptions:
  "Skill 是什麼": ["跟其他自動化工具有什麼不同？", "需要會寫程式嗎？"]
  "基本結構": ["YAML 格式看不懂", "縮排一直出錯", "action 和 input 的關係搞不清"]
  "Action 清單": ["不知道該用哪個 Action", "找不到我需要的 Action"]
  "Email 摘要機器人": ["照著做但執行失敗", "output 沒有結果", "怎麼讓它自動執行？"]
  "進階技巧": ["條件判斷看不懂", "變數傳遞怎麼用"]
---

## Skill 是什麼？一句話解釋

**Skill = 你教 AI 做的一套固定流程。**

就像你教新同事做一項工作：先做 A，再做 B，最後做 C。Skill 就是把這個流程寫下來，讓 OpenClaw 的 Agent 可以重複執行。

---

## 為什麼需要 Skill？

你可能會想：「我直接跟 ChatGPT 講就好了，為什麼要多寫一個 Skill？」

好問題。差別在這裡：

| 直接聊天 | 使用 Skill |
|---|---|
| 每次都要重新描述 | 寫一次，永遠可用 |
| 結果不穩定（每次 prompt 可能不同）| 結果一致（流程固定）|
| 無法串接其他工具 | 可以串接 Google Drive、Notion 等 |
| 只能處理單一步驟 | 可以編排多步驟工作流 |

### 打個比方

- **直接聊天** = 每次口頭告訴助理「幫我查XX，然後整理成表格，再寄給老闆」
- **Skill** = 寫一份 SOP 給助理，以後只要說「執行每週報告」就行

---

## Skill 的基本結構

一個 Skill 由以下部分組成：

```yaml
# 📄 my-first-skill.yaml
name: "每週新聞整理"
description: "搜尋指定主題的最新新聞，整理成摘要，存到 Google Drive"

# 觸發方式
trigger:
  type: manual  # manual = 手動觸發 | schedule = 定時觸發
  # schedule: "0 9 * * 1"  # 每週一早上 9 點（cron 格式）

# 輸入參數
inputs:
  - name: topic
    type: string
    description: "要搜尋的主題"
    default: "AI 技術趨勢"

# 步驟
steps:
  - id: search
    action: web_search
    params:
      query: "{{topic}} 最新新聞 本週"
      max_results: 10

  - id: summarize
    action: llm_generate
    params:
      prompt: |
        請將以下搜尋結果整理成中文摘要：
        {{search.results}}
        
        格式要求：
        - 每則新聞一段
        - 包含標題、來源、重點摘要
        - 最後加上「本週趨勢總結」

  - id: save
    action: google_drive_create
    params:
      title: "週報_{{topic}}_{{date}}"
      content: "{{summarize.output}}"
      folder: "Weekly Reports"
```

看起來很多？別擔心，我們一步步拆解。

---

## 拆解 Skill 的每個部分

### 1. 基本資訊（name / description）

```yaml
name: "每週新聞整理"
description: "搜尋指定主題的最新新聞，整理成摘要，存到 Google Drive"
```

- `name`：Skill 的名字，之後你對 Agent 說「執行 XX」時會用到
- `description`：描述這個 Skill 做什麼，Agent 會參考這個來決定何時使用

### 2. 觸發方式（trigger）

```yaml
trigger:
  type: manual
```

| 觸發類型 | 說明 | 範例 |
|---|---|---|
| `manual` | 手動觸發 | 你說「執行每週報告」|
| `schedule` | 定時執行 | 每週一早上 9 點自動跑 |
| `event` | 事件觸發 | 收到特定 Email 時執行 |

### 3. 輸入參數（inputs）

```yaml
inputs:
  - name: topic
    type: string
    description: "要搜尋的主題"
    default: "AI 技術趨勢"
```

參數讓你的 Skill 更有彈性。同一個 Skill，你可以用不同主題執行：

- 「用 AI 技術趨勢 執行每週新聞整理」
- 「用 區塊鏈 執行每週新聞整理」

### 4. 步驟（steps）

這是 Skill 的核心。每個步驟包含：

- `id`：步驟識別碼（後續步驟可以引用）
- `action`：要執行的動作
- `params`：動作的參數

步驟之間用 `{{步驟id.output}}` 來傳遞資料，就像接力賽傳棒子。

---

## 常用的 Action 清單

| Action | 說明 | 用途 |
|---|---|---|
| `web_search` | 網路搜尋 | 搜集資料 |
| `llm_generate` | 呼叫 LLM | 摘要、翻譯、分析 |
| `google_drive_create` | 建立 Google Drive 檔案 | 儲存結果 |
| `google_drive_read` | 讀取 Google Drive 檔案 | 讀取現有資料 |
| `gmail_send` | 寄送 Email | 發送報告 |
| `gmail_read` | 讀取 Email | 抓取新信件 |
| `notion_create` | 建立 Notion 頁面 | 筆記管理 |
| `notion_query` | 查詢 Notion 資料庫 | 資料檢索 |
| `http_request` | HTTP 請求 | 呼叫任意 API |

---

## 你的第一個 Skill：Email 摘要機器人

讓我們從一個實用且簡單的 Skill 開始：

### 需求

> 每天早上把未讀 Email 整理成摘要，讓你 30 秒就知道今天有什麼重要的事。

### 完整 Skill

```yaml
name: "Email 晨間摘要"
description: "讀取未讀 Email，整理成今日重點摘要"

trigger:
  type: schedule
  schedule: "0 8 * * *"  # 每天早上 8 點

steps:
  - id: fetch_emails
    action: gmail_read
    params:
      filter: "is:unread"
      max_results: 20

  - id: summarize
    action: llm_generate
    params:
      prompt: |
        以下是今天的未讀 Email（共 {{fetch_emails.count}} 封）：
        
        {{fetch_emails.results}}
        
        請整理成以下格式：
        
        ## 🔴 需要立即處理
        （需要今天回覆或行動的 Email）
        
        ## 🟡 需要關注
        （重要但不急的 Email）
        
        ## 🟢 已知悉
        （通知類，不需要行動）
        
        每封 Email 用一行摘要就好。

  - id: notify
    action: gmail_send
    params:
      to: "me"
      subject: "📬 今日 Email 摘要 ({{date}})"
      body: "{{summarize.output}}"
```

### 這個 Skill 做了什麼？

1. **早上 8 點自動執行**
2. **讀取所有未讀 Email**（最多 20 封）
3. **用 LLM 分類整理**成「需要處理 / 需要關注 / 已知悉」
4. **把摘要寄給自己**

你只需要設定一次，以後每天早上打開信箱，第一封就是今天的摘要。

---

## 進階技巧

### 1. 條件判斷

```yaml
steps:
  - id: check
    action: llm_generate
    params:
      prompt: "這封 Email 是否包含緊急關鍵字？回答 yes 或 no"
  
  - id: alert
    action: gmail_send
    condition: "{{check.output}} == 'yes'"
    params:
      to: "me"
      subject: "⚠️ 緊急 Email 通知"
      body: "你收到一封可能緊急的 Email"
```

### 2. 迴圈處理

```yaml
steps:
  - id: process_each
    action: llm_generate
    loop: "{{fetch_emails.results}}"
    params:
      prompt: "翻譯以下 Email 內容為中文：{{item.body}}"
```

### 3. 錯誤處理

```yaml
steps:
  - id: risky_step
    action: http_request
    params:
      url: "https://api.example.com/data"
    on_error:
      action: gmail_send
      params:
        to: "me"
        subject: "Skill 執行失敗通知"
        body: "步驟 risky_step 失敗：{{error.message}}"
```

---

## 常見 Skill 範例

### 📰 產業新聞整理

搜尋 → 摘要 → 存到 Notion → Email 通知

### 📧 客戶 Email 自動分類

讀取 Email → LLM 判斷類別 → 加上 Gmail 標籤

### 📊 競品監控

搜尋競品新聞 → 與上週比較 → 產生報告

### 📝 會議記錄整理

讀取錄音/逐字稿 → 整理成重點 → 列出待辦事項 → 存到 Notion

---

## 常見問題

### Q: Skill 可以跟別人共享嗎？

可以！Skill 就是一個 YAML 檔案，你可以直接分享給別人。OpenClaw 社群也有 [Skill 市集](/#discussion) 讓大家分享自己的 Skill。

### Q: Skill 執行失敗怎麼辦？

OpenClaw 會記錄每次執行的 log。你可以在管理介面看到每個步驟的執行狀態和錯誤訊息。

### Q: 一個 Skill 最多可以有幾個步驟？

技術上沒有限制，但建議控制在 10 個步驟以內。如果流程太複雜，考慮拆成多個 Skill，再用一個「主 Skill」串接。

---

## 下一步

- 🤖 學習 [Agent：你的 AI 分身](/articles/openclaw-agent/)，讓 Agent 自動選擇和組合 Skill
- 🧠 了解 [Soul：讓 Agent 有記憶和個性](/articles/openclaw-soul/)
- 💬 [Prompt 工程：寫出更好的 Skill Prompt](/articles/prompt-engineering/)
- 🔗 [MCP 協定：讓 Skill 串接外部工具](/articles/mcp-protocol/)
- 📚 [用 Skill 建立知識管理系統](/articles/pkm-system/)
- ☁️ 還沒部署？看 [雲端部署指南](/articles/deploy-openclaw-cloud/)
