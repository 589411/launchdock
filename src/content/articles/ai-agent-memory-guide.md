---
title: "AI 的記憶腦洞大開：為什麼你的 Agent 用完就忘？"
description: "RAG 是記憶？長上下文是記憶？模型微調是記憶？當大家都在說「AI 記憶」，我們其實在說完全不同的四件事——一篇用鴨編視角把這些搞清楚的文章。"
contentType: "guide"
scene: "知識與進階"
difficulty: "中級"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 6
prerequisites: ["openclaw-agent", "rag-explained"]
estimatedMinutes: 12
tags: ["Agent", "RAG", "LLM", "Prompt Engineering", "MCP"]
stuckOptions:
  "記憶的四種類型": ["RAG 和 Agent 記憶差在哪？", "Context Engineering 是什麼？", "為什麼分這麼多種？"]
  "Forms 形式": ["Token-level 記憶怎麼理解？", "參數化記憶有什麼缺點？", "Latent 記憶是什麼？"]
  "Functions 功能": ["Factual 和 Experiential 有什麼差？", "Working Memory 是工作記憶嗎？"]
  "Dynamics 動力學": ["記憶是怎麼被建立的？", "Forgetting 忘記機制怎麼運作？", "Retrieval 跟 RAG 有什麼不同？"]
  "現況限制": ["100K context 不是很多了嗎？", "lost-in-the-middle 是什麼問題？"]
---

## 你有沒有遇過這個狀況？

你花了一個小時跟 AI 助理說清楚你的工作背景、偏好的回答風格、手上幾個專案的細節——

然後關掉視窗，隔天再打開。

全忘了。

從頭再說一遍。

這不是 bug。這是 AI 系統設計上目前最核心的限制之一。不是模型不夠強，而是**「記憶」這件事，比大家想像的難很多**。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編按：** 最近讀了一篇 102 頁的 survey 論文（Hu, Yuyang et al., "Memory in the Age of AI Agents", arXiv:2512.13564, 2025），讓我把這個問題想清楚了很多。這篇文章是我的讀後感——用比論文更白話的方式，跟你說「AI 記憶」到底是怎麼回事。

---

## 先釐清一件事：你說的「記憶」跟別人說的，根本不是同一件事

現在 AI 圈講「記憶」，至少有四種完全不同的意思，而且大家常常混著用：

| 當有人說「加入記憶功能」... | 他可能在說的是... |
|------|------|
| 「把文件丟進去讓 AI 查」 | **RAG**（檢索增強生成） |
| 「把對話歷史壓縮/管理」 | **Context Engineering**（上下文工程） |
| 「讓模型記住更多，改架構」 | **LLM 內部記憶**（長 context、KV cache） |
| 「讓 Agent 跨 session 累積經驗」 | **Agent 記憶**（真正的代理記憶） |

這四件事的目標完全不同，技術路徑也不同。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **比喻：** 這就像「交通問題」可以是「塞車」、「停車位不夠」、「沒有捷運」、「道路設計不良」——統稱「交通問題」沒有意義，你要先搞清楚是哪一種，才能找到對的解法。

論文的核心貢獻之一，就是幫大家把這個術語叢林拆乾淨。

<!-- @img: ai-memory-four-types | 四種「記憶」的比較示意圖 -->

---

## 什麼才是真正的「Agent 記憶」？

論文給出了一個清晰的定義：

> **Agent 記憶**是一個**持久、自我演進**的系統，讓 Agent 能在時間流逝中保持一致性、連貫性與適應能力。

關鍵字：**持久**（不是用完就消失）、**自我演進**（不是靜態的資料庫）。

這跟 RAG 的差別在哪？

RAG 是「你問我查」——有問題的時候去資料庫搜一下，回答完就沒了，資料庫本身不會因為這次對話而改變。

Agent 記憶是「會成長的腦子」——每次互動後，什麼值得記、記在哪、以後怎麼用，這個系統都在動態更新。

---

## 三維框架：把「記憶」拆成可工程化討論的語言

論文提出了一個 **Forms–Functions–Dynamics（形式–功能–動力學）** 的三維框架，這是全文最有價值的東西。

<!-- @img: ffd-framework-diagram | Forms-Functions-Dynamics 三維框架架構圖 -->

---

### 維度一：Forms（形式）—— 記憶存在哪裡？

記憶的「載體」有三種：

#### 🔤 Token-level 記憶（文字級記憶）

最直觀的形式：把資訊存成人看得懂的文字、JSON、知識圖譜等，放在外部資料庫。

- **優點**：可讀、可編輯、容易偵錯
- **缺點**：每次要用都得先搜一遍，有延遲；資料量大時搜尋品質下滑
- **常見架構**：平面列表 → 圖/樹狀結構 → 多層階層

這就是 RAG、MemGPT 等系統主要倚賴的記憶形式。

#### ⚙️ Parametric 記憶（參數化記憶）

直接把資訊「燒進」模型的權重裡，就像人類的肌肉記憶——不需要搜尋，直接反應。

- **實現方式**：模型微調（LoRA）、模型編輯技術（ROME、MEMIT）
- **優點**：零延遲，天生知道
- **缺點**：更新成本高；容易「災難性遺忘」（加新東西，舊東西就不見了）

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **類比：** Token-level 記憶是你的筆記本，Parametric 記憶是你的直覺反應。筆記本好查好改，直覺快但很難改。

#### 🌫️ Latent 記憶（潛在記憶）

介於兩者之間——把資訊壓縮成向量（連續的數值表示），存在 KV cache 或中間層狀態裡。

- **優點**：資訊密度高，機器處理效率好
- **缺點**：人看不懂是什麼，偵錯困難

---

### 維度二：Functions（功能）—— 記憶拿來幹嘛？

以往大家說「長期/短期記憶」，論文認為這個分法太粗糙，改用**用途**來分類：

#### 📖 Factual Memory（事實記憶）

儲存「是什麼」的宣告性知識：

- 「這位使用者叫小明，偏好用繁體中文」
- 「目前的 API Key 是 xxx，有效期到 3 月」
- 「任務目標是完成報告初稿」

用途是**維持一致性**——讓 Agent 在不同 session、不同對話裡，行為保持連貫。

#### 🛠️ Experiential Memory（經驗記憶）

儲存「怎麼做」的程序性知識，這是讓 Agent 真正「變強」的部分：

| 類型 | 說明 | 例子 |
|------|------|------|
| Case-based（案例式）| 記錄原始軌跡，供重播 | 「上次修這個 bug 的完整對話紀錄」 |
| Strategy-based（策略式）| 抽象化的工作流程與洞見 | 「遇到這類問題，先做 A 再做 B」 |
| Skill-based（技能式）| 可執行的程式碼或工具 API | 「自動生成報告的腳本」 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編認為這是最重要的分類。** 多數系統只做「事實記憶」，頂多幫 Agent 記住你是誰。但 Experiential Memory 才是讓 Agent 真正累積**能力**而不只是**資料**的關鍵——等於讓 Agent 從每次任務中學技能，而不只是更新個人資料。

#### 🎯 Working Memory（工作記憶）

當下任務執行中的暫態脈絡——就像你做數學題時「手算」的過程，任務完成就清除。

---

### 維度三：Dynamics（動力學）—— 記憶怎麼運作？

有了記憶的「形狀」和「用途」，最難的其實是**生命週期管理**：

#### Formation（形成）

記憶不是被動「存進去」，而是主動「萃取」：

- **語義摘要**：把線性對話流壓縮成核心敘述
- **結構化建構**：把互動解析成知識圖譜節點
- **關鍵事件偵測**：辨識哪些瞬間值得記錄

<!-- @img: memory-formation-process | 記憶形成流程：原始互動 → 摘要/結構化 → 儲存 -->

#### Evolution（演進）

這是「穩定性 vs. 可塑性」的難題：

- **Consolidation（鞏固）**：把零散片段合併成完整的知識模式
- **Updating（更新）**：新事實與舊記憶衝突時，如何解決矛盾
- **Forgetting（遺忘）**：主動剪枝低價值資訊，避免「垃圾堆積」

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **遺忘是功能，不是缺陷。** 記住所有東西反而讓系統變慢、雜訊增加。好的記憶系統要能聰明地「忘」——但要忘對的東西。

#### Retrieval（提取）

不只是「搜一下最相似的片段」，而是主動決策：

- **什麼時候**需要調用記憶？
- **要找什麼**才能幫助當前的推理？
- 新趨勢：**生成式提取（Generative Retrieval）**——不是查詢資料庫，而是動態合成一個「當下最適用」的記憶表示

---

## 現況到底有多難？

### 100K context 的幻覺

模型帳面上能處理 100K+ 個 Token，聽起來很猛。但實驗告訴你另一個故事：

「**Lost-in-the-middle**」效應——把關鍵資訊放在長 context 的中間，模型的回答品質會顯著下滑。有效上下文遠小於帳面數字。

### MemoryAgentBench 的殘忍現實

論文整理的 benchmark 數據顯示：當測試用的 context 從 6K tokens 拉到 32K 時，現有系統的效能會**大幅崩落**。

記憶一致性、時間推理、衝突更新——這些在 context 變長後都變得很不穩定。

### 但外部長期記憶已經看到曙光

有一個具體的好消息：MemGPT 在跨 session 記憶檢索的任務上，把正確率從 32–39% 拉到了 **67–93%**。

這個落差已經夠大，足以說明「好的外部記憶架構是值得投資的」。

<!-- @img: memgpt-accuracy-comparison | MemGPT 跨 session 記憶準確率對比圖 -->

---

## 下一個主戰場：結構化記憶

論文的結論方向很清楚：**向量 RAG 已經到達上限**。

單純把文字切片、轉向量、搜近似，對付「單跳問題」沒問題，但遇到「多跳關聯」（需要串連多個知識點推理）和「全域理解」（需要理解整份文件的架構），就力不從心了。

一批基於**知識圖譜**的新工作開始浮現：

| 系統 | 方向 |
|------|------|
| **GraphRAG** | 用圖結構組織文件，支援社群級摘要 |
| **HippoRAG 2** | 模仿海馬迴，把語義搜尋和圖索引結合 |
| **AriGraph** | 讓 Agent 自己建構和維護知識圖譜 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 這些系統的共同點：**讓記憶有結構，而不只是一堆向量**。就像同樣是「記了很多事」，有人記在 Excel 裡分欄位索引，有人把便利貼貼滿一面牆——前者搜起來快得多。

---

## 對你來說，這意味著什麼？

如果你在做 AI Agent 相關的產品或研究，這個框架有幾個直接的實用意義：

**1. 選工具時先問「我在解決哪種記憶問題？」**

- 需要查文件 → RAG 夠用
- 需要管對話長度 → Context engineering
- 需要跨 session 記住個人化資訊 → 外部 Agent 記憶
- 需要讓模型「本能」知道某個領域 → 微調

**2. 不要把「Memory」當黑盒子**

Forms–Functions–Dynamics 這組語言可以幫你在討論架構時精準溝通。「我們要加記憶功能」這句話沒有意義；「我們要加 Experiential Memory，用 Strategy-based 形式存跨任務的工作流程」才是可以動手的規格。

**3. 一致性和遺忘機制，是現在最容易被忽略的部分**

大多數 Agent 記憶的實作，都花了大量時間在「怎麼存」，卻很少想「什麼時候更新」、「什麼時候刪」。一個沒有遺忘機制的記憶系統，最終會成為一個越來越難用的雜訊堆。

---

## 延伸閱讀

- 論文原文：[Memory in the Age of AI Agents (arXiv:2512.13564)](https://arxiv.org/abs/2512.13564)
- 論文 GitHub Paper List：[Shichun-Liu/Agent-Memory-Paper-List](https://github.com/Shichun-Liu/Agent-Memory-Paper-List)
- RAG 是什麼？本站有一篇入門文章：[RAG 完整指南](/articles/rag-explained)
- 想了解 OpenClaw 怎麼做記憶？看 [Soul 系統](/articles/openclaw-soul)
