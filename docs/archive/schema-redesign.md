# LaunchDock Schema 重新設計方案

> **目標**：建立一套系統化的內容分類架構，讓 AI 持續生成文章時能精準歸類，讀者能清楚找到需要的內容。
>
> **設計日期**：2026-02-27

---

## 一、現狀問題分析

### 目前的 schema 欄位

```typescript
// src/content.config.ts 現有結構
{
  title, description, scene, difficulty,
  createdAt, verifiedAt, archived,
  order, tags, pathStep, stuckOptions
}
```

### 發現的問題

| 問題 | 說明 |
|------|------|
| `scene` 分類扁平 | 只有 5 個場景，顆粒度不足，擴展困難 |
| 沒有 `contentType` | 手把手教學 vs 概念說明 vs 參考文件 混在一起 |
| `tags` 無規範 | 自由輸入，AI 每次可能生成不同標籤 |
| 無前置依賴 | 無法表達「讀這篇之前要先讀哪篇」|
| 無預估時間 | 讀者無法判斷要花多少時間 |
| `difficulty` 只有兩層 | 「中級」跨度太大，從設定到協議設計都是中級 |
| 無版本/適用範圍 | 不知道文章適用哪個 OpenClaw 版本 |

---

## 二、新 Schema 設計

### 2.1 內容類型 (`contentType`) — 🆕 核心新增

定義文章的**本質**，AI 生成時第一步就要選擇：

```typescript
contentType: z.enum([
  'tutorial',      // 手把手教學：安裝、設定、API 申請（有步驟、有截圖）
  'guide',         // 概念指南：LLM 科普、Token 經濟學（解釋 why，建立認知）
  'reference',     // 參考文件：設定項速查、API 列表、指令表（查閱用）
  'troubleshoot',  // 疑難排解：常見錯誤、除錯步驟（問題導向）
])
```

**為什麼需要這個欄位？**

| contentType | 特徵 | AI 生成時的差異 |
|-------------|------|----------------|
| `tutorial` | 有編號步驟、`@img` 標記多、stuckOptions | 最多截圖、步驟最詳細 |
| `guide` | 比喻多、概念圖、延伸閱讀 | 著重解釋 why，少截圖 |
| `reference` | 表格、程式碼區塊、可搜尋 | 結構化、無敘事 |
| `troubleshoot` | 現象→原因→解法 | 以問題為索引 |

### 2.2 場景分類 (`scene`) — 重新定義

從 5 個擴展到 **7 個場景**，用 enum 鎖定：

```typescript
scene: z.enum([
  '認識 OpenClaw',    // 入門概念：什麼是 OpenClaw、為什麼需要它
  '環境準備',         // LLM 選擇、API Key 申請、前置軟體
  '安裝與部署',       // 本機安裝 (macOS/Windows)、雲端部署
  '基礎使用',         // 首次啟動、模型設定、基本操作
  '核心功能',         // Agent、Skill、Soul、MCP
  '整合與自動化',     // Telegram、工作流、外部服務連接
  '知識與進階',       // PKM 系統、進階設定、最佳實踐
])
```

**遷移對照表：**

| 舊 scene | → 新 scene | 理由 |
|----------|-----------|------|
| 打破資訊孤島 | 認識 OpenClaw | 更直觀，新手看得懂 |
| 安裝與設定 | 拆成「環境準備」+「安裝與部署」+「基礎使用」| 原本太大，7 篇塞一起 |
| 核心功能 | 核心功能 | 保留 |
| 工作流自動化 | 整合與自動化 | 擴大涵蓋範圍 |
| 知識管理 | 知識與進階 | 加入進階內容 |

### 2.3 標籤分類法 (`tags`) — 🆕 受控詞彙

將 tags 分為**兩層**：類別標籤（AI 必選）+ 自由標籤（可選補充）

```typescript
// 類別標籤 — AI 生成時必須從中選擇至少一個
const CONTROLLED_TAGS = {
  // 平台/工具
  platform: ['OpenClaw', 'KimiClaw', 'Zeabur', 'Docker', 'Telegram', 'Notion', 'Obsidian'],
  // AI 供應商  
  provider: ['OpenAI', 'Anthropic', 'Google', 'OpenRouter', 'Ollama', 'DeepSeek'],
  // 作業系統
  os: ['macOS', 'Windows', 'Linux', 'WSL'],
  // 核心概念
  concept: ['LLM', 'API', 'Agent', 'Skill', 'Soul', 'MCP', 'Token', 'Prompt', 'RAG'],
  // 操作類型
  action: ['安裝', '設定', '申請', '部署', '除錯', '整合'],
} as const;

// schema 中仍然是 string array，但 docs 約束 AI 優先從 CONTROLLED_TAGS 選
tags: z.array(z.string()).min(1).max(8)
```

### 2.4 前置依賴 (`prerequisites`) — 🆕

```typescript
// 前置閱讀的 slug 列表
prerequisites: z.array(z.string()).optional().default([])

// 範例：
// prerequisites: ['why-openclaw', 'llm-guide']
// → 表示讀者應先看完這兩篇
```

**用途：**
- 前端可渲染「📖 先讀這些」提示
- AI 生成時可檢查是否有知識斷層
- 未來可建立自動的知識圖譜

### 2.5 預估閱讀時間 (`estimatedMinutes`) — 🆕

```typescript
estimatedMinutes: z.number().min(1).max(60)

// tutorial 通常 10-20 分鐘
// guide 通常 5-10 分鐘
// reference 通常 3-5 分鐘
// troubleshoot 通常 5-10 分鐘
```

### 2.6 適用版本 (`compatibleVersion`) — 🆕

```typescript
// 文章驗證時的 OpenClaw 版本
compatibleVersion: z.string().optional()

// 範例："v0.8.x"、"v1.0+"
```

### 2.7 難度等級 — 保持三級但加明確定義

```typescript
difficulty: z.enum(['入門', '中級', '進階'])
```

| 等級 | 定義 | 前提 |
|------|------|------|
| 入門 | 零技術背景可跟操作 | 無 |
| 中級 | 需理解基本概念，會用命令列 | 完成入門路線 |
| 進階 | 需程式基礎或 DevOps 經驗 | 實務操作經驗 |

### 2.8 系列 (`series`) — 🆕 可選

```typescript
// 標記文章屬於哪個系列
series: z.object({
  name: z.string(),        // 系列名稱，如 "新手入門"、"API Key 申請"
  part: z.number(),        // 第幾篇
}).optional()

// 範例：
// series: { name: "新手入門", part: 3 }
```

**系列的價值：**
- 自動生成系列導覽 UI（上一篇 / 下一篇）
- AI 生成續篇時知道上下文
- 比 `pathStep` 更靈活（可有多個系列）

---

## 三、完整的新 Schema

```typescript
// src/content.config.ts — 新版
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    // === 基本資訊 ===
    title: z.string(),
    description: z.string(),

    // === 分類系統 ===
    contentType: z.enum(['tutorial', 'guide', 'reference', 'troubleshoot']),
    scene: z.enum([
      '認識 OpenClaw',
      '環境準備',
      '安裝與部署',
      '基礎使用',
      '核心功能',
      '整合與自動化',
      '知識與進階',
    ]),
    difficulty: z.enum(['入門', '中級', '進階']),
    tags: z.array(z.string()).min(1).max(8),

    // === 學習路徑 ===
    pathStep: z.number().optional(),              // 主線步驟（新手六步）
    series: z.object({                            // 系列歸屬
      name: z.string(),
      part: z.number(),
    }).optional(),
    order: z.number().optional().default(0),       // scene 內排序
    prerequisites: z.array(z.string()).optional().default([]),  // 前置文章 slug
    estimatedMinutes: z.number().min(1).max(60),   // 預估閱讀時間

    // === 元資料 ===
    createdAt: z.string(),
    verifiedAt: z.string(),
    compatibleVersion: z.string().optional(),      // 適用 OpenClaw 版本
    archived: z.boolean().optional().default(false),
    archivedReason: z.string().optional(),

    // === 互動功能 ===
    discussionUrl: z.string().url().optional(),
    stuckOptions: z.record(z.string(), z.array(z.string())).optional().default({}),
  }),
});

export const collections = { articles };
```

---

## 四、每篇文章的遷移計畫

### 現有文章對照表

| slug | 新 contentType | 新 scene | 新 difficulty | prerequisites | est. min |
|------|---------------|----------|--------------|---------------|----------|
| why-openclaw | guide | 認識 OpenClaw | 入門 | [] | 5 |
| llm-guide | guide | 環境準備 | 入門 | [why-openclaw] | 8 |
| ai-api-key-guide | tutorial | 環境準備 | 入門 | [llm-guide] | 10 |
| google-api-key-guide | tutorial | 環境準備 | 入門 | [ai-api-key-guide] | 10 |
| install-openclaw | tutorial | 安裝與部署 | 入門 | [ai-api-key-guide] | 15 |
| install-openclaw-macos | tutorial | 安裝與部署 | 入門 | [install-openclaw] | 15 |
| install-openclaw-windows | tutorial | 安裝與部署 | 入門 | [install-openclaw] | 15 |
| deploy-openclaw-cloud | tutorial | 安裝與部署 | 入門 | [ai-api-key-guide] | 12 |
| openclaw-first-run | tutorial | 基礎使用 | 入門 | [install-openclaw] | 10 |
| openclaw-model-config | tutorial | 基礎使用 | 中級 | [openclaw-first-run] | 10 |
| openclaw-first-skill | tutorial | 基礎使用 | 入門 | [openclaw-first-run] | 10 |
| openclaw-agent | guide | 核心功能 | 中級 | [openclaw-first-run] | 8 |
| openclaw-skill | guide | 核心功能 | 中級 | [openclaw-first-skill] | 8 |
| openclaw-soul | guide | 核心功能 | 中級 | [openclaw-agent] | 8 |
| mcp-protocol | guide | 核心功能 | 中級 | [why-openclaw] | 10 |
| prompt-engineering | guide | 知識與進階 | 中級 | [openclaw-first-run] | 10 |
| token-economics | guide | 認識 OpenClaw | 入門 | [llm-guide] | 8 |
| telegram-integration | tutorial | 整合與自動化 | 中級 | [openclaw-first-run] | 15 |
| pkm-system | guide | 知識與進階 | 中級 | [openclaw-skill] | 10 |
| media-guide | reference | — | — | — | — (archived) |

---

## 五、建議新增的內容分區（未來 AI 生成方向）

### 5.1 延伸技術文件（contentType: guide / reference）

| 建議文章 | contentType | scene | 價值 |
|---------|-------------|-------|------|
| OpenClaw 架構總覽 | guide | 認識 OpenClaw | 幫讀者建立全局心智模型 |
| API Key 安全管理指南 | guide | 環境準備 | 資安基礎，避免金鑰外洩 |
| 環境變數與設定檔參考 | reference | 基礎使用 | `.env` 設定速查表 |
| Skill 開發模板參考 | reference | 核心功能 | 常用 Skill 範本庫 |
| OpenClaw CLI 指令大全 | reference | 基礎使用 | 指令速查 |
| 模型比較表 | reference | 環境準備 | GPT-4o vs Claude vs Gemini 比較 |

### 5.2 疑難排解文件（contentType: troubleshoot）

| 建議文章 | scene | 常見問題 |
|---------|-------|---------|
| 安裝常見錯誤排解 | 安裝與部署 | Python 版本衝突、pip 錯誤、權限問題 |
| API 連線問題排解 | 環境準備 | Key 無效、配額超過、網路問題 |
| Skill 執行失敗排解 | 核心功能 | 語法錯誤、timeout、權限不足 |

### 5.3 使用者回饋與社群區 — Supabase 擴展

目前 Supabase 已有 article_reactions / section_reactions / QA 系統。建議擴展：

```sql
-- 新增：使用者學習進度追蹤
CREATE TABLE IF NOT EXISTS user_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'stuck')),
  stuck_at TEXT,              -- 卡在哪個步驟
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (fingerprint, slug)
);

-- 新增：文章有效性回報（步驟過時了？截圖不對？）
CREATE TABLE IF NOT EXISTS article_validity_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL,
  section_id TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'outdated_step',    -- 步驟已過時
    'screenshot_wrong', -- 截圖不符
    'link_broken',      -- 連結失效
    'missing_info',     -- 缺少資訊
    'other'
  )),
  description TEXT CHECK (char_length(description) <= 500),
  fingerprint TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_validity_reports_slug ON article_validity_reports(slug);
CREATE INDEX idx_validity_reports_status ON article_validity_reports(status);
```

---

## 六、我額外建議考慮的面向

### 6.1 🔄 文章生命週期管理

```typescript
// 在 schema 中追蹤文章新鮮度
verifiedAt: z.string(),           // 已有 — 最後驗證日期
compatibleVersion: z.string(),    // 新增 — 適用版本
archived: z.boolean(),            // 已有
archivedReason: z.string(),       // 已有
```

**建議邏輯：**
- `verifiedAt` 超過 90 天 → 前端顯示「⚠️ 此文章可能需要更新」
- OpenClaw 大版本更新時 → 批次標記相關文章需要重新驗證
- AI 重新驗證文章時 → 更新 `verifiedAt` 和 `compatibleVersion`

### 6.2 🌐 多語言準備

目前只有繁中，但如果未來要支援英文或簡中：

```typescript
// 未來擴展（暫不實作）
locale: z.enum(['zh-TW', 'zh-CN', 'en']).optional().default('zh-TW'),
```

建議目前在 slug 命名上保持英文，文件結構不混語言，這樣未來需要多語言時可以用 `src/content/articles/zh-TW/` 和 `src/content/articles/en/` 結構拆分。

### 6.3 📊 內容覆蓋度分析

建議加一個腳本，讓 AI 生成文章前先檢查覆蓋度：

```
scene 覆蓋度：
  認識 OpenClaw  ████░░ 2/5 篇
  環境準備        ████████ 4/5 篇
  安裝與部署      ████████ 4/4 篇
  基礎使用        ██████░ 3/4 篇
  核心功能        ████████ 4/5 篇
  整合與自動化    ██░░░░ 1/4 篇  ← 缺口
  知識與進階      ██░░░░ 2/5 篇  ← 缺口

contentType 覆蓋度：
  tutorial       ████████████ 11 篇
  guide          ████████ 8 篇
  reference      ░░░░ 0 篇  ← 完全缺失！
  troubleshoot   ░░░░ 0 篇  ← 完全缺失！
```

### 6.4 🔗 SEO / 結構化資料

教學文章可加入 `HowTo` schema.org 結構化資料，讓 Google 直接顯示步驟：

```typescript
// 未來 SEO 欄位（建議但暫不放入 frontmatter）
// 由 Layout 自動從 contentType === 'tutorial' 生成
```

### 6.5 📱 讀者旅程追蹤

結合 `prerequisites` 和 `series`，前端可以：
1. 顯示「你已完成 3/6 步」進度條
2. 推薦下一篇文章
3. 顯示知識圖譜（哪些概念串在一起）

---

## 七、實作優先順序

| 優先級 | 項目 | 工作量 | 影響 |
|--------|------|--------|------|
| P0 | 更新 `content.config.ts` schema | 小 | 所有後續依賴 |
| P0 | 遷移 19 篇文章 frontmatter | 中 | 必須一次完成 |
| P1 | 建立 CONTROLLED_TAGS 文檔 | 小 | AI 生成品質 |
| P1 | 更新 `copilot-instructions.md` | 小 | AI 遵循新 schema |
| P1 | 更新前端場景渲染邏輯 | 中 | UI 顯示 |
| P2 | Supabase 新增 tables | 小 | 回饋系統 |
| P2 | 覆蓋度分析腳本 | 小 | 內容規劃 |
| P3 | 文章新鮮度提示 UI | 小 | 品質管理 |
| P3 | 知識圖譜視覺化 | 大 | 閱讀體驗 |

---

## 八、場景 icon 對照表（更新 UI 用）

```typescript
const SCENE_CONFIG = {
  '認識 OpenClaw': { icon: '🧭', desc: '了解 OpenClaw 的核心價值與基本概念' },
  '環境準備':      { icon: '🔑', desc: '選擇 LLM、申請 API Key、前置準備' },
  '安裝與部署':    { icon: '💻', desc: '本機安裝或雲端部署 OpenClaw' },
  '基礎使用':      { icon: '🚀', desc: '首次啟動、模型設定、基本操作' },
  '核心功能':      { icon: '🧩', desc: 'Agent、Skill、Soul、MCP 深入理解' },
  '整合與自動化':  { icon: '⚡', desc: '連接外部服務、建立自動化工作流' },
  '知識與進階':    { icon: '📚', desc: '知識管理系統、進階設定與最佳實踐' },
} as const;
```
