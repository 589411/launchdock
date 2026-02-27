---
title: "AI 技術演進全景圖：從 Transformer 到蜂群智能，一次看懂"
description: "2017 年一篇論文改變了世界。用 10 分鐘了解 AI/LLM 的技術發展脈絡，搞懂 OpenClaw 背後的所有技術為什麼存在。"
contentType: "guide"
scene: "認識 OpenClaw"
difficulty: "入門"
createdAt: "2026-02-27"
verifiedAt: "2026-02-27"
archived: false
order: 3
prerequisites: ["why-openclaw"]
estimatedMinutes: 10
tags: ["LLM", "OpenClaw", "Agent", "MCP"]
stuckOptions:
  "Transformer 架構": ["Self-Attention 到底在幹嘛？", "為什麼 Transformer 比 RNN 好？", "這些名詞記不住怎麼辦？"]
  "GPT 演進": ["GPT-1 到 GPT-4 差在哪？", "什麼是湧現能力？", "參數量跟智慧有什麼關係？"]
  "Agent 時代": ["Agent 跟 Chatbot 到底差在哪？", "為什麼 2023 年突然爆發？"]
  "技術跟我有什麼關係": ["我不是工程師，需要懂這些嗎？", "知道這些對我使用 OpenClaw 有幫助嗎？"]
---

## 為什麼要了解 AI 技術演進？

你可能在想：「我只是想用 OpenClaw，幹嘛要知道 Transformer？」

好問題。你不需要會修汽車引擎才能開車。但如果你知道：

- 引擎大 = 馬力大 = 適合爬山
- 油電混合 = 省油 = 適合通勤

你就能**選到最適合你的車**。

理解 AI 技術演進也一樣。知道每項技術「解決什麼問題」，你用 OpenClaw 的時候會知道：

- 為什麼不同模型價格差 10 倍？
- 為什麼 Agent 比 Chatbot 強？
- 為什麼 OpenClaw 的 Skill 系統這麼設計？

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **放心**，不會有數學公式。我們用比喻說人話。

---

## 技術演進時間軸

先看全貌，細節後面解釋：

```
2017 ── Transformer 架構 ← 一切的起點
  │
2018 ── GPT-1（1.17 億參數）
  │
2019 ── GPT-2（15 億參數）
  │
2020 ── GPT-3（1750 億參數）、Prompt Engineering
  │
2022 ── ChatGPT、Chain-of-Thought、ReAct
  │
2023 ── GPT-4、Function Calling、RAG、Agent 概念爆發
  │
2024 ── Multi-Agent、MCP 協定、Skill 生態系統
  │
2025 ── Swarm Intelligence（蜂群智能）
  │
2026 ── OpenClaw 整合全部能力，個人 AI 助理普及 ← 你在這裡
```

每一步都是在解決「上一步做不到的事」。接下來我們逐段看。

---

## 第一章：一切的起點——Transformer（2017）

### 一篇改變世界的論文

2017 年，Google 的研究員發了一篇論文：*《Attention Is All You Need》*。

這篇論文提出了 **Transformer 架構**——今天所有 AI 大模型（GPT、Claude、Gemini）的基礎。

### Self-Attention 是什麼？

用一個例子：

> 「**她**把**球**丟給了**他**，然後**他**把**球**接住了。」

人類讀這句話，天生知道第二個「他」跟第一個「他」是同一個人，「球」也是同一顆球。

但電腦不行。以前的 AI（RNN/LSTM）像逐字閱讀的人——讀到句尾時已經忘了句首。

**Self-Attention 讓 AI 可以同時看到整個句子裡每個詞跟其他詞的關係。**

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 比喻：RNN 像一個人用手指一個字一個字讀。Transformer 像一個人把整頁攤開，眼睛同時掃全文。哪個讀得好？當然是看全文的。

### 三大核心創新

| 創新 | 解決什麼問題 | 比喻 |
|------|-------------|------|
| **Self-Attention** | 理解詞與詞的關係 | 鳥瞰全文而非逐字閱讀 |
| **平行計算** | 訓練速度太慢 | 100 人同時閱卷，而非 1 人改完才換下一個 |
| **位置編碼** | 模型不知道詞的順序 | 給每個詞一個座號，讓 AI 知道誰在前誰在後 |

---

## 第二章：GPT 的進化——從玩具到天才（2018-2023）

### 參數量 = 大腦容量

GPT 的全名是 *Generative Pre-trained Transformer*——用 Transformer 架構做的生成式預訓練模型。

它的進化路線，就是一路「變大」：

| 版本 | 發布年 | 參數量 | 核心突破 |
|------|--------|-------|---------|
| GPT-1 | 2018 | **1.17 億** | 證明「先大量閱讀，再學特定任務」的路線可行 |
| GPT-2 | 2019 | **15 億** | 「零樣本學習」——沒教過的任務也能做 |
| GPT-3 | 2020 | **1750 億** | 「湧現能力」——突然表現出類似理解的行為 |
| GPT-4 | 2023 | **未公開** | 多模態（看圖＋文字）、推理能力大幅提升 |

### 什麼是「湧現能力」？

這是 AI 領域最神奇的現象：

> 模型從「笨」到「聰明」不是漸進的，而是在某個規模突然跳躍。

就像：
- 100 隻螞蟻 → 只是一堆蟲
- 10,000 隻螞蟻 → 突然建出精密蟻穴

GPT-3 在 1750 億參數時，突然會做翻譯、寫程式、回答邏輯問題——但這些**從來沒有人教過它**。研究者到現在還沒完全搞懂為什麼。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 這就是為什麼 AI 領域的人老說「scaling law」——把模型做大，可能就會出現新能力。有點像煉丹。

---

## 第三章：學會「怎麼問」——Prompt Engineering（2020）

當 GPT-3 出現後，人們發現一個有趣的事：

**同一個模型，問法不同，結果差 10 倍。**

```
❌ "幫我寫一封信"
→ 泛泛的模板，還要改 80%

✅ "你是一位資深HR。請用專業但溫暖的語氣，
    寫一封 300 字的辭職信。感謝公司栽培，
    但因個人職涯規劃決定離開。"
→ 直接能用的成品
```

這引發了 **Prompt Engineering**（提示工程）的研究。

### Prompt 的四代演進

| 代 | 做法 | 效果 |
|----|------|------|
| 第一代 | 直接提問 | 隨機 |
| 第二代 | 角色設定（「你是...」） | 好很多 |
| 第三代 | 結構化（角色 + 任務 + 格式 + 限制） | 穩定 |
| 第四代 | Chain-of-Thought（「讓我們一步步思考...」） | 推理大幅提升 |

> 想深入學 Prompt？看 [Prompt 工程完整教學](/articles/prompt-engineering)。

**在 OpenClaw 中**：`SOUL.md` 就是你的「超級 System Prompt」——定義 Agent 的角色、性格、行為準則。寫好 SOUL，等於幫你的 AI 做好第三代 Prompt。

---

## 第四章：Context Window——AI 的短期記憶

### 為什麼 AI 會忘記你剛才說的？

AI 模型有一個「記憶限制」，叫做 **Context Window**（上下文窗口）。就像人的工作記憶容量——同時最多記得 7±2 個東西。

Context Window 的演進：

| 年份 | 模型 | Context Window | 相當於 |
|------|------|---------------|-------|
| 2020 | GPT-3 | 2,048 tokens | 約 1,500 字 |
| 2022 | GPT-3.5 | 4,096 tokens | 約 3,000 字 |
| 2023 | GPT-4 | 128K tokens | 約一本小說 |
| 2024 | Claude 3 | 200K tokens | 約兩本小說 |
| 2025 | Gemini 1.5 | 1M+ tokens | 約十本小說 |

### 但上下文窗口不能解決所有問題

窗口再大也有極限。而且窗口越大：
- **成本越高**（按 Token 計費）
- **注意力越分散**（模型可能忽略中間內容）

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 比喻：Context Window 像桌面大小。桌子再大，文件放太多還是會找不到。你需要的其實是一個**抽屜系統**——要用的時候再拿出來。

**這就是為什麼 OpenClaw 有 Memory 系統**——不把所有東西塞進窗口，而是用類似搜尋的方式，把相關記憶「檢索」出來，只放你需要的進去。

> 詳見 [RAG 技術解密](/articles/rag-explained)

---

## 第五章：學會推理——Chain-of-Thought（2022）

### 直接給答案 vs 說出思考過程

2022 年的一篇論文發現：**如果讓 AI「說出想法」，推理能力提升 3-5 倍。**

```
❌ 直接問：「Roger 有 5 顆網球。他又買了 2 罐，
   每罐有 3 顆。他現在有幾顆？」
AI 回答：「11」（錯）

✅ CoT 問法：「...讓我們一步步計算」
AI 回答：
   Roger 原本有 5 顆
   他買了 2 罐，每罐 3 顆 → 2×3 = 6 顆
   總共 5 + 6 = 11 顆  ← 對了
```

### ReAct：讓 AI 不只「想」，還會「做」

Chain-of-Thought 讓 AI 學會推理。**ReAct** 更進一步——讓 AI 在推理的同時可以**呼叫工具**。

```
你：「明天台北會下雨嗎？」

AI 思考：我需要查天氣預報
AI 行動：呼叫天氣 API → 查詢台北天氣
AI 觀察：API 回傳降雨機率 80%
AI 思考：根據數據，明天很可能下雨
AI 回覆：「明天台北降雨機率 80%，建議帶傘！」
```

**這個循環就是 OpenClaw Agent 的核心運作方式。**

> 想更深入了解推理技術？看 [AI 推理技術解密](/articles/cot-and-reasoning)

---

## 第六章：工具使用——Function Calling 與 RAG（2023）

### Function Calling：AI 學會「動手做事」

2023 年之前，AI 只能「說」。  
2023 年之後，AI 學會「做」。

**Function Calling** 讓 AI 可以主動呼叫外部工具：

```
用戶需求 → AI 分析 → 決定呼叫哪個工具
                        ↓
                   執行工具（查天氣/發信/存檔...）
                        ↓
                   收到結果 → 組織成回覆
```

**在 OpenClaw 中**：每個 **Skill** 就是一組工具。AI 根據你的指令自動選擇要用哪個 Skill。

> 詳見 [Skill 完全指南](/articles/openclaw-skill)

### RAG：讓 AI 不再胡說八道

AI 有兩大問題：
1. **知識有截止日期**——它不知道昨天發生的事
2. **會幻覺**——不會的也硬掰

**RAG**（Retrieval-Augmented Generation）解決了這個問題：先從你的資料庫搜尋相關內容，再讓 AI 基於**真實資料**回答。

```
你的問題 → 搜尋你的檔案/筆記 → 找到相關資料
               ↓
        把資料塞進 Prompt → AI 基於事實回答
```

**在 OpenClaw 中**：Memory 系統的 QMD 後端就是 RAG 的實現——你的長期記憶會被向量化，需要時自動檢索。

> 詳見 [RAG 技術入門](/articles/rag-explained)

---

## 第七章：Agent 時代來臨（2023-2024）

結合了推理（CoT）、行動（ReAct）、工具（Function Calling），2023 年 **AI Agent** 的概念正式爆發。

### Agent vs Chatbot

| 特徵 | Chatbot | Agent |
|------|---------|-------|
| 互動方式 | 你問一句，我答一句 | 你給目標，我自主完成 |
| 工具使用 | ❌ 不能 | ✅ 主動呼叫 |
| 規劃能力 | ❌ 無 | ✅ 自動拆解任務 |
| 記憶 | ❌ 對話結束就忘 | ✅ 長期記憶 |

**OpenClaw 的核心定位：個人 AI Agent 平台。**

### 標準化：MCP 協定（2024）

Agent 需要連接各種工具，但每個工具的接口都不同——這很痛苦。

**MCP**（Model Context Protocol）解決了這個問題，就像 USB-C 統一了所有接口。

```
AI Agent ←→ MCP 協定 ←→ Slack / Gmail / GitHub / Notion / ...
```

> 詳見 [MCP 協定完整介紹](/articles/mcp-protocol)

---

## 第八章：蜂群智能——AI 的未來（2025-2026）

### 從「一個 Agent」到「一群 Agent」

2024 年出現了 **Multi-Agent**（多代理）系統。
2025 年更進一步——**Swarm Intelligence**（蜂群智能）。

靈感來自自然界：一隻蜜蜂不聰明，但一整群蜜蜂可以建出精密的蜂巢。

```
你的任務：「規劃一趟日本自由行」

蜂群分工：
├── 🗾 路線規劃 Agent ×3（各自用不同策略）
├── 🏨 住宿搜尋 Agent ×3（各找不同平台）
├── 🍜 美食推薦 Agent ×3（各有不同偏好）
├── 🚄 交通安排 Agent ×2
└── 💰 預算優化 Agent ×2

→ 各自完成 → 交叉驗證 → 投票 → 整合為最佳方案
```

優勢：
- **多角度思考**：避免單一 Agent 的偏見
- **並行加速**：同時處理，而非排隊等候
- **容錯性**：一個 Agent 掛了，其他照跑

**在 OpenClaw 中的應用**：`AGENTS.md` 可以定義多個專業角色協作。

> 想深入了解？看 [多 Agent 協作與蜂群智能](/articles/multi-agent-swarm)

---

## 全技術棧：OpenClaw 整合了什麼

```
┌─────────────────────────────────────────────────────┐
│                OpenClaw 技術棧                       │
├─────────────────────────────────────────────────────┤
│  應用層  Skills（天氣、郵件、日曆...）               │
│          ↓                                          │
│  協定層  MCP（統一接口標準）                         │
│          ↓                                          │
│  智能層  Agent（感知→思考→行動→觀察）               │
│          ↓                                          │
│  推理層  CoT + Prompt Engineering                   │
│          ↓                                          │
│  模型層  GPT / Claude / Gemini（Transformer 架構）  │
│          ↓                                          │
│  基礎層  Tokenize + Embedding + Attention           │
└─────────────────────────────────────────────────────┘
```

| 技術概念 | OpenClaw 的實現 |
|---------|----------------|
| Transformer/GPT | 支援多種 LLM 後端 |
| Prompt Engineering | SOUL.md 系統角色定義 |
| Context Window | Memory 長期記憶系統 |
| Chain-of-Thought | 複雜任務自動拆解 |
| ReAct | Agent 執行循環 |
| Function Calling | Skills 工具呼叫 |
| RAG | QMD 記憶後端檢索 |
| MCP | 內建 MCP 協定支援 |
| Multi-Agent | AGENTS.md 多角色設定 |
| Swarm | 多 Agent 協作模式 |

---

## 學了這些，下一步？

你不需要記住每個技術的細節。重要的是理解**它們解決什麼問題**。

### 建議的學習順序

1. 🟢 **先搞懂 Prompt**——你每天都會用（[Prompt 工程](/articles/prompt-engineering)）
2. 🟢 **再學 Agent 和 Skill**——OpenClaw 核心（[Agent 指南](/articles/openclaw-agent)、[Skill 指南](/articles/openclaw-skill)）
3. 🟡 **進階 MCP**——擴充能力（[MCP 協定](/articles/mcp-protocol)）
4. 🟡 **理解 RAG 和推理**——解鎖深度功能（[RAG 技術](/articles/rag-explained)、[推理技術](/articles/cot-and-reasoning)）
5. 🔴 **探索蜂群智能**——未來趨勢（[多 Agent 協作](/articles/multi-agent-swarm)）

---

## 延伸閱讀

- 🧭 [為什麼你需要 OpenClaw](/articles/why-openclaw)
- 💰 [Token 經濟學：搞懂 AI 怎麼計費](/articles/token-economics)
- 🧠 [選擇你的 AI 大腦](/articles/llm-guide)
