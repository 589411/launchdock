---
title: "macOS 安裝 OpenClaw：從零開始的完整教學"
description: "在 Mac 上安裝 OpenClaw 的逐步指南，涵蓋 Homebrew、Python 環境、相依套件到第一次啟動。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 2
prerequisites: ["install-openclaw"]
estimatedMinutes: 15
tags: ["OpenClaw", "macOS", "安裝", "Python", "Homebrew"]
stuckOptions:
  "Homebrew": ["Homebrew 安裝指令跑很久", "終端機顯示 permission denied", "不知道 Homebrew 是什麼"]
  "Python": ["已經有 Python 但版本不對", "pyenv 安裝後 python 指令沒變", "M1/M2 晶片有相容問題嗎？"]
  "建立虛擬環境": ["virtualenv 和 venv 差在哪？", "啟動虛擬環境後怎麼確認？"]
  "安裝 OpenClaw": ["pip install 出現紅字錯誤", "相依套件衝突", "安裝很慢正常嗎？"]
  "第一次啟動": ["啟動後出現 ModuleNotFoundError", "開了但網頁打不開", "API Key 要填在哪裡？"]
---

## 開始之前

> 這篇藍鴨教學會帶你在 macOS 上從零安裝 OpenClaw，每一步都有截圖。

這篇教學適合在 **macOS**（Intel 或 Apple Silicon M1/M2/M3）上安裝 OpenClaw。

如果你用的是 Windows，請看 [Windows 安裝指南](/articles/install-openclaw-windows)。
如果你不想在本地安裝，可以考慮 [雲端部署方案](/articles/deploy-openclaw-cloud)。

### 你需要準備

- macOS 12 (Monterey) 或更新版本
- 至少 8GB RAM（建議 16GB）
- 至少 5GB 可用磁碟空間
- 穩定的網路連線
- 一個 OpenAI / Google / Anthropic 的 API Key（至少一個）

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 不確定 Mac 型號？點左上角蘋果圖示 →「關於這台 Mac」查看。

---

## Step 1：安裝 Homebrew

Homebrew 是 macOS 的套件管理工具，幾乎所有開發工具都靠它安裝。

打開 **Terminal**（終端機），貼上這行指令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安裝過程中可能會要求你：
1. 輸入 Mac 的登入密碼（輸入時不會顯示字元，正常）
2. 按 Enter 確認

安裝完成後，確認 Homebrew 可用：

```bash
brew --version
# 應該顯示類似 Homebrew 4.x.x
```

> ⚠️ **Apple Silicon（M1/M2/M3）使用者**：安裝完可能需要執行以下指令讓 brew 生效：
> ```bash
> echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
> eval "$(/opt/homebrew/bin/brew shellenv)"
> ```

---

## Step 2：安裝 Python 3.11+

OpenClaw 需要 Python 3.11 或更新版本。我們用 `pyenv` 管理 Python 版本，避免跟系統 Python 衝突。

```bash
# 安裝 pyenv
brew install pyenv

# 設定 shell（zsh）
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# 重新載入設定
source ~/.zshrc

# 安裝 Python 3.11
pyenv install 3.11
pyenv global 3.11

# 確認版本
python --version
# 應該顯示 Python 3.11.x
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **已經有 Python？** 執行 `python3 --version` 確認。如果是 3.11 以上可以跳過這步。

---

## Step 3：安裝額外相依工具

OpenClaw 需要幾個系統工具：

```bash
# Git（版本控制，通常 macOS 已內建）
git --version

# Node.js（部分功能需要）
brew install node

# 確認
node --version  # 應該 v18 以上
npm --version
```

---

## Step 4：下載 OpenClaw

```bash
# 選一個你喜歡的目錄
cd ~/Projects  # 或任何你放專案的地方
mkdir -p ~/Projects && cd ~/Projects

# 下載 OpenClaw
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

---

## Step 5：建立虛擬環境

虛擬環境可以避免套件互相衝突，強烈建議使用：

```bash
# 建立虛擬環境
python -m venv .venv

# 啟動虛擬環境
source .venv/bin/activate

# 啟動成功後，終端機前面會出現 (.venv)
# 例如：(.venv) user@MacBook openclaw %
```

> ⚠️ **每次打開新的 Terminal 視窗都需要重新啟動虛擬環境**：
> ```bash
> cd ~/Projects/openclaw
> source .venv/bin/activate
> ```

---

## Step 6：安裝 OpenClaw

```bash
# 確認你在虛擬環境中（前面有 .venv）
pip install --upgrade pip

# 安裝 OpenClaw 和所有相依套件
pip install -r requirements.txt

# 或者用 pip 直接安裝（如果有發布到 PyPI）
# pip install openclaw
```

安裝過程可能需要 3-5 分鐘，取決於網路速度。

---

## Step 7：設定 API Key

OpenClaw 需要至少一個 LLM 的 API Key：

```bash
# 建立環境設定檔
cp .env.example .env
```

用你喜歡的編輯器打開 `.env`，填入 API Key：

```bash
# 至少填一個
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
# 或
GOOGLE_API_KEY=your-google-api-key
# 或
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **還沒有 API Key？** 看 [AI 模型 API Key 申請指南](/articles/ai-api-key-guide)——Google AI Studio 有免費額度，最適合新手。

---

## Step 8：第一次啟動

```bash
# 啟動 OpenClaw
python -m openclaw start

# 或者
openclaw start
```

如果一切順利，你會看到類似這樣的輸出：

```
🐾 OpenClaw is starting...
✅ Server running at http://localhost:3000
✅ Dashboard available at http://localhost:3000/dashboard
```

打開瀏覽器，前往 `http://localhost:3000`，你應該能看到 OpenClaw 的儀表板！

---

## 常見問題

### `pip install` 出現紅字

通常是相依套件版本衝突。試試：

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --force-reinstall
```

### M1/M2 晶片出現編譯錯誤

某些 Python 套件在 Apple Silicon 需要原生編譯：

```bash
# 安裝編譯工具
xcode-select --install

# 重試安裝
pip install -r requirements.txt
```

### 啟動後 `localhost:3000` 打不開

1. 確認 OpenClaw 有正確啟動（終端機沒有紅字錯誤）
2. 試試 `http://127.0.0.1:3000`
3. 檢查 Port 3000 是否被其他程式占用：`lsof -i :3000`

### `ModuleNotFoundError`

你可能忘記啟動虛擬環境：

```bash
source .venv/bin/activate
python -m openclaw start
```

---

## 下一步

安裝完成！接下來你可以：

- 🧩 [學習 Skill：讓 AI 學會可重複的工作流](/articles/openclaw-skill)
- 🤖 [打造你的第一個 Agent](/articles/openclaw-agent)
- 🔑 [申請 Google API Key 串接更多服務](/articles/google-api-key-guide)
- ☁️ [不想管伺服器？改用雲端部署](/articles/deploy-openclaw-cloud)
