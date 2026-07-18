---
title: "Mac 安裝 Docker + n8n 完整指南"
description: "Mac 使用者安裝 Docker + n8n 的最簡流程。不用 WSL2、不用管斜線方向、不用處理換行符號，三個指令就能跑起來。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-05-30"
verifiedAt: "2026-05-30"
archived: false
order: 11
prerequisites: []
estimatedMinutes: 10
tags: ["Docker", "n8n", "macOS", "安裝"]
stuckOptions:
  "安裝 Docker Desktop": ["Apple Silicon 要選哪個版本？", "安裝後找不到 Docker 圖示？"]
  "docker pull 卡住": ["網路正常但 Image 下不來", "公司電腦 SSL 憑證錯誤"]
  "n8n 打不開": ["localhost:5678 無法連線", "Terminal 顯示 Error 怎麼辦？"]
  "Port 衝突": ["5678 已被佔用", "怎麼換 Port？"]
---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **Mac 使用者的好消息**：在 Mac 上裝 Docker + n8n，比 Windows 簡單非常多。沒有 WSL2 權限坑、沒有路徑斜線混淆、沒有換行符號的問題。看完這篇，你大概 10 分鐘就能跑起來。

> 📌 **Windows 使用者請移駕**：這篇是 Mac 專版。Windows 版本的踩坑指南請看：[Windows 安裝 Docker + n8n 避坑完全指南](/articles/docker-n8n-windows/)

---

## 🤔 為什麼 Mac 比 Windows 簡單這麼多？

如果你看過 [Windows 安裝 Docker + n8n 避坑完全指南](/articles/docker-n8n-windows/)，就知道 Windows 使用者要面對一大堆麻煩。這些問題源自於 Windows 原生環境和 Linux 的根本差異，想深入了解可以看這篇：[為什麼不建議在 Windows 原生環境安裝 OpenClaw？](/articles/why-not-windows-openclaw/)

| 問題 | Windows | Mac |
|------|---------|-----|
| 需要 [WSL2](/articles/windows-wsl-guide/) 虛擬環境 | ✅ 必須裝，且常出問題 | ❌ 不需要 |
| 路徑斜線方向 | ⚠️ `\` vs `/` 常搞混 | ✅ 全部用 `/`，Unix 原生 |
| PowerShell 換行符號 | ⚠️ 多行指令容易斷掉 | ✅ Terminal 無此問題 |
| Volume 路徑含空格 | ⚠️ 需要特別用 `""` 處理 | ✅ 通常不是問題 |
| 更新後權限爆炸 | ⚠️ 需要修 `/etc/wsl.conf` | ❌ 不會發生 |

Mac 是 Unix-based 系統，Docker 的底層就是 Linux，兩者天生相容。你輸入的路徑和容器內部的格式是同一套，完全不需要做任何轉換。

---

## 🚀 安裝步驟（只有三步）

### Step 1：安裝 Docker Desktop

前往 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) 下載。

> ⚠️ **注意版本**：Mac 分為兩種晶片版本，下載前確認你的機器：
> - **Apple Silicon（M1/M2/M3/M4）** → 選 Apple Silicon 版
> - **Intel Mac** → 選 Intel Chip 版
>
> 不確定的話，點左上角蘋果圖示 → 「關於這台 Mac」查看。

<!-- @img: docker-desktop-download-mac | Docker Desktop 下載頁面選擇 Mac 版本 -->

安裝完成後，點擊 Docker Desktop 開啟，看到頂端選單列出現鯨魚圖示 🐳 就表示 Docker 已啟動。

<!-- @img: docker-desktop-running-mac | Mac 選單列顯示 Docker 鯨魚圖示 -->

### Step 2：建立資料夾

開啟 **Terminal**（在 Spotlight 搜尋 `terminal`），建立一個存放 n8n 資料的資料夾。如果你不熟悉 Terminal 操作，可以先看：[CLI 入門指南](/articles/cli-guide/)。

```bash
mkdir ~/n8n_data
```

> 💡 `~` 是你的家目錄（Home Directory）的縮寫，也就是 `/Users/你的帳號名稱`。資料會放在這裡，方便管理。

### Step 3：啟動 n8n

```bash
docker run -d --name n8n -p 5678:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

等 Docker 下載完 Image 並啟動後（第一次約 1-2 分鐘），打開瀏覽器前往：

```
http://localhost:5678
```

看到 n8n 設定畫面，完成！

<!-- @img: n8n-first-run-browser-mac | 瀏覽器開啟 n8n 初始設定畫面 -->

---

## 🧐 指令解析：這一行在做什麼？

```bash
docker run -d --name n8n -p 5678:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

| 參數 | 說明 |
|------|------|
| `run` | 建立並啟動一個新容器 |
| `-d` | 在背景執行（不佔用 Terminal 視窗） |
| `--name n8n` | 幫容器取名，方便之後操作 |
| `-p 5678:5678` | 把 Mac 的 5678 Port 接通到容器內的 5678 Port |
| `-v ~/n8n_data:/home/node/.n8n` | 把 Mac 的資料夾掛進容器，確保資料不會消失 |
| `docker.n8n.io/n8nio/n8n` | 要使用的 Image 名稱 |

---

## 🚨 常見問題快速排查

### 問題一：docker pull 卡住或 SSL 憑證錯誤

**症狀**：第一次跑 `docker run` 時，下載 Image 的進度卡在某個百分比，或出現 `certificate signed by unknown authority`。

**原因**：公司電腦的資安軟體（如 Zscaler）攔截了對外連線。

**處理方式**：Docker Desktop → Settings → Resources → Proxies → 填入公司 Proxy 設定，或洽詢 IT 部門開放白名單。

### 問題二：localhost:5678 打不開

先用指令確認容器是否真的在跑：

```bash
docker ps
```

如果看到 n8n 在清單裡，再看日誌找原因：

```bash
docker logs n8n
```

### 問題三：Port 5678 衝突

```bash
# 查看是否有舊容器佔著
docker ps -a

# 移除舊容器
docker rm -f n8n

# 或改用其他 Port
docker run -d --name n8n -p 5679:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

---

## 💡 日常操作指令

```bash
# 啟動 n8n（容器存在但停止時）
docker start n8n

# 停止 n8n
docker stop n8n

# 查看執行中的容器
docker ps

# 查看日誌
docker logs n8n

# 刪除容器（資料不會消失，放在 ~/n8n_data）
docker rm n8n

# 更新 n8n（先刪容器，重新 run 即可）
docker stop n8n && docker rm n8n
docker pull docker.n8n.io/n8nio/n8n
docker run -d --name n8n -p 5678:5678 -v ~/n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

> 💡 **更新 n8n 不會遺失資料**，因為所有資料都存在 `~/n8n_data`，容器只是一個殼。刪掉重建就是最乾淨的更新方式。

---

## 🔗 延伸閱讀

- **也想在 Mac 上跑 AI Agent？** → [macOS 安裝 OpenClaw 完整教學](/articles/install-openclaw-macos/)
- **想用免費本地 LLM 搭配 OpenClaw？** → [Ollama + OpenClaw 快速上手｜macOS 篇](/articles/ollama-openclaw-mac/)
- **想把 OpenClaw 部署到雲端？** → [雲端部署 OpenClaw：Zeabur 一鍵部署](/articles/deploy-openclaw-cloud/)
- **也有 Windows 電腦？** → [Windows 安裝 Docker + n8n 避坑完全指南](/articles/docker-n8n-windows/)
