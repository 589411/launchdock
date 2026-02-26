---
title: "AI 模型 API Key 申請指南：OpenAI、Anthropic、Google、OpenRouter 一次搞定"
description: "一步步教你申請 AI 模型的 API Key。不管你選哪家，照著做就能拿到讓 OpenClaw 運作的鑰匙。"
scene: "安裝與設定"
difficulty: "入門"
createdAt: "2026-02-25"
verifiedAt: "2026-02-25"
archived: false
order: 3
pathStep: 3
tags: ["API Key", "OpenAI", "Anthropic", "Google AI Studio", "OpenRouter", "Gemini", "Claude", "GPT"]
stuckOptions:
  "選哪家": ["我還沒決定要用哪家", "可以之後再加其他家嗎？"]
  "Google AI Studio": ["找不到 API Key 的按鈕", "Google AI Studio 跟 Google Cloud Console 差在哪？", "顯示地區不支援"]
  "OpenRouter": ["註冊後找不到 Key", "免費額度有多少？", "怎麼充值？"]
  "OpenAI": ["API 跟 ChatGPT Plus 是分開的嗎？", "信用卡被拒絕", "Key 建立後看不到完整內容"]
  "Anthropic": ["$5 免費額度要怎麼啟用？", "Key 格式長什麼樣？"]
  "Key 安全": ["Key 不小心公開了怎麼辦？", "可以把 Key 存在哪裡？"]
---

## 這篇要幹嘛？

上一步你已經 [選好了 LLM 方案](/articles/llm-guide)。現在要去**拿到那把鑰匙（API Key）**，讓 OpenClaw 能呼叫 AI 模型。

整個過程大約 3-10 分鐘，取決於你選的方案。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **只需要選一個就好。** 之後隨時可以加其他家。

---

## 🚨 重要觀念：API Key 就是密碼

API Key 就像你家的鑰匙。拿著它就能用你的帳號呼叫 AI——**也能花你的錢**。

**三個基本原則：**
1. **不要截圖分享** Key
2. **不要貼到公開的地方**（GitHub、論壇、聊天室）
3. **不小心外洩就立即撤銷**，然後重新申請一把

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：API Key 就是你家大門鑰匙。你不會把鑰匙拍照放 IG 吧？同樣的道理，Key 外洩就等於把家門打開，任何人都可以進去刷你的信用卡。

---

## 方案 A：Google AI Studio（推薦新手）

最簡單的方案，3 分鐘搞定，不需要信用卡。

### Step 1：前往 Google AI Studio

1. 打開瀏覽器，前往 Google AI Studio（搜尋「Google AI Studio」即可找到）
2. 用你的 Google 帳號登入

![Google AI Studio 首頁](/images/articles/ai-api-key-guide/003.png)

### Step 2：取得 API Key

1. 登入後，在左側選單找到「**Get API key**」
2. 點擊「**Create API key**」

![點擊 Get API key](/images/articles/ai-api-key-guide/005.png)

3. 選擇一個 Google Cloud 專案（如果沒有，它會自動幫你建一個）
4. 點擊「**Create API key in new project**」

![建立 API Key](/images/articles/ai-api-key-guide/006.png)

5. 你的 Key 會出現在畫面上，格式長這樣：

```
AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **複製這把 Key，存到安全的地方**（例如密碼管理器或一個私人筆記）

![API Key 建立完成](/images/articles/ai-api-key-guide/007.png)

### Step 3：驗證 Key 可以用

在 Google AI Studio 頁面上，你可以直接測試：

1. 回到主頁面
2. 在聊天框輸入「Hello」
3. 如果 AI 有回應，代表你的帳號是正常的，Key 可以用

![在 Google AI Studio 測試](/images/articles/ai-api-key-guide/008.png)

> ✅ **完成！** 你已經拿到 Gemini 的 API Key 了。跳到 [下一步：安裝 OpenClaw](/articles/install-openclaw)。

### 🚨 常見問題

**Q：顯示「Google AI Studio is not available in your region」？**

某些地區可能有限制。解決方式：
- 確認你的 Google 帳號地區設定
- 嘗試使用不同的 Google 帳號

**Q：這跟 Google Cloud Console 的 API Key 一樣嗎？**

**不一樣！** 這是兩個完全不同的東西：

| | Google AI Studio | Google Cloud Console |
|---|---|---|
| **用途** | 呼叫 Gemini AI 模型 | 串接 Google Drive / Gmail |
| **Key 格式** | `AIzaSy...` | OAuth Client ID + Secret |
| **費用** | 免費額度很大 | 要設定計費帳號 |
| **教學** | 就是這篇 | [Google API Key 指南](/articles/google-api-key-guide) |

---

## 方案 B：OpenRouter

一把 Key 就能用幾十種模型。

### Step 1：註冊帳號

1. 前往 OpenRouter 官網
2. 點「**Sign Up**」
3. 可以用 Google 帳號直接註冊

![OpenRouter 註冊頁面](/images/articles/ai-api-key-guide/016.png)

### Step 2：取得 API Key

1. 登入後，點擊右上角頭像 →「**Keys**」
2. 點擊「**Create Key**」
3. 名稱輸入 `openclaw`（或任何你喜歡的名字）
4. 點擊「**Create**」

![建立 OpenRouter API Key](/images/articles/ai-api-key-guide/017.png)

5. Key 會出現一次，格式長這樣：

```
sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **立刻複製！** 關掉這個對話框後就看不到完整 Key 了

![複製 API Key](/images/articles/ai-api-key-guide/024.png)

### Step 3：加值額度（可選）

- 免費額度可以先用來測試
- 需要更多額度：點「**Credit**」→ 選擇金額 → 付款

> ✅ **完成！** 跳到 [下一步：安裝 OpenClaw](/articles/install-openclaw)。

---

## 方案 C：OpenAI API

### Step 1：註冊 OpenAI Platform 帳號

1. 前往 OpenAI Platform（搜尋「OpenAI API」）
2. 點「**Sign up**」建立帳號（或用現有 ChatGPT 帳號登入）

![OpenAI Platform 註冊](/images/articles/ai-api-key-guide/027.png)

> ⚠️ **注意**：API 和 ChatGPT Plus 是**分開計費**的。有 ChatGPT Plus 不代表有 API 額度，要另外加值。

### Step 2：加值額度

1. 登入後，進入「**Settings**」→「**Billing**」
2. 點「**Add payment method**」加入信用卡
3. 加值至少 $5 美元

![OpenAI 加值頁面](/images/articles/ai-api-key-guide/030.png)

4. **強烈建議設定花費上限**：在 Billing → Usage limits → 設定 **Hard cap**（例如 $10 / 月）

![設定花費上限](/images/articles/ai-api-key-guide/031.png)

### Step 3：建立 API Key

1. 進入「**API keys**」頁面
2. 點「**Create new secret key**」
3. 名稱輸入 `openclaw`
4. 點「**Create secret key**」

![建立 OpenAI API Key](/images/articles/ai-api-key-guide/032.png)

5. Key 格式長這樣：

```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **立刻複製！** 這個 Key 只會顯示一次

![複製 API Key](/images/articles/ai-api-key-guide/033.png)

> ✅ **完成！** 跳到 [下一步：安裝 OpenClaw](/articles/install-openclaw)。

### 🚨 常見問題

**Q：Key 建立後忘記複製了？**

沒關係，再建一把新的就好。舊的可以刪掉。

**Q：信用卡被拒絕？**

OpenAI 不接受部分預付卡和虛擬卡。試試用一般信用卡或簽帳金融卡。

---

## 方案 D：Anthropic API

### Step 1：註冊帳號

1. 前往 Anthropic Console（搜尋「Anthropic Console」）
2. 點「**Sign Up**」
3. 用 Email 註冊，完成驗證

![Anthropic Console 註冊](/images/articles/ai-api-key-guide/047.png)

### Step 2：取得免費額度

- 新帳號會有 **$5 美元免費額度**
- 不需要綁信用卡就能使用

### Step 3：建立 API Key

1. 登入後，進入「**API Keys**」頁面
2. 點「**Create Key**」
3. 名稱輸入 `openclaw`
4. 點「**Create Key**」

![建立 Anthropic API Key](/images/articles/ai-api-key-guide/048.png)

5. Key 格式長這樣：

```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **立刻複製！**

![複製 API Key](/images/articles/ai-api-key-guide/051.png)

> ✅ **完成！** 跳到 [下一步：安裝 OpenClaw](/articles/install-openclaw)。

---

## Key 拿到了，然後呢？

你現在手上有一把 API Key。把它**安全地存好**——等你安裝完 OpenClaw 之後，會在設定精靈中用到它。

**下一步：安裝 OpenClaw → 選擇你的作業系統**

👉 [安裝 OpenClaw](/articles/install-openclaw)

---
