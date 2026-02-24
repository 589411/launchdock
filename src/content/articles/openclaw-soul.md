---
title: "OpenClaw Soul 完全指南：讓 Agent 擁有記憶、個性與成長能力"
description: "Soul 是 OpenClaw 最強大也最獨特的功能。它讓你的 Agent 不只是工具，而是一個真正『懂你』的 AI 夥伴。"
scene: "核心功能"
difficulty: "中級"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 5
tags: ["OpenClaw", "Soul", "記憶系統", "個性化", "核心功能"]
stuckOptions:
  "Soul 是什麼": ["Soul 和 Agent 差在哪？", "沒有 Soul 的 Agent 也能用吧？"]
  "四大組成": ["Memory / Persona / Preference / Growth 太多了看不懂", "該從哪個開始設定？"]
  "記憶系統": ["Episodic 和 Semantic 差在哪？", "記憶會自動清除嗎？", "記憶增多會讓 Agent 變慢嗎？"]
  "人格設定": ["tone 和 style 怎麼填比較好？", "可以中途修改嗎？"]
  "成長系統": ["等級怎麼提升？", "milestone 解鎖是什麼意思？"]
---

## Soul 是什麼？為什麼重要？

你有沒有這種經驗：

- 跟 ChatGPT 聊了一整天，隔天開新對話，它**什麼都不記得**
- 每次都要重新告訴 AI「我的寫作風格是...」「我的公司做的是...」
- 同一個助理，對每個人都是一樣的回應，沒有個人化

**Soul 就是解決這些問題的。**

> **Soul = Agent 的記憶 + 個性 + 偏好 + 成長軌跡**

把 Agent 想像成一個新員工：
- **沒有 Soul**：每天上班都像第一天，什麼都要重新教
- **有 Soul**：越來越了解你的習慣，知道你的偏好，越用越順手

---

## Soul 的四大組成

```
┌────────────────────────────────────┐
│              Soul                   │
│                                    │
│  ┌──────────┐  ┌──────────┐       │
│  │  Memory   │  │ Persona  │       │
│  │  記憶系統  │  │ 人格設定  │       │
│  └──────────┘  └──────────┘       │
│                                    │
│  ┌──────────┐  ┌──────────┐       │
│  │ Preference│  │ Growth   │       │
│  │  偏好設定  │  │ 成長系統  │       │
│  └──────────┘  └──────────┘       │
│                                    │
└────────────────────────────────────┘
```

### 1. Memory（記憶系統）

Agent 如何記住跟你互動過的一切。

### 2. Persona（人格設定）

Agent 的語氣、風格、角色定位。

### 3. Preference（偏好設定）

你的工作習慣、格式偏好、常用工具。

### 4. Growth（成長系統）

Agent 如何從互動中學習和改進。

---

## Memory：記憶系統深入解析

OpenClaw 的記憶系統分為三層：

### 短期記憶（Short-term Memory）

```yaml
memory:
  short_term:
    type: conversation
    max_turns: 50        # 記住最近 50 輪對話
    expire_after: "24h"  # 24 小時後過期
```

像是「工作記憶」，記住當前對話的上下文。

**用途**：
- 「剛才」提到的事情
- 當前任務的中間結果
- 對話中的上下文

### 長期記憶（Long-term Memory）

```yaml
memory:
  long_term:
    type: vector_store     # 使用向量資料庫
    provider: chromadb     # chromadb / pinecone / weaviate
    auto_memorize: true    # 自動判斷是否值得記住
```

像是「筆記本」，記住重要的事實和資訊。

**用途**：
- 你的公司叫什麼、做什麼
- 你的工作習慣和偏好
- 過去完成過的重要任務

### 情境記憶（Episodic Memory）

```yaml
memory:
  episodic:
    enabled: true
    max_episodes: 100     # 最多記住 100 個重要事件
```

像是「日記」，記住重要的互動事件。

**用途**：
- 「上次處理類似任務時，用了什麼方法」
- 「上週你說過下週要做 XX」
- 「你通常在週五下午做週報」

### 三者如何協作？

```
你：幫我寫一份給投資人的報告

Agent 思考：
  📌 短期記憶：這次對話還沒提到投資人的資訊
  📒 長期記憶：使用者的公司是「XX 科技」，做 SaaS 產品
  📓 情境記憶：上個月幫他寫過一份，格式是...

Agent：我根據 XX 科技的資訊，用上次的格式幫你起草了一份...
```

---

## Persona：人格設定

Persona 決定了 Agent「是誰」。

### 基本人格設定

```yaml
persona:
  name: "小歐"
  role: "資深行銷顧問"
  tone: "專業但親切，偶爾幽默"
  language: "繁體中文"
  
  # 角色背景
  background: |
    你是一位有 10 年經驗的數位行銷顧問，
    擅長社群行銷、內容策略和數據分析。
    你的溝通風格是先給結論，再解釋原因。
    
  # 行為準則
  guidelines:
    - 回答要簡潔，避免冗長
    - 先給可執行的建議，再解釋為什麼
    - 用數據支持你的觀點
    - 不確定時說「我不確定，但我建議...」
```

### 為什麼 Persona 有用？

**沒有 Persona：**
```
你：這個廣告文案怎麼樣？
Agent：這個文案看起來不錯，但可以改進一些地方...
（太籠統，像從教科書抄的）
```

**有 Persona（資深行銷顧問）：**
```
你：這個廣告文案怎麼樣？
Agent：直說了——開頭太弱。前 3 秒抓不到注意力，CTR 大概只有 1% 以下。
      我建議把核心痛點拉到第一句。例如：
      ❌ 「想要更好的工作效率嗎？」
      ✅ 「每天浪費 2 小時在 copy-paste？」
      第二版的點擊率通常能提升 30-50%。
```

感受到差別了嗎？

---

## Preference：偏好設定

讓 Agent 知道你的「使用習慣」。

```yaml
preference:
  # 格式偏好
  format:
    report_style: "bullet_points"     # 報告用條列式
    code_language: "python"           # 偏好 Python
    date_format: "YYYY-MM-DD"        # 日期格式
    
  # 工具偏好
  tools:
    note_taking: "notion"             # 筆記用 Notion
    file_storage: "google_drive"      # 檔案存 Google Drive
    communication: "gmail"            # 溝通用 Gmail
    
  # 工作習慣
  work_habits:
    active_hours: "09:00-18:00"       # 工作時間
    timezone: "Asia/Taipei"           # 時區
    weekly_report_day: "friday"       # 週報在週五
    
  # 通知偏好
  notifications:
    urgent: "email + push"            # 緊急用 Email + 推播
    normal: "email"                   # 一般用 Email
    low: "none"                       # 不重要不通知
```

### 偏好的好處

設定完偏好後：

```
你：幫我整理今天的會議記錄

Agent：
（🧠 偏好知道你用 Notion、喜歡條列式、時區在台北）

好的，我把會議記錄整理成條列式，
已存到你的 Notion「會議記錄」資料夾了。
連結：https://notion.so/meeting-xxxx
```

你不需要每次指定「存到哪裡」「用什麼格式」，Agent 自動根據你的偏好處理。

---

## Growth：成長系統

這是 Soul 最酷的部分——你的 Agent 會**越來越好**。

### 工作原理

```yaml
growth:
  enabled: true
  
  # 從互動中學習
  learn_from:
    - user_feedback      # 你的回饋好壞
    - task_success_rate   # 任務成功率
    - correction_patterns # 你常修改的模式
    
  # 自我改進
  self_improve:
    review_interval: "weekly"    # 每週回顧一次
    optimize_skills: true        # 自動優化 Skill
    suggest_new_skills: true     # 建議新的 Skill
```

### 實際的學習過程

**第一週：**
```
你：幫我寫一份週報
Agent：（寫了一份很正式的週報）
你：太正式了，用輕鬆一點的語氣
Agent：好的，已調整。
（🧠 記錄：「使用者偏好輕鬆的週報語氣」）
```

**第二週：**
```
你：幫我寫週報
Agent：（直接用輕鬆語氣寫）
你：（不需要再提醒了）
```

**第四週：**
```
Agent：我注意到你每週五下午都會要我寫週報，
      要不要我自動在每週五 16:00 幫你準備好？
你：好啊！
（🧠 建議新 Skill：「每週五自動準備週報」）
```

---

## 完整的 Soul 設定範例

```yaml
# 📄 my-soul.yaml
soul:
  persona:
    name: "小歐"
    role: "全方位工作助理"
    tone: "簡潔有力，像一個能幹的同事"
    language: "繁體中文"
    background: |
      你是一位效率極高的工作助理。
      你的風格是：先做，做完再報告。
      如果使用者沒有指定細節，你會根據過去的偏好自行判斷。
    guidelines:
      - 回答控制在 3-5 句以內，除非使用者要求詳細
      - 完成任務時附上結果連結或截圖
      - 不確定的事情直接問，不要猜

  memory:
    short_term:
      max_turns: 30
      expire_after: "12h"
    long_term:
      type: vector_store
      provider: chromadb
      auto_memorize: true
    episodic:
      enabled: true
      max_episodes: 200

  preference:
    format:
      report_style: "bullet_points"
      language: "zh-TW"
    tools:
      primary_storage: "google_drive"
      note_taking: "notion"
    work_habits:
      timezone: "Asia/Taipei"
      active_hours: "09:00-22:00"

  growth:
    enabled: true
    learn_from:
      - user_feedback
      - task_success_rate
    self_improve:
      review_interval: "weekly"
      suggest_new_skills: true
```

---

## Soul vs 其他框架的比較

| 功能 | OpenClaw Soul | LangChain Memory | AutoGPT | Custom GPTs |
|---|---|---|---|---|
| 短期記憶 | ✅ | ✅ | ✅ | ✅ |
| 長期記憶 | ✅ | ✅ | ⚠️ 有限 | ❌ |
| 情境記憶 | ✅ | ❌ | ❌ | ❌ |
| 人格設定 | ✅ 完整 | ❌ | ⚠️ 基本 | ✅ |
| 偏好學習 | ✅ | ❌ | ❌ | ❌ |
| 自動成長 | ✅ | ❌ | ❌ | ❌ |

---

## 常見問題

### Q: Soul 的記憶資料存在哪裡？

預設存在本地的 ChromaDB 向量資料庫。你也可以設定存到：
- Pinecone（雲端，適合大量記憶）
- Weaviate（自建，適合有資安需求的團隊）

### Q: 可以重設 Soul 嗎？

```bash
# 清除所有記憶
openclaw soul reset --agent "工作助理"

# 只清除短期記憶
openclaw soul reset --agent "工作助理" --type short_term

# 匯出記憶（備份）
openclaw soul export --agent "工作助理" --output soul-backup.json

# 匯入記憶
openclaw soul import --agent "工作助理" --input soul-backup.json
```

### Q: 多個使用者可以共用同一個 Soul 嗎？

不建議。Soul 是個人化的，每個使用者應該有自己的 Soul 設定。如果是團隊使用，建議每人建立獨立的 Agent + Soul。

### Q: Soul 會增加多少運算成本？

記憶查詢大約增加每次呼叫 100-200ms 的延遲，費用上主要是向量資料庫的儲存成本，通常可忽略不計。

---

## 下一步

- 🧩 還沒了解 Skill？先看 [Skill：可重複的工作流](/articles/openclaw-skill)
- 🤖 設定你的 Agent：[Agent 完全指南](/articles/openclaw-agent)
- ☁️ 部署到雲端：[雲端部署指南](/articles/deploy-openclaw-cloud)
- 💬 分享你的 Soul 設定：[首頁討論區](/#discussion)
