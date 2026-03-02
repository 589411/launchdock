---
title: "CLI 入門指南：命令列到底是什麼？為什麼 AI 離不開它？"
description: "命令列介面（CLI）是 OpenClaw 的手和腳。了解 CLI 的原理、常見工具、以及它為什麼是 AI 時代最強大的操作方式。"
contentType: "guide"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 0
prerequisites: ["why-openclaw"]
estimatedMinutes: 12
tags: ["OpenClaw", "安裝", "macOS", "Linux", "WSL"]
stuckOptions:
  "CLI 是什麼": ["我完全沒用過命令列", "CLI 和 Terminal 一樣嗎？", "為什麼不能用滑鼠點？"]
  "常見工具": ["這些工具我需要全部學嗎？", "有沒有圖形化替代方案？"]
  "為什麼重要": ["GUI 不是更直覺嗎？", "AI 為什麼要用 CLI？"]
---

## 什麼是 CLI？

CLI 是 **Command-Line Interface（命令列介面）** 的縮寫。簡單說，就是你用**打字**而非**點滑鼠**來操作電腦。

你可能更熟悉的是 GUI（Graphical User Interface，圖形介面）——有按鈕、有圖示、有視窗，用滑鼠點來點去。而 CLI 就是那個黑底白字的畫面，你輸入一行指令，電腦做一件事。

```bash
# 這就是 CLI —— 一行指令，一個結果
ls -la ~/Documents
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：想像 GUI 是去餐廳看菜單點餐，你只能點菜單上有的東西。而 CLI 就像直接跟廚師講，你可以自由組合任何食材和做法，甚至發明新菜。自由度完全不同。

---

## CLI 的運作原理

CLI 的運作非常優雅，只有三個部分：

### 1. Shell（殼層）

Shell 就是那個等待你輸入指令的程式。它是你跟作業系統之間的翻譯官。

常見的 Shell：
- **Bash**：Linux 預設，最通用
- **Zsh**：macOS 預設，Bash 的加強版
- **PowerShell**：Windows 的 Shell（語法跟 Bash 完全不同）
- **Fish**：對新手友善的 Shell

### 2. 指令（Command）

你輸入的每一行文字就是一個指令。指令的結構通常是：

```bash
指令名稱 [選項] [參數]

# 範例
ls -la ~/Documents
# ls     → 指令：列出檔案
# -la    → 選項：顯示詳細資訊 + 隱藏檔
# ~/Documents → 參數：目標目錄
```

### 3. 管道（Pipe）與組合

CLI 真正強大的地方在於**組合**。你可以把多個小工具串在一起，完成複雜的任務：

```bash
# 找出 Documents 裡所有包含 "OpenClaw" 的 .md 檔案，按修改時間排序
find ~/Documents -name "*.md" | xargs grep -l "OpenClaw" | xargs ls -lt
```

這個概念叫做 **Unix 哲學**：每個工具只做一件事，但做到最好。需要複雜功能？把它們串起來。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：這就像樂高積木。每塊積木很簡單，但你可以組出任何東西。CLI 工具就是電腦世界的樂高。

---

## 常見 CLI 工具分類

不用全部學會——先知道有哪些類型，用到再查就好。

### 📁 檔案與目錄操作

這是最基本的工具，用來管理你的檔案。

| 指令 | 功能 | 範例 |
|---|---|---|
| `ls` | 列出檔案 | `ls -la` |
| `cd` | 切換目錄 | `cd ~/Projects` |
| `cp` | 複製 | `cp file.txt backup.txt` |
| `mv` | 移動/改名 | `mv old.md new.md` |
| `rm` | 刪除 | `rm unwanted.txt` |
| `mkdir` | 建立目錄 | `mkdir my-project` |
| `find` | 搜尋檔案 | `find . -name "*.md"` |
| `tree` | 顯示目錄結構 | `tree -L 2` |

### 🔍 文字搜尋與處理

這類工具是 CLI 的靈魂，也是 OpenClaw Agent 最常使用的工具。

| 指令 | 功能 | 範例 |
|---|---|---|
| `cat` | 顯示檔案內容 | `cat README.md` |
| `grep` | 搜尋文字 | `grep "error" log.txt` |
| `sed` | 取代文字 | `sed 's/old/new/g' file.txt` |
| `awk` | 欄位處理 | `awk '{print $1}' data.csv` |
| `head` / `tail` | 看開頭/結尾 | `tail -f server.log` |
| `wc` | 計算字數/行數 | `wc -l *.md` |
| `sort` | 排序 | `sort -n numbers.txt` |
| `uniq` | 去除重複 | `sort data.txt \| uniq` |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：`grep` 是你會最常用到的。它可以在幾百個檔案中瞬間找到你要的文字。OpenClaw 的 Agent 用它來搜尋 Skill 檔案、找 log 錯誤、分析資料。

### 🌐 網路工具

跟外部服務溝通的工具。OpenClaw 透過 MCP 呼叫 API 時，底層就是這些。

| 指令 | 功能 | 範例 |
|---|---|---|
| `curl` | 發送 HTTP 請求 | `curl https://api.example.com` |
| `wget` | 下載檔案 | `wget https://example.com/file.zip` |
| `ssh` | 遠端連線 | `ssh user@server.com` |
| `scp` | 遠端複製 | `scp file.txt user@server:~/` |
| `ping` | 測試連線 | `ping google.com` |

### 📦 套件管理

安裝軟體的工具。就像手機上的 App Store，但用一行指令就能裝。

| 工具 | 系統 | 範例 |
|---|---|---|
| `apt` | Ubuntu / Debian | `sudo apt install jq` |
| `brew` | macOS | `brew install jq` |
| `dnf` | Fedora | `sudo dnf install jq` |
| `pacman` | Arch Linux | `sudo pacman -S jq` |
| `pip` | Python | `pip install requests` |
| `npm` | Node.js | `npm install express` |

### 🔧 開發與版本控制

寫程式和管理程式碼的工具。

| 指令 | 功能 | 範例 |
|---|---|---|
| `git` | 版本控制 | `git clone https://github.com/...` |
| `python` | 執行 Python | `python script.py` |
| `node` | 執行 JavaScript | `node app.js` |
| `make` | 自動化建置 | `make build` |
| `docker` | 容器管理 | `docker run ubuntu` |

### 🛠️ 資料處理

處理結構化資料的專業工具，是 AI Agent 的最愛。

| 指令 | 功能 | 範例 |
|---|---|---|
| `jq` | JSON 處理 | `curl api.com \| jq '.name'` |
| `csvkit` | CSV 處理 | `csvlook data.csv` |
| `pandoc` | 文件轉換 | `pandoc doc.md -o doc.pdf` |
| `ffmpeg` | 影音處理 | `ffmpeg -i video.mp4 audio.mp3` |
| `imagemagick` | 圖片處理 | `convert img.png -resize 50% small.png` |

---

## CLI 的五大優勢

為什麼在 GUI 這麼方便的年代，CLI 還是這麼重要？

### 1. ⚡ 速度與效率

一行指令能做到的事，用 GUI 可能要點十幾下：

```bash
# 一行指令：找出所有超過 30 天沒修改的 .log 檔案並刪除
find /var/log -name "*.log" -mtime +30 -delete
```

用 GUI 做同樣的事？打開檔案管理器 → 導航到目錄 → 排序 → 逐一檢查日期 → 逐一刪除 → ……

### 2. 🔄 可重複性

指令可以存成 Script（腳本），一次寫好，永遠重複使用：

```bash
#!/bin/bash
# 每天自動備份的 script
tar -czf backup-$(date +%Y%m%d).tar.gz ~/Documents
rsync -avz backup-*.tar.gz server:~/backups/
echo "✅ 備份完成：$(date)"
```

GUI 操作？你得每次手動重複，還可能漏步驟。

### 3. 🤖 可自動化（AI 最愛這個！）

**這是 CLI 對 OpenClaw 最關鍵的優勢。**

AI 模型（LLM）輸出的是文字。CLI 的輸入也是文字。兩者天生契合。

當你跟 OpenClaw 說「幫我整理這個資料夾」，Agent 的思考過程是：

```
思考：需要列出檔案 → 用 ls
思考：需要找出重複的 → 用 md5sum + sort + uniq
思考：需要移動分類 → 用 mv
思考：需要產生報告 → 用 echo 寫入檔案
```

每一步都是 CLI 指令，LLM 可以直接生成、直接執行。如果是 GUI 呢？AI 要怎麼「點滑鼠」？

### 4. 🔗 可組合（管道的魔法）

小工具 + 管道 = 無限可能。你永遠可以把工具用你想不到的方式組合：

```bash
# 統計你的 OpenClaw Skill 檔案中最常用的 CLI 工具
grep -rh "^>" ~/openclaw/skills/*.md | \
  grep -oE '\b(curl|grep|jq|sed|awk|git)\b' | \
  sort | uniq -c | sort -rn
```

### 5. 🖥️ 遠端操作

透過 `ssh`，你可以用 CLI 操作任何一台遠端電腦，就像坐在它面前一樣。這對伺服器管理、雲端部署至關重要。

```bash
# 從你的筆電登入雲端伺服器，重啟 OpenClaw
ssh myserver "cd /app/openclaw && docker-compose restart"
```

---

## CLI 與 OpenClaw 的關係

現在你應該明白了：**OpenClaw 的 Agent 是透過 CLI 工具來「做事」的**。

整個流程是這樣的：

```
你的需求（自然語言）
     ↓
LLM 理解需求
     ↓
Agent 決定要用哪些工具
     ↓
生成 CLI 指令
     ↓
執行指令、取得結果
     ↓
LLM 分析結果、決定下一步
     ↓
重複直到完成
```

OpenClaw 的 Skill 本質也是 Markdown 檔案裡寫好的 CLI 指令模板。MCP 協定連接的外部工具，很多也是透過 CLI 介面互動的。

這就是為什麼 [macOS 和 Linux 是龍蝦最好的飼養環境](/articles/why-not-windows-openclaw)——它們的 CLI 生態最完整。Windows 用戶不用擔心，裝了 [WSL](/articles/windows-wsl-guide) 就能享受同樣的 CLI 環境。

---

## 新手該從哪裡開始？

不需要一次學完所有指令。建議的學習順序：

### 第一步：基本操作（10 分鐘就能上手）

```bash
# 看看你在哪
pwd

# 看看這裡有什麼
ls

# 進入某個資料夾
cd Documents

# 看某個檔案
cat README.md

# 回上一層
cd ..
```

### 第二步：搜尋（最常用）

```bash
# 在檔案裡找文字
grep "關鍵字" file.txt

# 在整個資料夾裡找
grep -r "關鍵字" ~/Documents/

# 找檔案
find ~/Documents -name "*.md"
```

### 第三步：管道組合

```bash
# 找出包含 "error" 的行，然後計算有幾行
grep "error" log.txt | wc -l

# 列出檔案，只看前 5 個
ls -lt | head -5
```

學會這三步，你就能應付 80% 的日常需求了。其餘的，等用到再查。

---

## 一句話總結

> **CLI 是用文字操作電腦的方式。它快速、可自動化、可組合——這正是 AI Agent 需要的。OpenClaw 的威力，建立在 CLI 生態之上。**

---

## 延伸閱讀

- 🪟 [為什麼不建議在 Windows 原生環境安裝 OpenClaw？](/articles/why-not-windows-openclaw) — 了解 CLI 生態差異的影響
- 🖥️ [WSL 安裝與使用完整教學](/articles/windows-wsl-guide) — Windows 用戶取得 CLI 環境
- 🤖 [OpenClaw Agent 完全指南](/articles/openclaw-agent) — 看看 Agent 怎麼使用 CLI 工具
- 🔌 [MCP 協定](/articles/mcp-protocol) — AI 的工具連接標準
