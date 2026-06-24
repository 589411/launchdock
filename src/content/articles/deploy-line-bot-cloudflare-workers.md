---
title: "用 Cloudflare Workers 當 LINE Bot 後端：部署 Worker + 設定官方帳號 Webhook"
description: "用 Claude Code 一行指令把 Cloudflare Worker 部署上線，再到 LINE 官方帳號後台開啟 Messaging API 與 Webhook，讓你的 LINE 帳號變成 24 小時在線的 AI 機器人。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "中級"
createdAt: "2026-06-18"
verifiedAt: "2026-06-18"
archived: false
order: 2
prerequisites: ["telegram-integration"]
estimatedMinutes: 20
tags: ["LINE", "Cloudflare", "Webhook", "部署", "整合"]
stuckOptions:
  "為什麼選 Cloudflare Workers": ["跟自己架伺服器差在哪？", "免費額度夠用嗎？", "一定要會寫程式嗎？"]
  "部署 Worker": ["wrangler 是什麼？", "deploy 後的網址在哪看？", "deploy 失敗怎麼辦？"]
  "開啟 Messaging API": ["Channel secret 在哪複製？", "找不到 Messaging API 分頁", "Channel ID 跟 secret 差在哪？"]
  "設定 Webhook": ["Webhook URL 要填哪一段？", "開了 Webhook 但 Bot 不回應", "驗證一直失敗"]
  "常見問題排除": ["Bot 同時回兩則訊息", "訊息延遲很久", "改了程式要重新部署嗎？"]
---

## 為什麼用 Cloudflare Workers 當 LINE Bot 後端？

要讓 LINE 官方帳號「會自己回話」，你需要一個 **24 小時在線、收到訊息就立刻處理的後端**。傳統做法是租一台雲端主機，但對個人或小專案來說又貴又難維護。

**Cloudflare Workers 把這件事變簡單：**

| 比較項目 | Cloudflare Workers | 自架雲端主機 |
|---|---|---|
| 啟動速度 | 全球邊緣節點，毫秒級 | 要自己挑機房 |
| 費用 | 每天 10 萬次請求免費 | 最低也要月租 |
| 維護 | 不用管作業系統、不用更新 | 要自己顧 OS、安全性 |
| 部署 | 一行 `wrangler deploy` | SSH、設定一大堆 |
| 取得對外網址 | 部署完自動給你 HTTPS 網址 | 要自己設網域、憑證 |

簡單說：你只要寫好處理訊息的程式，剩下「跑在哪、會不會掛、網址怎麼來」Cloudflare 都幫你搞定。這個對外的 HTTPS 網址，正是 LINE 用來推送訊息的 **Webhook URL**。

> 💡 如果你還沒用過 Bot Webhook 的概念，建議先看 [Telegram 整合完整教學](/articles/telegram-integration)，那篇用更簡單的 BotFather 帶你跑過一次同樣的流程。

---

## 前置準備

開始前你需要：

1. 一個 **LINE 官方帳號**（在 [LINE Official Account Manager](https://manager.line.biz) 免費建立）
2. 一個 **Cloudflare 帳號**（免費方案即可）
3. 本機裝好 **Claude Code** 與 **wrangler**（Cloudflare 的命令列部署工具）
4. 一份已經寫好的 Worker 程式（負責接收 LINE 訊息、呼叫 AI、回傳結果）

整個流程分兩半：**先把後端部署上線拿到網址**，再**回 LINE 後台把網址貼上去並開啟 Webhook**。

---

## Step 1：用 Claude Code 部署 Cloudflare Worker

在你的專案目錄打開 Claude Code，請它幫你完成 Cloudflare 的設定與部署。一個完整的部署通常包含這幾件事：

1. `wrangler login`：登入你的 Cloudflare 帳號
2. 設定 KV／R2 等儲存（如果你的 Bot 需要記住對話）
3. `wrangler secret put`：把 LINE 的 Channel secret 等機密以加密方式存進去（**不要寫在程式裡**）
4. `wrangler deploy`：部署上線，完成後它會回拋一個 **Webhook URL**

![用 Claude Code 在專案目錄部署 Cloudflare Worker，準備設定 wrangler 與 LINE webhook](/images/articles/deploy-line-bot-cloudflare-workers/claude-code-deploy-worker.png)

部署成功後，終端機會印出一個類似 `https://your-worker.xxx.workers.dev` 的網址。**把它記下來**，等一下要貼到 LINE 後台。

> ⚠️ Channel secret、access token 這類機密，一律用 `wrangler secret put` 存，不要 commit 進 Git。

---

## Step 2：進入 LINE 官方帳號後台

前往 [LINE Official Account Manager](https://manager.line.biz)，登入後選擇你的官方帳號，進入主頁。右上角點「設定」。

![LINE 官方帳號管理後台主頁，右上角的設定入口](/images/articles/deploy-line-bot-cloudflare-workers/line-oa-home.png)

---

## Step 3：開啟 Messaging API，取得 Channel 資訊

在設定頁左側選單找到 **Messaging API**。這裡有三項關鍵資訊：

- **Channel ID**：頻道識別碼
- **Channel secret**：用來驗證請求來源的密鑰（就是上一步要 `wrangler secret put` 存起來的）
- **Webhook URL**：填入 Step 1 拿到的 Worker 網址

![LINE Messaging API 設定頁，顯示 Channel ID、Channel secret 與 Webhook URL 欄位](/images/articles/deploy-line-bot-cloudflare-workers/line-messaging-api.png)

把 **Webhook URL** 欄位填入你的 Worker 網址後按「儲存」。

> 🚨 **常見錯誤：secret 沒對上**
> 如果 Bot 收得到訊息卻一直回 401／驗證失敗，多半是後端存的 Channel secret 跟這裡顯示的不一致。回 Step 1 用 `wrangler secret put` 重存一次。

---

## Step 4：在「回應設定」開啟 Webhook

光填網址還不夠，要告訴 LINE「訊息交給 Webhook 處理」。到「設定 → 回應設定」，這裡有幾個開關，照下圖設定：

- **聊天**：關閉（不用真人客服聊天）
- **Webhook**：**開啟**（這是關鍵——開了 LINE 才會把訊息事件 POST 到你的 Worker）
- 自動回應訊息：可先保持開啟，下一步只關掉預設那則罐頭訊息

![回應設定頁面，聊天關閉、Webhook 開關已開啟](/images/articles/deploy-line-bot-cloudflare-workers/line-oa-webhook-toggle.png)

> 💡 **（選用）讓 Bot 能被邀進群組**：在「帳號設定 → 功能切換」可勾選「接受邀請加入群組或多人聊天室」，之後就能把 Bot 拉進群組使用。
>
> ![功能切換頁面，允許接受邀請加入群組](/images/articles/deploy-line-bot-cloudflare-workers/line-oa-group-invite.png)

---

## Step 5：關閉預設自動回應訊息

LINE 預設會有一則「罐頭」自動回應，會跟你的 Bot 搶著回話，造成使用者收到兩則訊息。把它關掉。

在「自動回應訊息」把預設那則的開關關閉。

![自動回應訊息列表，將預設的自動回應開關關閉](/images/articles/deploy-line-bot-cloudflare-workers/line-disable-auto-reply.png)

---

## 驗證結果

1. 用手機加入你的官方帳號為好友
2. 隨便傳一則訊息
3. 幾秒內收到由你的 Worker 處理後回傳的回應 —— 成功！

如果沒反應，可以用 `wrangler tail` 即時查看 Worker 的日誌，看訊息有沒有進來、哪一步出錯。

---

## 常見問題

### 🚨 Bot 同時回兩則訊息

預設自動回應沒關（見 Step 5），或回應模式還停在「聊天」而不是 Webhook（見 Step 4）。

### 🚨 改了程式，LINE 上沒變化

Cloudflare Worker 不會自動更新，每次改完都要重新 `wrangler deploy`。Webhook URL 不變，不用回 LINE 後台重設。

### 🚨 收不到任何訊息

依序檢查：Webhook 開關有沒有開（Step 4）→ Webhook URL 有沒有填對且按了儲存（Step 3）→ 用 `wrangler tail` 看請求有沒有進到 Worker。

---

## 下一步

- 想讓 Bot 記住對話脈絡？了解 [AI Agent 的記憶機制](/articles/ai-agent-memory-guide)
- 想接更多服務（行事曆、資料庫、外部 API）？看 [MCP 協定](/articles/mcp-protocol) 怎麼把工具接給 AI
