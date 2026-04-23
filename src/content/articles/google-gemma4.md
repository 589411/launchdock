---
title: "Google 開源神機 Gemma 4：本機可跑的多模態 AI，免費、免授權費"
description: "Google 在 2025 年 4 月開源了 Gemma 4，支援文字、圖片、音訊，可在筆電和手機本地執行。Apache 2.0 授權，商用免費。鴨編帶你看懂它的意義。"
contentType: "guide"
scene: "鴨編的碎碎念"
difficulty: "入門"
createdAt: "2026-04-23"
verifiedAt: "2026-04-23"
archived: false
order: 5
prerequisites: ["llm-guide", "ollama-openclaw-mac"]
estimatedMinutes: 10
tags: ["LLM", "Ollama", "OpenClaw", "Google", "開源"]
stuckOptions:
  "Gemma 4 跟 Gemini 差在哪": ["兩個都是 Google 的，為什麼要分開？", "Gemma 4 能做 Gemini 做的事嗎？"]
  "我的電腦能跑嗎": ["需要多少 VRAM？", "MacBook 跑得動嗎？", "沒有 GPU 可以嗎？"]
  "Apache 2.0 授權是什麼意思": ["商用也可以用嗎？", "我需要開源我的程式嗎？"]
---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 這是鴨編的第一線觀察，不是純教學。Gemma 4 出來的時候，我第一時間就下載了跑跑看。

---

## 為什麼 Gemma 4 值得注意

AI 模型領域有一條清楚的分界線：

- **閉源模型**：GPT-4o、Claude 3.7、Gemini 2.0 Ultra——能力強，但要付費、要上網、資料送到別人伺服器
- **開源模型**：Llama、Mistral、Gemma——拿到權重就能自己跑，但以前能力明顯差一截

Gemma 4 的出現，讓這條線變模糊了。

Google 在 2025 年 4 月，把一組達到商用水準的多模態模型，塞進了 Apache 2.0 開源授權裡面。

說大白話：**免費、可商用、本機可跑、支援圖片和音訊。**

---

## Gemma 4 到底是什麼

Gemma 4 是 Google DeepMind 推出的開放權重（open-weight）模型系列。

「開放權重」跟「完全開源」有點不一樣——訓練資料和完整訓練程式碼沒有公開，但**模型的權重完全公開**，你可以下載、在本機跑、商業使用、拿來做 fine-tuning。

底層架構與 Gemini 2.0 同源，但針對在消費者硬體上高效執行而做了最佳化。

---

## 四個版本，各有它的戰場

Gemma 4 有四個版本，用不同格局解決不同問題：

| 版本 | 有效參數 | 支援模態 | 最適部署環境 |
|------|---------|---------|------------|
| **E2B** | 23 億 | 文字、圖片、**音訊** | 高階手機、邊緣裝置 |
| **E4B** | 45 億 | 文字、圖片、**音訊** | 消費型 GPU（12GB VRAM 以下） |
| **26B A4B**（MoE）| 活躍 38 億 / 總計 252 億 | 文字、圖片 | 筆電、工作站 |
| **31B** | 307 億 | 文字、圖片 | 消費型 GPU（24GB VRAM） |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 「E」代表「有效參數」（Effective）——這些小模型用了一種叫 PLE（Per-Layer Embedding）的技術，讓每個詞元在每一層都有專屬的小型嵌入，大幅提升效率。總參數看起來大，但推理時的記憶體需求比總數小很多。

---

## 最讓我印象深刻的幾個特點

### 1. 原生支援音訊（E2B、E4B）

以前做「語音 → 文字 → AI 回答」這個流程，需要兩個模型：一個 ASR（自動語音辨識），一個 LLM。

Gemma 4 的 E2B 和 E4B 把這兩步合一了——音訊直接進去，文字答案出來。

支援多語言轉錄和翻譯，音訊上限 30 秒。

### 2. 內建思考模式（Thinking Mode）

所有版本都有「思考」能力——用 `<|think|>` 系統提示觸發，模型在回答之前會先產出內部推理過程。

在數學、程式、邏輯推理任務上，開啟思考模式進步非常明顯。

AIME 2026 數學競賽題：31B 版本拿到 **42.5%**，相比沒開思考模式的版本差距很大。

### 3. 超長 Context Window

- E2B / E4B：**128K tokens**（約 90,000 字）
- 26B A4B / 31B：**256K tokens**（約 180,000 字）

256K tokens 是什麼概念？大概可以塞進去：
- 一本 300 頁的書
- 一個中型軟體專案的完整程式碼
- 幾個月的會議紀錄

### 4. Apache 2.0 授權——這才是關鍵

很多「開源」模型其實授權有很多限制。Apache 2.0 是最寬鬆的授權之一：

- ✅ 可以商業使用，不需要付授權費
- ✅ 可以拿來 fine-tuning，結果不必公開
- ✅ 不強制你開源自己的程式碼
- ✅ 包含專利授權保護（對企業採用很重要）

這表示你可以用 Gemma 4 做出商業產品，不需要事先向 Google 申請，也不需要付任何費用。

---

## 跑起來需要什麼硬體？

說得直白一點：

| 你的電腦 | 可以跑哪個 |
|---------|-----------|
| 手機（高階 Android） | E2B（Google 有做最佳化） |
| MacBook（Apple Silicon） | E4B 沒問題，26B A4B 看 RAM 大小 |
| 有 RTX 3060 （12GB）的桌機 | E4B 順跑 |
| 有 RTX 4090 （24GB）的桌機 | 31B 可以跑 |
| 只有 CPU 的筆電 | E2B 理論可行，但很慢 |

**用 Ollama 最簡單**：

```bash
# 下載 Gemma 4 E4B（小版本）
ollama pull gemma4:4b

# 跑起來
ollama run gemma4:4b
```

如果你已經有 Ollama，一行指令就搞定。

---

## 跑分怎麼樣？老實說

### 強項

| 測試 | 31B 得分 | 說明 |
|------|---------|------|
| MMLU Pro（廣泛知識） | 69.4% | 跟同等級開源模型持平或更好 |
| AIME 2026（數學競賽） | 42.5% | 開啟思考模式才有的成績 |
| LiveCodeBench v6（程式） | 52.0% | 程式能力不錯 |
| MMMU Pro（視覺理解） | 52.6% | 多模態表現強 |

### 坦白說的弱點

Gemma 4 不在絕對前沿。GPT-4o、Claude 3.7、Gemini 2.0 Ultra 在最複雜的推理任務上還是勝過它。如果你需要頂尖的 agentic 能力，閉源模型還是有優勢。

但對大多數實際任務，差距比你預期的小。

---

## 什麼情況適合用 Gemma 4？

### 1. 私密資料處理
法律合約、醫療記錄、財務文件——這些資料不能送到外部 API。Gemma 4 在本機跑，資料完全不離開你的機器。

### 2. 本地 RAG 系統
把私有知識庫搭配本地 Gemma 4，完全離線問答。

### 3. 商用 fine-tuning
Apache 2.0 + 自訂資料微調 = 你專屬的垂直領域模型，不需要授權費。

### 4. 語音處理管線
E2B/E4B 直接接收音訊，省掉一個 ASR 模型，流程更簡洗。

### 5. 搭配 OpenClaw 當本地 Agent 的大腦
這是我最感興趣的用法。OpenClaw + 本地 Gemma 4 + MCP 工具，構成一個完全不依賴雲端的 AI Agent。

---

## 跟 Llama 4 比怎麼樣？

兩者都在 2025 年初發布，都是強力的開源選項：

| 比較項目 | Gemma 4 | Llama 4 |
|---------|---------|---------|
| 架構 | 密集（Dense）+ MoE | 混合 MoE |
| 音訊支援 | ✅（E2B/E4B） | ❌ |
| 授權 | Apache 2.0 | 自訂授權（有商業限制） |
| 小尺寸表現 | E4B 非常優秀 | 同等強 |
| 最適用途 | 本地部署、多模態 | 大規模服務 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> Llama 4 的授權其實比 Apache 2.0 限制多一些，企業用要注意。Gemma 4 在這點上更友善。

---

## 哪裡下載？

- **Hugging Face**：[huggingface.co/google](https://huggingface.co/google)（需接受使用條款）
- **Google AI Studio**：直接在瀏覽器裡用，不用下載
- **Ollama**：`ollama pull gemma4:4b`
- **Vertex AI**：Google 雲端，適合企業部署

---

## 鴨編的總結

Gemma 4 讓「本地跑得動的模型」這個門檻，又往前推了一大步。

不是說它比 GPT-4o 或 Claude 更強——在頂尖任務上還差一截。

但它做到了一件很重要的事：**讓能力勉強夠用的模型，變成授權完全自由、本機可跑、多模態的開放工具。**

對想做私有資料應用、想省 API 費、或是想把 AI Agent 放進本地環境的人來說，Gemma 4 現在是排名很前面的選擇。

---

## 延伸閱讀

| 主題 | 文章 |
|------|------|
| 在本機跑開源模型 | [Ollama + OpenClaw（macOS）](/articles/ollama-openclaw-mac) |
| 本地 Agent 架構 | [AI 工具全景地圖](/articles/ai-tool-landscape) |
| RAG 是什麼 | [RAG 解釋](/articles/rag-explained) |
| 哪個模型適合我 | [LLM 選擇指南](/articles/llm-guide) |
