---
title: "Windows 安裝 OpenClaw：從零開始的完整教學"
description: "在 Windows 10/11 上安裝 OpenClaw 的逐步指南，涵蓋 Python、WSL、相依套件到第一次啟動。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 2
prerequisites: ["install-openclaw"]
estimatedMinutes: 15
tags: ["OpenClaw", "Windows", "安裝", "Python", "WSL"]
stuckOptions:
  "選擇安裝方式": ["我該用 WSL 還是原生 Windows？", "WSL 是什麼？"]
  "安裝 Python": ["Microsoft Store 裝的 Python 可以用嗎？", "PATH 設定是什麼意思？", "安裝完但 cmd 找不到 python"]
  "安裝 WSL": ["WSL 安裝指令沒反應", "BIOS 虛擬化怎麼開啟？", "WSL 1 和 WSL 2 差在哪？", "systeminfo 怎麼看？"]
  "下載 OpenClaw": ["git clone 出現 SSL 錯誤", "下載很慢正常嗎？"]
  "安裝 OpenClaw": ["pip install 出現紅字", "VC++ Build Tools 是什麼？", "裝了很久正常嗎？"]
  "第一次啟動": ["啟動但網頁打不開", "Windows Defender 跳出防火牆警告", "API Key 格式不確定"]
---

## 開始之前

這篇教學適合在 **Windows 10（版本 2004+）或 Windows 11** 上安裝 OpenClaw。

> 💡 **先讀這篇**：[為什麼不建議在 Windows 原生環境安裝 OpenClaw？](/articles/why-not-windows-openclaw)——了解為什麼 WSL 是 Windows 用戶的最佳選擇。

如果你用的是 Mac，請看 [macOS 安裝指南](/articles/install-openclaw-macos)。
如果你不想在本地安裝，可以考慮 [雲端部署方案](/articles/deploy-openclaw-cloud)。

### 你需要準備

- Windows 10 (版本 2004 以上) 或 Windows 11
- 至少 8GB RAM（建議 16GB）
- 至少 5GB 可用磁碟空間
- 穩定的網路連線
- 一個 OpenAI / Google / Anthropic 的 API Key（至少一個）

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **確認 Windows 版本**：按 `Win + R`，輸入 `winver`，按 Enter。

---

## 選擇安裝方式

Windows 上有兩種安裝方式：

| 方式 | 難度 | 適合 | 優點 |
|---|---|---|---|
| **方式 A：原生 Windows** | ⭐ 簡單 | 新手 | 不需要額外工具 |
| **方式 B：WSL 2** | ⭐⭐ 中等 | 開發者 | Linux 環境，更穩定 |

**推薦新手用方式 A**，有開發經驗的可以選方式 B。

---

## 方式 A：原生 Windows 安裝

### Step 1：安裝 Python 3.11+

1. 前往 [python.org/downloads](https://www.python.org/downloads/)
2. 下載最新的 Python 3.11+ 安裝檔
3. 執行安裝程式

> ⚠️ **重要！安裝時一定要勾選「Add Python to PATH」**，這一步很多人忘記！

<!-- 📸 截圖建議：Python 安裝畫面，圈出 Add to PATH -->
<!-- ![Python 安裝](/images/articles/install-windows/python-install-path.png) -->

4. 安裝完成後，開啟 **命令提示字元**（按 `Win + R`，輸入 `cmd`）：

```cmd
python --version
REM 應該顯示 Python 3.11.x 或更新

pip --version
REM 應該顯示 pip 24.x.x
```

> 如果 `python` 沒反應，試試 `python3` 或 `py`。

### Step 2：安裝 Git

1. 前往 [git-scm.com/download/win](https://git-scm.com/download/win)
2. 下載並安裝（使用預設設定即可）
3. 確認：

```cmd
git --version
REM 應該顯示 git version 2.x.x
```

### Step 3：安裝 Node.js

1. 前往 [nodejs.org](https://nodejs.org)
2. 下載 LTS 版本
3. 安裝（使用預設設定）
4. 確認：

```cmd
node --version
REM 應該 v18 以上
```

### Step 4：下載 OpenClaw

```cmd
REM 建立專案目錄
mkdir C:\Projects
cd C:\Projects

REM 下載 OpenClaw
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

### Step 5：建立虛擬環境

```cmd
REM 建立虛擬環境
python -m venv .venv

REM 啟動虛擬環境
.venv\Scripts\activate

REM 成功後前面會出現 (.venv)
REM (.venv) C:\Projects\openclaw>
```

> ⚠️ **每次開新的命令提示字元都需要重新啟動**：
> ```cmd
> cd C:\Projects\openclaw
> .venv\Scripts\activate
> ```

### Step 6：安裝 OpenClaw

```cmd
REM 升級 pip
pip install --upgrade pip

REM 安裝相依套件
pip install -r requirements.txt
```

> ⚠️ 如果出現 C++ 編譯錯誤，你需要安裝 **Visual Studio Build Tools**：
> 1. 前往 [visualstudio.microsoft.com/visual-cpp-build-tools/](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
> 2. 下載並安裝
> 3. 選擇「Desktop development with C++」
> 4. 重新執行 `pip install -r requirements.txt`

### Step 7：設定 API Key

```cmd
REM 複製範本設定
copy .env.example .env

REM 用記事本編輯
notepad .env
```

在 `.env` 中填入至少一個 API Key：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **還沒有 API Key？** 看 [AI 模型 API Key 申請指南](/articles/ai-api-key-guide)——Google AI Studio 有免費額度，最適合新手。

### Step 8：啟動 OpenClaw

```cmd
python -m openclaw start
```

看到以下訊息就成功了：

```
🐾 OpenClaw is starting...
✅ Server running at http://localhost:3000
```

打開瀏覽器前往 `http://localhost:3000`。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 如果 Windows Defender 跳出防火牆警告，點「允許存取」即可。

---

## 方式 B：WSL 2 安裝（進階）

WSL（Windows Subsystem for Linux）讓你在 Windows 裡跑 Linux。好處是很多 Python 套件在 Linux 上更穩定。

> 📘 **完整版教學**：如果你想深入了解 WSL 的原理和更多使用技巧，請看 [WSL 完整教學](/articles/windows-wsl-guide)。以下是快速安裝版。

### Step 1：確認 BIOS 虛擬化已開啟

WSL 2 需要硬體虛擬化支援。先確認你的電腦有沒有開：

以**系統管理員**身份開啟命令提示字元（`Win + R` → 輸入 `cmd` → `Ctrl + Shift + Enter`）：

```cmd
systeminfo
```

找到最後幾行，確認「Hyper-V 需求」區塊：

```
Hyper-V 需求:    已偵測到 Hypervisor。將不會顯示 Hyper-V 所需功能。
```

如果顯示「韌體中已啟用虛擬化：否」，你需要到 BIOS 開啟：
1. 重新開機，按 `DEL` 或 `F2` 進入 BIOS
2. 找到 `Intel VT-x`（Intel 處理器）或 `AMD-V / SVM Mode`（AMD 處理器）
3. 設為 `Enabled`
4. 儲存並重新開機

<!-- @img: systeminfo-hypervisor | systeminfo 指令確認 Hyper-V 狀態 -->

### Step 2：（建議）建立獨立 Windows 使用者

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **安全性建議**：用獨立的 Windows 帳號跑 OpenClaw / AI Agent，可以限制它的系統存取範圍。如果你只是想先體驗，可以跳過這步。

```cmd
REM 以管理員身份執行
net user openclaw-user YourPassword123 /add
```

建立後，到 Windows「開始」→ 使用者頭像 →「切換使用者」，用新帳號登入。

### Step 3：安裝 WSL 2

以**系統管理員**身份開啟 PowerShell（右鍵 → 以系統管理員身分執行）：

```powershell
wsl --install
```

安裝完成後**重新啟動電腦**。

重啟後會自動開啟 Ubuntu，設定使用者名稱和密碼。

> ⚠️ 如果 `wsl --install` 沒反應，回頭確認 Step 1 的 BIOS 虛擬化是否已開啟。

### Step 4：安裝 Node.js 24+（使用 nvm）

開啟 Ubuntu（從開始選單啟動）：

```bash
# 確認現有 Node 版本（如果已安裝）
node -v

# 如已安裝舊版，先移除
sudo apt remove nodejs -y
sudo apt autoremove -y
sudo apt update

# 安裝 nvm（Node 版本管理器）
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新載入設定（或退出再重新登入）
exit
```

重新進入 WSL：

```bash
wsl -d ubuntu
```

```bash
# 確認 nvm
nvm --version

# 安裝 Node.js 24
nvm install 24
nvm use 24

# 設為預設
nvm alias default 24

# 確認
node -v   # 應顯示 v24.x.x
which node  # 應在 ~/.nvm/versions/node/v24.x.x/bin/node
```

### Step 5：安裝與啟動 OpenClaw

```bash
# 方式一：npm 全域安裝（推薦，最簡單）
npm install -g openclaw
openclaw --version

# 方式二：傳統 git clone 安裝
sudo apt install python3.11 python3.11-venv python3-pip git -y
mkdir -p ~/Projects && cd ~/Projects
git clone https://github.com/openclaw/openclaw.git
cd openclaw
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### 設定 API Key

```bash
# npm 安裝方式：直接啟動時設定
openclaw start
# 首次會引導你設定 API Key

# git clone 方式：編輯 .env
cp .env.example .env
nano .env  # 填入 API Key，Ctrl+O 存檔，Ctrl+X 離開
python -m openclaw start
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **還沒有 API Key？** 看 [AI 模型 API Key 申請指南](/articles/ai-api-key-guide)。或者考慮 [Ollama 本機方案](/articles/ollama-openclaw)——搭配 `ollama launch openclaw` 可以直接用免費雲端模型，完全不需要 API Key。

WSL 裡的 `localhost:3000` 在 Windows 瀏覽器可以直接存取。

### 🚀 快捷方式：搭配 Ollama 免 API Key 體驗

如果你只是想先玩玩，不想申請 API Key，可以在 WSL 裡裝 Ollama：

```bash
# 安裝 zstd（Ollama 需要）
sudo apt install -y zstd

# 安裝 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 確認 Ollama 版本
ollama --version

# 一鍵啟動 OpenClaw + 選雲端模型
ollama launch openclaw
# 選 minimax-m2.5:cloud → 不需下載模型、Ollama 送免費 Token
```

詳細說明見 [Ollama + OpenClaw 完整教學](/articles/ollama-openclaw)。

---

## 常見問題

### `python` 指令找不到

**原因**：安裝 Python 時沒勾選 Add to PATH

**解法**：
1. 重新執行 Python 安裝程式
2. 選「Modify」
3. 確認勾選「Add Python to environment variables」

或手動加 PATH：
```cmd
setx PATH "%PATH%;C:\Users\你的使用者名稱\AppData\Local\Programs\Python\Python311"
```

### pip install 出現 `Microsoft Visual C++ 14.0 is required`

安裝 Visual Studio Build Tools（Step 6 有說明）。

### 防火牆擋住 OpenClaw

Windows Defender 可能會跳出警告。點「允許」即可，這只是讓 Python 監聽本地 port。

### WSL 裡 `localhost` 打不開

試試用 WSL 的 IP：
```bash
hostname -I
# 用顯示的 IP 取代 localhost
```

---

## 下一步

安裝完成！接下來你可以：

- 🧩 [學習 Skill：讓 AI 學會可重複的工作流](/articles/openclaw-skill)
- 🤖 [打造你的第一個 Agent](/articles/openclaw-agent)
- 🔑 [申請 Google API Key 串接更多服務](/articles/google-api-key-guide)
- ☁️ [不想管伺服器？改用雲端部署](/articles/deploy-openclaw-cloud)
