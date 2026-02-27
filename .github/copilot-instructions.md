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

## 技術棧

- **框架**：Astro (SSG)
- **樣式**：全域 CSS (`src/styles/global.css`)
- **後端**：Supabase（回饋、互動功能）
- **部署**：靜態網站
- **文章格式**：Markdown（Astro Content Collections）

---

## 檔案結構速查

```
src/content/articles/*.md    ← 教學文章
public/images/articles/*/    ← 文章圖片（按 slug 分資料夾）
scripts/add-image.sh         ← 圖片工作流程 CLI
docs/image-workflow.md       ← 圖片工作流程完整文檔（含 auto-capture 串接說明）
docs/llm-article-prompt.md   ← LLM 生成文章時的 @img 規則
```
