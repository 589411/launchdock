# 🚀 LaunchDock

> **弄髒雙手，但不用弄髒全身**

[LaunchDock](https://launchdock.app) 是一個互動式中文學習平台，專為想上手 **OpenClaw AI Agent** 的新手打造。不只看教學，而是跟著做。

---

## ✨ 功能亮點

### 📖 結構化學習路線
- **新手養蝦路線**：6 步主線學習路徑，從認識 OpenClaw → 建立第一個 Skill
- **8 大場景分類**：認識 OpenClaw、環境準備、安裝與部署、基礎使用、核心功能、整合與自動化、知識與進階、鴨編觀點
- **25+ 篇教學文章**，依難度分級（入門 / 中級 / 進階）
- **文章前後關聯**：先修條件、系列文歸屬

### 💬 段落層級互動回饋
每個 h2 段落旁都有即時反應列：
- 👍 **看懂了** / 😵 **卡關了** / 😢 **看不懂**
- 選擇卡關時自動觸發「卡關偵測」，從 `stuckOptions` 列出常見問題
- 匿名指紋去重，支援 Supabase 即時同步

### 🎯 文章層級情緒回饋
- 🚀 成功 / 👍 有幫助 / 😵 卡關 / 😢 看不懂
- 卡關可附加文字說明，幫助作者改善內容

### ❓ 問答系統
- 讀者可在每篇文章的段落下方提問與回答
- 支援答案投票、內容篩選
- 首頁社群討論板同樣基於問答系統

### 🎬 GIF 播放控制器
- 教學 GIF 自動凍結於首次播放後，點擊重播
- 規格：12 幀循環（11×80ms + 1×320ms），800ms 凍結點

### 🖼️ 圖片工作流程（@img 標記系統）
三階段工作流，結合 LLM 產文 → 人工截圖 → CLI 自動配對：
```bash
./scripts/add-image.sh <slug> --scan       # 檢查截圖狀態
./scripts/add-image.sh <slug> ~/path/*.png  # 自動配對並插入
./scripts/add-image.sh <slug> --validate   # 驗證圖片連結
```

---

## 🛠 技術棧

| 層級 | 技術 |
| :--- | :--- |
| 框架 | [Astro](https://astro.build) (SSG) + [React](https://react.dev) (互動元件) |
| 樣式 | [Tailwind CSS](https://tailwindcss.com) v4 |
| 後端 | [Supabase](https://supabase.com)（回饋、問答、投票） |
| 部署 | 靜態網站 → https://launchdock.app |
| 文章 | Markdown（Astro Content Collections） |

---

## 📂 專案結構

```
src/
├── content/articles/*.md       ← 教學文章（Markdown）
├── components/                 ← Astro / React 元件
│   ├── SectionReactions.tsx    ← 段落反應列（👍 😵 😢）
│   ├── EmotionFeedback.tsx     ← 文章情緒回饋
│   ├── ArticleQA.tsx           ← 問答系統
│   ├── HomeDiscussion.tsx      ← 首頁討論板
│   ├── GifPlayer.astro         ← GIF 播放控制
│   ├── LearningPath.astro      ← 學習路線元件
│   └── SceneCard.astro         ← 場景卡片
├── layouts/                    ← 頁面佈局
├── pages/                      ← 路由頁面
├── lib/                        ← Supabase client、安全驗證
└── styles/global.css           ← 全域樣式
public/images/articles/*/       ← 文章圖片（按 slug 分資料夾）
scripts/add-image.sh            ← 圖片工作流程 CLI
supabase/schema.sql             ← 資料庫結構定義
docs/                           ← 內部文件與規劃資料
```

---

## 🗄️ 資料庫結構（Supabase）

| 資料表 | 用途 |
| :--- | :--- |
| `article_reactions` | 文章層級回饋（🚀 👍 😵 😢），fingerprint 去重 |
| `section_reactions` | 段落層級回饋（👍 😵 😢），per h2 section |
| `qa_questions` | 文章問答 & 首頁討論 |
| `qa_answers` | 回答與 helpful 計數 |
| `qa_helpful_votes` | 防止重複投票 |

全部資料表啟用 **Row Level Security (RLS)**，匿名讀寫，透過 fingerprint + UNIQUE 約束防灌票。

---

## 🔒 安全機制

- **匿名指紋**：基於 timezone、螢幕、canvas 等瀏覽器特徵產生，不蒐集 PII
- **內容驗證**：攔截 prompt injection（20+ 模式）、XSS/HTML 注入
- **速率限制**：提問 3 次/10 分鐘、回答 5 次/10 分鐘、投票 10 次/5 分鐘

---

## 🚀 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構正式版本
npm run build

# 預覽建構結果
npm run preview
```

### 環境變數（可選）

如需啟用 Supabase 互動功能，建立 `.env`：
```
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

未設定時，互動功能自動降級為 localStorage 本地儲存。

---

## 🤖 AI 協作

本專案內建 AI coding agent 指引（`.github/copilot-instructions.md`），支援 GitHub Copilot、Claude Code 等工具，協作時自動遵循：
- 文章結構規範與 frontmatter schema
- @img 圖片標記系統
- 繁體中文口語風格

---

## 📄 License

MIT
