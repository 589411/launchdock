---
title: "OpenRouter 註冊教學：一把金鑰接遍所有大模型（含免費模型）"
description: "OpenRouter 是一個「一個 API 接遍所有大模型」的 LLM 閘道，用 Google 帳號幾分鐘就能註冊、拿到一把 API Key，還有一堆免費模型可以用。這篇帶你從首頁註冊、選帳號類型、拿到金鑰，到怎麼找免費模型——之後串 Make、n8n、OpenClaw 或自己的程式都用得上。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 7
tags: ["OpenRouter", "API", "申請", "LLM"]
stuckOptions:
  "註冊與登入": ["一定要用 Google 嗎？", "Individual 和 Organization 選哪個？", "要先綁信用卡嗎？"]
  "拿 API Key": ["金鑰只顯示一次是什麼意思？", "金鑰不小心關掉了怎麼辦？", "金鑰要放哪裡才安全？"]
  "選模型": ["哪些是免費的？", "免費模型和付費差在哪？", "model 名稱要怎麼填？"]
---

> **一句話**：到 [openrouter.ai](https://openrouter.ai) 點 Sign Up、用 Google 登入、選 Individual、在 Keys 頁面產生一把 API Key（**只會完整顯示一次，當下要複製存好**），之後任何工具只要填這把金鑰，就能呼叫 GPT、Claude、Gemini、Llama 等各家模型，還有一票標著 `(free)` 的免費模型。

**關鍵字**：OpenRouter、API Key、金鑰、LLM 閘道、免費模型、free、Gemma、Individual、Sign in with Google、模型路由

---

## OpenRouter 是什麼？為什麼要有它？

想像你要串接 AI 模型，但市面上有 OpenAI、Anthropic、Google、Meta… 每一家的 API 格式、帳號、計費都不一樣。要一家一家申請、一家一家串，很煩。

**OpenRouter** 就是來解決這件事的——它是一個 **LLM 閘道（Gateway）**：你只跟 OpenRouter 拿一把 API Key，就能透過同一個介面呼叫 **400+ 個模型、70+ 家供應商**。要換模型？改一個字串就好，不用重新申請帳號。而且它上面有一票免費模型，練習、做小專案完全夠用。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：OpenRouter 就像一張「跨電信門號」——以前你打中華要中華的卡、打台哥大要台哥大的卡，現在一張卡打遍所有電信。想換供應商？不用換卡，撥號前面加個代碼就好。這裡的「代碼」就是模型名稱（像 `google/gemma-4`）。

![OpenRouter 首頁：One API for Any Model](/images/articles/openrouter-free-llm-api-key/openrouter-homepage.png)

---

## Step 1：到官網點 Sign Up

打開 [openrouter.ai](https://openrouter.ai)，首頁右上角有紫色的 **Sign Up**，中間 hero 區也有 **Get API Key** 按鈕。點任一個開始。

---

## Step 2：選登入方式（推薦 Google）

會跳出 **「Sign in to OpenRouter」** 卡片，提供 GitHub、Google 等 SSO 圖示，也可以用 Email + 密碼。用 **Google** 最快——點 Google 圖示，選你的 Google 帳號、同意授權即可。

![OpenRouter 登入卡片，多種登入方式](/images/articles/openrouter-free-llm-api-key/openrouter-signin.png)

第一次註冊還會有一張 **Legal consent**（同意服務條款）的勾選頁，勾一勾、點 Continue 就好。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：用 Google 登入等於拿你的 Google 帳號當門禁卡，OpenRouter 只拿到你的名字和 email，拿不到你的密碼。省下再設一組密碼的麻煩。

---

## Step 3：選帳號類型 Individual

進入 onboarding，OpenRouter 會問你 **「How will you be using OpenRouter?」**，兩個選項：

- **Individual**：做個人專案、探索模型、寫原型 ← 個人用選這個
- **Organization**：跟團隊協作、集中管理用量

自己玩、學習、做小工具，選 **Individual** 就對了。

![OpenRouter onboarding：選 Individual 或 Organization](/images/articles/openrouter-free-llm-api-key/openrouter-onboarding.png)

接著可能會問你「從哪裡認識 OpenRouter」——隨便選（例如 YouTube）點 Continue 即可，不影響功能。

![OpenRouter 問卷：從哪裡認識我們](/images/articles/openrouter-free-llm-api-key/openrouter-survey.png)

### 🚨 它要我綁信用卡／填帳單地址，一定要嗎？

註冊過程可能會出現「Add a payment method / 填帳單地址」的步驟，但通常有一個 **「I'll do this later」（稍後再說）** 的連結。**免費模型不需要綁卡**——想先用免費的練手，直接點稍後再說，跳過付款設定即可。等你要用付費模型再回來綁。

---

## Step 4：完成設定，進 Dashboard

看到 **「You're all set!」** 就代表帳號建好了。點 **Go to Dashboard**（或 Read the Docs 看文件）。

![OpenRouter：You're all set 完成畫面](/images/articles/openrouter-free-llm-api-key/openrouter-all-set.png)

---

## Step 5：產生你的 API Key（只顯示一次！）

到 **Keys**（API Keys）頁面，產生一把新的金鑰。畫面會秀出一段 `sk-or-v1-...` 開頭的字串，旁邊有複製鈕。

**這裡最重要的一句話**：畫面通常會提醒你 —— *「This is the only time your full key will be shown」*（這是唯一一次顯示完整金鑰）。所以**當下就要按複製、把它貼到安全的地方存好**（例如密碼管理器、或你的 `.env` 檔）。關掉這個畫面就再也看不到完整金鑰了。

![OpenRouter API Key 產生畫面（金鑰只完整顯示一次）](/images/articles/openrouter-free-llm-api-key/openrouter-api-key.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：API Key 就像你家的門禁卡。沒有卡你進不了門，別人拿到你的卡就能進你家。所以千萬別把 API Key 貼到公開的地方（GitHub、聊天室、截圖）！這也是為什麼本文的截圖把金鑰塗掉了。

### 🚨 金鑰不小心關掉、沒存到怎麼辦？

別慌，也別想辦法「找回」——找不回來的。直接**刪掉舊的、重新產生一把**新金鑰即可。金鑰本來就可以隨時作廢重發，這也是好習慣：懷疑外洩就馬上換一把。

---

## Step 6：認識免費模型

OpenRouter 上很多模型名稱後面標著 **`(free)`**，這些是**免費**的（有速率限制，但練習綽綽有餘）。當你在工具裡（例如 Make、n8n）選 OpenRouter 模型時，可以直接搜 `free` 篩出免費模型，例如 **`Google: Gemma 4 26B A4B (free)`**。

![OpenRouter 免費模型清單（搜尋 free 篩選）](/images/articles/openrouter-free-llm-api-key/openrouter-free-models.png)

模型名稱的格式是 **`供應商/模型`**，例如 `google/gemma-4`、`anthropic/claude-opus-4.6`。填模型時照這個格式寫就好。

![選定一個免費模型（Gemma 4 free）](/images/articles/openrouter-free-llm-api-key/openrouter-model-selected.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：免費模型就像試吃——夠你判斷合不合胃口、能不能做你要的事。等你的專案真的要上線、要穩定要快，再升級到付費模型（像 Claude、GPT）。先用免費的把流程跑通，是最省錢的學習法。

---

## 完成了！這把金鑰能拿去哪用？

現在你手上有一把 OpenRouter API Key 了，它能餵給幾乎任何支援自訂 LLM 的工具：

- **Make／n8n** 這類自動化平台（例如做「Gmail 進來自動用 AI 分類」）
- **OpenClaw** 等 AI Agent 框架
- 你自己寫的 Python／JavaScript 程式

一把金鑰，接遍所有模型。之後要換模型、比性價比，都不用重辦帳號。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：註冊很簡單，真正要記牢的只有兩件事——① **金鑰只顯示一次，當下複製存好**；② **金鑰是門禁卡，別外洩、懷疑外洩就重發**。把這兩件事養成反射，你用任何 API 服務都不會出包。
