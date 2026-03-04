---
title: "Ollama + OpenClaw 快速上手｜Windows 篇"
description: "Windows 專用教學：透過 WSL + Node 22，用 Ollama 免費雲端額度讓 OpenClaw 開口說話，完全不用設定 API Key。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-03-04"
verifiedAt: "2026-03-04"
archived: false
order: 5
prerequisites: ["llm-guide"]
estimatedMinutes: 15
tags: ["OpenClaw", "Ollama", "安裝", "LLM", "Windows", "WSL"]
stuckOptions:
  "安裝 WSL": ["WSL 安裝指令沒反應", "BIOS 虛擬化怎麼開啟？", "重開機後要重做嗎？"]
  "安裝 Node 22": ["nvm 指令找不到", "版本裝了還是顯示舊的", "npm 指令不存在"]
  "安裝 OpenClaw": ["npm install 卡住", "Permission denied 怎麼辦？"]
  "Ollama 連線": ["ollama launch openclaw 跑不動", "連不上 localhost:11434"]
  "登入認證": ["瀏覽器打不開", "QR code 看不見"]
  "第一次對話": ["模型回應是英文", "回應很慢正常嗎？"]
---

![Ollama + OpenClaw 讓你和 AI 一起快樂工作](/images/articles/ollama-openclaw/happy-bros.webp)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **Windows 用戶必看**：OpenClaw 在 Windows 上需要透過 WSL（Windows Subsystem for Linux）運行，這是微軟官方支援的方式，穩定性遠比原生 Windows 環境好。整個流程約 15 分鐘，照著走就沒問題。

---

## 準備工作

- Windows 10（版本 2004 以上）或 Windows 11
- 網路連線
- 不需要任何 API Key

---

## Step 1：安裝 WSL

用系統管理員身份開啟 **PowerShell**（在開始選單搜尋 PowerShell，右鍵「以系統管理員身份執行」）：

![以系統管理員身份開啟 PowerShell](/images/articles/ollama-openclaw-windows/windows-powershell-admin.png)<!-- ⚠️ 未配對 -->

輸入安裝指令：

```powershell
wsl --install
```

![PowerShell 執行 wsl --install 指令](/images/articles/ollama-openclaw-windows/wsl-install-command.png)<!-- ⚠️ 未配對 -->

安裝完成後，**重新開機**。

![重開機提示畫面](/images/articles/ollama-openclaw-windows/wsl-install-reboot.png)<!-- ⚠️ 未配對 -->

重開機後，WSL 會自動繼續安裝 Ubuntu，過程中會要求設定 Linux 使用者名稱和密碼（這組帳密只用在 WSL 內部，隨便設一組就好，但要記住）：

![WSL Ubuntu 首次啟動設定使用者名稱與密碼](/images/articles/ollama-openclaw-windows/wsl-ubuntu-setup.png)<!-- ⚠️ 未配對 -->

> 🚨 **如果 wsl --install 沒反應**，可能需要先在 BIOS 開啟虛擬化（Virtualization）功能。詳細步驟見 [Windows WSL 安裝指南](/articles/windows-wsl-guide)。

確認 WSL 安裝成功：

```bash
wsl --version
```

<!-- @img: wsl-version-check | 終端機顯示 WSL 版本資訊 -->

---

## Step 2：在 WSL 安裝 Node.js 22

**務必安裝 Node 22**，版本過舊會導致 OpenClaw 無法正常運作。

在 WSL 終端機（Ubuntu）中執行，先安裝 nvm（Node 版本管理工具）：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

![WSL 終端機執行 nvm 安裝指令](/images/articles/ollama-openclaw-windows/nvm-install-command.png)<!-- ⚠️ 未配對 -->

安裝完後，關閉終端機再重開（讓 nvm 生效），然後安裝 Node 22：

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

![WSL 終端機安裝 Node 22 過程](/images/articles/ollama-openclaw-windows/node22-install.png)<!-- ⚠️ 未配對 -->

確認版本正確，**必須是 v22.x.x**：

```bash
node --version
```

![終端機顯示 node --version 結果為 v22.x.x](/images/articles/ollama-openclaw-windows/node-version-check.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

> 🚨 **如果顯示舊版本**，執行 `nvm use 22` 再確認一次。若 nvm 指令找不到，關閉終端機重開再試。

---

## Step 3：安裝 OpenClaw

在 WSL 終端機中執行：

```bash
npm install -g openclaw
```

![WSL 終端機執行 npm install -g openclaw](/images/articles/ollama-openclaw-windows/openclaw-npm-install.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

安裝完成後驗證：

```bash
openclaw --version
```

![終端機顯示 openclaw 版本號](/images/articles/ollama-openclaw-windows/openclaw-version-check.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

---

## Step 4：在 WSL 安裝 Ollama

直接在 WSL 終端機中執行一鍵安裝腳本：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

<!-- @img: ollama-install-wsl | WSL 終端機執行 Ollama 安裝腳本 -->

安裝完成後確認版本：

```bash
ollama --version
```

<!-- @img: ollama-version-wsl | WSL 終端機顯示 ollama --version 結果 -->

確認 Ollama 服務正在執行（安裝後會自動啟動）：

```bash
curl http://localhost:11434/api/tags
```

<!-- @img: ollama-api-check-wsl | WSL 終端機 curl Ollama API 回傳 JSON -->

看到 JSON 回應就代表 Ollama 已正常運行。

---

## Step 5：執行 ollama launch openclaw

在 WSL 終端機中輸入：

```bash
ollama launch openclaw
```

![WSL 終端機執行 ollama launch openclaw](/images/articles/ollama-openclaw-windows/ollama-launch-openclaw-windows.png)

---

## Step 6：登入 Ollama 帳號認證

第一次執行會要求登入 Ollama 帳號以使用免費雲端額度，畫面會顯示驗證連結或 QR code：

![終端機顯示 Ollama 登入認證提示及連結](/images/articles/ollama-openclaw-windows/ollama-auth-prompt.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

1. 複製終端機顯示的網址，貼到 Windows 瀏覽器開啟（或掃描 QR code）
2. 用 Google 帳號登入 Ollama

![瀏覽器開啟 Ollama 登入頁面](/images/articles/ollama-openclaw-windows/ollama-login-browser.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

![瀏覽器顯示認證成功，可關閉此頁](/images/articles/ollama-openclaw-windows/ollama-auth-success.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

回到終端機，認證完成後會繼續啟動流程。

---

## Step 7：選擇模型，開始對話

出現模型選單後，選「**Cloud**」，使用 Ollama 免費雲端模型，不需下載到本機：

![OpenClaw 模型選擇清單（選 Cloud）](/images/articles/ollama-openclaw-windows/openclaw-model-select-windows.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **推薦的雲端模型**：
>
> | 模型 | 特色 |
> |------|------|
> | `minimax-m2.5` | 🥇 **實測推薦**：工具呼叫能力最佳，Agent 任務表現優異 |
> | `kimi-k2.5` | 1T 參數，對話品質強 |
> | `glm-4.7` | 通用型，穩定可靠 |
>
> **注意**：以上模型試玩沒問題，但若要正式導入工作流程，建議換用 Claude、GPT-4o 等主流模型，穩定性與工具使用可靠度仍有明顯差距。

![OpenClaw 就緒畫面](/images/articles/ollama-openclaw-windows/openclaw-ready-windows.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

出現就緒畫面，代表成功啟動！

試著輸入：

```
你好！我是這裡的主人。請用繁體中文自我介紹——你是誰、你能做什麼。
另外，幫你自己取一個有特色的中文名字吧！
```

![OpenClaw 第一次對話畫面（Windows）](/images/articles/ollama-openclaw-windows/openclaw-first-chat-windows.png)<!-- ⚠️ 未配對 --><!-- ⚠️ 未配對 -->

恭喜 🎉 你的龍蝦在 Windows 上正式啟動！

---

## 常見問題

### 🚨 curl Ollama 沒有回應

Ollama 服務可能尚未啟動，手動啟動它：

```bash
ollama serve &
```

再重新執行 `curl http://localhost:11434/api/tags` 確認。

### 🚨 nvm 指令不存在

```bash
# 重新載入 shell 設定
source ~/.bashrc
# 或
source ~/.zshrc
```

### 🚨 npm install 出現 Permission denied

不要用 `sudo npm install -g`，改用 nvm 安裝的 Node 就不會有權限問題。

### 🚨 模型回應是英文

直接告訴它：「請用繁體中文回覆」，它就會切換語言。

---

## 免費額度說明

Ollama 雲端模型有免費額度（[官方說明](https://ollama.com/pricing)）：

1. 前往 [ollama.com/settings](https://ollama.com/settings)，用 Google 帳號登入
2. 即可查看剩餘免費額度與用量

額度用完？可改用 [Gemini Flash 雲端 API](/articles/gemini-api-setup)。

---

## 下一步

- ⚙️ [模型設定與切換](/articles/openclaw-model-config)
- 🧩 [打造你的第一個 Skill](/articles/openclaw-first-skill)
- 📱 [串接 Telegram](/articles/telegram-integration)

有問題？到 [首頁討論區](/#discussion) 一起討論！
