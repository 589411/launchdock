---
title: "選擇你的 AI 大腦：4 種 LLM 方案完整比較"
description: "OpenClaw 需要接上 LLM 才能運作。搞懂 ChatGPT 訂閱、OpenRouter、各家 API 的差別，選出最適合你的方案。"
contentType: "guide"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-02-25"
verifiedAt: "2026-02-25"
archived: false
order: 2
pathStep: 2
series:
  name: "新手入門"
  part: 2
prerequisites: ["why-openclaw"]
estimatedMinutes: 8
tags: ["LLM", "ChatGPT", "Claude", "Gemini", "OpenRouter", "API", "OpenClaw"]
stuckOptions:
  "LLM 是什麼": ["LLM 跟 ChatGPT 有什麼不同？", "為什麼 OpenClaw 要另外接 LLM？", "OpenClaw 本身不能回答問題嗎？"]
  "方案選擇": ["我不知道該選哪個", "哪個最便宜？", "我想先免費試用", "我已經有 ChatGPT Plus 了"]
  "費用問題": ["API 會不會不小心花很多錢？", "怎麼設定花費上限？", "Token 是什麼？"]
  "模型差異": ["GPT-4o 和 Claude Sonnet 差在哪？", "模型那麼多怎麼選？", "以後可以換嗎？"]
---
## 先搞懂一件事：OpenClaw ≠ AI

很多新手以為裝好 OpenClaw 就能開始跟 AI 對話。**不行。**

OpenClaw 是一個**框架**——它幫你管理工具、自動化流程、串接服務。但它本身不會「思考」。

你需要幫它接上一顆「大腦」，這顆大腦就是 **LLM（大型語言模型）**。

> 🧠 **簡單比喻**：OpenClaw 是一台車，LLM 是引擎。沒有引擎，車跑不動。

---

## 什麼是 LLM？

LLM 就是 ChatGPT、Claude、Gemini 背後的核心技術。它讀過海量的文字資料，學會了理解和生成語言。

你平常用的這些服務，背後都是不同公司的 LLM：

| 你用過的服務 | 背後的 LLM                   | 開發公司  |
| ------------ | ---------------------------- | --------- |
| ChatGPT      | GPT-4o、GPT-4o mini          | OpenAI    |
| Claude       | Claude Opus、Sonnet、Haiku   | Anthropic |
| Gemini       | Gemini 2.0 Flash、Gemini Pro | Google    |

OpenClaw 可以接上**任何一家**的 LLM。而且之後隨時可以換。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：ChatGPT、Claude、Gemini 就像不同品牌的引擎——Toyota、BMW、Tesla。OpenClaw 是車架，引擎可以隨你換，換了不用重新學開車。

---

## 4 種方案完整比較

### 方案總覽

| 方案                          | 月費     | 計費方式 | 難度      | 適合誰               |
| ----------------------------- | -------- | -------- | --------- | -------------------- |
| **A. Google AI Studio** | 免費起步 | 按用量   | ⭐ 簡單   | 🏆**新手首選** |
| **B. OpenRouter**       | 免費起步 | 按用量   | ⭐ 簡單   | 想試多種模型的人     |
| **C. OpenAI API**       | 按用量   | 按用量   | ⭐⭐ 中等 | 主要用 GPT 的人      |
| **D. Anthropic API**    | 按用量   | 按用量   | ⭐⭐ 中等 | 想要最好品質的人     |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **不確定？選 A（Google AI Studio）。** 免費額度最高、不需要綁信用卡，最適合先體驗。

---

### 方案 A：Google AI Studio（Gemini API）🏆 推薦新手

| 項目                 | 內容                                             |
| -------------------- | ------------------------------------------------ |
| **費用**       | 免費額度非常大（每分鐘 15 次請求），超過才收費   |
| **需要信用卡** | ❌ 不需要                                        |
| **支援模型**   | Gemini 2.0 Flash（快又便宜）、Gemini Pro（更強） |
| **Key 格式**   | `AIzaSy...` 開頭                               |

**為什麼推薦新手？**

- 免費額度夠你用好幾週
- 不需要綁信用卡，不怕帳單爆炸
- Gemini Flash 速度快、品質也不錯
- 申請過程最簡單（3 分鐘搞定）

**注意：這跟 Google Cloud Console 的 API 不一樣！**

> 🚨 **常見搞混**：Google AI Studio 是拿來用 Gemini 模型的（就像要一顆 AI 大腦）。Google Cloud Console 的 API 是用來串接 Google Drive、Gmail 這類服務的。兩者完全不同，申請方式也不同。
>
> - **Gemini AI 大腦** → 在 Google AI Studio 申請 → 這篇會教你
> - **串接 Google Drive/Gmail** → 在 Google Cloud Console 申請 → 看 [Google API Key 指南](/articles/google-api-key-guide)

---

### 方案 B：OpenRouter

| 項目                 | 內容                                                     |
| -------------------- | -------------------------------------------------------- |
| **費用**       | 註冊送少量免費額度，之後按用量收費                       |
| **需要信用卡** | 免費額度不用，充值需要                                   |
| **支援模型**   | GPT-4o、Claude Sonnet、Gemini、Llama…**全部都有** |
| **Key 格式**   | `sk-or-...` 開頭                                       |

**優點**：一把 Key 就能用幾十種模型。想試 Claude？換個模型名就好。不用分別去各家註冊。

**適合誰**：想嘗試不同模型的人、不想管理多把 Key 的人。

---

### 方案 C：OpenAI API

| 項目                 | 內容                         |
| -------------------- | ---------------------------- |
| **費用**       | 按用量計費，最低充值 $5 美元 |
| **需要信用卡** | ✅ 需要                      |
| **支援模型**   | GPT-5-mini、5.3-Codex        |
| **Key 格式**   | `sk-...` 開頭              |

**優點**：GPT 系列生態最成熟，網路上範例最多。

**注意**：API 和 ChatGPT Plus 訂閱是**分開計費**的。你有 ChatGPT Plus 不代表有 API 額度。

---

### 方案 D：Anthropic API

| 項目                 | 內容                       |
| -------------------- | -------------------------- |
| **費用**       | 首次註冊送 $5 免費額度     |
| **需要信用卡** | 免費額度不用，之後需要     |
| **支援模型**   | Claude Opus、Sonnet、Haiku |
| **Key 格式**   | `sk-ant-...` 開頭        |

**優點**：Claude 在長文理解、寫作品質、程式碼上表現特別好。很多開發者認為 Opus 是目前綜合能力最強的模型。

**適合誰**：追求最好回答品質、有寫程式需求的人。

---

## 費用到底怎麼算？

所有 API 方案都是按 **Token** 計費。Token 是 AI 處理文字的最小單位：

- 英文：大約 4 個字母 = 1 Token
- 中文：大約 1 個字 = 1-2 Token

### 實際花費參考

| 使用場景       | 大約 Token 數 | Gemini Flash 費用 | Claude Opus 費用 |
| -------------- | ------------- | ----------------- | ---------------- |
| 問一個簡單問題 | ~500          | < $0.001          | ~$0.02           |
| 整理一頁筆記   | ~2,000        | < $0.001          | ~$0.08           |
| 寫一篇完整報告 | ~5,000        | < $0.001          | ~$0.20           |
| 一天正常使用   | ~20,000       | ~$0.003           | ~$0.80           |
| 一個月正常使用 | ~600,000      | ~$0.10            | ~$24.00          |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **結論**：用便宜模型（Gemini Flash），一個月不到 $1 美元。用頂級模型（Claude Opus），一個月大約一杯咖啡到一頓午餐的價格。
>
> 想深入了解可以看 [Token 經濟學](/articles/token-economics)。

### 怎麼避免帳單爆炸？

**不會。** 每家供應商都可以設定花費上限：

- **OpenAI**：Settings → Billing → Usage limits → 設定 Hard cap
- **Anthropic**：Settings → Plans & Billing → Usage limit
- **Google AI Studio**：免費額度本身就有限制，不會自動扣錢

設定完上限後，到達上限會自動停止，不會繼續扣款。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：帳單爆炸就像吃到飽忘記設定人數上限——先設好安全門檻，超過自動鎖住，你就安心了。

---

## 模型那麼多，怎麼選？

新手先記住這個簡表就夠了：

| 你的需求             | 推薦模型                   | 原因                |
| -------------------- | -------------------------- | ------------------- |
| 先試試看，不想花錢   | Gemini 2.0 Flash           | 免費額度最大        |
| 日常問答、簡單任務   | GPT-4o mini / Gemini Flash | 便宜又快            |
| 寫報告、分析、寫程式 | Claude Sonnet / GPT-4o     | 品質最好            |
| 處理超長文件         | Gemini 1.5 Pro             | 100 萬 Token 上下文 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **以後可以換嗎？** 當然可以。OpenClaw 支援同時設定多個 Provider，隨時切換。進階設定可以看 [模型設定與切換](/articles/openclaw-model-config)。

---

## 做出你的選擇

到這裡，你應該已經決定好方案了。如果還是不確定：

- **完全新手、不想花錢** → 選 **A. Google AI Studio**
- **想多方嘗試** → 選 **B. OpenRouter**
- **已經有偏好的模型** → 選 **C 或 D**

決定好了嗎？下一步我們就去申請你的 API Key 👉 [申請 API Key](/articles/ai-api-key-guide)

---
