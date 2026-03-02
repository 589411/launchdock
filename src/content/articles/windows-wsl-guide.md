---
title: "WSL 完整教學：讓你的 Windows 擁有 Linux 超能力"
description: "WSL（Windows Subsystem for Linux）是 Windows 用戶安裝 OpenClaw 的最佳方案。從安裝、設定到日常使用，一次搞定。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 1
prerequisites: ["cli-guide"]
estimatedMinutes: 20
tags: ["WSL", "Windows", "Linux", "安裝", "OpenClaw"]
stuckOptions:
  "什麼是 WSL": ["WSL 跟虛擬機有什麼不同？", "WSL 會讓電腦變慢嗎？", "WSL 是免費的嗎？"]
  "安裝 WSL": ["wsl --install 沒反應", "BIOS 虛擬化怎麼開？", "安裝後要求重開機正常嗎？"]
  "使用 WSL": ["怎麼在 WSL 裡存取 Windows 檔案？", "WSL 裡的檔案在 Windows 哪裡？", "可以用 VS Code 編輯 WSL 的檔案嗎？"]
  "安裝 OpenClaw": ["WSL 裡安裝 Python 出錯", "pip install 很慢正常嗎？"]
---

## WSL 是什麼？

WSL 是 **Windows Subsystem for Linux** 的縮寫——**Windows 的 Linux 子系統**。

簡單說：**它讓你在 Windows 裡跑一個真正的 Linux 環境，不需要虛擬機、不需要重灌系統。**

<!-- @img: wsl-terminal | WSL Ubuntu 終端機畫面 -->

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：想像你的 Windows 電腦就像一棟大樓。以前你只能住在「Windows 樓層」。WSL 就是在大樓裡加蓋了一個「Linux 樓層」——你可以隨時搭電梯上下來回，兩邊的設施都能用。

---

## 為什麼要用 WSL？

如果你看過 [為什麼不建議在 Windows 原生環境安裝 OpenClaw？](/articles/why-not-windows-openclaw)，你就知道 OpenClaw 大量依賴 CLI 工具，而這些工具在 Linux 上最完整。

WSL 讓你兩全其美：

| | Windows 原生 | WSL | 虛擬機（如 VirtualBox） |
|---|---|---|---|
| CLI 工具支援 | ❌ 缺很多 | ✅ 完整 | ✅ 完整 |
| 效能損耗 | 無 | 幾乎無 | 明顯變慢 |
| 記憶體佔用 | 無 | ~300MB | 2-4GB |
| 跟 Windows 互通 | — | ✅ 共享檔案 | ❌ 需設定 |
| 啟動速度 | — | 秒開 | 1-2 分鐘 |
| 安裝難度 | — | 一行指令 | 多步驟設定 |

---

## WSL 1 和 WSL 2 的差別

目前 WSL 有兩個版本：

| | WSL 1 | WSL 2 |
|---|---|---|
| 核心 | 翻譯層 | 真正的 Linux 核心 |
| 相容性 | 大部分可用 | 完全相容 |
| 檔案效能 | Linux 內較慢 | Linux 內極快 |
| 記憶體 | 較少 | 動態分配 |
| Docker 支援 | ❌ | ✅ |

**結論：用 WSL 2**。它是預設版本，效能和相容性都更好。

---

## 系統需求

在開始安裝之前，確認你的系統符合以下條件：

- **Windows 10** 版本 2004（Build 19041）以上，或 **Windows 11**
- 至少 **4GB RAM**（建議 8GB 以上）
- BIOS 中的**虛擬化技術**已啟用

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **確認 Windows 版本**：按 `Win + R`，輸入 `winver`，按 Enter。看到的版本號要 ≥ 2004。

<!-- @img: winver-check | winver 指令顯示 Windows 版本資訊 -->

---

## Step 1：安裝 WSL

### 1.1 開啟 PowerShell（系統管理員）

1. 按 `Win` 鍵，輸入 `PowerShell`
2. 右鍵點擊「Windows PowerShell」
3. 選擇「**以系統管理員身分執行**」

<!-- @img: powershell-admin | 以系統管理員身分開啟 PowerShell -->

### 1.2 執行安裝指令

```powershell
wsl --install
```

這一行指令會自動：
- 啟用 WSL 功能
- 啟用虛擬機器平台
- 下載 Linux 核心
- 安裝 Ubuntu（預設發行版）

<!-- @img: wsl-install-command | wsl --install 指令執行畫面 -->

> 安裝完成後會要求**重新啟動電腦**，這是正常的。

### 1.3 重啟電腦

點選「立即重新啟動」，或手動重開機。

---

## Step 2：設定 Ubuntu

重啟後，Ubuntu 會自動開啟（或從開始選單找到 Ubuntu）。

### 2.1 設定使用者名稱和密碼

Ubuntu 會要求你設定：

```
Enter new UNIX username: your-name
New password: ********
Retype new password: ********
```

<!-- @img: wsl-setup-user | WSL 首次啟動設定使用者名稱畫面 -->

> ⚠️ **注意**：
> - 使用者名稱用小寫英文，不要有空格
> - 密碼輸入時**不會顯示任何字元**（連 `***` 都沒有），這是正常的
> - 這個密碼之後用 `sudo` 時會用到，請記住

### 2.2 更新系統

設定完成後，先把系統更新到最新：

```bash
sudo apt update && sudo apt upgrade -y
```

第一次會要你輸入剛才設的密碼。

> 這個步驟可能要幾分鐘，取決於網路速度。

---

## Step 3：認識 WSL 的基本操作

### 3.1 啟動和關閉 WSL

```powershell
# 從 PowerShell 或 CMD 啟動 WSL
wsl

# 指定發行版啟動
wsl -d Ubuntu

# 關閉所有 WSL
wsl --shutdown

# 查看已安裝的發行版
wsl --list --verbose
```

### 3.2 WSL 與 Windows 的檔案互通

WSL 和 Windows 的檔案是互通的，但路徑寫法不同：

#### 在 WSL 裡存取 Windows 檔案

你的 Windows 磁碟掛載在 `/mnt/` 下：

```bash
# 你的 C 碟
ls /mnt/c/

# 你的 Windows 桌面
ls /mnt/c/Users/你的使用者名/Desktop/

# 你的 Windows Documents
ls /mnt/c/Users/你的使用者名/Documents/
```

#### 在 Windows 裡存取 WSL 檔案

在 Windows 檔案總管的路徑列輸入：

```
\\wsl$\Ubuntu\home\你的使用者名
```

<!-- @img: wsl-file-access | 在 Windows 檔案總管中存取 WSL 檔案 -->

> ⚠️ **重要效能提醒**：
> - 在 WSL 裡操作 WSL 的檔案 → **快**
> - 在 WSL 裡操作 Windows 的檔案（`/mnt/c/`）→ **慢**
> - 建議把 OpenClaw 專案放在 WSL 的 home 目錄，而不是 `/mnt/c/`

### 3.3 在 WSL 裡開啟 Windows 程式

你可以從 WSL 直接呼叫 Windows 程式：

```bash
# 用 Windows 的瀏覽器開啟網址
explorer.exe https://localhost:3000

# 用 Windows 的記事本開檔案
notepad.exe somefile.txt

# 用 VS Code 開啟當前目錄
code .
```

---

## Step 4：安裝開發工具

### 4.1 安裝基本工具

```bash
# 安裝常用的 CLI 工具
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  jq \
  tree \
  unzip \
  htop
```

### 4.2 安裝 Python

```bash
# 安裝 Python 3.11 和相關工具
sudo apt install -y python3.11 python3.11-venv python3-pip

# 確認版本
python3.11 --version
# 應該顯示 Python 3.11.x
```

> 如果 `python3.11` 找不到，可以先加入 deadsnakes PPA：
> ```bash
> sudo add-apt-repository ppa:deadsnakes/ppa -y
> sudo apt update
> sudo apt install python3.11 python3.11-venv -y
> ```

### 4.3 安裝 Node.js

```bash
# 用 NodeSource 安裝最新 LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 確認版本
node --version
# 應該 v18 以上
```

---

## Step 5：在 WSL 中安裝 OpenClaw

現在你的 WSL 已經有完整的 Linux 環境了，安裝 OpenClaw 跟在 Mac/Linux 上一模一樣：

```bash
# 建立專案目錄
mkdir -p ~/Projects && cd ~/Projects

# 下載 OpenClaw
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# 建立 Python 虛擬環境
python3.11 -m venv .venv
source .venv/bin/activate

# 安裝相依套件
pip install --upgrade pip
pip install -r requirements.txt

# 複製設定檔
cp .env.example .env
```

### 設定 API Key

```bash
# 用 nano 編輯設定檔
nano .env
```

填入至少一個 API Key：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

> 在 nano 中：`Ctrl + O` 存檔，`Ctrl + X` 離開。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **還沒有 API Key？** 看 [AI 模型 API Key 申請指南](/articles/ai-api-key-guide)——Google AI Studio 有免費額度，最適合新手。

### 啟動 OpenClaw

```bash
python -m openclaw start
```

看到以下訊息就成功了：

```
🐾 OpenClaw is starting...
✅ Server running at http://localhost:3000
```

打開 Windows 的瀏覽器前往 `http://localhost:3000`——WSL 裡的 `localhost` 在 Windows 瀏覽器可以直接存取！

---

## Step 6：搭配 VS Code 使用（強烈推薦）

VS Code 有一個超好用的 WSL 擴充功能，讓你在 Windows 的 VS Code 裡直接編輯 WSL 內的檔案。

### 6.1 安裝 VS Code WSL 擴充功能

1. 在 Windows 上開啟 VS Code
2. 安裝擴充功能：**WSL**（由 Microsoft 開發）

<!-- @img: vscode-wsl-extension | VS Code 的 WSL 擴充功能安裝畫面 -->

### 6.2 從 WSL 開啟 VS Code

```bash
# 在 WSL 終端機中，進入 OpenClaw 目錄
cd ~/Projects/openclaw

# 用 VS Code 開啟
code .
```

第一次會自動安裝 VS Code Server，之後就能在 VS Code 裡直接編輯 WSL 的檔案、使用 WSL 的終端機。

<!-- @img: vscode-wsl-remote | VS Code 透過 WSL 開啟專案的畫面 -->

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：裝了 VS Code + WSL 之後，你的開發體驗跟 Mac/Linux 使用者幾乎沒有差別。這是 Windows 開發者的最佳組合。

---

## 常見問題

### 🚨 `wsl --install` 沒反應

**可能原因**：Windows 版本太舊。

**解法**：
1. 按 `Win + R` → 輸入 `winver` → 確認版本 ≥ 2004
2. 如果版本太舊，先去 Windows Update 更新

### 🚨 出現「請啟用虛擬機器平台 Windows 功能」

**原因**：BIOS 中的虛擬化技術（Intel VT-x 或 AMD-V）沒有啟用。

**解法**：
1. 重開機，進入 BIOS（通常按 `F2`、`F12` 或 `Delete` 鍵）
2. 找到「Virtualization Technology」或「Intel VT-x」
3. 設為 `Enabled`
4. 儲存並重啟

<!-- @img: bios-virtualization | BIOS 中啟用虛擬化技術的畫面 -->

> 每個主機板的 BIOS 介面不同，找不到的話可以搜尋你的電腦型號 + 「enable virtualization」。

### 🚨 WSL 裡網路很慢

**解法**：設定 DNS

```bash
# 編輯 WSL 設定
sudo nano /etc/wsl.conf

# 加入以下內容
[network]
generateResolvConf = false
```

```bash
# 設定 DNS
sudo rm /etc/resolv.conf
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

重啟 WSL：
```powershell
# 在 PowerShell 中
wsl --shutdown
wsl
```

### 🚨 磁碟空間不夠

WSL 預設安裝在 C 碟。如果 C 碟空間不夠，可以移動整個 WSL：

```powershell
# 在 PowerShell 中
# 匯出
wsl --export Ubuntu D:\backup\ubuntu.tar

# 移除
wsl --unregister Ubuntu

# 匯入到 D 碟
wsl --import Ubuntu D:\WSL\Ubuntu D:\backup\ubuntu.tar
```

### 🚨 WSL 裡的 `localhost` 在 Windows 打不開

WSL 2 大部分時候會自動把 `localhost` 映射到 Windows。如果打不開：

```bash
# 在 WSL 中查看 IP
hostname -I
```

用顯示的 IP 取代 `localhost`，例如 `http://172.x.x.x:3000`。

---

## 日常使用小技巧

### 設定 WSL 預設啟動目錄

每次打開 WSL 預設會在 Windows 使用者目錄。改成 home 目錄：

```bash
# 編輯 .bashrc
echo 'cd ~' >> ~/.bashrc
```

### 設定 alias 加速操作

```bash
# 編輯 .bashrc 或 .zshrc
nano ~/.bashrc

# 加入常用 alias
alias ll='ls -la'
alias oc='cd ~/Projects/openclaw && source .venv/bin/activate'
alias ocstart='cd ~/Projects/openclaw && source .venv/bin/activate && python -m openclaw start'
```

以後只要打 `ocstart` 就能一鍵啟動 OpenClaw。

### 安裝 Zsh + Oh My Zsh（可選）

讓你的終端機更好用、更好看：

```bash
# 安裝 Zsh
sudo apt install zsh -y

# 安裝 Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

---

## 一句話總結

> **WSL 讓你的 Windows 電腦多了一個完整的 Linux 環境。裝好 WSL，你的 OpenClaw 就能在最舒服的環境裡跑。**

---

## 下一步

WSL 裝好了！接下來你可以：

- 🐾 [第一次啟動 OpenClaw](/articles/openclaw-first-run) — 設定 API Key，聽到 AI 的第一句話
- 🧩 [學習 Skill](/articles/openclaw-skill) — 讓 AI 學會可重複的工作流
- 🤖 [打造你的 Agent](/articles/openclaw-agent) — AI 分身上線
- 🔑 [申請 API Key](/articles/ai-api-key-guide) — 免費 Google API Key 最適合新手
