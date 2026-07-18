---
title: "Ollama 雲端 API 金鑰申請：把開源模型當備援 provider"
description: "Ollama 不只是本機跑模型的工具，它也提供雲端模型與 API 金鑰。這篇教你註冊 Ollama、到 Settings 建立一把 cloud API key，之後就能在 Make、n8n 或程式裡把 Ollama 當成另一個 LLM 供應商——當你的主力 provider 掛了或限流時，多一條備援。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 2
prerequisites: []
estimatedMinutes: 6
tags: ["Ollama", "API", "申請", "LLM"]
modules: [M01]
stuckOptions:
  "註冊與登入": ["一定要用 Google 嗎？", "要手機驗證嗎？", "Ollama 不是本機跑的嗎，為什麼要登入？"]
  "建立 API Key": ["Keys 在哪裡？", "金鑰只顯示一次嗎？", "Device Keys 和 API Keys 差在哪？"]
  "拿去哪裡用": ["可以接 Make 嗎？", "和 OpenRouter 差在哪？", "雲端模型要錢嗎？"]
---

> **一句話**：到 [ollama.com](https://ollama.com) 用 Google 登入（可能要手機驗證），進 **Settings → Keys**，點 **Add API Key**、取個名字、產生，把這把 cloud API key 存好，就能在自動化工具或程式裡把 Ollama 當成另一個 LLM 供應商。

**關鍵字**：Ollama、cloud API key、API 金鑰、開源模型、備援 provider、Settings、Keys、Device Keys

---

## 等等，Ollama 不是本機跑的嗎？

沒錯，很多人認識的 Ollama 是「在自己電腦上跑開源模型」的工具（那部分見〈在 Mac 上用 Ollama 跑 OpenClaw〉）。但 Ollama 現在也有**雲端服務**：你可以用它的雲端模型，並拿一把 **cloud API key**，讓外部工具透過網路呼叫。

為什麼要這把金鑰？因為在自動化流程裡，**多一個 LLM 供應商就是多一條命**。當你的主力（例如 OpenRouter）某天限流、掛掉，你可以讓流程自動改用 Ollama 這條備援，不會整條停擺。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：LLM provider 就像手機的雙 SIM 卡——平常用一張，某天那家基地台掛了，自動切到另一張還是能通。做自動化最怕「一家掛全家死」，所以多備一把不同供應商的金鑰，是很划算的保險。

---

## Step 1：進 Ollama 官網

打開 [ollama.com](https://ollama.com)。首頁主打的是「一鍵安裝、用開源模型建置」，右上角有 **Sign in** 與 **Download**。我們要的是登入拿金鑰，點 **Sign in**。

![Ollama 首頁](/images/articles/ollama-cloud-api-key/ollama-homepage.png)

---

## Step 2：登入帳號

登入頁提供 **Email、使用 Google 繼續、使用 GitHub 繼續** 三種方式。用 **Google** 最快。

![Ollama 登入頁（Email／Google／GitHub）](/images/articles/ollama-cloud-api-key/ollama-signin.png)

### 🚨 它要我手機驗證？

第一次註冊，Ollama 可能會要你做一次**手機號碼驗證**（輸入號碼、收簡訊驗證碼）。這是防機器人的正常步驟，驗一次即可。台灣號碼記得選 **+886**。

---

## Step 3：進 Settings，找到 Keys

登入後進 **Settings**（帳號設定）。你會看到 Quickstart 頁面，左側有 **Usage / Keys / Billing / Profile** 導覽。底部的 **Cloud API access** 區塊也有 **Create API key** 的入口。

![Ollama Settings／Quickstart 頁面](/images/articles/ollama-cloud-api-key/ollama-settings.png)

點左側的 **Keys** 分頁。這裡有兩種東西，別搞混：

- **API keys**：給外部工具／程式呼叫雲端模型用的金鑰（**這篇要建的就是這個**）。
- **Device Keys**：當你在 Mac／Windows／Linux 安裝 Ollama app、或跑 `ollama signin` 時自動加上的裝置金鑰。

![Ollama Settings → Keys 分頁](/images/articles/ollama-cloud-api-key/ollama-api-keys.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：**API key** 是給「別的程式」用的通行證；**Device key** 是給「你這台電腦」用的。你要讓 Make 呼叫 Ollama 雲端，需要的是 **API key**。

---

## Step 4：建立 API Key

在 **API keys** 區點 **Add API Key**，跳出一個表單：

1. 幫金鑰取個看得懂的名字（label），例如 `make-mail-tags`——名字只是給你自己認的，跟哪個專案用，取個好認的就好。
2. 點 **Generate API Key**。

![建立 API Key，輸入名稱](/images/articles/ollama-cloud-api-key/ollama-create-key.png)

---

## Step 5：複製金鑰（只顯示一次！）

產生後，畫面會秀出完整的金鑰值，並提醒你 **「This value can be viewed only once」**（這個值只會顯示這一次）。

所以**當下就要按複製、貼到安全的地方存好**（密碼管理器或 `.env`）。關掉就再也看不到了。

![Ollama API Key 產生完成（只顯示一次）](/images/articles/ollama-cloud-api-key/ollama-key-created.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：又是「只顯示一次」——這幾乎是所有 API 服務的通則。API Key 是門禁卡，服務方不會幫你保管一份明碼（那才危險）。沒存到？別找了，刪掉重發一把就好。

### 🚨 金鑰名稱（label）不是金鑰本身

注意：你取的名字（像 `make-mail-tags`）**不是**金鑰、也不是機密，它只是標籤，方便你日後辨認「這把是幹嘛的」。真正的機密是那串 `Generate` 之後才出現、只顯示一次的長字串。

---

## 完成了！這把金鑰怎麼用？

現在你有一把 Ollama cloud API key，可以：

- 填進 **Make／n8n** 當作另一個 LLM 供應商（例如做 Gmail 自動分類時，把 Ollama 設成 OpenRouter 的**備援**）。
- 給你自己的程式呼叫 Ollama 雲端模型。

搭配 OpenRouter（見〈OpenRouter 註冊教學〉），你就有兩家不同供應商的金鑰，做自動化時互為備援，穩定度大加分。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：拿 API 金鑰的流程，你現在應該很熟了——註冊、進 Settings、Add Key、**只顯示一次立刻複製存好**。不管是 OpenRouter、Ollama 還是別家，套路都一樣。把這個反射練起來，接任何 AI 服務都不慌。
