---
title: "AI 推理技術解密：Chain-of-Thought、ReAct 與思維樹"
description: "AI 怎麼學會「想事情」？從 Chain-of-Thought 到思維樹，了解讓 AI 推理能力提升 5 倍的技術，以及 OpenClaw 如何運用它們。"
contentType: "guide"
scene: "知識與進階"
difficulty: "中級"
createdAt: "2026-02-27"
verifiedAt: "2026-02-27"
archived: false
order: 3
prerequisites: ["prompt-engineering"]
estimatedMinutes: 8
tags: ["LLM", "Prompt", "Agent", "OpenClaw"]
stuckOptions:
  "CoT 基本概念": ["跟一般 Prompt 差在哪？", "什麼時候需要用 CoT？", "是不是每次都要加「一步步思考」？"]
  "ReAct 模式": ["ReAct 跟 CoT 差在哪？", "什麼是 Observation？", "Agent 循環看不懂"]
  "進階技巧": ["Self-Consistency 是什麼？", "Tree of Thoughts 太複雜了", "這些在 OpenClaw 裡可以直接用嗎？"]
  "實際應用": ["我要怎麼在 Skill 裡用推理技術？", "什麼任務不需要 CoT？"]
---

## AI 也會「想錯」

你有沒有試過讓 AI 做數學題？

```
你：Roger 有 5 顆網球。他又買了 2 罐，每罐有 3 顆。
    他現在有幾顆網球？
AI：11 顆
```

答案是對的...但如果換個稍微複雜的問題：

```
你：一間教室有 23 個學生。有 5 個學生離開了，
    又來了 3 組新學生，每組 4 人。現在幾個學生？
AI：26 個
```

錯了。答案應該是 23 - 5 + (3×4) = 30 個。

AI 直接給答案時容易「跳過思考」，就像學生考試不寫計算過程，直覺寫答案的結果——常常出錯。

**解決方法：逼 AI 寫出計算過程。**

---

## Chain-of-Thought：讓 AI 說出思考過程

### 核心概念

2022 年 Google 的研究團隊發現：**如果在 Prompt 裡要求 AI 「一步步思考」，推理能力可以提升 3-5 倍。**

這個技術叫做 **Chain-of-Thought（CoT）**——思維鏈。

### 對照實驗

**❌ 普通問法：**
```
一間教室有 23 個學生。5 個離開了，
又來了 3 組新學生，每組 4 人。現在幾個學生？
```
AI 回答：`26 個`（錯）

**✅ CoT 問法：**
```
一間教室有 23 個學生。5 個離開了，
又來了 3 組新學生，每組 4 人。現在幾個學生？
讓我們一步步計算。
```
AI 回答：
```
讓我一步步算：
1. 原本有 23 個學生
2. 5 個離開 → 23 - 5 = 18 個
3. 來了 3 組，每組 4 人 → 3 × 4 = 12 個
4. 18 + 12 = 30 個
答案是 30 個學生。
```

✅ 正確。

### 為什麼有效？

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 比喻：你叫一個學生解數學題，他在腦子裡算了一下直接說「26」。你叫他寫下計算過程，他寫到第二步就發現自己算錯了。**寫下來的過程本身就是一種自我修正機制。**

技術上，CoT 有效是因為：
- **分解複雜問題**：一個大問題變成多個小問題，每步都是簡單問題
- **中間步驟可檢查**：錯了可以在某一步被抓到
- **利用了模型的序列生成特性**：生成的每個 Token 都會影響下一個 Token

---

## CoT 的三種用法

### 1. Zero-shot CoT：最簡單的用法

**不用給範例**，只需要加一句話：

```
[你的問題]
讓我們一步步思考。
```

或英文版：`Let's think step by step.`

就這樣。加這一句，數學和邏輯題的正確率從 **17.7%** 跳到 **78.7%**——Google 的論文數據，不是我亂講的。

### 2. Few-shot CoT：給範例

給 AI 2-3 個帶有推理過程的範例，讓它學會格式：

```
問題：小明有 3 顆蘋果，小華給了他 5 顆，他又吃了 2 顆。還剩幾顆？
思考過程：
- 原本 3 顆
- 加上 5 顆 → 3 + 5 = 8 顆
- 吃掉 2 顆 → 8 - 2 = 6 顆
答案：6 顆

問題：[你的新問題]
思考過程：
```

效果比 Zero-shot 更穩定，特別適合**你知道正確推理方式**的場景。

### 3. Self-Consistency：投票制

同一個問題，讓 AI **用 CoT 回答 5 次**，然後看哪個答案出現最多次——**多數決**。

```
回答 1：300（推理路徑 A）
回答 2：360（推理路徑 B）
回答 3：360（推理路徑 C）
回答 4：360（推理路徑 D）
回答 5：300（推理路徑 E）

投票結果：360（3/5 投票）→ 採用 360
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 比喻：不確定答案時，問 5 個人，選多數人的答案。不能保證對，但大概率比只問 1 個人好。

---

## ReAct：讓 AI 邊想邊做

### CoT 的限制

CoT 讓 AI 學會推理，但它只能在「腦子裡」想——碰到需要查資料或操作工具的任務就不行了。

> 「明天台北會不會下雨？」
> AI 用 CoT 可以推理，但它沒有天氣資料，所以只能猜。

### ReAct = Reasoning + Acting

2022 年的 ReAct 論文合併了**推理**和**行動**：

```
Thought（想法） → Action（行動） → Observation（觀察）→ Thought...
```

完整流程：

```
用戶：「明天台北會下雨嗎？幫我判斷要不要帶傘。」

[Thought] 用戶問台北天氣，我需要查天氣預報才能給準確建議
[Action]  呼叫 weather.get_forecast(city="台北", day="明天")
[Observation] API 回傳：降雨機率 80%、氣溫 18-22°C、東北風
[Thought] 降雨機率 80% 很高，應該建議帶傘。
          氣溫偏低，可以建議帶外套。
[Answer]  明天台北降雨機率 80%，建議帶傘！
          氣溫 18-22°C，東北風，也帶件薄外套比較保險。
```

### 這就是 OpenClaw Agent 的核心

**OpenClaw 的 Agent 模式就是 ReAct 循環的實現：**

1. **感知**（接收你的指令）
2. **思考**（分析需要什麼 Skill）
3. **行動**（呼叫 Skill / 工具）
4. **觀察**（接收工具回傳結果）
5. **回到思考**（判斷任務是否完成）

```
你：「幫我把今天的待辦事項整理好，發到 Telegram」

Agent 思考：需要兩個步驟——取待辦 + 發訊息
Agent 行動：呼叫 Todoist Skill → 取得今日待辦
Agent 觀察：收到 5 筆待辦事項
Agent 思考：格式化後發送到 Telegram
Agent 行動：呼叫 Telegram Skill → 發送整理好的清單
Agent 觀察：發送成功
Agent 回覆：「已經把 5 項待辦事項發到你的 Telegram 了！」
```

> 詳見 [Agent 完全指南](/articles/openclaw-agent)

---

## 進階：Tree of Thoughts（思維樹）

### 從鏈到樹

CoT 是**一條線**的思考路徑——從 A → B → C → 答案。

但有些問題沒有明確的下一步，需要**探索多條路線**：

```
Chain-of-Thought（鏈）：
A → B → C → 答案

Tree of Thoughts（樹）：
         A
       / | \
      B  C  D
     /|    / \
    E  F  G   H
    ✅     ✅
  （找到兩條可行路線，選最好的）
```

### 什麼時候需要思維樹？

| 問題類型 | 用 CoT 就好 | 需要 Tree of Thoughts |
|---------|------------|---------------------|
| 數學計算 | ✅ | |
| 翻譯 | ✅ | |
| 創意寫作 | | ✅（需要嘗試不同風格）|
| 策略規劃 | | ✅（需要比較多種方案）|
| 程式 Debug | | ✅（需要假設多個原因）|

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> OpenClaw 的蜂群智能模式就像自動化的思維樹——多個 Agent 各走不同路線，最後投票選最好的結果。詳見 [多 Agent 協作](/articles/multi-agent-swarm)。

---

## 推理技術對照表

| 技術 | 核心概念 | 適用場景 | OpenClaw 應用 |
|------|---------|---------|--------------|
| **Zero-shot CoT** | 加一句「一步步思考」 | 日常問題 | Skill 內的 Prompt |
| **Few-shot CoT** | 給 2-3 個範例 | 特定領域 | SOUL.md 範例 |
| **Self-Consistency** | 多次回答取多數 | 重要決策 | 多次執行比對 |
| **ReAct** | 推理 + 行動循環 | 需要工具的任務 | Agent 核心循環 |
| **Tree of Thoughts** | 探索多條路線 | 創意/策略 | 蜂群智能 |

---

## 實際建議：什麼時候用什麼

### 日常使用（80% 的情況）
在 Prompt 結尾加「讓我們一步步思考」就夠了。不用想太多。

### 複雜任務
讓 OpenClaw 的 Agent 模式自動處理——它內建了 ReAct 循環，你不用手動管。

### 重要決策
在 Skill 裡設計多次執行 + 比對結果的流程——這就是 Self-Consistency 思想。

---

## 延伸閱讀

- 📝 [Prompt 工程完整教學](/articles/prompt-engineering)——推理技術的基礎
- 🤖 [Agent 完全指南](/articles/openclaw-agent)——ReAct 在 OpenClaw 的實現
- 🧠 [AI 技術演進全景圖](/articles/ai-tech-evolution)——推理技術在 AI 發展中的位置
- 🐝 [多 Agent 協作與蜂群智能](/articles/multi-agent-swarm)——思維樹的群體版
