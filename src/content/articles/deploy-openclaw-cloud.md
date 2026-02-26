---
title: "雲端部署 OpenClaw：Zeabur 一鍵部署 + KimiClaw 快速上手"
description: "不想折騰本地環境？用 Zeabur 一鍵部署 OpenClaw，或試試 KimiClaw 直接在雲端體驗 AI Agent 的威力。"
scene: "安裝與設定"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 2
tags: ["OpenClaw", "Zeabur", "KimiClaw", "雲端部署", "Docker"]
stuckOptions:
  "Zeabur 一鍵部署": ["注冊 Zeabur 後不知道怎麼開始", "部署失敗但沒有錯誤訊息", "免費額度夠用嗎？"]
  "KimiClaw": ["注冊後找不到 OpenClaw 入口", "跟本地版功能有什麼差別？"]
  "Docker 自建": ["docker-compose 執行失敗", "環境變數不知道怎麼填", "容器啟動但網頁打不開"]
  "怎麼選": ["不確定該用哪個方案", "可以後來再換方案嗎？"]
---

## 為什麼要雲端部署？

本地安裝 OpenClaw 雖然彈性最大，但你可能遇到這些情況：

- 💻 **電腦規格不夠**：OpenClaw 加上模型需要一定的運算資源
- 🌐 **想要 24/7 運行**：你的 Agent 需要全天候待命
- 🚀 **不想折騰環境**：Python 版本、相依套件讓你頭痛
- 👥 **團隊共用**：多人需要使用同一個 OpenClaw 實例

這篇文章會介紹兩種雲端方案，從最簡單到最靈活。

---

## 方案一：Zeabur 一鍵部署（推薦新手）

### 什麼是 Zeabur？

[Zeabur](https://zeabur.com) 是一個台灣團隊打造的雲端部署平台，類似 Vercel / Railway，但對中文使用者更友善。最大的優點是**幾乎零設定**。

### 部署步驟

#### Step 1：註冊 Zeabur 帳號

1. 前往 [zeabur.com](https://zeabur.com)
2. 用 GitHub 帳號登入（推薦）或 Email 註冊
3. 免費方案足夠用於個人測試

<!-- 📸 截圖建議：Zeabur 註冊頁面 -->
<!-- ![Zeabur 註冊頁面](/images/articles/deploy-cloud/zeabur-signup.png) -->

#### Step 2：建立新專案

1. 點擊「Create Project」
2. 選擇一個離你最近的區域（推薦：`Asia - Taiwan`）
3. 為專案命名，例如 `my-openclaw`

#### Step 3：部署 OpenClaw

你有兩種方式：

**方式 A：從 Marketplace 部署（最快）**

1. 在專案頁面點擊「Add Service」
2. 搜尋 `OpenClaw`
3. 點擊「Deploy」
4. 等待約 2-3 分鐘完成部署

**方式 B：從 GitHub Repo 部署（更靈活）**

1. 先 Fork OpenClaw 的 GitHub repo 到你的帳號
2. 在 Zeabur 點擊「Add Service」→「Git」
3. 選擇你 Fork 的 repo
4. Zeabur 會自動偵測到 Dockerfile 並部署

#### Step 4：設定環境變數

部署完成後，你需要設定 API Key：

1. 點擊你的服務 → 「Variables」
2. 新增以下環境變數：

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
# 或你使用的其他 LLM API Key
GOOGLE_API_KEY=your-google-api-key
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **小提醒**：不知道怎麼申請 API Key？看 [AI 模型 API Key 申請指南](/articles/ai-api-key-guide)——Google AI Studio 有免費額度，最適合新手。

#### Step 5：取得你的存取網址

1. 點擊「Networking」→「Generate Domain」
2. 你會得到一個像 `my-openclaw-xxxx.zeabur.app` 的網址
3. 打開這個網址，你的 OpenClaw 就上線了！

### Zeabur 費用參考

| 方案 | 費用 | 適合 |
|---|---|---|
| Developer | 免費 | 測試、學習 |
| Team | ~$5/月起 | 個人正式使用 |
| Pro | 依用量 | 團隊使用 |

> ⚠️ 免費方案有使用時間限制，正式使用建議升級 Team 方案。

---

## 方案二：KimiClaw 雲端體驗

### 什麼是 KimiClaw？

KimiClaw 是基於 OpenClaw 架構的雲端版本，由 Kimi AI（月之暗面）提供支援。你可以把它想像成 **「不用安裝的 OpenClaw」**。

### 跟自建 OpenClaw 有什麼差別？

| 比較項目 | 自建 OpenClaw | KimiClaw |
|---|---|---|
| 安裝難度 | 需要設定環境 | 零安裝，網頁即用 |
| 自訂彈性 | 完全掌控 | 有限 |
| 模型選擇 | 任意 LLM | 以 Kimi 為主 |
| 費用 | API 用量費 | 依 KimiClaw 方案 |
| 離線使用 | ✅ | ❌ |
| Skill 自訂 | 完全自由 | 支援基本 Skill |

### 適合你嗎？

**選 KimiClaw 如果你：**
- 想快速體驗 OpenClaw 的概念
- 不想處理任何技術設定
- 主要使用中文場景

**選自建 OpenClaw 如果你：**
- 需要串接多種 LLM（GPT-4、Claude 等）
- 需要完全客製化 Skill
- 有資料安全考量

### KimiClaw 快速上手

1. 前往 KimiClaw 官網註冊帳號
2. 進入工作台，你會看到預建的 Agent 範本
3. 選擇一個範本（例如「資訊整理助手」）
4. 直接在對話框輸入指令，體驗 Agent 運作

<!-- 📸 截圖建議：KimiClaw 工作台介面 -->
<!-- ![KimiClaw 工作台](/images/articles/deploy-cloud/kimiclaw-dashboard.png) -->

---

## 方案三：Docker 自建（進階）

如果你有自己的伺服器，或想要最大控制權：

### 前置需求

- 一台 VPS（Linode、DigitalOcean、AWS EC2 等）
- Docker 和 Docker Compose 已安裝
- 基本的 Linux 命令列操作能力

### 部署步驟

```bash
# 1. 拉取 OpenClaw Docker Image
docker pull openclaw/openclaw:latest

# 2. 建立 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  openclaw:
    image: openclaw/openclaw:latest
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
EOF

# 3. 建立 .env 檔案
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "GOOGLE_API_KEY=your-google-key" >> .env

# 4. 啟動
docker-compose up -d

# 5. 確認狀態
docker-compose ps
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **安全提醒**：正式部署請記得設定 HTTPS（可以用 Nginx + Let's Encrypt）和防火牆規則。

---

## 三種方案怎麼選？

```
你是否想要零安裝體驗？
├── 是 → KimiClaw（最快上手）
└── 否 → 你有自己的伺服器嗎？
    ├── 沒有 → Zeabur（推薦，省事）
    └── 有 → Docker 自建（最大彈性）
```

---

## 下一步

部署完成後，你可以開始學習 OpenClaw 的核心功能：

- ⚙️ [設定模型切換與 Fallback](/articles/openclaw-model-config)
- 🧩 [Skill：讓 AI 學會可重複的工作流](/articles/openclaw-skill)
- 🤖 [Agent：你的 AI 分身](/articles/openclaw-agent)
- 🧠 [Soul：讓 Agent 有記憶和個性](/articles/openclaw-soul)
- 📱 [串接 Telegram 隨時隨地使用](/articles/telegram-integration)

有問題？到 [首頁討論區](/#discussion) 一起討論！
