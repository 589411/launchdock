---
title: "Claude Code 怎麼安裝？Windows／Mac 一行指令裝好、登入、第一次啟動"
description: "Claude Code 是跑在終端機裡的 AI 寫程式助手。這篇用最新的官方原生安裝法，分 Mac 與 Windows 兩條路走完：開終端機、貼一行指令、確認版本、登入帳號、第一次啟動，還有 command not found、&& 不是有效陳述式、要不要裝 Git for Windows 這些最常卡關的地方。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-10-22"
verifiedAt: "2026-10-22"
archived: false
order: 7
prerequisites: ["cli-guide"]
estimatedMinutes: 10
tags: ["Anthropic", "安裝", "macOS", "Windows", "WSL"]
stuckOptions:
  "開終端機": ["我不知道終端機在哪", "PowerShell 和 CMD 差在哪？", "Mac 的終端機要怎麼開？"]
  "貼上安裝指令": ["貼了指令都沒有反應", "出現 && 不是有效的陳述式", "出現 irm 不是內部或外部命令"]
  "確認安裝成功": ["claude 顯示 command not found", "claude 無法辨識為 Cmdlet", "裝好了但開新視窗才有用"]
  "登入": ["我沒有付費方案能用嗎？", "瀏覽器沒有自動跳出來", "登入後終端機沒反應"]
---

> **一句話**：Claude Code 現在**不用裝 Node.js、不用 npm**，官方推薦的「原生安裝」只要**貼一行指令**——Mac 貼 `curl -fsSL https://claude.ai/install.sh | bash`，Windows 在 PowerShell 貼 `irm https://claude.ai/install.ps1 | iex`。裝完**開一個新的終端機視窗**，打 `claude --version` 看到版本號就成功，再打 `claude` 照瀏覽器提示登入即可。

**關鍵字**：安裝 Claude Code、Claude Code Windows、Claude Code Mac、claude command not found、install.sh、install.ps1、Git for Windows、claude --version、claude doctor

---

## Claude Code 是什麼？先搞懂再裝

網頁版 Claude 是你在瀏覽器裡跟它聊天；**Claude Code 是把同一個 Claude 請進你的終端機**，它可以直接讀你資料夾裡的檔案、改檔案、跑指令，幫你把一件事從頭做到尾。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：網頁版像是你把文件拍照傳給顧問、顧問在電話裡回答你；Claude Code 像是顧問**直接坐到你的電腦前**，看得到你的資料夾，還能幫你動手改。能力更強，所以第一次用也要更小心一點——這點後面「第一次啟動」會提醒。

如果你完全沒用過終端機，先花 10 分鐘看〈[CLI 是什麼？](/articles/cli-guide/)〉會輕鬆很多；不看也行，這篇每一步都會告訴你該開哪個視窗、貼什麼。

> 💡 **不想碰終端機？** Anthropic 另外提供 **Claude 桌面版 App**（Mac、Windows 都有），裡面也能用 Claude Code，是圖形介面。這篇走的是終端機版，因為它最通用、教學資料最多。

---

## 開始前：確認這三件事

| 項目 | 需求 |
|------|------|
| **作業系統** | macOS 13 以上；Windows 10（1809 版）以上或 Windows Server 2019 以上；Ubuntu 20.04+／Debian 10+ |
| **硬體** | 4 GB 以上記憶體、x64 或 ARM64 處理器（近年的 Mac 與 Windows 電腦都符合） |
| **帳號** | **付費的** Claude **Pro、Max、Team、Enterprise** 方案，或 Anthropic Console（API）帳號。**免費版 claude.ai 帳號不能用 Claude Code** |

還要有網路，並且位於 [Anthropic 支援的國家／地區](https://www.anthropic.com/supported-countries)。

> ⚠️ 帳號這關最容易被忽略：很多人裝完才發現登入後被擋。還沒有方案的話，先看〈[Claude Team 方案怎麼申請？](/articles/claude-team-setup/)〉或到 claude.ai 看個人方案。**方案價格會變動，請以官網為準**，這篇不寫價錢。

---

## 方法選擇：我該用哪一種裝法？

| 你的情況 | 建議 |
|---------|------|
| 一般使用者（Mac／Windows／Linux） | ✅ **原生安裝**（一行指令，會自動更新）——本文主線 |
| Mac 已經習慣用 Homebrew | `brew install --cask claude-code`（不會自動更新） |
| Windows 習慣用 WinGet | `winget install Anthropic.ClaudeCode`（不會自動更新） |
| 需要 Linux 工具鏈、或要用沙盒（sandbox）功能 | 在 WSL 2 裡裝（見文末） |

**一般人選原生安裝就對了**：它會在背景自己更新，你不用管版本。

---

## Mac 安裝（約 3 分鐘）

### Step 1：開啟「終端機」

按 `⌘ + 空白鍵` 叫出 Spotlight，輸入 **Terminal**（或「終端機」），按 Enter。

### Step 2：貼上安裝指令

把下面這行整串複製，貼到終端機，按 Enter：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**這個指令執行時不會顯示下載進度**，畫面看起來像卡住，這是正常的，等它自己跑完、回到可以輸入的狀態就好。

### Step 3：開新視窗，確認版本

**關掉這個終端機，重新開一個新的**（讓系統重新讀取路徑設定），然後輸入：

```bash
claude --version
```

看到像 `2.1.211 (Claude Code)` 這樣的版本號，就是裝好了（你的數字會不一樣，因為版本天天更新）。

### 想改用 Homebrew？

```bash
brew install --cask claude-code
```

Homebrew 有兩個版本：`claude-code`（穩定版，通常比最新版晚約一週、會避開有重大問題的版本）和 `claude-code@latest`（新版一出就更新）。Homebrew 裝的**不會自動更新**，要自己跑 `brew upgrade claude-code`。

---

## Windows 安裝（約 5 分鐘）

Windows 有兩個長得很像的視窗：**PowerShell** 和 **CMD（命令提示字元）**。指令不一樣，貼錯會出錯。分辨方法：

- 提示符號是 `PS C:\Users\你的名字>` → 這是 **PowerShell**
- 提示符號是 `C:\Users\你的名字>`（沒有 `PS`）→ 這是 **CMD**

**建議用 PowerShell**，下面以它為主。不需要用「系統管理員身分」執行。

### Step 1：開啟 PowerShell

按 Windows 鍵，輸入 **PowerShell**，按 Enter 開啟 Windows PowerShell（或「終端機」App 預設的分頁）。

### Step 2：貼上安裝指令

```powershell
irm https://claude.ai/install.ps1 | iex
```

一樣，執行時**不會顯示進度**，等它跑完回到 `PS C:\...>` 就好。

> 如果你是在 CMD 裡，改貼這一行：
>
> ```batch
> curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
> ```

### Step 3：開新視窗，確認版本

關掉 PowerShell，**重新開一個新視窗**，輸入：

```powershell
claude --version
```

看到 `2.1.xxx (Claude Code)` 就成功了。

### 要不要裝 Git for Windows？

**選配，不是必要。**

- **沒裝**：Claude Code 改用 PowerShell 當它執行指令的工具，一樣能用。
- **有裝**：Claude Code 可以用 Git Bash，支援度比較完整。如果你平常就會用 Git／GitHub（可看〈[Git 是什麼？](/articles/git-guide/)〉），順手裝起來沒壞處。

如果裝了 Git 但 Claude Code 找不到 Git Bash，可以在 `settings.json` 指定路徑：

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

### 想改用 WinGet？

```powershell
winget install Anthropic.ClaudeCode
```

WinGet 裝的**不會自動更新**，要定期跑 `winget upgrade Anthropic.ClaudeCode`。

---

## 登入：Mac／Windows 一樣

### Step 1：進到你要工作的資料夾，輸入 `claude`

先用 `cd` 進到你想讓 Claude 幫忙的資料夾（例如 `cd ~/Documents/my-project`，Windows 是 `cd C:\Users\你的名字\Documents\my-project`），然後輸入：

```bash
claude
```

### Step 2：照瀏覽器提示登入

第一次啟動會請你選登入方式，通常會自動開瀏覽器，到 claude.ai 登入你**有訂閱的那個帳號**並按下授權。回到終端機，就會看到 Claude Code 的互動畫面。

> 如果瀏覽器沒自動跳出來，終端機通常會顯示一串網址，複製貼到瀏覽器手動打開即可。

### Step 3：第一次啟動，Claude 會問你信不信任這個資料夾

Claude Code 會問你**是否信任目前這個資料夾**。這是它的安全機制：因為它可以讀寫檔案、執行指令，所以第一次進一個資料夾要你點頭。

**只在你自己的專案資料夾信任它**。不要在「下載」資料夾、桌面這種雜物堆，或陌生人給你的專案裡亂按信任。

---

## 驗收：用 `claude doctor` 健檢

如果想確認安裝與設定都正常，執行：

```bash
claude doctor
```

它會印出安裝狀態、設定檔錯誤、自動更新狀況，並附上建議修法，**只讀取、不會改任何東西**，也不需要開啟對話。

---

## 🚨 常見錯誤

### 🚨 `claude: command not found`／「無法辨識 claude」

**原因**：安裝成功了，但終端機還沒讀到新的路徑（PATH）。
**解法**：
1. **關掉所有終端機，重開一個新的**，再試一次 `claude --version`。多數情況這樣就好。
2. 還是不行 → 代表安裝目錄不在 PATH 裡。官方的疑難排解頁有逐步修法：[Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install)。

### 🚨 Windows 出現 `The token '&&' is not a valid statement separator`

**原因**：你在 **PowerShell** 裡貼了 **CMD** 的指令（有 `&&` 的那行）。
**解法**：PowerShell 請貼 `irm https://claude.ai/install.ps1 | iex` 那一行。

### 🚨 Windows 出現 `'irm' is not recognized as an internal or external command`

**原因**：反過來——你在 **CMD** 裡貼了 PowerShell 的指令。
**解法**：改貼 CMD 版的 `curl ... install.cmd` 那行，或改開 PowerShell。

### 🚨 Mac 出現 `syntax error near unexpected token '<'`、或出現 `403`

**原因**：下載到的不是安裝腳本，而是一個錯誤網頁。常見於公司網路、VPN、代理（proxy）擋住了連線，或所在地區不在支援範圍。
**解法**：換個網路（例如手機熱點）再試；仍失敗就看官方疑難排解頁對照你的錯誤訊息。

### 🚨 裝好了，登入後說我沒有權限

**原因**：免費版 claude.ai 帳號不含 Claude Code。
**解法**：確認你登入的是 Pro／Max／Team／Enterprise 帳號，或改用 Console（API）帳號。如果你被邀請進團隊，帳號切換請看〈[被邀請加入 Claude Team](/articles/join-claude-team/)〉。

### 🚨 以前用 `npm install -g @anthropic-ai/claude-code` 裝過

那條路現在是**次要選項**（需要 Node.js 22 以上），npm 裝的版本也不如原生安裝省事。已經能用就不用動；想換成原生安裝，建議先 `npm uninstall -g @anthropic-ai/claude-code`，再跑上面的一行指令，避免同時有兩份 `claude`。

---

## 更新與移除

- **更新**：原生安裝會**在背景自動更新**，下次啟動就是新版。想立刻更新就跑 `claude update`。Homebrew／WinGet 要自己更新（指令見上）。
- **移除（原生安裝）**：
  - Mac：`rm -f ~/.local/bin/claude` 與 `rm -rf ~/.local/share/claude`
  - Windows（PowerShell）：`Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force` 與 `Remove-Item -Path "$env:USERPROFILE\.local\share\claude" -Recurse -Force`
- ⚠️ 設定與對話紀錄存在 `~/.claude` 裡，上面的移除指令**不會**動它。想連設定一起清才需要另外刪，刪了就回不來。

---

## 進階：Windows 想用 WSL 2 裝？

如果你的專案跑在 Linux 工具鏈，或想使用 Claude Code 的**沙盒**功能（原生 Windows 不支援沙盒，WSL 2 支援），可以改在 WSL 裡裝：先照〈[WSL 是什麼？Windows 安裝 WSL 2](/articles/windows-wsl-guide/)〉開好 WSL，然後**在 WSL 的終端機裡**貼 Mac／Linux 那行 `curl ... | bash`，之後也都在 WSL 裡執行 `claude`，而不是在 PowerShell。

---

## 下一步：明天就能做的一件事

1. 照上面裝好，`claude --version` 看到版本號。
2. 在一個**你不怕被改壞的測試資料夾**（先自己複製一份備份）裡打 `claude`，丟一個小任務：「幫我看這個資料夾有哪些檔案，用一段話說明每個是做什麼的」。
3. 先讓它**只讀、不改**，習慣它怎麼回答、怎麼問你許可，再慢慢交給它動手改。

想看團隊怎麼一起用，接著讀〈[Claude Team 方案怎麼申請？](/articles/claude-team-setup/)〉。
