---
title: "Ollama + OpenClaw：免 API Key，幾分鐘內開始和 AI 對話"
description: "不用設定 API Key，直接用 Ollama 帳號的免費雲端額度，幾分鐘內就能讓 OpenClaw 開口說話。請選擇你的作業系統開始。"
contentType: "guide"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-03-02"
verifiedAt: "2026-03-04"
archived: false
order: 4
prerequisites: ["llm-guide"]
estimatedMinutes: 2
tags: ["OpenClaw", "Ollama", "安裝", "LLM", "macOS", "Windows"]
---

![Ollama + OpenClaw 讓你和 AI 一起快樂工作](/images/articles/ollama-openclaw/happy-bros.webp)

## 你用哪個作業系統？

請選擇對應你電腦的教學，直接點進去跟著走：

| 作業系統 | 教學連結 | 預計時間 |
|---------|---------|---------|
| 🍎 **macOS** | [Ollama + OpenClaw macOS 篇](/articles/ollama-openclaw-mac) | 約 8 分鐘 |
| 🪟 **Windows** | [Ollama + OpenClaw Windows 篇](/articles/ollama-openclaw-windows) | 約 15 分鐘 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **Windows 用戶**：流程會需要安裝 WSL（Windows Linux 子系統）和 Node 22，步驟多一點，但都附截圖一步一步走，不用擔心。

---

## 什麼是 Ollama + OpenClaw？

[Ollama](https://ollama.com) 是一個 AI 模型管理工具，同時支援雲端與本機模型。**內建免費雲端額度，完全不用申請 API Key**。

搭配 `ollama launch openclaw`，整個流程超簡單：

```
安裝 Ollama → ollama launch openclaw → 登入帳號 → 選雲端模型 → 開始對話
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **模型可靠度說明**：Ollama 的免費雲端模型（minimax、kimi 等）拿來學習和試玩很好用，但若要正式導入工作流程、交辦重要任務，還是建議換用 Claude、GPT-4o 等主流商業模型，穩定性與指令遵循能力有明顯差距。

有問題？到 [首頁討論區](/#discussion) 一起討論！

