---
title: "安裝指南：選擇你的平台"
description: "OpenClaw 安裝入口頁面，根據你的作業系統選擇對應的安裝教學。"
scene: "安裝與設定"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 1
tags: ["OpenClaw", "安裝", "入門"]
stuckOptions:
  "選擇安裝方式": ["我不知道該選哪個", "可以裝在平板或手機上嗎？", "我的電腦很舊，跑得動嗎？"]
---

## 選擇安裝方式

根據你的環境，選一個最適合的方式開始：

<div class="install-platform-cards">

<a href="/articles/install-openclaw-macos" class="install-card install-card--macos">
  <div class="install-card__icon">🍎</div>
  <div class="install-card__content">
    <h3>macOS</h3>
    <p>適用 macOS 13 Ventura 以上</p>
    <ul>
      <li>Homebrew 安裝</li>
      <li>pyenv 管理 Python</li>
      <li>Terminal 操作</li>
    </ul>
  </div>
  <span class="install-card__arrow">→</span>
</a>

<a href="/articles/install-openclaw-windows" class="install-card install-card--windows">
  <div class="install-card__icon">🪟</div>
  <div class="install-card__content">
    <h3>Windows</h3>
    <p>適用 Windows 10 / 11</p>
    <ul>
      <li>原生 CMD 安裝</li>
      <li>WSL 2 進階方案</li>
      <li>Build Tools 設定</li>
    </ul>
  </div>
  <span class="install-card__arrow">→</span>
</a>

<a href="/articles/deploy-openclaw-cloud" class="install-card install-card--cloud">
  <div class="install-card__icon">☁️</div>
  <div class="install-card__content">
    <h3>雲端部署</h3>
    <p>不用裝在本機</p>
    <ul>
      <li>Zeabur 一鍵部署</li>
      <li>KimiClaw 免設定</li>
      <li>Docker 容器</li>
    </ul>
  </div>
  <span class="install-card__arrow">→</span>
</a>

</div>

---

## 不確定該選哪個？

| 情境 | 建議 |
|---|---|
| 第一次接觸，只想試試 | ☁️ **雲端部署**（最快） |
| 想長期使用、深入學習 | 🍎 **macOS** 或 🪟 **Windows** 本地安裝 |
| 有 Linux 開發經驗 | 🪟 **Windows WSL 2** 或直接參考 macOS 教學 |
| 電腦跑不太動 | ☁️ **雲端部署** |

---

## 系統需求

不管哪個平台，最低需求：

- **Python** 3.11 以上
- **Node.js** 18 以上
- **RAM** 8GB（建議 16GB）
- **磁碟空間** 5GB 以上
- **網路** 穩定連線（需要呼叫 AI API）
- **API Key** 至少一個：OpenAI / Google / Anthropic

> 💡 還沒有 API Key？先看 [Google API Key 申請指南](/articles/google-api-key-guide)，免費額度就能開始！

---

## 安裝完成之後

裝好了？可以接著學：

- 📖 [為什麼需要 OpenClaw？](/articles/why-openclaw)
- ⚙️ [設定模型與 API Key](/articles/openclaw-model-config)
- 💰 [搞懂 Token 計費](/articles/token-economics)
- 🧩 [打造你的第一個 Skill](/articles/openclaw-skill)
- 🤖 [建立自動化 Agent](/articles/openclaw-agent)
- 👻 [設計 AI 的靈魂：Soul](/articles/openclaw-soul)
