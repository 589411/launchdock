# LaunchDock — AI 協作指引

這是 LaunchDock 的 AI coding agent 共用指令。
所有 LLM（Copilot、Claude Code、Cursor、Gemini CLI 等）進入此 repo 時請遵守。

---

## 專案概述

LaunchDock 是一個 Astro 靜態網站，為中文使用者提供 OpenClaw AI Agent 的教學文章。
文章位於 `src/content/articles/*.md`，圖片位於 `public/images/articles/<slug>/`。

---

## 🔴 最重要的規則：圖片工作流程

本站教學文章的核心價值在於「讀者能跟著操作」，因此**螢幕截圖是最重要的功能**。

### @img 標記系統

任何時候生成或編輯教學文章，都必須在需要截圖的位置放置佔位標記：

```
<!-- @img: 描述性檔名 | alt 說明文字 -->
```

**完整規範見 `docs/image-workflow.md`，以下是速查規則：**

#### 格式規則
- `描述性檔名`：kebab-case 英文（如 `zeabur-signup`、`create-project-button`）
- `alt 說明文字`：中文，簡述截圖內容
- 標記放在操作步驟正下方，獨立一行，前後各空一行
- GIF 操作用 `.gif` 後綴：`<!-- @img: demo.gif | 操作示範 -->`

#### 什麼時候必須放
- UI 操作步驟（點擊、選擇、填表）
- 設定頁面、錯誤畫面、完成確認畫面

#### 什麼時候不放
- 純文字概念說明
- 命令列輸出（用 code block）
- 外部網站連結

#### 範例
```markdown
#### Step 1：註冊帳號

1. 前往 zeabur.com
2. 點擊「Sign Up」

<!-- @img: zeabur-signup | Zeabur 註冊頁面 -->
```

### CLI 工具

圖片處理用 `scripts/add-image.sh`：

```bash
# 查看文章截圖狀態
./scripts/add-image.sh <slug> --scan

# 為現有文章加入 @img 標記
./scripts/add-image.sh <slug> --retrofit

# 手動新增標記
./scripts/add-image.sh <slug> --add-marker

# 處理圖片 + 互動配對
./scripts/add-image.sh <slug> ~/Desktop/*.png

# 驗證圖片連結
./scripts/add-image.sh <slug> --validate

# 遷移舊的 📸 標記
./scripts/add-image.sh --migrate-markers
```

### 三階段流程

```
Phase 1: LLM 生成文章 → 自動包含 @img 標記
Phase 2: 人工截圖     → 提醒使用者操作截圖
Phase 3: CLI 配對     → 引導使用者執行 add-image.sh
```

當你完成 Phase 1（生成/編輯文章）後，**必須提醒使用者**：
> 文章已包含 X 個 @img 截圖標記。請照文章步驟實際操作並截圖，然後執行：
> `./scripts/add-image.sh <slug> <圖片路徑...>`
>
> 💡 如果安裝了 [auto-capture](https://github.com/589411/auto-capture)，可以用：
> `auto-capture --window "App名稱" --output ~/Desktop/captures/<slug>/`
> 操作完成後再執行 `./scripts/add-image.sh <slug> ~/Desktop/captures/<slug>/*.png`

---

## 🟡 概念自動連結系統

本站有一套概念自動連結機制：build 時 Remark 插件會自動將已知概念名詞轉為超連結，文章底部也會自動產生「延伸閱讀」卡片。

### ⚡ 生成/編輯文章前必做

**在生成或編輯任何教學文章之前，必須先讀取 `docs/article-registry.json`**，了解：
- 目前有哪些概念已被定義（避免重複解釋）
- 每個概念的 canonical 文章是哪一篇（該概念已有主文章的，不需重新解釋，讀者會自動看到連結）
- 各文章之間的概念關聯（確保新文章正確定位）

### 寫作守則

1. **用語一致**：使用 `src/data/concepts.yaml` 中的 `displayName` 或 `aliases` 寫法
2. **首次提到用全名**：如「大型語言模型（LLM）」，之後可只用「LLM」
3. **不需手動加連結**：Remark 插件會自動處理概念連結，你只需正常寫文字
4. **引入新概念時**：完成文章後提醒使用者更新 `src/data/concepts.yaml` 並執行 `npm run registry`

### 完成文章後的提醒模板

生成文章後，除了原有的 @img 提醒，還需額外提醒：
> 📘 本文引用了 N 個已知概念（會自動連結），並新增了 M 個新概念。
> 若有新概念，請更新 `src/data/concepts.yaml` 後執行 `npm run registry`。

---

## 文章結構規範

### frontmatter 必要欄位

```yaml
---
title: "標題"
description: "描述"
contentType: "tutorial"  # tutorial | guide | reference | troubleshoot
scene: "安裝與部署"      # 見下方場景列表
difficulty: "入門"        # 入門 | 中級 | 進階
createdAt: "YYYY-MM-DD"
verifiedAt: "YYYY-MM-DD"
archived: false
order: 1
prerequisites: ["slug-of-previous-article"]
estimatedMinutes: 10
tags: ["OpenClaw", "安裝"]  # 1-8 個，優先從受控詞彙選
stuckOptions:
  "步驟名稱": ["常見問題1", "常見問題2"]
---
```

### contentType 說明
- `tutorial`：手把手教學（安裝、設定、API 申請），步驟多、截圖多
- `guide`：概念指南（LLM 科普、Token 經濟學），解釋 why
- `reference`：參考速查（設定表、指令大全），表格為主
- `troubleshoot`：疑難排解（錯誤排查），問題→原因→解法

### scene 可用值
- `認識 OpenClaw`：入門概念、價值主張
- `環境準備`：LLM 選擇、API Key 申請
- `安裝與部署`：本機安裝、雲端部署
- `基礎使用`：首次啟動、模型設定
- `核心功能`：Agent、Skill、Soul、MCP
- `整合與自動化`：Telegram、外部服務
- `知識與進階`：PKM、進階設定
- `鴨編的碎碎念`：AI 趨勢觀察、產業洞察

### 受控標籤（tags 優先從此選擇）
- **平台**：OpenClaw, KimiClaw, Zeabur, Docker, Telegram, Notion, Obsidian
- **AI 供應商**：OpenAI, Anthropic, Google, OpenRouter, Ollama, DeepSeek
- **作業系統**：macOS, Windows, Linux, WSL
- **核心概念**：LLM, API, Agent, Skill, Soul, MCP, Token, Prompt, RAG
- **操作類型**：安裝, 設定, 申請, 部署, 除錯, 整合

### 可選欄位
- `pathStep`：主線學習步驟編號（1-6）
- `series`：系列歸屬（name + part）
- `compatibleVersion`：適用 OpenClaw 版本
- `discussionUrl`：討論連結

### 文章風格
- 繁體中文
- 口語化但專業
- 用「你」稱呼讀者
- 每個步驟清楚編號
- 常見錯誤用 `### 🚨` 標記

---

## 🌐 多語系（i18n）

本站支援繁體中文（預設）和英文。

### 生成新文章時必須同時產出英文版

| 語言 | 路徑 | scene 值 | difficulty 值 |
|------|------|----------|---------------|
| 繁中 | `src/content/articles/<slug>.md` | 中文（`認識 OpenClaw`） | 中文（`入門`） |
| 英文 | `src/content/articles/en/<slug>.md` | 英文 key（`intro`） | 英文 key（`beginner`） |

**Scene 對照**：認識 OpenClaw→`intro` / 環境準備→`env-setup` / 安裝與部署→`install` / 基礎使用→`basics` / 核心功能→`core` / 整合與自動化→`integration` / 知識與進階→`advanced` / 鴨編的碎碎念→`blog`

**Difficulty 對照**：入門→`beginner` / 中級→`intermediate` / 進階→`advanced`

**規則**：
- slug 相同（中英共用 `why-openclaw.md`）
- `@img` 標記保留，alt 文字改英文
- 圖片共用 `public/images/articles/<slug>/`
- 英文風格：professional but approachable, use "you", numbered steps
- 完成後提醒：`🌐 已同時生成英文版：src/content/articles/en/<slug>.md`

---

## 技術棧

- **框架**：Astro (SSG)
- **樣式**：全域 CSS (`src/styles/global.css`)
- **後端**：Supabase（回饋、互動功能）
- **部署**：靜態網站
- **文章格式**：Markdown（Astro Content Collections）

---

## 檔案結構速查

```
src/content/articles/*.md    ← 教學文章（繁中）
src/content/articles/en/*.md ← 教學文章（英文）
src/i18n/ui.ts               ← UI 翻譯字典（zh-tw / en）
src/i18n/utils.ts            ← i18n helpers
src/data/concepts.yaml       ← 受控概念定義（displayName、aliases、canonical article）
public/images/articles/*/    ← 文章圖片（按 slug 分資料夾）
docs/article-registry.json   ← ⭐ 概念×文章交叉索引（生成文章前必讀）
docs/image-workflow.md       ← 圖片工作流程完整文檔（含 auto-capture 串接說明）
docs/llm-article-prompt.md   ← LLM 生成文章時的 @img 與概念連結規則
scripts/add-image.sh         ← 圖片工作流程 CLI
scripts/generate-article-registry.mjs ← 重新產生 article-registry.json
plugins/remark-concept-links.mjs      ← 概念自動連結 Remark 插件
```
