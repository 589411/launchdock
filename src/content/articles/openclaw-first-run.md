---
title: "第一次啟動 OpenClaw：設定 API Key、聽到 AI 的第一句話"
description: "安裝好了，現在讓 OpenClaw 真正動起來。跟著設定精靈完成初始化，3 分鐘內讓 AI 回應你的第一句話。"
scene: "安裝與設定"
difficulty: "入門"
createdAt: "2026-02-25"
verifiedAt: "2026-02-25"
archived: false
order: 4
pathStep: 5
tags: ["OpenClaw", "設定", "啟動", "Gateway", "API Key", "入門"]
stuckOptions:
  "啟動設定精靈": ["找不到 openclaw 指令", "出現 command not found", "精靈卡住了"]
  "輸入 API Key": ["貼上 Key 後沒有顯示", "顯示 Invalid API Key", "不確定該選哪個 Provider"]
  "選擇模型": ["模型太多不知道選哪個", "選錯了可以改嗎？"]
  "啟動 Gateway": ["Gateway 啟動失敗", "Port 被占用", "看不到控制面板"]
  "第一次對話": ["Telegram 機器人沒回應", "等超過 1 分鐘還沒回", "回應是亂碼"]
---

## 你目前的進度

到這裡，你應該已經完成了：

- ✅ [了解 OpenClaw 是什麼](/articles/why-openclaw)
- ✅ [選好 LLM 方案](/articles/llm-guide)
- ✅ [拿到 API Key](/articles/ai-api-key-guide)
- ✅ [安裝 OpenClaw](/articles/install-openclaw)

現在要做的事很簡單：**把 API Key 填進去，然後聽到 AI 的第一句話。**

---

## Step 1：啟動設定精靈

打開終端機（macOS 用 Terminal、Windows 用 WSL 或 PowerShell），輸入：

```bash
openclaw onboard --install-daemon
```

<!-- @img: onboard-start | 設定精靈啟動畫面 -->

你會看到一個互動式的設定畫面。別擔心，就照著選就好。

### 1.1 安全警告

精靈會先提醒你 OpenClaw 是一個強大的工具，它可以代替你執行操作。

- 用方向鍵選擇 **Yes**
- 按 Enter 確認

### 1.2 選擇安裝模式

選擇 **QuickStart**（新手推薦）。

它會使用安全的預設設定，之後都可以改。

<!-- @img: onboard-quickstart | 選擇 QuickStart 模式 -->

---

## Step 2：設定 LLM Provider

### 2.1 選擇 Provider

精靈會問你要用哪家 LLM。根據你上一步申請的 Key 選擇：

| 你的 Key 開頭 | 選擇 |
|---|---|
| `AIzaSy...` | Google (Gemini) |
| `sk-or-...` | OpenRouter |
| `sk-...`（沒有 ant） | OpenAI |
| `sk-ant-...` | Anthropic |

<!-- @img: onboard-provider | 選擇 LLM Provider -->

### 2.2 貼上 API Key

複製你保存的 API Key，貼到終端機裡。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **貼上去可能看不到任何字元，這是正常的！** 終端機出於安全考量不會顯示密碼類的輸入。直接按 Enter 就好。

<!-- @img: onboard-api-key | 輸入 API Key -->

### 2.3 選擇模型

精靈會列出該 Provider 支援的模型。**新手推薦：**

| Provider | 推薦模型 | 原因 |
|---|---|---|
| Google | `gemini-2.0-flash` | 免費、速度快 |
| OpenRouter | `anthropic/claude-3.5-sonnet` | 品質好、價格合理 |
| OpenAI | `gpt-4o-mini` | 便宜、速度快 |
| Anthropic | `claude-sonnet-4-5` | 平衡品質和速度 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 不用糾結太久，之後隨時可以在設定檔裡換。

<!-- @img: onboard-model | 選擇模型 -->

### 2.4 確認設定

精靈會顯示你的設定摘要。確認沒問題就按 Enter。

你應該會看到：

```
✅ Configuration saved successfully
```

如果看到紅色錯誤，最常見的原因是 Key 貼錯了。按方向鍵回去重新輸入。

---

## Step 3：設定訊息平台（Telegram）

精靈接下來會問你要用什麼平台跟 OpenClaw 對話。

**新手推薦 Telegram**——最簡單、免費、手機電腦都能用。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 如果你還不想設定平台，可以跳過這步，直接用 Web 介面（`http://localhost:18789`）跟 OpenClaw 對話。

### 3.1 建立 Telegram 機器人

1. 打開 Telegram（手機或電腦版都行）
2. 搜尋 `@BotFather`，開始對話
3. 發送 `/newbot`
4. 輸入一個名稱（例如：`My OpenClaw`）
5. 輸入一個 username（必須以 `bot` 結尾，例如：`my_openclaw_bot`）

<!-- @img: botfather-newbot | 在 BotFather 建立新機器人 -->

6. BotFather 會回覆一個 **Token**，格式像這樣：

```
123456789:ABCdefGHIjklMNOpqrSTUvwxyz
```

7. **複製這個 Token**

### 3.2 貼上 Token 到精靈

回到終端機，把 Token 貼上去，按 Enter。

<!-- @img: onboard-telegram-token | 貼上 Telegram Bot Token -->

### 3.3 配對你的帳號

1. 在 Telegram 中找到你剛建的機器人 → 按「**Start**」
2. 發送任意訊息（例如 `hello`）
3. 終端機會顯示一個配對碼

```bash
# 按照顯示的指令操作：
openclaw pairing approve telegram <配對碼>
```

<!-- @img: onboard-pairing | 配對確認 -->

---

## Step 4：啟動 Gateway

Gateway 是 OpenClaw 的核心服務，讓所有東西串在一起。

如果你在精靈中選了 `--install-daemon`，它已經自動啟動了。確認一下：

```bash
openclaw gateway status
```

你應該看到：

```
✅ Gateway is running on port 18789
```

<!-- @img: gateway-status | Gateway 運行狀態 -->

如果沒有自動啟動，手動啟動：

```bash
# 前景啟動（可以看到即時 log）
openclaw gateway start

# 或背景啟動（推薦日常使用）
openclaw gateway start --daemon
```

### 確認 Web 介面

打開瀏覽器，前往 `http://localhost:18789`

你應該看到 OpenClaw 的控制面板。

<!-- @img: gateway-web-ui | OpenClaw Web 控制面板 -->

---

## Step 5：你的第一句話 🎉

現在，最激動的時刻——

### 方式 A：用 Telegram

在你的 Telegram 機器人中發送：

```
你好，請簡單介紹一下你自己
```

等 5-10 秒（第一次可能比較慢），你應該收到 AI 的回覆！

<!-- @img: first-message-telegram | Telegram 收到 AI 的第一封回覆 -->

### 方式 B：用 Web 介面

1. 打開 `http://localhost:18789`
2. 在聊天框輸入訊息
3. 按送出

<!-- @img: first-message-web | Web 介面收到 AI 回覆 -->

> 🎉 **恭喜！** 如果你看到 AI 的回覆，代表一切都設定成功了！
>
> 你的 OpenClaw 已經可以運作了。下一步來試試更厲害的東西——
>
> 👉 [第一個 Skill：完成你的第一個自動化任務](/articles/openclaw-first-skill)
> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：第一次聽到 AI 回話的感覚怎麼樣？就像你組了一台電腦，按下電源鍵的那一刻——螢幕亮了，一切值得了。接下來要教你讓它幹活，而不只是聊天。
---

## 🚨 常見問題排查

### Gateway 啟動失敗

**「Port 18789 already in use」**

```bash
# 找到佔用的程式
sudo lsof -i :18789
# 關閉後重新啟動
openclaw gateway start
```

**「Gateway failed to start」**

```bash
# 用 doctor 指令診斷
openclaw doctor
```

它會檢查所有設定並告訴你哪裡有問題。

### API Key 相關

**「Invalid API Key」**

- Key 可能沒有複製完整，重新到供應商網站複製
- 確認 Key 沒有多餘的空格
- 如果是 OpenAI，確認帳號已加值

**「Connection timeout」**

- 檢查網路連線
- 確認你選的 Provider 沒有在維護中

### Telegram 相關

**「機器人沒有回應」**

1. 確認 Gateway 正在運行：`openclaw gateway status`
2. 確認已配對：發送過配對碼了嗎？
3. 確認 Bot Token 正確：回 BotFather 重新取得

**「等了很久才回」**

第一次回應通常需要 10-30 秒，因為模型需要「暖機」。之後的回應會快很多。如果每次都超過 1 分鐘：

- 換一個更快的模型（如 `gemini-2.0-flash`）
- 檢查網路速度

---

## 設定檔在哪裡？

如果日後要手動修改設定：

```
~/.openclaw/
├── openclaw.json    ← 主要設定檔
├── workspace/       ← 工作目錄
│   ├── USER.md      ← AI 對你的認識（可以編輯）
│   └── ...
└── logs/            ← 錯誤日誌
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 進階設定（模型路由、Fallback 機制）可以看 [模型設定與切換](/articles/openclaw-model-config)。

---
