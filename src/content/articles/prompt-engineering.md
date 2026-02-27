---
title: "Prompt 工程：讓 AI 聽懂你的話，給出你要的答案"
description: "掌握 Prompt 的核心技巧，從角色設定到思維鏈，讓同一個模型的回答品質提升 10 倍。"
contentType: "guide"
scene: "知識與進階"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 1
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 10
tags: ["Prompt", "LLM"]
stuckOptions:
  "為什麼 Prompt 重要": ["隨便問不行嗎？", "AI 不是應該很聰明嗎？"]
  "Prompt 的基本結構": ["角色、任務、格式怎麼分？", "每次都要寫一大串嗎？"]
  "五大技巧": ["Few-shot 是什麼？", "思維鏈看不懂", "什麼時候該用哪個技巧？"]
  "在 OpenClaw 中應用": ["Agent 的 System Prompt 怎麼寫？", "Skill 裡怎麼用 Prompt 技巧？"]
  "常見陷阱": ["AI 一直幻覺怎麼辦？", "回答太長或太短", "怎麼讓 AI 承認不知道？"]
---

## 為什麼「怎麼問」比「問什麼」重要？

同一個問題，不同問法，結果天差地別：

**❌ 普通問法：**
```
幫我寫一封信
```
→ AI 回了一封泛泛的範本，你還是得改 80%。

**✅ 好的問法：**
```
你是一位資深行銷經理。請幫我寫一封給客戶的年度合作回顧信。
- 語氣：專業但溫暖
- 長度：300 字以內
- 必須包含：今年合作成果數據、明年展望、感謝語
- 格式：分段，每段有小標題
```
→ AI 直接給出可以用的成品。

差別在哪？就是 **Prompt 工程**。

---

## Prompt 的基本結構

一個好的 Prompt 有四個部分（不是每次都需要全部）：

```
┌─────────────────────────────────────┐
│ 1. 角色（Role）                      │
│    你是一位資深行銷經理               │
├─────────────────────────────────────┤
│ 2. 任務（Task）                      │
│    幫我寫一封年度回顧信               │
├─────────────────────────────────────┤
│ 3. 約束（Constraints）               │
│    300 字、專業語氣、分段             │
├─────────────────────────────────────┤
│ 4. 格式（Format）                    │
│    Markdown、表格、JSON...           │
└─────────────────────────────────────┘
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：寫 Prompt 就像寫點餐單。你跟服務生說「給我好吃的」，他不知道要上什麼菜。但你說「不辣的、一飯一肉一湯、台幣 200 以內」——菜馬上就對了。

### 1. 角色設定

告訴 AI「你是誰」，可以顯著提升回答品質。

```
你是一位有 10 年經驗的 Python 工程師。
你是一位專門寫給小學生看的科普作家。
你是一位嚴格的程式碼審查者。
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 角色設定跟 OpenClaw 的 [Soul 人設](/articles/openclaw-soul) 概念完全相同。

### 2. 明確的任務描述

不要含糊。越具體，結果越好。

```
❌ 「幫我整理一下」
✅ 「把以下 10 個重點，按重要性排序，整理成表格，欄位包含：重點摘要、相關人、截止日期」
```

### 3. 約束條件

限制 AI 的發揮空間，反而能得到更好的結果。

```
- 回答限制在 200 字以內
- 使用繁體中文
- 不要使用「首先」「其次」「最後」這類過渡詞
- 如果不確定，直接說「我不確定」而不是猜測
```

### 4. 輸出格式

指定你要的格式，AI 就不會亂來。

```
請以以下 JSON 格式回答：
{
  "summary": "簡短摘要",
  "key_points": ["重點1", "重點2"],
  "action_items": ["待辦1", "待辦2"]
}
```

---

## 五大 Prompt 技巧

### 技巧 1：Zero-shot（直接問）

最簡單的方式，適合簡單任務。

```
把以下句子翻譯成英文：「今天天氣很好」
```

### 技巧 2：Few-shot（給範例）

給 AI 幾個範例，讓它理解你要的「模式」。

```
請根據以下範例格式，幫我分類新的客訴：

範例 1：
客訴：「訂單遲到了三天」→ 分類：物流問題，緊急度：中
客訴：「產品收到就壞了」→ 分類：品質問題，緊急度：高

新客訴：「網站一直當機無法下單」→
```

AI 會學到格式，回答：`分類：技術問題，緊急度：高`

> 🔑 **Few-shot 是 OpenClaw Skill 的核心技巧。** 在 [Skill YAML](/articles/openclaw-skill) 裡用 `examples` 欄位定義範例。

### 技巧 3：Chain of Thought / CoT（思維鏈）

讓 AI 「想出來」，而不是一步到位。

```
❌ 「小明有 5 顆蘋果，給了小華 2 顆，又買了 3 顆，總共幾顆？」

✅ 「小明有 5 顆蘋果，給了小華 2 顆，又買了 3 顆，總共幾顆？
   請一步一步推理，列出每一步的計算過程。」
```

思維鏈對複雜推理任務特別有效，準確率可以提升 20-40%。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：CoT 就像考數學時老師要求你「寫出計算過程」。直接寫答案容易粗心，但一步步寫出來反而不會算錯。AI 也是一樣——你叫它慢慢想，它反而比較聰明。

### 技巧 4：Role Play（角色扮演）

讓 AI 從特定視角回答。

```
你即將面試 Google 的軟體工程師職位。
我是面試官，會問你技術問題。
請以真實面試的態度回答，可以思考後再回答，也可以說不確定。
```

### 技巧 5：Self-Consistency（自我一致性）

讓 AI 回答 3 次，取最一致的答案。

```
請用三種不同的方式解決這個問題，然後比較三種方式的結果，
選出你最有信心的答案。
```

---

## 在 OpenClaw 中應用 Prompt 技巧

### System Prompt = Agent 的「靈魂」

OpenClaw 的 [Soul 設定](/articles/openclaw-soul) 就是長期的 System Prompt：

```markdown
# SOUL.md
你是一位專注於行銷分析的 AI 助理。
- 回答時永遠附上數據來源
- 使用繁體中文
- 不確定時主動詢問而非猜測
```

### Skill Prompt = 任務的「SOP」

在 [Skill](/articles/openclaw-skill) 裡，你的 Prompt 就是工作流的指令：

```yaml
name: weekly-news-summary
steps:
  - action: llm_generate
    input:
      prompt: |
        你是一位資深科技記者。
        請將以下新聞整理成表格，包含：
        - 標題
        - 一句話摘要
        - 影響程度（高/中/低）
        
        新聞內容：
        {{news_content}}
      model: gpt-4o-mini
      max_tokens: 800
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **省錢提醒**：精簡 Prompt 可以顯著降低 [Token 成本](/articles/token-economics)。每少 100 token，每天 100 次就省 10,000 tokens。

### Agent Prompt = 決策的「指南針」

[Agent](/articles/openclaw-agent) 的 Prompt 決定它如何思考和選擇 Skill：

```markdown
# AGENTS.md - 行銷分析 Agent
你擁有以下工具：
1. 新聞搜尋 Skill
2. 數據分析 Skill
3. 報告生成 Skill

決策原則：
- 先搜集資料，再分析
- 數據不足時主動搜尋補充
- 報告完成後自動寄信
```

---

## 常見陷阱與解法

### 陷阱 1：AI 幻覺（胡說八道）

AI 會很有自信地說出錯誤的事實。

**解法：**
```
如果你不確定答案，請明確說「我不確定」而不是猜測。
對於事實性問題，請附上你的依據。
```

### 陷阱 2：回答太長

AI 傾向冗長回答。

**解法：**
```
請在 3 句話以內回答。
用條列而非段落。
不需要重複我的問題。
```

### 陷阱 3：語氣不對

預設語氣可能太正式或太隨意。

**解法：**
```
語氣：像朋友聊天一樣，用「你」而非「您」。
避免使用「首先」「接下來」「總結來說」等過渡詞。
```

### 陷阱 4：忘了上下文

長對話中 AI 會忘記前面講的。

**解法：**
- 重要資訊在 Prompt 開頭（AI 對開頭記憶最好）
- 用 OpenClaw 的 [Agent 記憶系統](/articles/openclaw-agent) 自動管理上下文
- 關鍵資訊用 `<重要>` 標籤包住突出

---

## Prompt 模板庫

以下是幾個可以直接套用的模板：

### 摘要模板

```
請將以下內容整理成結構化摘要：

## 規則
- 先列出 3-5 個關鍵發現
- 每個發現用一句話描述
- 最後給一個 50 字以內的總結
- 標記任何需要後續處理的事項

## 內容
{{paste_content_here}}
```

### 會議紀錄模板

```
你是一位專業的會議記錄員。請將以下會議逐字稿整理成會議紀錄。

## 格式要求
- 日期與出席者
- 議題列表
- 每個議題的討論重點（條列）
- 決議事項
- 待辦事項（表格：事項 / 負責人 / 截止日）

## 逐字稿
{{meeting_transcript}}
```

### 程式除錯模板

```
我遇到了一個 bug，請幫我分析。

## 程式語言：{{language}}
## 錯誤訊息：
{{error_message}}

## 相關程式碼：
{{code}}

## 請依序回答：
1. 這個錯誤的根本原因是什麼？
2. 如何修復？（給出具體程式碼）
3. 如何避免未來再犯？
```

---

## 常見問題

### 每次都要寫這麼長的 Prompt 嗎？

不用。把常用的 Prompt 存成 OpenClaw 的 [Skill](/articles/openclaw-skill)，以後一句話啟動就好。這就是 Prompt 工程的終極目標：**寫一次，重複用**。

### Prompt 技巧適用所有模型嗎？

基本上是的。角色設定、Few-shot、CoT 在所有主流模型上都有效。但不同模型對格式指令的遵循程度不同，可能需要微調。選模型可以參考 [模型設定指南](/articles/openclaw-model-config)。

### 有推薦的學習資源嗎？

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- 或直接在 OpenClaw 裡實驗——每個 Skill 就是一次 Prompt 練習

---

## 下一步

掌握了 Prompt 技巧，你可以：

- 🧩 [用 Skill 把好的 Prompt 變成自動化流程](/articles/openclaw-skill)
- 🤖 [寫出好的 Agent 決策 Prompt](/articles/openclaw-agent)
- 👻 [讓 AI 的人設更精準：Soul 設定](/articles/openclaw-soul)
- 💰 [用更少 Token 達到同樣效果](/articles/token-economics)
- 🔗 [了解 MCP 協定：AI 怎麼接上外部工具](/articles/mcp-protocol)
