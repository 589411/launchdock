---
title: "Telegram 整合完整教學：讓 OpenClaw 變成你的私人 AI 助理"
description: "從 BotFather 建立機器人到串接 OpenClaw，把 Telegram 變成你隨時隨地使用 AI 的入口。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "中級"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 1
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 15
tags: ["Telegram", "Bot", "MCP", "整合"]
stuckOptions:
  "為什麼用 Telegram": ["LINE 不行嗎？", "為什麼不用 Discord？", "Telegram 在台灣不流行吧？"]
  "建立 Bot": ["BotFather 找不到", "Token 長什麼樣？", "Bot 和一般帳號有什麼不同？"]
  "連接 OpenClaw": ["MCP Server 怎麼安裝？", "Webhook URL 是什麼？", "設定完但 Bot 沒回應"]
  "進階功能": ["怎麼在群組裡用？", "可以傳圖片嗎？", "怎麼設權限只讓特定人用？"]
  "常見問題排除": ["Bot 突然不回了", "Webhook 掛了怎麼辦？", "訊息延遲很久"]
---

## 為什麼 Telegram 是最好的 AI 入口？

你已經安裝了 OpenClaw，在電腦上用得很順。但你不可能一直坐在電腦前。

**Telegram 讓你走到哪，AI 跟到哪：**

| 場景 | 你做的事 |
|---|---|
| 通勤時看到好文章 | 貼連結給 Bot → 自動整理到 [知識庫](/articles/pkm-system) |
| 臨時需要翻譯 | 傳文字給 Bot → 秒回翻譯結果 |
| 會議中想查資料 | 偷偷傳訊息給 Bot → 安靜地收到答案 |
| 睡前想到靈感 | 語音訊息給 Bot → 自動轉文字存筆記 |

### 為什麼選 Telegram 而不是 LINE？

| 特性 | Telegram | LINE |
|---|---|---|
| Bot API | 免費、無限制 | 每月 500 則免費 |
| Webhook | 原生支援 | 需要額外設定 |
| 訊息格式 | Markdown、HTML | 限制較多 |
| 群組功能 | 可當管理員 | 無 Bot 管理員 |
| API 文件 | 非常完整 | 相對陽春 |
| 開發者友善度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## Step 1：在 Telegram 建立 Bot

### 1.1 找到 BotFather

在 Telegram 搜尋 `@BotFather`（認準藍色勾勾）。

<!-- 📸 截圖建議：BotFather 的搜尋結果 -->

### 1.2 建立新 Bot

跟 BotFather 對話：

```
你：/newbot
BotFather：Alright, a new bot. How are we going to call it?
你：My OpenClaw AI（填你想要的名字）
BotFather：Good. Now let's choose a username...
你：my_openclaw_bot（結尾必須是 _bot）
BotFather：Done! ... Use this token to access the HTTP API:
         7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **那串 Token 非常重要！** 不要分享給任何人。它就像密碼一樣。

### 1.3 設定 Bot 資訊（選擇性）

```
/setdescription  → 設定 Bot 的描述
/setabouttext    → 設定「關於」文字
/setuserpic      → 設定頭像
/setcommands     → 設定指令列表
```

推薦的指令設定：

```
/setcommands
start - 開始使用
help - 使用說明
ask - 問問題
capture - 存一篇文章
status - 查看狀態
```

---

## Step 2：安裝 Telegram MCP Server

### 2.1 安裝

```bash
# 使用 npm 安裝
npm install -g @openclaw/mcp-server-telegram

# 或用 OpenClaw 內建指令
openclaw mcp install telegram
```

### 2.2 設定環境變數

在 OpenClaw 的 `.env` 中加入：

```bash
# Telegram Bot Token（Step 1 拿到的）
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 你的 Telegram User ID（限制只有你能使用）
TELEGRAM_ALLOWED_USERS=123456789
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **怎麼找到自己的 User ID？** 跟 `@userinfobot` 對話，它會告訴你。

### 2.3 設定 config.yaml

```yaml
mcp_servers:
  telegram:
    command: mcp-server-telegram
    env:
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      TELEGRAM_ALLOWED_USERS: ${TELEGRAM_ALLOWED_USERS}
    
    # 選擇連接方式
    mode: webhook  # 或 polling

    # Webhook 設定（推薦）
    webhook:
      url: "https://你的域名/telegram/webhook"
      port: 8443
    
    # Polling 設定（開發用）
    # polling:
    #   interval: 2  # 每 2 秒檢查一次
```

### Webhook vs Polling

| 方式 | 優點 | 缺點 | 適合 |
|---|---|---|---|
| **Webhook** | 即時、省資源 | 需要公網 URL + HTTPS | 正式環境 |
| **Polling** | 不需公網 URL | 有延遲、耗資源 | 本地開發 |

**開發時用 Polling，上線後改 Webhook。**

---

## Step 3：設定 AI Agent

建立一個 Telegram 專用的 Agent：

### AGENTS.md

```markdown
## Telegram Agent

你是一個 Telegram AI 助理，透過訊息與用戶互動。

### 能力
- 使用所有已安裝的 Skill
- 存取知識庫（MCP: Google Drive / Notion）
- 搜尋網路（MCP: Web Search）

### 行為規則
- 回覆要簡短（Telegram 適合短訊息）
- 長回覆用分段，每段不超過 200 字
- 用 Markdown 格式化（粗體、條列、程式碼）
- 收到連結 → 自動用 capture Skill 整理存檔
- 收到語音 → 自動轉文字 + 回覆摘要

### 安全
- 只回應 TELEGRAM_ALLOWED_USERS 的訊息
- 不執行刪除、轉帳等高風險操作
```

---

## Step 4：測試

### 4.1 啟動

```bash
# 啟動 OpenClaw（會自動連接所有 MCP Server）
openclaw start

# 確認 Telegram 已連接
openclaw mcp status
# ✅ telegram: Connected (Bot: @my_openclaw_bot)
```

### 4.2 跟 Bot 對話

打開 Telegram，找到你的 Bot，開始對話：

```
你：/start
Bot：👋 你好！我是你的 OpenClaw AI 助理。
     可以問我問題、貼連結讓我整理、或直接下指令。
     輸入 /help 看完整功能。

你：幫我整理一下 AI Agent 的最新發展趨勢
Bot：🔍 搜尋中...

     📊 AI Agent 2026 年趨勢：
     
     1. **多 Agent 協作** 成為主流
        - 不再是單一 Agent 做所有事
        - 專業分工 + 結果整合
     
     2. **MCP 協定** 快速普及
        - 工具連接標準化
        - 生態系快速擴張
     
     3. **本地部署** 需求增加
        - 隱私意識提升
        - 企業內網需求
     
     需要我深入某個主題嗎？
```

### 4.3 貼連結自動擷取

```
你：https://openai.com/blog/some-article
Bot：📰 已擷取文章：
     
     **標題：** Some Important AI Article
     **摘要：** OpenAI 發布了...
     **標籤：** #AI #OpenAI #LLM
     
     ✅ 已存入 Notion 知識庫
```

---

## 進階功能

### 群組使用

讓 Bot 加入群組，只在被 @ 或回覆時才回應：

```yaml
# config.yaml
mcp_servers:
  telegram:
    group_mode:
      trigger: mention  # 只在被 @ 時回應
      # 其他選項：always（隨時）、command（只接受 /指令）
```

### 多媒體處理

```
你：[傳一張圖片] 這張圖上寫什麼？
Bot：📷 圖片辨識結果：
     這是一張產品規格表，包含以下資訊...
```

支援：圖片（OCR + 理解）、語音（轉文字）、文件（PDF 擷取）

### 排程推送

結合 [PKM 系統](/articles/pkm-system)，讓 Bot 定時推送：

```yaml
# 每天早上 8 點推送新聞摘要
name: telegram-daily-digest
trigger:
  - schedule: "0 8 * * *"
steps:
  - action: run_skill
    skill: daily-knowledge-feed
    output: digest
  - action: mcp_call
    server: telegram
    tool: send_message
    input:
      chat_id: "{{user_telegram_id}}"
      text: "{{digest}}"
```

### 權限控制

```yaml
# 限制特定使用者
telegram:
  allowed_users:
    - 123456789  # 你自己
    - 987654321  # 你的夥伴
  
  # 或限制特定群組
  allowed_groups:
    - -100123456789  # 你的工作群組
  
  # 每人每小時限制
  rate_limit:
    messages_per_hour: 60
```

---

## 常見問題排除

### Bot 建好了但不回訊息

**檢查清單：**

1. Token 是否正確？
   ```bash
   # 測試 Token
   curl https://api.telegram.org/bot你的TOKEN/getMe
   # 應該回傳 Bot 資訊
   ```

2. OpenClaw 是否在運行？
   ```bash
   openclaw status
   ```

3. Webhook 是否設定正確？
   ```bash
   curl https://api.telegram.org/bot你的TOKEN/getWebhookInfo
   ```

4. 你的 User ID 在允許列表中嗎？

### Webhook 設定失敗

常見原因：
- URL 不是 HTTPS → 必須有 SSL 憑證
- Port 不對 → Telegram 只支援 443, 80, 88, 8443
- 防火牆擋住了 → 開放對應 port

**開發階段用 Polling 就好：**
```yaml
telegram:
  mode: polling
```

### 回覆延遲

- Polling 模式：正常有 1-3 秒延遲
- Webhook 模式：應該在 1 秒內
- 如果超過 5 秒：檢查模型回應速度，可能 AI 推理比較久

用 [更快的模型](/articles/openclaw-model-config)（如 Gemini Flash）可以減少延遲。

### Bot 被 Telegram 封鎖

- 每秒發送超過 30 則訊息會被暫時限制
- 在群組中每分鐘不超過 20 則
- 設定好 rate limit 就不用擔心

---

## 下一步

Telegram Bot 設好了，你可以：

- 📚 [建立 PKM 系統，Bot 幫你自動收集整理](/articles/pkm-system)
- 🧩 [寫 Skill 讓 Bot 執行自動化任務](/articles/openclaw-skill)
- 🔗 [用 MCP 串接更多工具](/articles/mcp-protocol)
- ⚙️ [選一個快又便宜的模型給 Bot 用](/articles/openclaw-model-config)
- 💬 [在首頁討論區分享你的 Bot 設定](/#discussion)
