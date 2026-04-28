---
title: "Hermes Agent 快速上手｜ollama launch hermes 一鍵啟動"
description: "用一行指令啟動 Hermes AI Agent：自動安裝、選雲端模型、設定完成，幾分鐘內體驗具備跨 session 記憶與 70+ 內建技能的自主 Agent。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-04-28"
verifiedAt: "2026-04-28"
archived: false
order: 1
series:
  name: "Hermes 專題"
  part: 1
prerequisites: ["ollama-openclaw-mac"]
estimatedMinutes: 10
tags: ["Ollama", "Hermes", "Agent", "安裝", "LLM"]
stuckOptions:
  "ollama launch hermes": ["出現 Error: unknown integration: hermes 怎麼辦？", "安裝時卡在 npm 那步"]
  "模型選擇": ["要選雲端還是本機模型？", "gemma4 要下載多久？"]
  "第一次對話": ["Hermes 回應是英文怎麼辦？", "怎麼確認 Hermes 有在記憶對話？"]
---

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **鴨編快說重點**：Hermes 是 Nous Research 打造的自主 AI Agent，內建 70+ 技能、跨對話記憶、還能自動學新技能。用 Ollama 啟動超簡單——整個流程是這樣的：
>
> ```
> brew upgrade ollama → ollama launch hermes → 選雲端模型 → 開始對話
> ```

<!-- @img: hermes-cover | Hermes Agent 結合 Ollama 一鍵啟動示意圖 -->

---

## Hermes Agent 是什麼？

[Hermes](https://github.com/NousResearch/hermes-agent) 是 [Nous Research](https://nousresearch.com/) 開發的開源 AI Agent，和 OpenClaw 的定位類似，但有幾個特別的地方：

| 特色 | 說明 |
| --- | --- |
| **自動技能建立** | 遇到新任務會自動建立可重複使用的技能 |
| **跨 session 記憶** | 對話結束後仍記得你說過的事 |
| **70+ 內建技能** | 開箱即用，涵蓋搜尋、摘要、程式生成等 |
| **訊息平台整合** | 可連接 Telegram、Discord、Slack、WhatsApp、Signal、Email |

最重要的是：**Ollama 直接支援 `ollama launch hermes`**，一行指令搞定一切。

---

## Step 1：確認 Ollama 版本

`ollama launch hermes` 需要 Ollama 夠新的版本。先確認：

```bash
ollama --version
```

<!-- @img: ollama-version-check | 終端機確認 Ollama 版本號 -->

如果看到版本低於 `0.7.0`，或執行後出現 `Error: unknown integration: hermes`，先更新：

```bash
brew upgrade ollama
```

<!-- @img: brew-upgrade-ollama | 終端機執行 brew upgrade ollama -->

更新完畢後，重新啟動 Ollama（點選選單列的 Ollama 圖示 → Quit，再重新開啟）。

---

## Step 2：一鍵啟動 Hermes

開啟終端機，輸入：

```bash
ollama launch hermes
```

<!-- @img: hermes-launch-command | 終端機輸入 ollama launch hermes -->

第一次執行，Ollama 會問你是否安裝 Hermes，按 Enter 確認：

<!-- @img: hermes-install-prompt | Hermes 安裝確認提示 -->

Ollama 接著自動執行四個步驟：

1. **Install** — 用 npm 安裝 Hermes Agent
2. **Model** — 開啟模型選擇畫面
3. **Onboarding** — 自動設定 Ollama 為 provider，指向 `http://127.0.0.1:11434/v1`
4. **Launch** — 啟動 Hermes 對話介面

<!-- @img: hermes-installing | Hermes 安裝進度 -->

<!-- @img: hermes-onboarding | Hermes 自動設定 Ollama provider -->

---

## Step 3：選擇模型

安裝完成後，Hermes 會出現模型選擇畫面。

<!-- @img: hermes-model-selector | Hermes 模型選擇器 -->

> `<img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;">` **推薦的雲端模型**（用 Ollama 免費額度，免下載）：
>
> | 模型 | 特色 |
> | --- | --- |
> | `minimax-m2.7:cloud` | 🥇 快速、高效，適合日常生產力任務 |
> | `kimi-k2.5:cloud` | 強推理能力、支援子代理（subagents） |
> | `glm-5.1:cloud` | 推理與程式生成 |
> | `qwen3.5:cloud` | 工具呼叫 + 視覺理解，適合 Agent 任務 |
>
> 想完全離線？本機模型需要獨顯：
>
> | 模型 | 需求 |
> | --- | --- |
> | `gemma4` | 約 16 GB VRAM |
> | `qwen3.6` | 約 24 GB VRAM |

選好模型後，Hermes 完成設定並自動啟動。

<!-- @img: hermes-setup-complete | Hermes 設定完成準備就緒 -->

---

## Step 4：第一次對話

Hermes 啟動後，就像一般 AI Agent 介面——直接輸入你想做的事：

```
你好！請用繁體中文自我介紹——你是 Hermes，你有什麼能力？
```

<!-- @img: hermes-first-chat | Hermes 第一次對話畫面 -->

Hermes 和一般 Chatbot 的差別：它會把對話摘要存進記憶，下次啟動時還記得你說過什麼。

> 如果 Hermes 用英文回應，直接說：「請用繁體中文回覆」即可。

---

## Step 5（選做）：連接訊息平台

想用 Telegram 或 Discord 和 Hermes 聊？執行：

```bash
hermes gateway setup
```

<!-- @img: hermes-gateway-setup | hermes gateway setup 設定訊息平台 -->

支援的平台：Telegram、Discord、Slack、WhatsApp、Signal、Email。

設定完成後，直接在訊息 App 裡傳訊息就能和 Hermes 互動，不用每次開終端機。

---

## 常見問題

### 🚨 Error: unknown integration: hermes

Ollama 版本太舊，執行 `brew upgrade ollama` 更新後重試。

### 🚨 安裝時卡在 npm 那步

確認你有安裝 Node.js（版本 18 以上）：

```bash
node --version
```

沒有的話：

```bash
brew install node
```

### 🚨 想重新設定模型或 provider

執行以下指令，重新跑完整設定流程：

```bash
hermes setup
```

<!-- @img: hermes-reconfigure | hermes setup 重新設定畫面 -->

---

## 補充：手動安裝方式

偏好自己掌控安裝流程？不用 `ollama launch`，直接用安裝腳本：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安裝完成後，設定向導會自動啟動。連接 Ollama 的步驟：

1. 選「**More providers…**」
2. 選「**Custom endpoint（自訂端點）**」
3. 輸入 API base URL：

   ```
   http://127.0.0.1:11434/v1
   ```

4. API key 留空（本機 Ollama 不需要）
5. Hermes 自動偵測本機模型，確認後按 Enter

> **Windows 使用者**：Hermes 在 Windows 上需要 WSL2。先安裝 WSL2（`wsl --install`），再從 WSL 終端機內執行安裝指令。

---

## 下一步

- 🦀 [認識 OpenClaw：另一個 AI Agent 框架](/articles/why-openclaw)
- 📱 [OpenClaw 串接 Telegram](/articles/telegram-integration)
- 🧩 [打造你的第一個 Skill（OpenClaw）](/articles/openclaw-first-skill)

有問題？到 [首頁討論區](/#discussion) 一起討論！
