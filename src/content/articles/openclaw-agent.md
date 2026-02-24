---
title: "OpenClaw Agent 完全指南：打造你的 AI 分身"
description: "Agent 是 OpenClaw 的靈魂角色，它能理解你的意圖、自動選擇 Skill、甚至自己決定下一步該做什麼。"
scene: "核心功能"
difficulty: "中級"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 4
tags: ["OpenClaw", "Agent", "AI 代理", "核心功能", "LLM"]
stuckOptions:
  "Agent 是什麼": ["Agent 和 Skill 差在哪裡？", "需要自己的 API Key 嗎？"]
  "運作原理": ["ReAct 框架看不懂", "什麼是 Tool Calling？"]
  "建立你的第一個 Agent": ["照著做但 Agent 沒有回應", "system prompt 怎麼寫比較好？", "Skill 連接失敗"]
  "多 Agent 協作": ["多個 Agent 之間怎麼傳遞資料？", "看不懂協作流程圖"]
  "記憶系統": ["記憶和 Soul 有什麼不同？", "記憶會不會占很多空間？"]
  "除錯技巧": ["不知道怎麼看 Log", "Agent 陷入無限迴圈"]
---

## Agent 是什麼？跟 Chatbot 有什麼不同？

先講結論：

> **Chatbot = 你問一句，它答一句**
> **Agent = 你給一個目標，它自己想辦法完成**

### 舉個例子

**Chatbot 模式（像 ChatGPT）：**

```
你：幫我查一下最新的 AI 新聞
Bot：這裡是最近的 AI 新聞...(列出結果)
你：把這些整理成表格
Bot：好的，以下是表格格式...(輸出表格)
你：存到我的 Google Drive
Bot：抱歉，我無法存取你的 Google Drive
```

每一步都需要你**手動下指令**，而且 Chatbot 無法存取外部工具。

**Agent 模式（OpenClaw）：**

```
你：幫我把最新的 AI 新聞整理成表格，存到 Google Drive 的「週報」資料夾
Agent：好的，我來處理。
  → 步驟 1: 搜尋最新 AI 新聞 ✅
  → 步驟 2: 整理成表格格式 ✅
  → 步驟 3: 存到 Google Drive「週報」資料夾 ✅
Agent：完成了！檔案已存到 Google Drive，檔名是「AI新聞週報_2026-02-24」
```

一句話搞定，Agent **自己規劃步驟、選擇工具、執行到底**。

---

## Agent 的運作原理

OpenClaw 的 Agent 基於 **ReAct（Reasoning + Acting）** 架構：

```
                    ┌──────────────┐
                    │   你的指令    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   思考(Think) │ ← 理解意圖，規劃步驟
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   行動(Act)   │ ← 選擇 Skill 或工具
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  觀察(Observe)│ ← 檢查結果
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  完成/繼續？   │
                    └──────┬───────┘
                      ↙         ↘
                  完成           繼續 → 回到「思考」
```

### 關鍵概念：Agent Loop（代理迴圈）

Agent 不是執行一次就結束。它會**持續循環**直到任務完成：

1. **Think**（思考）：「使用者想要什麼？我該怎麼做？」
2. **Act**（行動）：「我要使用 web_search 來搜尋新聞」
3. **Observe**（觀察）：「搜到了 10 筆結果，看起來品質不錯」
4. **Decide**（決定）：「夠了，進入下一步」或「結果不夠好，換個關鍵字再搜」

這就是為什麼 Agent **比 Chatbot 聰明**——它會根據結果調整行為。

---

## 建立你的第一個 Agent

### Agent 設定檔

```yaml
# 📄 my-agent.yaml
name: "工作助理"
description: "一個全方位的工作助理，擅長資料整理、Email 處理和報告撰寫"

# Agent 使用的 LLM
model:
  provider: openai
  name: gpt-4
  temperature: 0.7

# Agent 可以使用的 Skill
skills:
  - email-morning-summary
  - weekly-news-digest
  - meeting-notes-organizer
  - competitor-monitor

# Agent 可以使用的工具
tools:
  - web_search
  - google_drive
  - gmail
  - notion

# Agent 的行為設定
behavior:
  # 最多執行幾個步驟（防止無限迴圈）
  max_steps: 20
  # 遇到不確定的情況時...
  on_uncertainty: ask_user  # ask_user | best_guess | stop
  # 是否顯示思考過程
  verbose: true
```

### 配置重點解析

#### `model`：選擇 LLM

```yaml
model:
  provider: openai    # openai / anthropic / google / local
  name: gpt-4        # 具體模型名稱
  temperature: 0.7    # 0 = 精確，1 = 創意
```

| 模型 | 優點 | 適合場景 |
|---|---|---|
| GPT-4 | 推理能力最強 | 複雜任務規劃 |
| GPT-4o | 速度快、成本低 | 日常大多數任務 |
| Claude 3.5 | 長文本處理優秀 | 文件分析、長報告 |
| Gemini Pro | Google 生態整合 | Google 工具串接 |
| 本地模型（Ollama）| 完全免費、隱私 | 敏感資料處理 |

#### `skills`：Agent 的技能庫

Agent 會根據你的指令**自動選擇適合的 Skill**。你不需要指定「用哪個 Skill」，Agent 會自己判斷。

```
你：「把今天的 Email 重點整理給我」
Agent 思考：這跟 Email 處理有關...
         → 選擇「email-morning-summary」Skill
         → 執行！
```

#### `behavior`：Agent 的「個性設定」

```yaml
on_uncertainty: ask_user
```

這決定了 Agent 在不確定時的行為：

- `ask_user`：「我不太確定你要存到哪個資料夾，可以指定嗎？」
- `best_guess`：Agent 自己判斷，可能猜錯但效率高
- `stop`：停下來等你決定

---

## 多 Agent 協作

OpenClaw 支援**多個 Agent 同時工作**，各自負責不同領域：

```yaml
# 📄 agent-team.yaml
agents:
  - name: "研究員"
    speciality: "資料搜集和分析"
    skills: [web_search, document_analysis]
    
  - name: "編輯"
    speciality: "內容撰寫和修潤"
    skills: [content_writing, translation]
    
  - name: "秘書"
    speciality: "溝通和行程管理"
    skills: [email_management, calendar]

# 協作模式
collaboration:
  mode: sequential  # sequential | parallel | hierarchical
  coordinator: "秘書"  # 由秘書統籌
```

### 三種協作模式

| 模式 | 說明 | 適合場景 |
|---|---|---|
| `sequential` | 一個做完換下一個 | 有先後順序的任務 |
| `parallel` | 同時進行 | 獨立且不互相依賴的任務 |
| `hierarchical` | 主管 Agent 分配工作 | 複雜的大型任務 |

### 實際範例：每週產業報告

```
你：「幫我做這週的 AI 產業報告」

秘書（coordinator）：收到，我來分配工作
  → 研究員：搜尋本週 AI 相關新聞和論文
  → 編輯：等研究員完成後，整理成報告格式
  → 秘書：報告完成後，寄給團隊成員
```

---

## Agent 的記憶系統

Agent 不只是「執行指令」，它還有記憶：

### 短期記憶（Conversation Memory）

```
你：我在做一個行銷專案
Agent：了解，有什麼我可以幫忙的嗎？

你：幫我搜尋相關的案例
Agent：好的，我搜尋「行銷專案案例」（記得你在做行銷專案）
```

### 長期記憶（Persistent Memory）

```
上週的對話：
你：我們公司的目標客群是 25-35 歲的上班族

本週的對話：
你：幫我寫一份廣告文案
Agent：我根據你之前提到的目標客群（25-35 歲上班族），
       幫你寫了一份針對性的文案...
```

> 💡 想深入了解記憶系統？看 [Soul：讓 Agent 有記憶和個性](/articles/openclaw-soul)

---

## Agent 除錯技巧

### 1. 開啟 verbose 模式

```yaml
behavior:
  verbose: true
```

開啟後，Agent 會顯示每一步的思考過程，方便你找出問題。

### 2. 檢查執行日誌

```bash
# 查看最近一次執行的日誌
openclaw logs --last

# 查看特定 Agent 的日誌
openclaw logs --agent "工作助理" --limit 5
```

### 3. 常見問題排查

| 問題 | 可能原因 | 解決方案 |
|---|---|---|
| Agent 一直在同一步驟迴圈 | `max_steps` 太高或條件判斷有誤 | 設定合理的 `max_steps` |
| Agent 選錯 Skill | Skill 的 description 不夠明確 | 改善 Skill 描述 |
| Agent 回應太慢 | 模型太大或步驟太多 | 換用更快的模型 |
| Agent 不理解指令 | 指令太模糊 | 更明確地描述你要什麼 |

---

## 最佳實踐

### 1. 從簡單開始

先建立單一功能的 Agent，確認運作正常後再慢慢增加 Skill。

### 2. 寫好 Skill 描述

Agent 選擇 Skill 的依據是 `description`。描述越清楚，Agent 越不會選錯。

```yaml
# ❌ 不好的描述
description: "處理 Email"

# ✅ 好的描述
description: "讀取未讀 Email，按重要性分類，整理成每日摘要"
```

### 3. 設定安全護欄

```yaml
behavior:
  max_steps: 20          # 限制步驟數
  on_uncertainty: ask_user  # 不確定就問
  confirm_before:          # 這些動作執行前要確認
    - gmail_send
    - google_drive_delete
```

---

## 下一步

- 🧠 深入了解 [Soul：讓 Agent 有記憶和個性](/articles/openclaw-soul)
- 🧩 回顧 [Skill：可重複的工作流](/articles/openclaw-skill)
- ☁️ 部署你的 Agent：[雲端部署指南](/articles/deploy-openclaw-cloud)
