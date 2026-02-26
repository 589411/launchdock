---
title: "用 OpenClaw 打造個人知識管理（PKM）系統"
description: "告別資訊焦慮。用 OpenClaw 自動收集、整理、回顧知識，讓你的第二大腦真正運作起來。"
scene: "知識管理"
difficulty: "中級"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 1
tags: ["PKM", "知識管理", "Notion", "Obsidian", "自動化", "工作流"]
stuckOptions:
  "為什麼你需要 PKM": ["我用書籤和筆記就夠了", "PKM 不就是 Notion 嗎？"]
  "架構設計": ["資料夾結構怎麼設計？", "標籤太多反而亂了", "Workspace 是什麼？"]
  "自動收集": ["怎麼把網頁文章自動存進來？", "RSS 是什麼？", "Skill 設定看不懂"]
  "智能整理": ["AI 整理的品質好嗎？", "自動標籤準確嗎？"]
  "知識回顧": ["回顧提醒怎麼設？", "回顧太頻繁很煩"]
---

## 你的知識正在流失

你每天可能會：

- 看 10+ 篇文章或推文
- 在 Notion 做一些筆記
- 跟 ChatGPT 聊一些想法
- 在 YouTube 學到新東西
- Slack/Discord 上看到有價值的討論

**一週後，你還記得多少？** 大概 10%。

問題不是你不努力，而是你的「知識管理系統」有漏洞：

| 問題 | 症狀 |
|---|---|
| **收集分散** | 「那篇文章我記得看過，但找不到存在哪…」 |
| **缺乏整理** | Notion 裡一堆未分類的筆記 |
| **沒有回顧** | 存了就忘，bookmark 墳場無限增長 |
| **手動搬運** | 每天花 30 分鐘 copy-paste 各處資料 |

---

## OpenClaw + PKM = 自動化的第二大腦

OpenClaw 在 PKM 裡扮演的角色：

```
收集 → 整理 → 存儲 → 回顧 → 應用
  ↑       ↑       ↑       ↑       ↑
  AI 自動  AI 自動  你指定   AI 定期  AI 搜尋
  擷取    分類     存哪     提醒    你的知識
```

你只需要做兩件事：
1. 告訴 OpenClaw 去哪裡收集
2. 偶爾看一下 AI 幫你整理好的回顧

---

## 第一步：設計你的知識架構

### Workspace 結構

在 OpenClaw 的 Workspace 中建立知識管理的基本結構：

```
workspace/
├── SOUL.md           # AI 的人設：知識管理員
├── AGENTS.md         # 定義知識管理 Agent
├── skills/
│   ├── capture.yml   # 收集 Skill
│   ├── organize.yml  # 整理 Skill
│   └── review.yml    # 回顧 Skill
├── knowledge/
│   ├── inbox/        # 待整理（AI 自動投遞）
│   ├── notes/        # 已整理筆記
│   ├── references/   # 參考資料
│   └── projects/     # 專案相關知識
└── config.yaml       # MCP 連接設定
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> Workspace 設定的詳細說明可以參考 [Soul 設定指南](/articles/openclaw-soul)。

### 知識分類法

不需要太複雜。推薦 **PARA 方法**（Tiago Forte）：

| 分類 | 說明 | 範例 |
|---|---|---|
| **P**rojects | 正在進行的專案 | 「Q2 行銷計畫」 |
| **A**reas | 持續關注的領域 | 「AI 技術」「投資理財」 |
| **R**esources | 未來可能用到的參考資料 | 「設計範本」「寫作技巧」 |
| **A**rchives | 完成或不再需要的 | 「2024 年報」 |

---

## 第二步：自動收集

### Skill：網頁文章擷取

```yaml
name: capture-article
description: 自動擷取網頁文章並存入知識庫
trigger:
  - command: "存這篇"
  - command: "capture"

steps:
  # Step 1: 擷取網頁內容
  - action: web_scrape
    input:
      url: "{{url}}"
    output: raw_content

  # Step 2: AI 整理成筆記
  - action: llm_generate
    config:
      model: gpt-4o-mini  # 簡單任務用便宜模型
    input:
      prompt: |
        請將以下網頁內容整理成結構化筆記：
        
        ## 格式要求
        - 標題
        - 一句話摘要（30字以內）
        - 3-5 個關鍵重點（條列）
        - 相關標籤（3-5 個）
        - 我的行動項目（如果有的話）
        
        ## 內容
        {{raw_content}}
    output: organized_note

  # Step 3: 存到 Notion（透過 MCP）
  - action: mcp_call
    server: notion
    tool: create_page
    input:
      database_id: "{{notion_knowledge_db}}"
      content: "{{organized_note}}"
      tags: "{{organized_note.tags}}"
```

### Skill：RSS 每日新知

```yaml
name: daily-knowledge-feed
description: 每天早上自動收集訂閱的文章摘要
trigger:
  - schedule: "0 8 * * *"  # 每天早上 8 點

steps:
  - action: rss_fetch
    input:
      feeds:
        - "https://openai.com/blog/rss"
        - "https://blog.google/technology/ai/rss"
        - "你的其他 RSS 來源"
      since: "24h"  # 過去 24 小時
    output: articles

  - action: llm_generate
    config:
      model: gpt-4o-mini
    input:
      prompt: |
        以下是過去 24 小時的新文章。
        請挑出最重要的 5 篇，每篇給：
        - 標題 + 連結
        - 一句話重點
        - 跟我的相關程度（高/中/低）
        
        我的關注領域：AI Agent、自動化、生產力工具
        
        {{articles}}
    output: digest

  - action: notify
    channel: telegram  # 透過 Telegram 推送
    input:
      message: "📚 今日知識新訊\n\n{{digest}}"
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> Telegram 的設定請看 [Telegram 整合教學](/articles/telegram-integration)。

---

## 第三步：智能整理

### AI 自動標籤

不需要手動分類。讓 AI 根據內容自動打標籤：

```yaml
name: auto-organize
description: 自動整理 inbox 中的新筆記
trigger:
  - watch: "knowledge/inbox/"  # 監控 inbox 資料夾

steps:
  - action: llm_generate
    config:
      model: gpt-4o-mini
    input:
      prompt: |
        分析以下筆記內容，回傳 JSON：
        {
          "category": "projects|areas|resources|archives",
          "tags": ["標籤1", "標籤2"],
          "related_notes": ["可能相關的現有筆記關鍵字"],
          "priority": "high|medium|low"
        }
        
        筆記內容：
        {{note_content}}
    output: classification

  - action: file_move
    input:
      from: "knowledge/inbox/{{filename}}"
      to: "knowledge/{{classification.category}}/{{filename}}"

  - action: metadata_update
    input:
      file: "knowledge/{{classification.category}}/{{filename}}"
      tags: "{{classification.tags}}"
```

### 知識連結

AI 發現筆記之間的關聯，就像 Obsidian 的反向連結：

```yaml
name: link-knowledge
description: 定期掃描知識庫，建立筆記之間的連結

steps:
  - action: file_list
    input:
      path: "knowledge/notes/"
    output: all_notes

  - action: llm_generate
    config:
      model: gpt-4o  # 需要較好的理解能力
    input:
      prompt: |
        以下是我知識庫中的筆記。
        請找出有強關聯的筆記對，說明關聯原因。
        
        輸出格式：
        - [筆記A] ←→ [筆記B]：關聯原因
        
        {{all_notes}}
```

---

## 第四步：定期回顧

### Spaced Repetition（間隔重複）

最有效的記憶方法。AI 根據你的回顧歷史，自動安排複習時間：

```yaml
name: knowledge-review
description: 每天早上推送需要回顧的知識
trigger:
  - schedule: "0 9 * * *"  # 每天早上 9 點

steps:
  - action: review_scheduler
    input:
      algorithm: "sm2"  # SuperMemo 2 演算法
      count: 5          # 每天回顧 5 則
    output: review_items

  - action: llm_generate
    config:
      model: gpt-4o-mini
    input:
      prompt: |
        將以下知識整理成回顧卡片格式：
        每張卡片包含：
        - 🃏 核心概念（一句話）
        - 💡 為什麼重要
        - 🔗 相關知識
        - ❓ 一個思考問題
        
        {{review_items}}
    output: review_cards

  - action: notify
    channel: telegram
    input:
      message: "🧠 今日知識回顧\n\n{{review_cards}}\n\n回覆數字 1-5 表示記憶程度"
```

### 每週知識報告

```yaml
name: weekly-knowledge-report
trigger:
  - schedule: "0 18 * * 5"  # 每週五下午 6 點

steps:
  - action: knowledge_stats
    input:
      period: "7d"
    output: stats

  - action: llm_generate
    config:
      model: gpt-4o
    input:
      prompt: |
        根據以下統計，寫一份個人知識管理週報：
        
        - 本週新增筆記數
        - 最常出現的標籤
        - 知識缺口（有搜尋但找不到的主題）
        - 建議下週關注的方向
        
        {{stats}}
```

---

## 推薦工具搭配

OpenClaw 的 [MCP 協定](/articles/mcp-protocol) 讓你可以串接各種知識管理工具：

| 功能 | 推薦工具 | MCP Server |
|---|---|---|
| 筆記庫 | Notion / Obsidian | mcp-server-notion |
| 稍後閱讀 | Readwise / Pocket | mcp-server-readwise |
| RSS 訂閱 | Feedly / Inoreader | mcp-server-rss |
| 書籤 | Raindrop.io | mcp-server-raindrop |
| 推送通知 | Telegram | mcp-server-telegram |
| 檔案儲存 | Google Drive | mcp-server-google-drive |

---

## 完整範例：我的 PKM 設定

### SOUL.md

```markdown
你是我的個人知識管理助理。

## 原則
- 精簡勝過冗長：每則筆記的核心重點不超過 5 條
- 連結勝過堆積：主動找出知識之間的關聯
- 行動勝過收藏：每則筆記至少有一個「我可以做什麼」

## 語氣
- 像朋友提醒你一樣，不要太正式
- 用繁體中文

## 注意事項
- 不確定的資訊要標記 ⚠️
- 不要幫我決定，給我選項讓我自己選
```

### 每日流程

```
08:00 → RSS 日報推送到 Telegram
09:00 → 知識回顧卡片推送
隨時   → 說「存這篇」+ 貼連結 → 自動擷取整理
18:00 → inbox 自動整理（分類 + 打標籤）
週五   → 週報 + 下週建議
```

---

## 常見問題

### 我用 Notion，可以嗎？

完全可以。OpenClaw 透過 [MCP](/articles/mcp-protocol) 連接 Notion API，可以自動新增頁面、更新資料庫、搜尋現有筆記。

### 不想用 AI 整理，怕品質不好？

可以設成「AI 整理 + 人工確認」模式：AI 先整理到 inbox，你再審核移到正式區。品質可以用 [Prompt 技巧](/articles/prompt-engineering) 提升。

### 每個月要花多少？

用 GPT-4o mini 處理收集和整理，一般使用量每月 $1-3 美金。詳情看 [Token 經濟學](/articles/token-economics)。

### 資料安全嗎？

OpenClaw 跑在你自己的電腦 / 伺服器上，資料不經過第三方。筆記內容只在呼叫 AI API 時才會傳送，且不會被用於訓練。

---

## 下一步

開始建立你的 PKM 系統：

- 📦 [先安裝 OpenClaw](/articles/install-openclaw)
- 🧩 [學寫 Skill 建立自動化流程](/articles/openclaw-skill)
- 🔗 [用 MCP 串接 Notion / Google Drive](/articles/mcp-protocol)
- 💬 [串接 Telegram 接收推送通知](/articles/telegram-integration)
- 👻 [設定 AI 助理的人設](/articles/openclaw-soul)
