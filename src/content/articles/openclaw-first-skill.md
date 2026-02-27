---
title: "第一個 Skill：5 分鐘完成你的第一個自動化任務"
description: "你的 OpenClaw 已經能回話了，但它真正的威力在 Skill。跟著做，把一個手動任務變成一鍵完成。"
contentType: "tutorial"
scene: "基礎使用"
difficulty: "入門"
createdAt: "2026-02-25"
verifiedAt: "2026-02-25"
archived: false
order: 2
pathStep: 6
series:
  name: "新手入門"
  part: 6
prerequisites: ["openclaw-first-run"]
estimatedMinutes: 10
tags: ["OpenClaw", "Skill", "自動化", "入門"]
stuckOptions:
  "Skill 概念": ["跟直接跟 AI 聊天有什麼不同？", "Skill 可以做什麼？"]
  "建立 Skill 檔案": ["不知道檔案要放在哪裡", "YAML 格式看不懂", "縮排一直出錯"]
  "執行 Skill": ["執行時出現錯誤", "沒有任何輸出", "怎麼看執行結果？"]
  "修改與實驗": ["想改 prompt 但不知道怎麼改", "可以加更多步驟嗎？"]
---

## 你已經走到最後一步了

到這裡，你的 OpenClaw 已經能跟你對話了。但這只是開始。

直接跟 AI 聊天，你每次都要重新描述任務。**Skill 讓你把任務寫成流程，以後一句話就能重複執行。**

> 🎯 **這篇的目標**：在 5 分鐘內建立並執行你的第一個 Skill。

---

## 直接聊天 vs Skill

先搞清楚為什麼要多這一步：

| | 直接聊天 | 使用 Skill |
|---|---|---|
| **每次使用** | 得重新描述任務 | 一句話觸發 |
| **結果穩定性** | 每次可能不一樣 | 每次走同樣的流程 |
| **能串接工具** | ❌ 只能對話 | ✅ 可以搜網路、讀檔案、存到 Drive |
| **適合場景** | 一次性的問題 | 每週/每天要重複做的工作 |

**打個比方**：直接聊天 = 每次口頭交代新員工。Skill = 寫一份 SOP，新員工照著做就好。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：你不會每次去早餐店都從頭解釋「我要一個蛋餅、不要辣、加起司、中杯冰奶茶半糖」——你會直接說「老樣子」。Skill 就是你的「老樣子」。

---

## 我們要做什麼？

建立一個「**每日新聞摘要**」Skill：

1. 搜尋指定主題的最新新聞
2. 用 AI 整理成 3 條重點摘要
3. 顯示結果

完成後，你以後只要說「執行每日新聞摘要」，就能拿到當天的新聞摘要。

---

## Step 1：建立 Skill 檔案

Skill 是一個 YAML 檔案，放在工作目錄的 `skills/` 資料夾裡。

### 1.1 建立資料夾

```bash
mkdir -p ~/.openclaw/workspace/skills
```

### 1.2 建立檔案

在你喜歡的編輯器中建立 `~/.openclaw/workspace/skills/daily-news.yaml`：

```bash
# 用 VS Code 開啟
code ~/.openclaw/workspace/skills/daily-news.yaml

# 或用 nano（終端機內建編輯器）
nano ~/.openclaw/workspace/skills/daily-news.yaml
```

<!-- @img: create-skill-file | 建立 Skill 檔案 -->

### 1.3 貼上以下內容

```yaml
name: "每日新聞摘要"
description: "搜尋指定主題的最新新聞，整理成重點摘要"

trigger:
  type: manual

inputs:
  - name: topic
    type: string
    description: "想了解什麼主題的新聞？"
    default: "AI 技術"

steps:
  - id: search
    action: web_search
    params:
      query: "{{topic}} 最新新聞 today"
      max_results: 5

  - id: summarize
    action: llm_generate
    params:
      prompt: |
        以下是關於「{{topic}}」的最新新聞搜尋結果：

        {{steps.search.output}}

        請整理成 3 條重點摘要，格式如下：
        1. **標題**：一句話摘要
        2. **標題**：一句話摘要
        3. **標題**：一句話摘要

        最後加一句「整體趨勢觀察」。
        用繁體中文回答。

output:
  result: "{{steps.summarize.output}}"
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **不用怕打錯**。YAML 最常見的錯誤是**縮排不對**。確保用空格（不是 Tab），每層縮排 2 個空格。

<!-- @img: skill-yaml-content | Skill 檔案的完整內容 -->

### 看懂這個 Skill

| 區塊 | 說明 |
|---|---|
| `name` + `description` | Skill 的名字和描述 |
| `trigger: manual` | 手動觸發（之後可以改成定時執行） |
| `inputs` | 使用者可以輸入的參數 |
| `steps` | 執行步驟，由上往下依序執行 |
| `steps[0]: web_search` | 第一步：搜尋網路 |
| `steps[1]: llm_generate` | 第二步：用 AI 整理搜尋結果 |
| `output` | 最終輸出什麼 |

步驟之間用 `{{steps.search.output}}` 把上一步的結果傳給下一步。像接力賽一樣。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：整個 Skill 就像一條工廠流水線——第一站搜集原料（搜尋新聞），第二站加工包裝（AI 整理），最後成品出貨（顯示摘要）。你只要按下開關，流水線就自己跑。

---

## Step 2：執行你的第一個 Skill

### 方式 A：用指令執行

```bash
openclaw skill run daily-news
```

它會問你主題（預設是「AI 技術」），直接按 Enter 用預設，或輸入你想要的主題。

<!-- @img: skill-run-terminal | 在終端機執行 Skill -->

等待 10-20 秒，你會看到整理好的新聞摘要！

<!-- @img: skill-output | Skill 執行結果 -->

### 方式 B：用 Telegram 執行

直接跟你的 OpenClaw 機器人說：

```
執行每日新聞摘要
```

或者指定主題：

```
執行每日新聞摘要，主題：電動車
```

<!-- @img: skill-run-telegram | 在 Telegram 中執行 Skill -->

### 方式 C：用 Web 介面

打開 `http://localhost:18789`，在聊天框輸入同樣的指令。

---

## Step 3：改造你的 Skill

Skill 的威力在於可以不斷調整。試試看改這些地方：

### 改 prompt

把 `3 條重點摘要` 改成 `5 條`，或加上「用表格呈現」。

### 改搜尋範圍

把 `max_results: 5` 改成 `10`，搜更多資料。

### 加上定時觸發

把 `trigger` 改成定時執行，每天早上 9 點自動跑：

```yaml
trigger:
  type: schedule
  schedule: "0 9 * * *"  # 每天早上 9 點
```

### 把結果存到檔案

在 `steps` 最後加一步：

```yaml
  - id: save
    action: file_write
    params:
      path: "~/Desktop/news-{{date}}.md"
      content: "{{steps.summarize.output}}"
```

---

## 🎉 恭喜你完成入門路線！

你已經成功：

1. ✅ 了解 OpenClaw 是什麼
2. ✅ 選擇並取得 LLM API Key
3. ✅ 安裝 OpenClaw
4. ✅ 完成初始設定、聽到 AI 的第一句話
5. ✅ **建立並執行了你的第一個 Skill**

你不再只是一個 AI 工具的使用者——你已經開始**自動化你的工作流程**了。

---

## 接下來可以做什麼？

### 深入學習 Skill
- 📖 [Skill 完全指南](/articles/openclaw-skill)——更多 Action 類型、條件判斷、錯誤處理

### 了解核心架構
- 🤖 [Agent 完全指南](/articles/openclaw-agent)——讓 AI 自己決定用哪個 Skill
- 🧠 [Soul 完全指南](/articles/openclaw-soul)——讓 AI 擁有記憶和個性

### 實用工作流
- 💬 [Telegram 整合](/articles/telegram-integration)——手機隨時使用 AI
- 📚 [知識管理系統](/articles/pkm-system)——自動整理你的知識

### 延伸閱讀
- 🔗 [MCP 協定](/articles/mcp-protocol)——理解 AI 串接工具的底層原理
- 💰 [Token 經濟學](/articles/token-economics)——控制 AI 使用成本
- 🎯 [Prompt 工程](/articles/prompt-engineering)——讓 AI 的回答更精確

---
