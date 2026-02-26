---
title: "Token 經濟學：搞懂 AI 怎麼計費，不再帳單爆炸"
description: "什麼是 Token？各模型怎麼收費？教你精準控制 AI 使用成本，用最少的錢做最多的事。"
scene: "打破資訊孤島"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 2
tags: ["Token", "計費", "LLM", "成本控制", "AI 基礎"]
stuckOptions:
  "什麼是 Token": ["Token 和字元有什麼不同？", "中文的 Token 特別多嗎？", "為什麼不直接用字數計費？"]
  "各模型計費方式": ["OpenAI 和 Google 哪個比較便宜？", "免費額度用完怎麼辦？", "怎麼看帳單明細？"]
  "成本估算實戰": ["我一個月大概要花多少？", "超預算了怎麼辦？"]
  "省錢技巧": ["怎麼減少 Token 用量？", "模型降級會差很多嗎？", "快取是什麼意思？"]
---
## 為什麼你需要懂 Token？

你已經 [申請了 API Key](/articles/ai-api-key-guide)，開始用 OpenClaw 了。突然有一天，你收到一封帳單——

> 「本月 API 使用費：$47.82」

等等，我不是只用了幾天嗎？怎麼就快 50 美金了？

問題出在：你不知道 Token 是什麼，也不知道每次呼叫花了多少。

---

## 什麼是 Token？

**Token 是 AI 的「計量單位」，就像水電的度數。**

但 Token ≠ 字。AI 把文字切成小碎片（稱為 Token），每個碎片可能是一個字、半個字、甚至一個標點符號。

### 英文 vs 中文

```
英文：  "Hello world" → 2 tokens（每個單字 1 token）
中文：  "你好嗎？"    → 4-6 tokens（每個字可能 1-2 tokens）
```

> ⚠️ **重要：中文比英文「貴」約 1.5-2 倍**，因為中文字拆出更多 Token。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：Token 就像計程車的跳表。不是按「一趩」收費，而是每走一小段就跳一格。你說的話越多、AI 回的越長，表就跳越多。

### 實際拆法

以 OpenAI 的 tokenizer 為例：

| 文字              | Token 數 | 說明                     |
| ----------------- | -------- | ------------------------ |
| `Hello`         | 1        | 常見英文單字 = 1 token   |
| `你好`          | 2-3      | 每個中文字 ≈ 1-2 tokens |
| `OpenClaw`      | 2-3      | 不常見的複合詞會被拆開   |
| `2024年2月24日` | 5-7      | 數字+中文混合            |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **試試看**：到 [OpenAI Tokenizer](https://platform.openai.com/tokenizer) 貼上你的文字，看看實際的 Token 數量。

---

## Input Token vs Output Token

每次 AI 呼叫有兩部分費用：

```
你送出的問題 → Input Token（輸入）
AI 回覆的答案 → Output Token（輸出）
```

**Output Token 通常比 Input Token 貴 2-4 倍。**

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：為什麼輸出比輸入貴？想像你去餐廳點菜——你點一道菜（input）只需要說幾個字，但廚師要買料、洗切炒盛（output），當然廚師那邊花更多成本。

### 費用結構

```
總費用 = (Input Token × Input 單價) + (Output Token × Output 單價)
```

---

## 各模型計費方式

截至 2026 年初的主要模型價格（每百萬 Token）：

### OpenAI

| 模型        | Input 價格 | Output 價格 | 適用場景               |
| ----------- | ---------- | ----------- | ---------------------- |
| GPT-4o      | $2.50      | $10.00      | 日常對話、中等複雜任務 |
| GPT-4o mini | $0.15      | $0.60       | 簡單任務、大量呼叫     |

### Google

| 模型             | Input 價格     | Output 價格    | 適用場景   |
| ---------------- | -------------- | -------------- | ---------- |
| Gemini 2.0 Flash | 免費（有額度） | 免費（有額度） | 入門首選！ |
| Gemini 1.5 Pro   | $1.25 | $5.00  | 長文件、多模態 |            |

### Anthropic Claude

| 模型              | Input 價格 | Output 價格 | 適用場景           |
| ----------------- | ---------- | ----------- | ------------------ |
| Claude 3.7 Sonnet | $3.00      | $15.00      | 寫作、分析、程式   |
| Claude 3.5 Haiku  | $0.80      | $4.00       | 快速回覆、低成本   |
| Claude 3 Opus     | $15.00     | $75.00      | 最高品質、複雜推理 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **新手建議**：先用 **Gemini 2.0 Flash**（免費額度），等熟悉了再考慮付費模型。
> 這也是為什麼我們先教你 [申請 Google API Key](/articles/google-api-key-guide)。

---

## 成本估算實戰

### 場景 1：每天用 OpenClaw 整理新聞

假設你每天讓 Agent 做一次「新聞整理」：

- 搜尋 + 輸入：~2,000 tokens
- 整理 + 輸出：~1,500 tokens
- 模型：GPT-5 Nano

```
每天費用 = (2,000 × $0.05 / 1M) + (1,500 × $0.40 / 1M)
         = $0.0001 + $0.0006
         = $0.0007

每月費用 = $0.0007 × 30 = $0.021（不到台幣 1 元）
```

**一個月不到台幣 1 元。** 用 Nano 級模型做簡單任務極度划算。

### 場景 2：每天寫 5 篇長文

假設每篇需要大量上下文：

- 輸入：~10,000 tokens × 5
- 輸出：~3,000 tokens × 5
- 模型：Claude Sonnet 4.5

```
每天費用 = (50,000 × $3.00 / 1M) + (15,000 × $15.00 / 1M)
         = $0.15 + $0.225
         = $0.375

每月費用 = $0.375 × 30 = $11.25（約台幣 370 元）
```

如果升級到 Claude Opus 4.6 就是 ~$45/月。降到 Gemini 2.5 Flash 可以降到 ~$1.5/月。

### 場景 3：為什麼帳單爆了？

常見原因：

| 原因                          | 解法               |
| ----------------------------- | ------------------ |
| 對話太長，每次帶入全部歷史    | 限制對話記憶長度   |
| 用旗艦模型做簡單任務          | 降級到 Flash / Nano |
| Skill 出 bug 無限迴圈         | 設定 Token 上限    |
| 忘記 System Prompt 也算 Token | 精簡 System Prompt |

---

## 省錢技巧

### 1. 選對模型（最重要）

**80% 的任務用最便宜的模型就夠了。**

```
簡單問答、分類、摘要     → GPT-5 Nano / DeepSeek V3
寫文章、分析報告         → Gemini 2.5 Flash / Claude Haiku 4.5
程式碼、複雜推理         → Claude Sonnet 4.5 / GPT-4.1
超長文件（>200K tokens） → Gemini 2.5 Pro / Gemini 3.1 Pro
追求最好品質             → Claude Opus 4.6
```

在 OpenClaw 裡，你可以針對不同 Skill [設定不同的模型](/articles/openclaw-model-config)。

### 2. 精簡 System Prompt

System Prompt 每次呼叫都會送出，是「隱形成本」。

```
❌ 500 Token 的 System Prompt × 每天 100 次 = 50,000 tokens/天
✅ 100 Token 的 System Prompt × 每天 100 次 = 10,000 tokens/天
```

減少 80%！參考 [Soul 設定指南](/articles/openclaw-soul) 學習如何寫精簡有效的人設。

### 3. 善用快取（Caching）

OpenAI 和 Anthropic 都支援 Prompt Caching：

- 重複的前綴部分只算一次
- 可以省下 50-80% 的 Input Token 費用
- OpenClaw 內建支援，不需額外設定

### 4. 限制輸出長度

在 Skill 裡加上 `max_tokens` 限制：

```yaml
# 在 Skill 設定中
config:
  max_tokens: 500  # 最多產生 500 token 的回覆
```

### 5. 設定預算警報

在 OpenAI Dashboard：

1. Settings → Billing → Usage limits
2. 設定 Hard limit（硬上限）和 Soft limit（警報線）

建議設定：

- Soft limit: $5（提醒你）
- Hard limit: $20（強制停止）

---

## OpenClaw 怎麼幫你省錢？

OpenClaw 內建幾個省錢機制：

1. **模型路由**：根據任務複雜度自動選模型（在[模型設定](/articles/openclaw-model-config)中配置）
2. **Agent 記憶壓縮**：不會把全部歷史傳送，只保留重要部分
3. **Skill 快取**：相同輸入不重複呼叫
4. **Token 預算**：每個 Skill 可設上限

---

## 常見問題

### 免費額度用完了怎麼辦？

- Google Gemini Flash 每天有免費配額（通常足夠個人使用）
- OpenAI 新帳號有 $5 免費額度（用來試手感）
- 用完就需要儲值，建議先充 $10 試試

### 我一個月預算只有 100 台幣

完全夠用！用 GPT-5 Nano（$0.05/$0.40）或 DeepSeek V3（$0.27/$1.10），一般使用每月不到 $1 美金。如果用 OpenRouter 的免費模型（每日 200 次），幾乎不花錢。

### Token 會過期嗎？

Token 不是儲值，是用多少算多少。你的 API 額度不會過期（除非是限時優惠）。

---

## 下一步

了解 Token 後，你可以：

- 🔑 [申請 API Key 開始使用](/articles/ai-api-key-guide)
- ⚙️ [設定模型切換策略](/articles/openclaw-model-config)
- 🧩 [寫 Skill 時設定 Token 預算](/articles/openclaw-skill)
- 💬 [Prompt 工程：用更少 Token 得到更好結果](/articles/prompt-engineering)
