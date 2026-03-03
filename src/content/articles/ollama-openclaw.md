---
title: "Ollama + OpenClaw：免 API Key，幾分鐘內開始和 AI 對話"
description: "不用設定 API Key，直接用 Ollama 帳號的免費雲端額度，幾分鐘內就能讓 OpenClaw 開口說話。想在本機跑開源模型？文末附完整補充說明。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "初級"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 4
prerequisites: ["llm-guide"]
estimatedMinutes: 10
tags: ["OpenClaw", "Ollama", "安裝", "LLM", "部署", "macOS", "Windows", "Linux"]
stuckOptions:
  "Ollama 安裝": ["下載後打不開", "macOS 安全性阻擋怎麼辦？", "Windows 需要 WSL 嗎？"]
  "雲端模型選擇": ["免費額度夠用嗎？", "哪個模型回應品質最好？", "額度用光了怎麼辦？"]
  "OpenClaw 串接": ["config 檔要怎麼改？", "Ollama 啟動了但 OpenClaw 連不上", "模型回應很慢正常嗎？"]
  "第一次對話": ["模型回應是英文怎麼辦？", "回應很慢是正常的嗎？", "想換一個模型怎麼做？"]
  "本機模型": ["下載速度很慢怎麼辦？", "硬碟空間不夠怎麼辦？", "GPU 有被用到嗎？"]
---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **你在哪個階段？**
>
> | 我的狀況 | 建議路線 |
> |---------|----------|
> | 🐣 **什麼都沒裝，完全白紙** | 照 Step 1 → 2 → 3 → 4 依序走，約 10 分鐘就能開始對話 |
> | ✅ **已裝 Ollama，想接 OpenClaw** | 直接跳 [Step 2的 OpenClaw 安裝](#step-2安裝-openclaw) |
> | 🚀 **兩個都裝了，想直接開始** | 跳到 [Step 3：第一次對話](#step-3第一次對話幫龍蝦取個名字-) |

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編快說重點**：Ollama + OpenClaw 有個超讚的地方——**完全不用設定 API Key**。用 Ollama 帳號的免費雲端額度，直接在選單選好模型就能開始對話，幾分鐘就能體驗龍蝦 🦞。想在自己電腦上跑開源模型也可以，但那是進階玩法，文末有補充說明。

---

## Ollama + OpenClaw 有什麼特別？

Ollama 本來是一個在本機跑開源 AI 模型的工具，但它還有一個超實用的功能：**內建雲端模型支援，完全不用設定 API Key**。

只要有 Ollama 帳號，就能直接使用它提供的免費雲端模型額度。搭配 `ollama launch openclaw`，整個流程是這樣的：

```
安裝 Ollama → 安裝 OpenClaw → ollama launch openclaw → 選雲端模型 → 開始對話
```

不用申請 API Key、不用付費、不用下載幾 GB 的模型——**幾分鐘內就能讓 OpenClaw 開口說話**。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 想在自己電腦上跑開源模型（完全離線、完全免費）也可以，但那是進階玩法，需要看規格、下載模型。這篇的主線先帶你走「最快上手」的路線，本機模型的完整說明放在文末的[補充資料](#補充在本機下載開源模型)。

---

## 什麼是 Ollama？

[Ollama](https://ollama.com) 是一個本機 AI 模型管理工具，同時也支援雲端模型。你可以把它想成「本地版的 AI Studio」——不管是在線上跑還是下載到本機，都用一個工具搞定。

```
Ollama = 模型管理員（雲端 + 本機）
OpenClaw = AI Agent 框架（技能、自動化、對話）
```

---

## Step 1：安裝 Ollama

### macOS

1. 前往 [ollama.com/download](https://ollama.com/download)
2. 點擊「Download for macOS」
3. 打開下載的 `.dmg` 檔案，把 Ollama 拖到「應用程式」資料夾
4. 打開 Ollama

![Ollama 官網下載頁面（macOS）](/images/articles/ollama-openclaw/ollama-download-mac.png)

> 🚨 **macOS 安全性提示**：如果看到「無法打開 Ollama，因為來自未識別的開發者」，到「系統設定 → 隱私與安全性」拉到底點「仍然開啟」。

<!-- @img: macos-security-allow | macOS 安全性設定允許 Ollama --><!-- ⚠️ 未配對 -->

### Windows

1. 前往 [ollama.com/download](https://ollama.com/download)
2. 點擊「Download for Windows」，執行 `.exe` 安裝程式
3. 照安裝精靈走完，安裝後 Ollama 會在背景自動啟動

<!-- @img: ollama-download-windows | Ollama 官網下載頁面（Windows） --><!-- ⚠️ 未配對 -->

### Linux

```bash
sudo apt install -y zstd
curl -fsSL https://ollama.com/install.sh | sh
```

### 確認安裝成功

```bash
ollama --version
```

看到版本號就代表安裝成功：

```
ollama version 0.6.x
```

<!-- @img: ollama-version-check | 終端機確認 Ollama 版本 --><!-- ⚠️ 未配對 -->

---

## Step 2：安裝 OpenClaw 並啟動

### 安裝 OpenClaw

```bash
# macOS / Linux
curl -fsSL https://openclaw.ai/install.sh | bash
```

```powershell
# Windows（PowerShell）
iwr -useb https://openclaw.ai/install.ps1 | iex
```

> 💡 詳細說明可參考 [安裝 OpenClaw](/articles/install-openclaw)。

### 一鍵啟動

```bash
ollama launch openclaw
```

Ollama 會開啟一個設定頁面，讓你選擇模型和配置 OpenClaw。

**推薦的雲端模型**（免下載、用 Ollama 免費額度）：

| 模型 | 特色 |
|------|------|
| `kimi-k2.5` | 1T 參數，Agent 任務能力最強 |
| `minimax-m2.5` | 最新版，編程與生產力任務 |
| `glm-4.7` | 通用型，穩定可靠 |

選雲端模型的話，**不需要 GPU、不需要下載模型到本機**，直接就能用。Ollama 帳號目前提供免費額度。

![ollama launch openclaw 設定頁面](/images/articles/ollama-openclaw/ollama-launch-openclaw.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **社群回報雲端模型效果不錯**——可以直接幫你設定 Telegram、Email 等功能。如果 AI 說「請你自己裝」，可以跟它耐心溝通：「請你幫我裝，我不會」或「請你教我，我不懂」，通常它會配合。

> 💡 如果只想設定、不立即啟動，可以用 `ollama launch openclaw --config`。

### 查看 Ollama 免費額度

Ollama 的雲端模型有免費額度可用（[官方說明](https://ollama.com/pricing)）：

1. 前往 [ollama.com/settings](https://ollama.com/settings)
2. 用 Google 帳號登入
3. 即可查看剩餘免費額度與用量

![Ollama 帳號設定頁面查看免費額度](/images/articles/ollama-openclaw/ollama-settings-tokens.png)

---

## Step 3：第一次對話——幫龍蝦取個名字 🦞

OpenClaw 跑起來了！做第一件重要的事：**和你的 AI 助理打招呼、讓它自我介紹**。

試著輸入：

```
你好！我是這裡的主人。請用繁體中文自我介紹——你是誰、你能做什麼。
另外，幫你自己取一個有特色的中文名字吧！
```

或更直接一點：

```
你好，請用繁體中文跟我說說：
1. 你最擅長幫人做什麼事？
2. 如果你有機會取一個中文名字，你想叫什麼？
```

![OpenClaw 透過 Ollama 的第一次對話](/images/articles/ollama-openclaw/openclaw-ollama-first-chat.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 用雲端模型的回應速度跟用 API Key 的體驗差不多——但你完全不用設定任何東西。如果模型回應是英文，直接告訴它：「請用繁體中文回覆」，它就會切換語言。

恭喜 🎉 你的龍蝦正式啟動！接下來你可以繼續聊天，或跳到下面的 [Step 4](#step-4完整設定-config-可選) 看更進階的設定方式。

---

## Step 4：完整設定 config（可選）

> 用 `ollama launch openclaw` 已經可以開始對話了。  
> 如果你想**手動控制模型選擇、規格調校、或混用本機與雲端模型**，才需要這個步驟。

### 確認 Ollama 在運行

Ollama 安裝後會常駐在背景。確認它有在跑：

```bash
# 測試 Ollama API 是否可用
curl http://localhost:11434/api/tags
```

如果回傳一串 JSON（包含你下載的模型清單），代表 Ollama 運行正常。

> 🚨 **如果連不到？**
> - macOS / Windows：確認 Ollama app 有在運行（系統工具列應該看得到圖示）
> - Linux：執行 `ollama serve` 啟動服務

### 設定 OpenClaw

在 OpenClaw 的設定檔 `config.yaml` 中，加入 Ollama 作為 Provider：

```yaml
providers:
  ollama:
    type: ollama
    base_url: http://localhost:11434
    # Ollama 不需要 API Key，留空或省略即可

models:
  default:
    provider: ollama
    model: qwen2.5:7b
    temperature: 0.7
```

<!-- @img: openclaw-config-ollama | OpenClaw config.yaml 設定 Ollama --><!-- ⚠️ 未配對 -->

如果你之前已經有設定雲端 API，可以保留它們，把 Ollama 當成額外的選項：

```yaml
providers:
  google:
    type: google
    api_key: ${GOOGLE_API_KEY}
  ollama:
    type: ollama
    base_url: http://localhost:11434

models:
  default:
    provider: google
    model: gemini-2.0-flash
  local:
    provider: ollama
    model: qwen2.5:7b
    temperature: 0.7
```

這樣你就可以在不同 Skill 中選擇用雲端或本機模型。

### 測試連接

啟動 OpenClaw 並測試：

```bash
# 啟動 OpenClaw
openclaw start

# 送一個測試指令
openclaw chat "用繁體中文跟我打招呼"
```

如果你看到模型的回覆，代表 config 設定正確、Ollama 連線成功 ✅

---

## Step 5：效能優化

本機跑模型不像雲端 API 那麼快，但有些技巧可以大幅提升體驗。

### 確認 GPU 加速

#### Apple Silicon（M1/M2/M3/M4）

好消息：Ollama 會自動使用 Apple GPU 加速，不需要額外設定。

確認 GPU 是否有被使用：

```bash
# 查看模型運行資訊
ollama ps
```

如果看到 `gpu` 相關資訊，代表 GPU 加速已啟用。

#### NVIDIA GPU（Windows / Linux）

需要安裝 [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-toolkit)：

```bash
# 確認 NVIDIA 驅動
nvidia-smi
```

如果指令有回傳 GPU 資訊，Ollama 會自動偵測並使用 NVIDIA GPU。

#### 沒有 GPU？

也能跑！只是速度會慢一些。建議：
- 用較小的模型（`llama3.2:3b` 在 CPU 上也很快）
- 降低 `temperature` 減少推論時間
- 關掉其他吃記憶體的程式

### 記憶體管理

Ollama 會在模型閒置 5 分鐘後自動卸載記憶體。如果你想手動管理：

```bash
# 查看目前載入的模型
ollama ps

# 手動停止模型（釋放記憶體）
ollama stop qwen2.5:7b
```

### 模型推薦組合

根據你的電腦配備選擇最佳組合：

| 你的配備 | 推薦模型 | 預期速度 |
|---|---|---|
| 8GB RAM，無 GPU | `llama3.2:3b` | 每秒 5-10 Token |
| 16GB RAM，Apple M1 | `qwen2.5:7b` | 每秒 15-25 Token |
| 16GB RAM，NVIDIA RTX 3060 | `qwen2.5:14b` | 每秒 20-30 Token |
| 32GB+ RAM，NVIDIA RTX 4090 | `llama3.1:70b` | 每秒 30+ Token |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **參考數據**：一般人閱讀中文的速度大約每秒 5-8 個字。所以只要模型能達到每秒 10 Token 以上，體驗就已經不錯了。

---

## 進階：Ollama + 雲端 API 混合使用

最聰明的做法是**兩者並用**——日常雜務用本機模型（免費），重要任務用雲端 API（品質高）。

### 在 OpenClaw 中設定 Fallback

```yaml
providers:
  ollama:
    type: ollama
    base_url: http://localhost:11434
  google:
    type: google
    api_key: ${GOOGLE_API_KEY}

models:
  default:
    provider: ollama
    model: qwen2.5:7b
    fallback:
      provider: google
      model: gemini-2.0-flash

  heavy:
    provider: google
    model: gemini-1.5-pro
```

這樣的設定代表：
- **預設用 Ollama（免費）**，如果 Ollama 掛了或太慢，自動切到 Google
- **重度任務指定用 `heavy` profile**，直接走雲端

### 在 Skill 中指定模型

```yaml
# skills/daily-summary.yaml
name: 日常摘要
model: default  # 用本機 Ollama（免費）

# skills/code-review.yaml
name: 程式碼審查
model: heavy  # 用雲端 Gemini Pro（更聰明）
```

---

## 常見問題排解

### 🚨 Ollama 啟動後 OpenClaw 連不上

**症狀**：OpenClaw 報錯 `Connection refused` 或 `Cannot connect to Ollama`

**解法**：

```bash
# 1. 確認 Ollama 有在運行
ollama ps

# 2. 確認 API 端口
curl http://localhost:11434/api/tags

# 3. 如果用 Docker 跑 OpenClaw，要改成
base_url: http://host.docker.internal:11434
```

### 🚨 模型回應非常慢

**可能原因**：
- 模型太大，超過你的 RAM → 換小一號的模型
- CPU 跑推論 → 確認 GPU 加速是否啟用
- 電腦在做其他事 → 關掉 Chrome 的 87 個分頁 😅

**建議**：先用 `ollama run 模型名` 直接測速度，如果原生就慢，那也不是 OpenClaw 的問題。

### 🚨 中文回應品質不好

**解法**：
1. 換用 `qwen2.5:7b` 或 `qwen2.5:14b`（中文最佳選擇）
2. 在 Soul 設定明確指定「使用繁體中文回覆」
3. 提供 Few-shot 範例讓模型學習你要的風格

### 🚨 磁碟空間不夠

```bash
# 查看模型佔用空間
ollama list

# 刪除不需要的模型
ollama rm llama3.1:70b
```

---

## 補充：在本機下載開源模型

> 帶寬用光、想要完全離線，或只是好奇開源模型？這部分說明怎麼把模型下載到你的電腦上。  
> **如果你只是要繼續用 Ollama 免費雲端額度，可以完全跳過這段。**

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 本機模型的完整教學（涵蓋 GPU 加速、模型調校）計畫另開一篇文章。以下是快速參考版。

### 先確認你的電腦規格

| 項目 | 最低需求 | 建議配備 |
|---|---|---|
| RAM | 8 GB | 16 GB 以上 |
| 磁碟空間 | 10 GB 可用 | 20 GB 以上 |
| GPU | 不需要（CPU 也能跑）| 有 NVIDIA / Apple Silicon GPU 更快 |
| 作業系統 | macOS 12+ / Windows 10+ / Linux | 最新版本 |

<!-- @img: check-system-specs | 查看電腦規格（macOS 關於這台 Mac / Windows 系統資訊） --><!-- ⚠️ 未配對 -->

### 推薦模型（2026 年 3 月）

| 推薦順序 | 模型 | 為什麼選它 |
|---|---|---|
| 🥇 首選 | `qwen2.5:7b` | 中文能力最強，大小適中（~5 GB）|
| 🥈 輕量 | `llama3.2:3b` | 最小最快，低配電腦也跑得動（~2 GB）|
| 🥉 均衡 | `gemma2:9b` | Google 出品，英文很強（~5 GB）|

更多模型可到 [ollama.com/search](https://ollama.com/search) 搜尋。

### 下載並測試模型

```bash
# 下載（以 Qwen 7B 為例，推薦中文使用者）
ollama pull qwen2.5:7b
```

下載過程需要幾分鐘到十幾分鐘，取決於你的網路速度。

![終端機下載模型進度](/images/articles/ollama-openclaw/ollama-pull-model.png)

```bash
# 測試
ollama run qwen2.5:7b
```

看到對話介面後，輸入 `你好，請用繁體中文自我介紹`，模型會開始回覆。輸入 `/bye` 離開。

![測試模型對話回應](/images/articles/ollama-openclaw/ollama-test-chat.png)

### 用本機模型搭配 OpenClaw

在 `config.yaml` 改為使用本機模型：

```yaml
models:
  default:
    provider: ollama
    model: qwen2.5:7b
```

---

## 本機 vs 雲端 vs 混合：到底該怎麼選？

| 使用場景 | 推薦方案 | 原因 |
|---|---|---|
| 學習、實驗 | Ollama（本機）| 免費，隨便玩 |
| 日常輕度使用 | Ollama + Qwen 7B | 免費，速度可接受 |
| 中文重度使用 | 雲端 API（Gemini Flash）| 品質好，成本低 |
| 隱私敏感資料 | Ollama（本機）| 資料不外傳 |
| 正式工作流 | 混合模式 | 省錢又保品質 |
| 全天候 Agent | 雲端部署 | 電腦可以關機 |

---

## 下一步

你已經有了一個完全在本機運行的 AI Agent！接下來可以：

- ⚙️ [模型設定與切換](/articles/openclaw-model-config) — 學會更精細地控制模型行為
- 🧩 [打造你的第一個 Skill](/articles/openclaw-first-skill) — 讓 AI 學會可重複的工作流
- 🤖 [認識 Agent](/articles/openclaw-agent) — 從聊天機器人進化到自主代理
- 📱 [串接 Telegram](/articles/telegram-integration) — 用手機隨時呼叫你的本機 AI

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **小密技**：裝好 Ollama 之後，你也可以在其他 AI 工具裡用它（像 Obsidian Copilot、Continue.dev），不只是 OpenClaw 專屬的喔！

有問題？到 [首頁討論區](/#discussion) 一起討論！
