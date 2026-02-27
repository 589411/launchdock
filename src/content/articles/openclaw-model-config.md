---
title: "模型設定與切換：讓 OpenClaw 自動選最適合的 AI 模型"
description: "不同任務用不同模型。學會設定 Provider、模型路由和 Fallback 機制，又省錢又高效。"
contentType: "tutorial"
scene: "基礎使用"
difficulty: "中級"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 3
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 10
tags: ["OpenClaw", "模型", "GPT", "Gemini", "Claude", "設定"]
stuckOptions:
  "為什麼要切換模型": ["一個模型用到底不行嗎？", "模型之間真的差很多嗎？"]
  "Provider 設定": ["API Key 填在哪裡？", "env 變數怎麼設？", "測試連線失敗"]
  "模型路由配置": ["routing 的 pattern 怎麼寫？", "Skill 裡怎麼指定模型？"]
  "Fallback 機制": ["什麼時候會觸發 Fallback？", "Fallback 的順序怎麼設？"]
  "進階策略": ["成本預算怎麼算？", "模型效果怎麼比較？"]
---

## 一個模型打天下？不太行

你可能一直在用 GPT-4o（或 Gemini Flash）處理所有任務。大部分時候這沒問題。

但試試看這些情境：

| 情境 | 用 GPT-4o | 更好的選擇 |
|---|---|---|
| 簡單分類、格式轉換 | 殺雞用牛刀，浪費 Token | GPT-4o mini（便宜 20 倍）|
| 複雜數學推理 | 有時會算錯 | o1（專門做推理）|
| 超長文件（10萬字）| 遇到上下文限制 | Gemini 1.5 Pro（100 萬 Token 窗口）|
| API 掛了 | 整個系統停擺 | 自動切到 Claude（Fallback）|

**模型切換不是進階功能，是省錢和穩定的基本功。**

---

## Provider 設定

### 什麼是 Provider？

Provider = AI 模型的「供應商」。

```
OpenAI    → GPT-4o, GPT-4o mini, o1
Google    → Gemini 2.0 Flash, Gemini 1.5 Pro
Anthropic → Claude 3.5 Sonnet, Claude 3 Haiku
```

### 設定 API Key

在 OpenClaw 的 `.env` 檔案中設定各 Provider 的 Key：

```bash
# 至少設定一個
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 還沒有 API Key？先看 [AI 模型 API Key 申請指南](/articles/ai-api-key-guide)——Google AI Studio 有免費額度，最適合新手。
>
> 注意：這裡要填的是 **AI 模型的 Key**（用來呼叫 LLM），不是 [Google Drive/Gmail 的 OAuth Key](/articles/google-api-key-guide)，兩者不同。

### 測試連線

```bash
# 測試所有已設定的 Provider
openclaw provider test

# 輸出範例：
# ✅ OpenAI: Connected (GPT-4o, GPT-4o-mini)
# ✅ Google: Connected (Gemini-2.0-Flash, Gemini-1.5-Pro)
# ❌ Anthropic: No API key configured
```

---

## 模型路由：自動選最適合的模型

### 基本概念

模型路由 = AI 版的「智慧型轉接」。根據任務特性，自動分配到最適合的模型。

```
簡單問答 → GPT-4o mini（便宜快速）
寫作分析 → Claude Sonnet（品質最好）
長文處理 → Gemini Pro（超長視窗）
數學推理 → o1（專業推理）
```

### 設定方法

在 `config.yaml` 中：

```yaml
models:
  # 預設模型（沒特別指定時使用）
  default: gpt-4o-mini

  # 模型路由規則
  routing:
    # 高品質任務
    - pattern: "write|create|compose|分析|報告"
      model: gpt-4o
      reason: "需要較高的生成品質"

    # 推理任務
    - pattern: "calculate|prove|math|推理|計算"
      model: o1
      reason: "複雜推理需要專門模型"

    # 長文任務
    - pattern: "summarize_long|全文|長篇"
      model: gemini-1.5-pro
      reason: "需要超長上下文視窗"

  # 所有其他任務
  fallback: gpt-4o-mini
```

### 在 Skill 中指定模型

你也可以在 [Skill](/articles/openclaw-skill) 裡針對每個步驟指定模型：

```yaml
name: weekly-report
steps:
  # Step 1: 搜集資料（用便宜模型）
  - action: llm_generate
    config:
      model: gpt-4o-mini
    input:
      prompt: "從以下新聞中提取關鍵事實..."

  # Step 2: 寫出分析（用好模型）
  - action: llm_generate
    config:
      model: gpt-4o
    input:
      prompt: "根據以下事實，撰寫一份深度分析報告..."

  # Step 3: 翻譯成英文（用便宜模型就夠）
  - action: llm_generate
    config:
      model: gpt-4o-mini
    input:
      prompt: "將以下報告翻譯成英文..."
```

這樣一份報告：Step 1 和 3 用便宜模型，只有 Step 2 用貴的。比全程用 GPT-4o 省 60% 以上。

---

## Fallback 機制：AI 掛了不怕

### 什麼是 Fallback？

API 服務偶爾會掛（rate limit、伺服器維護…）。Fallback 機制讓 OpenClaw 自動切到備用模型，不會中斷工作。

### 設定 Fallback

```yaml
models:
  default: gpt-4o

  fallback_chain:
    - gpt-4o           # 第一首選
    - claude-3.5-sonnet # OpenAI 掛了用 Claude
    - gemini-2.0-flash  # Claude 也掛了用 Gemini
    - gpt-4o-mini       # 最後手段

  # 什麼時候啟動 Fallback
  fallback_triggers:
    - error: rate_limit     # API 限速
    - error: server_error   # 伺服器錯誤
    - error: timeout        # 超時（>30秒）
    - error: context_length # 超過上下文限制
```

### 實際運作

```
嘗試 GPT-4o... → 429 Rate Limit
自動切換：嘗試 Claude 3.5 Sonnet... → ✅ 成功
繼續工作，使用者無感
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> Fallback 是多 Provider 的最大好處。只設一個 Provider 就沒有這個安全網。

---

## 模型比較：什麼場景用什麼模型？

### 快速選擇指南

```
💰 最省錢：      GPT-4o mini / Gemini Flash
📝 最會寫作：    Claude 3.5 Sonnet
🧮 最會推理：    o1
📚 最長文件：    Gemini 1.5 Pro (1M tokens)
⚡ 最快回應：    Gemini 2.0 Flash
🎨 最好的多模態：GPT-4o / Gemini Pro
```

### 詳細比較

| 特性 | GPT-4o | GPT-4o mini | Claude Sonnet | Gemini Flash | o1 |
|---|---|---|---|---|---|
| 速度 | 中 | 快 | 中 | 最快 | 慢 |
| 品質 | 高 | 中 | 最高（寫作）| 中 | 最高（推理）|
| 價格 | 中 | 最低 | 中高 | 免費/低 | 高 |
| 視窗 | 128K | 128K | 200K | 1M | 200K |
| 工具使用 | 最好 | 好 | 好 | 好 | 有限 |

### 我的推薦組合

**新手入門（零成本）：**
```yaml
default: gemini-2.0-flash
```

**日常使用（低成本）：**
```yaml
default: gpt-4o-mini
fallback: gemini-2.0-flash
```

**專業工作（品質優先）：**
```yaml
default: gpt-4o
routing:
  - pattern: "write|分析"
    model: claude-3.5-sonnet
  - pattern: "math|推理"
    model: o1
fallback: gpt-4o-mini
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 不知道怎麼估算費用？看 [Token 經濟學](/articles/token-economics) 精算成本。

---

## 進階：成本預算控制

### 設定每日/每月預算上限

```yaml
budget:
  daily_limit: 1.00    # 每天最多花 $1 USD
  monthly_limit: 20.00 # 每月最多花 $20 USD

  # 超過預算時的行為
  over_budget_action: downgrade  # 自動降級到最便宜的模型
  # 其他選項：block（完全停止）、warn（只警告）
```

### 追蹤使用量

```bash
# 查看今日使用量
openclaw usage today

# 輸出：
# 📊 今日使用統計
# ├─ GPT-4o:     2,340 input / 1,560 output = $0.021
# ├─ GPT-4o-mini: 15,200 input / 8,900 output = $0.008
# └─ 總計: $0.029 / $1.00 daily limit (2.9%)

# 查看月報
openclaw usage monthly
```

---

## 常見問題

### 設定了多個 Provider 但只用到一個？

檢查 `config.yaml` 的 routing 規則。如果沒設 routing，默認只用 `default` 模型。

### 模型回答品質不穩定？

可能是 Fallback 觸發了，換到了品質較低的模型。查看 Log：

```bash
openclaw logs --filter model
# 會顯示每次請求實際用了哪個模型
```

### API Key 會不會被看到？

不會。API Key 存在 `.env` 檔案中，只在本地伺服器端使用。前端（瀏覽器）不會看到 Key。

如果你用 [雲端部署](/articles/deploy-openclaw-cloud)，Key 存在環境變數中，同樣安全。

---

## 下一步

模型設好了，接下來：

- 🧩 [在 Skill 中用不同模型處理不同步驟](/articles/openclaw-skill)
- 🤖 [讓 Agent 自動選模型完成任務](/articles/openclaw-agent)
- 💬 [學好 Prompt 讓便宜模型也有好效果](/articles/prompt-engineering)
- 💰 [精算你的 Token 成本](/articles/token-economics)
- 🔗 [用 MCP 連接更多外部工具](/articles/mcp-protocol)
