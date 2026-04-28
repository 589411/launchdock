---
title: "Hermes Agent 快速上手｜Windows + WSL2 篇"
description: "Windows 專用教學：用 WSL2 + Ollama 一鍵啟動 Hermes AI Agent，體驗跨 session 記憶與雲端模型運行，完全不需要設定 API Key。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-04-28"
verifiedAt: "2026-04-28"
archived: false
order: 2
series:
  name: "Hermes 專題"
  part: 2
prerequisites: ["ollama-openclaw-windows", "windows-wsl-guide"]
estimatedMinutes: 15
tags: ["Ollama", "Hermes", "Agent", "安裝", "Windows", "WSL"]
stuckOptions:
  "WSL2 安裝": ["wsl --install 沒有反應", "WSL2 安裝完要重開機嗎？"]
  "ollama launch hermes": ["出現 Error: unknown integration: hermes 怎麼辦？", "安裝時卡在 npm 那步"]
  "模型選擇": ["要選雲端還是本機模型？", "本機模型在 Windows 能跑嗎？"]
---

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **鴨編快說重點**：Hermes 在 Windows 上需要 WSL2，但流程其實很直覺——整個步驟是這樣的：
>
> ```
> 安裝 WSL2 → 在 WSL 裡安裝 Ollama → ollama launch hermes → 選雲端模型 → 開始對話
> ```

<!-- @img: hermes-windows-cover | Hermes Agent 在 Windows WSL2 上執行示意圖 -->

---

## 前提：為什麼需要 WSL2？

Hermes Agent 的安裝腳本是 Linux/macOS 原生設計，不支援原生 Windows PowerShell 或 CMD 環境。WSL2（Windows Subsystem for Linux 2）讓你在 Windows 上跑完整的 Linux 環境，解決這個問題。

> 已經裝好 WSL2 和 Ollama 的朋友，可以直接跳到 [Step 3：一鍵啟動 Hermes](#step-3一鍵啟動-hermes)。

---

## Step 1：安裝 WSL2

以**系統管理員身分**開啟 PowerShell（在開始選單搜尋「PowerShell」→ 右鍵 → 以系統管理員執行），輸入：

```powershell
wsl --install
```

<!-- @img: wsl-install-powershell | PowerShell 以系統管理員身分執行 wsl --install -->

安裝完成後，**重新啟動電腦**。重開機後，WSL2 會自動完成設定並要求你設定 Linux 使用者名稱和密碼。

<!-- @img: wsl-setup-username | WSL2 首次設定使用者名稱 -->

> 🚨 **如果 `wsl --install` 沒有反應**：確認 Windows 版本為 21H2 或更新（開始 → 設定 → Windows Update）。舊版 Windows 10 需手動開啟 WSL 功能。

---

## Step 2：在 WSL 裡安裝 Ollama

重開機後，搜尋「Ubuntu」或「WSL」開啟 Linux 終端機，輸入以下指令安裝 Ollama：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

<!-- @img: ollama-install-wsl | WSL 終端機安裝 Ollama -->

安裝完成後確認版本：

```bash
ollama --version
```

<!-- @img: ollama-version-wsl | WSL 終端機確認 Ollama 版本 -->

如果已安裝但版本過舊，執行：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

（重跑安裝腳本即可更新到最新版）

---

## Step 3：一鍵啟動 Hermes

在 WSL 終端機（Ubuntu/Linux）中輸入：

```bash
ollama launch hermes
```

<!-- @img: hermes-launch-wsl | WSL 終端機輸入 ollama launch hermes -->

第一次執行，Ollama 會詢問是否安裝 Hermes，按 Enter 確認。接著 Ollama 自動完成四個步驟：

1. **Install** — 用 npm 安裝 Hermes Agent
2. **Model** — 開啟模型選擇畫面
3. **Onboarding** — 自動設定 Ollama 為 provider，指向 `http://127.0.0.1:11434/v1`
4. **Launch** — 啟動 Hermes 對話介面

<!-- @img: hermes-installing-wsl | Hermes 在 WSL 中安裝進度 -->

<!-- @img: hermes-onboarding-wsl | Hermes 自動設定 Ollama provider（WSL）-->

> 🚨 **出現 `Error: unknown integration: hermes`**：Ollama 版本太舊。在 WSL 中重跑安裝腳本更新 Ollama，然後重試。

---

## Step 4：選擇模型

安裝完成後出現模型選擇畫面。

<!-- @img: hermes-model-selector-wsl | Hermes 模型選擇器（WSL）-->

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **推薦的雲端模型**（用 Ollama 免費額度，免下載，Windows 顯卡不夠也沒問題）：
>
> | 模型 | 特色 |
> | --- | --- |
> | `minimax-m2.7:cloud` | 🥇 快速、高效，適合日常生產力任務 |
> | `kimi-k2.5:cloud` | 強推理能力、支援子代理（subagents） |
> | `glm-5.1:cloud` | 推理與程式生成 |
> | `qwen3.5:cloud` | 工具呼叫 + 視覺理解，適合 Agent 任務 |
>
> **本機模型（需要 NVIDIA GPU）**：
>
> | 模型 | 需求 |
> | --- | --- |
> | `gemma4` | 約 16 GB VRAM |
> | `qwen3.6` | 約 24 GB VRAM |
>
> 一般 Windows 筆電建議直接選雲端模型。

<!-- @img: hermes-setup-complete-wsl | Hermes 設定完成準備就緒（WSL）-->

---

## Step 5：第一次對話

Hermes 啟動後，直接輸入：

```
你好！請用繁體中文自我介紹——你是 Hermes，你有什麼能力？
```

<!-- @img: hermes-first-chat-wsl | Hermes 在 WSL 上第一次對話 -->

> 如果 Hermes 用英文回應，直接說：「請用繁體中文回覆」即可。

---

## Step 6（選做）：連接訊息平台

在 WSL 終端機中執行：

```bash
hermes gateway setup
```

<!-- @img: hermes-gateway-wsl | hermes gateway setup 在 WSL 中設定訊息平台 -->

支援 Telegram、Discord、Slack、WhatsApp、Signal、Email。設定後可直接在訊息 App 和 Hermes 聊天，不用每次開終端機。

---

## 常見問題

### 🚨 WSL2 安裝後重開機，找不到 Ubuntu 在哪裡

開始選單搜尋「Ubuntu」或「WSL」，即可開啟 Linux 終端機。

### 🚨 Ollama 在 WSL 裡跑不起來

確認 WSL 版本是 WSL2（非 WSL1）：

```powershell
wsl --list --verbose
```

版本欄位應顯示「2」。如需升級：

```powershell
wsl --set-version Ubuntu 2
```

### 🚨 Node.js 安裝失敗

Hermes 需要 Node.js 18 以上。在 WSL 中確認：

```bash
node --version
```

沒有的話：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 🚨 想重新設定 Hermes

```bash
hermes setup
```

---

## 補充：手動安裝方式

不想用 `ollama launch`，也可以直接安裝：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

設定向導啟動後，連接 Ollama 的步驟與 macOS 版相同（選 More providers → Custom endpoint → 填入 `http://127.0.0.1:11434/v1`，API key 留空）。

---

## 下一步

- 🍎 [macOS 版 Hermes 教學](/articles/hermes-agent)
- 🦀 [認識 OpenClaw：另一個 AI Agent 框架](/articles/why-openclaw)
- 📱 [OpenClaw 串接 Telegram](/articles/telegram-integration)

有問題？到 [首頁討論區](/#discussion) 一起討論！
