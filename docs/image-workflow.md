# 圖片工作流程完整指引

> 本文件是 LaunchDock 文章截圖插入的**唯一權威參考**。  
> 供人類作者和 LLM 共同遵守。最後更新：2026-02-25。

---

## 目錄

1. [核心概念](#核心概念)
2. [三階段流程](#三階段流程)
3. [@img 標記規範](#img-標記規範)
4. [CLI 工具完整指令](#cli-工具完整指令)
5. [情境操作手冊](#情境操作手冊)
6. [檔案結構與命名規範](#檔案結構與命名規範)
7. [截圖品質規範](#截圖品質規範)
8. [自動截圖工具串接（auto-capture）](#自動截圖工具串接auto-capture)

---

## 🚀 自動化工作流程（推薦）

**新功能！** 現在可以使用一鍵式工作流程腳本，自動完成從選定文章到上架的所有步驟。

```bash
# 互動式完整流程
./scripts/article-workflow.sh

# 直接指定文章
./scripts/article-workflow.sh ollama-openclaw
```

**自動執行：**
1. ✅ 選定文章並檢查 @img 標記
2. ✅ 創建截圖資料夾
3. ✅ 自動截圖（監聽點擊）+ 標註 + GIF 動畫
4. ✅ 檢查並遮蔽敏感資訊
5. ✅ Vision AI 辨識圖片內容
6. ✅ 自動配對並寫入文章
7. ✅ 複製到 public/images
8. ✅ 上架前最終安全檢查

**詳細說明：** 請參閱 [文章截圖自動化工作流程](./article-workflow-guide.md)

---

## 核心概念

```
LLM 負責「決定哪裡需要圖」 → 放 @img 標記
人類負責「截對的圖」         → 實際操作截圖
CLI 負責「串起來」           → 自動配對、壓縮、插入
```

- `@img 標記`：HTML 註解 `<!-- @img: 檔名 | alt 說明 -->`，不會在網頁上顯示
- `article slug`：文章的檔名（不含 `.md`），例如 `deploy-openclaw-cloud`
- 圖片最終位置：`public/images/articles/<slug>/`

---

## 三階段流程

### Phase 1：LLM 生成文章（含 @img 標記）

LLM 在生成教學文章時，自動在需要截圖的位置放置 `@img` 標記。

**觸發方式**：在 prompt 中加入 `docs/llm-article-prompt.md` 的內容，或直接指示：
> 「在需要螢幕截圖的位置放 `<!-- @img: 檔名 | alt 說明 -->` 標記」

**產出範例**：
```markdown
#### Step 1：註冊帳號

1. 前往 zeabur.com
2. 用 GitHub 帳號登入

<!-- @img: zeabur-signup | Zeabur 註冊頁面 -->

#### Step 2：建立新專案

1. 點擊「Create Project」

<!-- @img: create-project | 建立新專案畫面 -->
```

### Phase 2：人工操作截圖

1. 打開文章 markdown，照步驟實際操作
2. 每遇到 `@img` 標記，截取對應畫面
3. 截圖**不需要特別命名**（`截圖1.png`、`Screen Shot...png` 都行）
4. 全部放到一個資料夾，例如 `~/Desktop/screenshots/`

### Phase 3：CLI 配對插入

```bash
./scripts/add-image.sh <slug> ~/Desktop/screenshots/*.png
```

CLI 互動式引導你將每張圖配對到對應的 `@img` 標記，完成後文章自動更新為正式圖片語法。

---

## @img 標記規範

### 格式

```
<!-- @img: 描述性檔名 | alt 說明文字 -->
```

| 欄位 | 規則 | 範例 |
|---|---|---|
| `描述性檔名` | kebab-case 英文 | `zeabur-signup`、`env-vars-panel` |
| `alt 說明文字` | 中文，簡述截圖內容 | `Zeabur 註冊頁面，GitHub 登入按鈕位置` |

### 放置規則

- 放在對應操作步驟的**正下方**
- 每個標記獨立一行，前後各空一行
- 不加數字前綴（順序由文章中的位置決定）

### 什麼時候需要放

| 需要 | 不需要 |
|---|---|
| UI 操作步驟（點擊、選擇） | 純文字說明、概念解釋 |
| 表單填寫畫面 | 命令列輸出（用 code block） |
| 設定頁面 | 外部網站首頁（用超連結） |
| 錯誤畫面 | |
| 完成確認畫面 | |

### GIF 標記

多步驟連續操作，檔名加 `.gif` 後綴：

```
<!-- @img: skill-create-demo.gif | 建立 Skill 的完整操作流程 -->
```

---

## CLI 工具完整指令

工具位置：`scripts/add-image.sh`

### 指令總覽

| 指令 | 說明 | 修改文章？ |
|---|---|---|
| `./scripts/add-image.sh` | 顯示說明 | 否 |
| `./scripts/add-image.sh <slug> <圖片...>` | **主功能**：處理圖片 + 互動配對 | 是 |
| `./scripts/add-image.sh <slug> --scan` | 查看標記/圖片狀態 | 否 |
| `./scripts/add-image.sh <slug> --dry-run <圖片...>` | 預覽配對結果 | 否 |
| `./scripts/add-image.sh <slug> --retrofit` | 為現有文章加入 @img 標記 | 是 |
| `./scripts/add-image.sh <slug> --add-marker` | 手動新增一個 @img 標記 | 是 |
| `./scripts/add-image.sh <slug> --validate` | 檢查圖片連結有效性 | 否 |
| `./scripts/add-image.sh <slug> --migrate-markers` | 單篇遷移舊 📸 標記 | 是 |
| `./scripts/add-image.sh --migrate-markers` | 全站遷移舊 📸 標記 | 是 |

### 詳細說明

#### 主功能：處理圖片 + 互動配對

```bash
./scripts/add-image.sh deploy-openclaw-cloud ~/Desktop/step1.png ~/Desktop/step2.png
```

**流程**：
1. **Step 1 — 處理圖片**：複製到 `public/images/articles/<slug>/`，自動壓縮（超過 1200px 寬度會縮小）、檔名正規化
2. **🔒 敏感資訊檢測**（自動執行）：使用 OCR 掃描圖片中的文字，檢測：
   - Email 地址
   - API Keys（OpenAI、Anthropic、Google、AWS、GitHub）
   - 主機名稱
   - 信用卡號
   - 其他可疑的 token 或密鑰
   
   若偵測到敏感資訊，會詢問是否自動遮蔽（馬賽克處理）。**強烈建議接受遮蔽，確保圖片上架安全。**
   
3. **Step 2 — 掃描標記**：找出文章中所有 `<!-- @img: ... -->` 標記並列出
4. **Step 3 — 互動配對**：逐張圖片詢問要放在哪個位置
   - 輸入**數字**：配對到對應的 @img 標記（標記會被替換為 `![alt](path)`）
   - 輸入 **h1, h2, h3...**：直接插到某個 heading 之後（不需要先有標記）
   - 輸入 **s**：跳過這張圖

**互動模式**（不指定圖片）：
```bash
./scripts/add-image.sh deploy-openclaw-cloud
# 然後拖曳圖片到終端，每行一個，空行結束
```

#### --scan：查看狀態

```bash
./scripts/add-image.sh deploy-openclaw-cloud --scan
```

顯示：
- 📌 待配對的 @img 標記（含行號和說明）
- 🖼 已插入的圖片
- ⚠️ 舊的 📸 標記（提示遷移）
- 📁 圖片資料夾中的檔案清單

#### --dry-run：預覽模式

```bash
./scripts/add-image.sh deploy-openclaw-cloud --dry-run ~/Desktop/*.png
```

走完配對流程但**不修改任何檔案**，適合先確認再執行。

#### --retrofit：為現有文章加標記

```bash
./scripts/add-image.sh deploy-openclaw-cloud --retrofit
```

針對**已生成但沒有 @img 標記**的文章：
1. 列出所有 heading
2. 你選擇哪些 heading 之後需要截圖（輸入數字、空格分隔，或 `a` 全選）
3. 為每個選中的位置輸入標記名稱和 alt 說明
4. 自動插入 @img 標記到文章中

#### --add-marker：手動新增標記

```bash
./scripts/add-image.sh deploy-openclaw-cloud --add-marker
```

當 LLM 少放了標記，你想在特定位置多加一個：
1. 列出所有 heading
2. 選擇位置
3. 輸入檔名和 alt 說明
4. 自動插入

#### --validate：檢查連結

```bash
./scripts/add-image.sh deploy-openclaw-cloud --validate
```

掃描文章中所有 `![alt](path)` 圖片引用，檢查對應檔案是否存在。

#### --migrate-markers：遷移舊標記

```bash
# 單篇文章
./scripts/add-image.sh deploy-openclaw-cloud --migrate-markers

# 全站所有文章
./scripts/add-image.sh --migrate-markers
```

將舊格式 `<!-- 📸 截圖建議：XXX -->` 和其下方的 `<!-- ![alt](path) -->` 註解行，自動轉換為新的 `<!-- @img: auto-name | XXX -->` 格式。

---

## 情境操作手冊

### 情境 A：LLM 生成新文章 + 截圖

```bash
# 1. LLM 生成文章（prompt 中包含 @img 標記規則）
# 2. 照文章操作，截圖放到 ~/Desktop/screenshots/
# 3. 執行 CLI
./scripts/add-image.sh google-api-key-guide ~/Desktop/screenshots/*.png
# 4. 互動配對
# 5. 預覽
npm run dev  # 打開 http://localhost:4321/articles/google-api-key-guide
# 6. 提交
git add public/images/articles/google-api-key-guide/ src/content/articles/google-api-key-guide.md
git commit -m "feat: add screenshots to google-api-key-guide"
```

### 情境 B：為已存在的文章補截圖

文章已經生成了，但沒有 @img 標記：

```bash
# 1. 先加入標記
./scripts/add-image.sh deploy-openclaw-cloud --retrofit
# 2. 照文章操作截圖
# 3. 配對插入
./scripts/add-image.sh deploy-openclaw-cloud ~/Desktop/*.png
```

### 情境 C：LLM 標記不夠，手動追加

```bash
# 方式 1：用 CLI
./scripts/add-image.sh deploy-openclaw-cloud --add-marker

# 方式 2：直接編輯 markdown
# 在想要的位置手動加入：
# <!-- @img: custom-screenshot | 自訂說明 -->

# 方式 3：配對時直接選 heading 位置
# 執行主功能時，輸入 h1/h2/h3... 插到 heading 之後（無需先有標記）
```

### 情境 D：更換已有的截圖

```bash
# 1. 把新圖片放到 public/images/articles/<slug>/ 覆蓋舊檔
# 2. 或刪除舊圖，重新跑 CLI 配對
```

### 情境 E：遷移全站舊格式標記

```bash
# 1. 預覽（不修改）
./scripts/add-image.sh --migrate-markers  # 先看會改哪些

# 2. 正式遷移
./scripts/add-image.sh --migrate-markers

# 3. 確認結果
./scripts/add-image.sh deploy-openclaw-cloud --scan
```

### 情境 F：LLM 協助截圖（LLM 如何知道針對哪篇文章）

當 LLM 協助你處理截圖流程時，它需要知道 **article slug**。

提供方式：
- 直接告訴 LLM：「我要處理 `deploy-openclaw-cloud` 這篇文章的截圖」
- 或讓 LLM 執行 `--scan` 查看：`./scripts/add-image.sh deploy-openclaw-cloud --scan`
- LLM 即可讀取文章內容、標記狀態，並引導你完成 Phase 2 和 Phase 3

---

## 檔案結構與命名規範

### 目錄結構

```
public/images/articles/
└── {article-slug}/          ← 與文章 slug 對應
    ├── zeabur-signup.png
    ├── create-project.png
    ├── deploy-service.gif
    └── env-vars-panel.png
```

### 圖片命名

由 CLI 自動處理：
- 轉小寫
- 空格替換為 `-`
- 移除特殊字元，只保留 `a-z 0-9 . _ -`

你可以隨意命名原始截圖，CLI 會正規化。

### 文章位置

```
src/content/articles/{slug}.md
```

slug 就是檔名去掉 `.md`，例如：
- `deploy-openclaw-cloud.md` → slug = `deploy-openclaw-cloud`
- `google-api-key-guide.md` → slug = `google-api-key-guide`

---

## 截圖品質規範

| 項目 | 建議 |
|---|---|
| 格式 | PNG（靜態），GIF（多步驟操作） |
| 寬度 | 800–1200px（超過會被 CLI 自動縮小） |
| 單張大小 | < 500KB（超過會警告） |
| GIF 大小 | < 2MB（超過會警告） |
| GIF 時長 | 3–10 秒 |
| 裁剪 | 只截重點區域，不截全螢幕 |
| 標註 | 用箭頭或框線指出重點（推薦 CleanShot X / Shottr） |
| **🔒 敏感資訊** | **執行 CLI 時會自動掃描並提醒遮蔽**，也可手動檢查：Email、API Key、主機名稱、Terminal 路徑等 |

### 🔒 敏感資訊處理

圖片上架**必經流程**：在執行 `./scripts/add-image.sh` 處理圖片時，會自動：

1. **OCR 掃描圖片文字**（macOS Vision 框架）
2. **模式匹配偵測**：
   - Email 地址
   - API Keys（OpenAI `sk-***`、Anthropic、Google、AWS、GitHub）
   - 信用卡號（含 Luhn 驗證）
   - 主機名稱、內部路徑
   - 其他可疑的 token

3. **互動確認**：
   - 若偵測到敏感資訊，列出所有匹配項目
   - 詢問「是否自動遮蔽？(Y/n)」
   - 按 Enter 或輸入 `y` → 自動以馬賽克遮蔽
   - 輸入 `n` → 跳過（需手動處理後再上架）

**技術實作**：
- 需要安裝 `auto-capture`：`pip install auto-capture`
- 如果未安裝 auto-capture，會顯示警告但不阻擋流程
- 遮蔽演算法：區域縮小 → 最近鄰插值放大 → 馬賽克效果
- 原始圖片被直接覆蓋（請確保有備份或 Git 版控）

**手動檢查**（不透過 CLI）：
```bash
# 單張圖片檢測
auto-capture --redact ~/Desktop/screenshot.png

# 批次處理一個資料夾
for f in ~/Desktop/screenshots/*.png; do
  auto-capture --redact "$f"
done
```

---

## 自動截圖工具串接（auto-capture）

> `auto-capture` 是獨立的 Python CLI 工具，位於另一個 repo。
> 它負責「一邊操作一邊自動截圖」，產出的圖片再由本 repo 的 `add-image.sh` 串接到文章中。

### 為什麼分開

| 面向 | launchdock | auto-capture |
|---|---|---|
| 語言 | Node.js / Astro | Python (pyobjc + Pillow) |
| 平台 | 跨平台 | macOS 專用 |
| 用途 | 靜態網站 + 內容管理 | 螢幕截圖擷取工具 |
| 安裝方式 | npm install | pip install / pipx |

兩者的技術棧和使用對象不同，放同一 repo 會增加不必要的依賴。

### auto-capture 功能簡述

- **Window capture**：擷取指定視窗（非全螢幕），使用 macOS `screencapture -l <windowID>`
- **Click trigger**：透過 `CGEventTap` 監聽滑鼠點擊，自動觸發截圖
- **Hotkey trigger**：手動按下快捷鍵（如 `Ctrl+Shift+S`）也能截圖
- **Click annotation**：在截圖上用可調整的框線 / 圓圈標註「點擊在哪裡」
  - 可設定框線大小、顏色、線寬
- **Sequential naming**：產出檔名按序號排列 `001.png`, `002.png`, …

### 串接流程

```
┌───────────────┐      檔案系統      ┌───────────────────┐
│  auto-capture │  ──── *.png ────▷  │  add-image.sh     │
│  (Python CLI) │                    │  (Bash CLI)       │
└───────────────┘                    └───────────────────┘
       ▲                                      │
       │ 操作應用程式                            ▼
    使用者                              文章 .md 檔更新
```

**步驟：**

```bash
# 1. 用 auto-capture 錄製截圖（在 auto-capture repo 中）
auto-capture --window "OpenClaw" --output ~/Desktop/captures/deploy-openclaw-cloud/

# 2. 操作完成後，回到 launchdock repo
cd ~/Documents/github/launchdock

# 3. 用 add-image.sh 將截圖配對到文章的 @img 標記
./scripts/add-image.sh deploy-openclaw-cloud ~/Desktop/captures/deploy-openclaw-cloud/*.png
```

### 輸出規範（auto-capture 必須遵守）

為了讓 `add-image.sh` 順利配對，auto-capture 的輸出需符合：

| 項目 | 規範 |
|---|---|
| 格式 | PNG（預設），GIF（可選） |
| 檔名 | 序號開頭：`001.png`, `002.png`, …（add-image.sh 按順序對應 @img 標記） |
| 輸出目錄 | 使用者指定，建議 `~/Desktop/captures/<slug>/` |
| 單張大小 | 建議 < 2MB（原始截圖；add-image.sh 會負責壓縮到 < 500KB） |
| 解析度 | macOS Retina 下 `screencapture` 會產生 2x 解析度，add-image.sh 會自動 resize |
| 標註 | auto-capture 負責加標註框；add-image.sh 不處理標註 |

### 快速指令對照

| 需求 | 指令 |
|---|---|
| 開始錄製 | `auto-capture --window "App名稱" --output <dir>` |
| 僅手動觸發 | `auto-capture --window "App名稱" --output <dir> --manual-only` |
| 錄完配對 | `./scripts/add-image.sh <slug> <dir>/*.png` |
| 先看有幾個標記 | `./scripts/add-image.sh <slug> --scan` |
| 驗證配對結果 | `./scripts/add-image.sh <slug> --validate` |

### Repo 位置

- **本 repo（launchdock）**：`~/Documents/github/launchdock/`
- **auto-capture repo**：`~/Documents/github/auto-capture/`（獨立安裝，`pip install -e .` 或 `pipx install .`）

---

## 給 LLM 的快速參考

如果你是 LLM，在生成或編輯文章時：

1. **生成新文章**：在每個 UI 操作步驟後放 `<!-- @img: kebab-name | 中文描述 -->`
2. **檢查現有文章**：執行 `./scripts/add-image.sh <slug> --scan` 查看狀態
3. **幫使用者加標記**：執行 `./scripts/add-image.sh <slug> --add-marker` 或 `--retrofit`
4. **確認圖片有效**：執行 `./scripts/add-image.sh <slug> --validate`
5. **完整格式定義**：見 `docs/llm-article-prompt.md`
