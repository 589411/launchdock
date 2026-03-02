---
title: "Ollama + OpenClaw：本機跑 AI 模型，完全免費零 API 費"
description: "用 Ollama 在自己的電腦上跑開源 LLM，搭配 OpenClaw 打造完全離線、零費用的 AI Agent。從安裝到串接，手把手帶你走完全程。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "中級"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 4
prerequisites: ["llm-guide", "install-openclaw"]
estimatedMinutes: 20
tags: ["OpenClaw", "Ollama", "安裝", "LLM", "部署", "macOS", "Windows", "Linux"]
stuckOptions:
  "Ollama 安裝": ["下載後打不開", "macOS 安全性阻擋怎麼辦？", "Windows 需要 WSL 嗎？"]
  "模型下載": ["下載速度很慢怎麼辦？", "哪個模型最適合中文？", "硬碟空間不夠怎麼辦？"]
  "OpenClaw 串接": ["config 檔要怎麼改？", "Ollama 啟動了但 OpenClaw 連不上", "模型回應很慢正常嗎？"]
  "效能問題": ["回應速度比 API 慢很多", "GPU 有被用到嗎？", "記憶體不夠怎麼辦？"]
  "進階設定": ["可以同時跑多個模型嗎？", "怎麼跟雲端 API 混用？", "ollama launch openclaw 是什麼？"]
---

## 為什麼要在本機跑 AI 模型？

你可能想問：「API 那麼方便，為什麼要在自己電腦上跑模型？」

好問題。幾個理由：

| 優勢 | 說明 |
|---|---|
| 💰 **完全免費** | 不用付 API 費用，跑多少次都不用錢 |
| 🔒 **隱私保護** | 資料不會傳到外部伺服器，100% 留在你的電腦 |
| 📴 **離線可用** | 沒有網路也能用，搭飛機、咖啡廳斷網都不怕 |
| 🧪 **自由實驗** | 隨便測試，不用擔心 Token 費用爆掉 |

但也有取捨：

| 限制 | 說明 |
|---|---|
| ⚡ 速度較慢 | 本機推論比雲端 API 慢，取決於你的硬體 |
| 💻 硬體需求 | 至少 8GB RAM，有 GPU 更好 |
| 🧠 模型能力 | 開源模型目前還比不上 GPT-4o / Claude Sonnet |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編建議**：先用 Ollama 免費練手，等你確定需求後再決定要不要花錢用雲端 API。兩者可以並用，一點也不衝突！

---

## 什麼是 Ollama？

[Ollama](https://ollama.com) 是一個讓你在本機輕鬆跑開源 LLM 的工具。你可以把它想成「本地版的 AI Studio」——一行指令就能下載和運行各種開源模型。

```
Ollama = 模型管理員（下載、啟動、管理）
開源 LLM = AI 大腦（Llama、Gemma、Qwen 等）
OpenClaw = 框架（Agent、Skill、工具串接）
```

三者搭起來，就是一套完全在你電腦上運行的 AI Agent 系統。

---

## 🚀 快速體驗路線：`ollama launch openclaw`

> 如果你只是想**先體驗看看 OpenClaw 長什麼樣子**，不想走完整安裝流程，Ollama 提供了一個超快的啟動方式。

### 前提

- 已安裝 Ollama（下面 Step 2 會教）
- 已安裝 Node.js 24+ 和 `npm install -g openclaw`

### 一鍵啟動

```bash
ollama launch openclaw
```

Ollama 會列出可選模型，你可以直接選雲端模型（不需要下載到本機）：

```
? Select a model:
  ❯ minimax-m2.5:cloud     ← 推薦！免下載，Ollama 送免費 Token
    qwen2.5:7b              ← 本機模型，需下載
    llama3.2:3b             ← 最小最快
```

選 `minimax-m2.5:cloud` 的話，**不需要 GPU、不需要下載模型**，直接就能用。Ollama 帳號目前有提供免費額度。

<!-- @img: ollama-launch-openclaw | ollama launch openclaw 選擇模型畫面 -->

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **minimax 雲端模型的效果不錯**——社群回報它可以直接幫你設定 Telegram、Email 等功能。如果它說「請你自己裝」，可以跟它耐心溝通：「請你幫我裝，我不會」或「請你教我，我不懂」，通常它會配合。

### 查看 Ollama 免費額度

Ollama 帳號有免費 Token 可以用於雲端模型：

1. 前往 [ollama.com/settings](https://ollama.com/settings)
2. 用 Google 帳號登入
3. 點「Connect」連結到你的本機 Ollama
4. 即可查看剩餘免費額度

<!-- @img: ollama-settings-tokens | Ollama 帳號設定頁面查看免費額度 -->

> ⚠️ **體驗版限制**：透過 `ollama launch openclaw` 啟動的方式，本質上是在你的作業系統原生環境跑 OpenClaw，**部分進階功能可能會受限**。如果你要長期使用，建議走下面的完整安裝流程。

---

## Step 1：確認你的電腦規格

在開始之前，先確認你的硬體能跑起來：

### 最低需求

| 項目 | 最低需求 | 建議配備 |
|---|---|---|
| RAM | 8 GB | 16 GB 以上 |
| 磁碟空間 | 10 GB 可用 | 20 GB 以上（模型越大越吃空間）|
| GPU | 不需要（CPU 也能跑）| 有 NVIDIA / Apple Silicon GPU 更快 |
| 作業系統 | macOS 12+ / Windows 10+ / Linux | 最新版本 |

### 模型大小參考

| 模型 | 大小 | RAM 需求 | 適合 |
|---|---|---|---|
| Llama 3.2 3B | ~2 GB | 8 GB | 低規電腦、快速測試 |
| Gemma 2 9B | ~5 GB | 16 GB | 日常使用首選 |
| Qwen 2.5 14B | ~9 GB | 16 GB | 中文最強 |
| Llama 3.1 70B | ~40 GB | 64 GB | 最強但吃資源，需 GPU |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **不確定自己電腦夠不夠？** 先裝 Ollama、下載最小的模型試試看就知道了，不行再換方案也不虧。

<!-- @img: check-system-specs | 查看電腦規格（macOS 關於這台 Mac / Windows 系統資訊）-->

---

## Step 2：安裝 Ollama

### macOS

1. 前往 [ollama.com/download](https://ollama.com/download)
2. 點擊「Download for macOS」
3. 打開下載的 `.dmg` 檔案
4. 把 Ollama 拖到「應用程式」資料夾
5. 打開 Ollama

<!-- @img: ollama-download-mac | Ollama 官網下載頁面（macOS）-->

> 🚨 **macOS 安全性提示**：如果看到「無法打開 Ollama，因為來自未識別的開發者」，到「系統設定 → 隱私與安全性」拉到底點「仍然開啟」。

<!-- @img: macos-security-allow | macOS 安全性設定允許 Ollama -->

### Windows

1. 前往 [ollama.com/download](https://ollama.com/download)
2. 點擊「Download for Windows」
3. 執行下載的 `.exe` 安裝程式
4. 照著安裝精靈走完（一直按「Next」就好）
5. 安裝完成後 Ollama 會在背景自動啟動

<!-- @img: ollama-download-windows | Ollama 官網下載頁面（Windows）-->

> 🚨 **Windows 注意**：Windows 版本需要 Windows 10 以上。如果你用的是較舊版本，需要先裝 WSL2，再在 Linux 環境裡安裝 Ollama。

### Linux

在終端機執行一行指令：

```bash
# 先安裝 zstd（Ollama 安裝過程需要）
sudo apt install -y zstd

# 安裝 Ollama
curl -fsSL https://ollama.com/install.sh | sh
```

> 💡 **WSL 使用者注意**：如果你是在 Windows 的 WSL 環境中安裝，`zstd` 這步千萬別跳過，否則安裝會卡住。

安裝完成後，啟動 Ollama 服務：

```bash
ollama serve
```

### 確認安裝成功

不管你是哪個系統，打開終端機（Terminal / PowerShell），輸入：

```bash
ollama --version
```

看到版本號就代表安裝成功：

```
ollama version 0.6.x
```

<!-- @img: ollama-version-check | 終端機確認 Ollama 版本 -->

---

## Step 3：下載你的第一個模型

Ollama 安裝好只是一個「空殻」，你需要下載模型才能開始用。

### 推薦模型（2026 年 3 月）

| 推薦順序 | 模型 | 為什麼選它 |
|---|---|---|
| 🥇 首選 | `qwen2.5:7b` | 中文能力最強，大小適中 |
| 🥈 輕量 | `llama3.2:3b` | 最小最快，低配電腦也跑得動 |
| 🥉 均衡 | `gemma2:9b` | Google 出品，英文很強 |
| ☁️ 雲端 | `minimax-m2.5:cloud` | 不需下載，Ollama 免費 Token，適合體驗 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **不想佔硬碟空間？** 選 `minimax-m2.5:cloud` 雲端模型，不需下載任何東西，直接透過 Ollama 帳號的免費額度使用。適合先體驗後決定。

### 下載模型

```bash
# 下載 Qwen 2.5 7B（推薦中文使用者）
ollama pull qwen2.5:7b
```

下載過程可能需要幾分鐘到十幾分鐘，取決於你的網路速度。

<!-- @img: ollama-pull-model | 終端機下載模型進度 -->

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **下載很慢？** 可以先下較小的模型 `ollama pull llama3.2:3b`（只有約 2GB），先跑起來再說。

### 測試模型是否可用

```bash
ollama run qwen2.5:7b
```

如果你看到一個對話介面，試著輸入：

```
你好，請用繁體中文自我介紹
```

模型會開始回覆。輸入 `/bye` 離開對話。

<!-- @img: ollama-test-chat | 測試模型對話回應 -->

### 查看已下載的模型

```bash
ollama list
```

會顯示所有已下載的模型及其大小。

---

## Step 4：串接 OpenClaw 與 Ollama

現在你有了本機模型，接下來把它接上 OpenClaw。

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

<!-- @img: openclaw-config-ollama | OpenClaw config.yaml 設定 Ollama -->

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

如果你看到模型的回覆，恭喜——你的本機 AI Agent 跑起來了！🎉

<!-- @img: openclaw-ollama-first-chat | OpenClaw 透過 Ollama 的第一次對話 -->

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
