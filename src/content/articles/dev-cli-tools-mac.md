---
title: "Mac 開發者必備 CLI 工具安裝：Homebrew、GitHub CLI、Firebase CLI、Antigravity CLI"
description: "在 Mac 上一次裝好開發常用的命令列工具。先用 Homebrew 打底，再安裝 GitHub CLI、Firebase CLI 與 Google Antigravity CLI，附登入與常見排錯。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-06-25"
verifiedAt: "2026-06-25"
archived: false
order: 12
prerequisites: ["cli-guide"]
estimatedMinutes: 12
tags: ["macOS", "安裝", "Homebrew", "GitHub", "Firebase"]
stuckOptions:
  "安裝 Homebrew": ["Apple Silicon 裝完找不到 brew 指令？", "要不要先裝 Xcode Command Line Tools？"]
  "command not found": ["明明裝好了卻說找不到指令", "PATH 要怎麼設定？"]
  "登入卡住": ["瀏覽器沒有自動打開", "授權後 Terminal 沒反應"]
  "更新工具": ["怎麼一次更新全部工具？", "舊版本怎麼移除？"]
---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **一次裝好，少踩幾個坑**：在 Mac 上，幾乎所有開發者 CLI 工具都能靠 [Homebrew](/articles/cli-guide/) 一行指令搞定。這篇帶你先打好地基，再依序裝上 GitHub CLI、Firebase CLI、以及 Google 的 Antigravity CLI。看完大概 12 分鐘，你的終端機就齊全了。

> 📌 **不熟悉終端機？** 建議先看 [CLI 入門指南](/articles/cli-guide/)，了解「打字操作電腦」是怎麼回事，再回來跟著做會更順。

---

## 🤔 為什麼要用 CLI 工具？

很多服務都有漂亮的網頁後台，但開發時你會發現：**用指令往往更快、更可重複、也更容易被自動化**。

- `gh`（GitHub CLI）：在終端機開 PR、看 issue、clone repo，不用一直切回瀏覽器。
- `firebase`（Firebase CLI）：部署網站、管理資料庫、跑本地模擬器，一行指令完成。
- `agy`（Antigravity CLI）：把 Google Antigravity 的 AI agent 直接帶進終端機。

而這些工具在 Mac 上的共通安裝方式，就是 **Homebrew**。先把它裝好，後面全部都簡單。

---

## 🍺 Step 0：先安裝 Homebrew（地基）

Homebrew 是 macOS 上最主流的套件管理員，可以把它想成「Mac 的 App Store，但全部用指令」。

開啟 **Terminal**（在 Spotlight 搜尋 `terminal`），貼上官方安裝指令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

> 💡 第一次執行會請你輸入 Mac 的登入密碼（輸入時不會顯示字元，是正常的），並可能順便安裝 Xcode Command Line Tools，耐心等它跑完即可。

裝完後，**Apple Silicon（M1/M2/M3/M4）使用者**要把 brew 加進 PATH，否則會出現「command not found」：

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

驗證安裝成功：

```bash
brew --version
```

看到版本號就代表地基打好了。

<!-- @img: brew-version-check | 終端機執行 brew --version 顯示版本號 -->

---

## 🐙 Step 1：GitHub CLI（`gh`）

GitHub 官方的命令列工具，讓你在終端機直接操作 repo、PR 與 issue。

### 安裝

```bash
brew install gh
```

### 登入

```bash
gh auth login
```

依提示選擇：`GitHub.com` → `HTTPS` → 同意用 Git 認證 → `Login with a web browser`。終端機會給你一組一次性代碼，並自動打開瀏覽器，貼上代碼授權即可。

<!-- @img: gh-auth-browser | 瀏覽器顯示 GitHub CLI 裝置授權頁面 -->

### 確認與常用指令

```bash
# 確認登入身份
gh auth status

# clone 一個 repo（不用打完整網址）
gh repo clone 589411/launchdock

# 在當前 repo 開一個 PR
gh pr create

# 看目前 repo 的 issue 清單
gh issue list
```

---

## 🔥 Step 2：Firebase CLI（`firebase`）

Google Firebase 的命令列工具，用來部署網站、管理 Firestore、跑本地模擬器。

### 安裝

```bash
brew install firebase-cli
```

> 💡 **偏好用 npm？** 如果你已經裝了 Node.js，也可以用 `npm install -g firebase-tools`。兩種擇一即可，不要重複裝以免版本打架。

### 登入

```bash
firebase login
```

會自動打開瀏覽器，選擇你的 Google 帳號並同意授權，終端機就會顯示登入成功。

<!-- @img: firebase-login-browser | 瀏覽器顯示 Firebase CLI Google 帳號授權頁面 -->

### 確認與常用指令

```bash
# 確認版本
firebase --version

# 查看你能存取的專案
firebase projects:list

# 在專案資料夾初始化 Firebase
cd ~/your-project
firebase init

# 部署
firebase deploy
```

---

## 🚀 Step 3：Antigravity CLI（`agy`）

Google Antigravity 的終端機版 AI coding agent，把 agent 的推理與執行能力直接帶進命令列。

### 安裝

```bash
brew install --cask antigravity-cli
```

> 💡 **不想用 Homebrew？** 官方也提供安裝腳本：
> ```bash
> curl -fsSL https://antigravity.google/cli/install.sh | bash
> ```
> 這種方式預設會把 `agy` 安裝到 `~/.local/bin/agy`，記得確認該路徑有在你的 PATH 裡。

### 首次啟動與登入

直接執行：

```bash
agy
```

第一次啟動會引導你用 Google 帳號登入，自動打開瀏覽器完成 Google Sign-In（一般、AI Pro、Ultra 帳號皆可）。

<!-- @img: antigravity-auth-browser | 瀏覽器顯示 Antigravity CLI Google 登入授權頁面 -->

授權完成後回到終端機，就能開始在命令列裡與 agent 對話、交辦任務。

---

## 🚨 常見問題快速排查

### 問題一：`command not found: brew`（或 gh / firebase / agy）

**症狀**：明明裝好了，輸入指令卻說找不到。

**原因**：工具的執行檔路徑不在 PATH 裡，最常見於 Apple Silicon 的 Homebrew（裝在 `/opt/homebrew`）。

**處理方式**：執行 Step 0 的 PATH 設定指令，然後**關掉再重開一個 Terminal 視窗**。若是 Antigravity 用腳本安裝，確認 `~/.local/bin` 也在 PATH：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### 問題二：登入時瀏覽器沒有自動打開

把終端機顯示的網址手動複製，貼到瀏覽器開啟即可。授權完成後回終端機，通常幾秒內就會偵測到。

### 問題三：`brew install` 卡住或下載很慢

多半是網路問題。可以先 `brew update` 更新後再試；公司網路若有 Proxy，需向 IT 確認對外連線白名單。

---

## 💡 日常維護：一次更新全部工具

Homebrew 最方便的地方，就是所有工具都能一起升級：

```bash
# 更新 Homebrew 本身的套件清單
brew update

# 升級所有已安裝的工具（含 gh、firebase、antigravity）
brew upgrade

# 清掉舊版本騰出空間
brew cleanup
```

```bash
# 單獨升級某個工具
brew upgrade gh

# 移除某個工具
brew uninstall firebase-cli
```

> 💡 養成偶爾 `brew update && brew upgrade` 的習慣，工具就能一直保持最新版，少踩舊版本的坑。

---

## 🔗 延伸閱讀

- **還不熟命令列？** → [CLI 入門指南：命令列到底是什麼？](/articles/cli-guide/)
- **想在 Mac 跑 AI Agent？** → [macOS 安裝 OpenClaw 完整教學](/articles/install-openclaw-macos/)
- **想用 Docker 跑自動化工具？** → [Mac 安裝 Docker + n8n 完整指南](/articles/docker-n8n-mac/)
