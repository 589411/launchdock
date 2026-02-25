# OpenClaw 新手安裝系列 - 完整安裝流程指南

> **目標讀者**：完全沒有經驗的新手  
> **預估總時間**：45-90 分鐘（依網路速度和熟悉程度）  
> **最後更新**：2025 年 6 月

---

## 目錄
1. [安裝前準備工作](#一安裝前準備工作)
2. [詳細安裝步驟](#二詳細安裝步驟)
3. [安裝後測試清單](#三安裝完成後測試清單)
4. [所需工具和資源](#四所需工具和資源列表)
5. [常見問題快速排解](#五常見問題快速排解)

---

## 一、安裝前準備工作

### 1.1 硬體需求檢查清單

| 項目 | 最低需求 | 建議配置 | 說明 |
|------|---------|---------|------|
| **RAM** | 4 GB | 8 GB+ | 影響回應速度 |
| **儲存空間** | 2 GB | 5 GB+ | 含日誌和快取 |
| **網路** | 穩定連線 | 寬頻網路 | API 呼叫需要 |
| **作業系統** | 見下方支援列表 | - | - |

### 1.2 作業系統支援

| 作業系統 | 支援狀態 | 安裝難度 | 備註 |
|---------|---------|---------|------|
| **macOS** | ✅ 完全支援 | 簡單 | 最佳體驗，原生整合 |
| **Linux (Ubuntu)** | ✅ 完全支援 | 簡單 | 推薦用於伺服器部署 |
| **Windows (WSL)** | ✅ 支援 | 中等 | 需先安裝 WSL2 |
| **Windows (原生)** | ⚠️ 有限支援 | 困難 | 建議使用 WSL |

### 1.3 必備帳號準備

在開始安裝前，請先準備以下帳號（**至少選一種 LLM 服務**）：

#### 選項 A：Anthropic Claude API（推薦）
- [ ] 註冊 Anthropic 帳號：https://console.anthropic.com
- [ ] 取得 API Key（註冊後免費額度 $5）
- [ ] 綁定付款方式（如需更多額度）

#### 選項 B：OpenAI API
- [ ] 註冊 OpenAI 帳號：https://platform.openai.com
- [ ] 取得 API Key
- [ ] 綁定付款方式

#### 選項 C：OpenRouter（統一介面）
- [ ] 註冊 OpenRouter 帳號：https://openrouter.ai
- [ ] 取得 API Key
- [ ] 充值點數

#### 選項 D：Google Gemini API
- [ ] 註冊 Google AI Studio：https://aistudio.google.com
- [ ] 取得 API Key（免費額度較高）

### 1.4 訊息平台選擇（擇一）

| 平台 | 難度 | 費用 | 適合場景 |
|-----|------|------|---------|
| **Telegram** | ⭐ 最簡單 | 免費 | 新手首選 |
| **WhatsApp** | ⭐⭐ 中等 | 免費 | 常用 WhatsApp 者 |
| **Discord** | ⭐⭐ 中等 | 免費 | 社群管理 |

---

## 二、詳細安裝步驟

### 步驟 0：前置檢查（所有系統通用）

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 5 分鐘 |
| **難度等級** | ⭐ 簡單 |

#### 操作說明

1. **確認網路連線正常**
   ```bash
   # 在終端機/命令提示字元輸入：
   ping google.com
   ```
   ✅ 應看到回應時間（如 `time=20ms`）

2. **確認系統版本**
   - **macOS**：點選左上角蘋果 → 關於這台 Mac
   - **Windows**：設定 → 系統 → 關於
   - **Linux**：`lsb_release -a`

#### 驗證方法
- [ ] 能正常開啟瀏覽器訪問網站
- [ ] 知道目前使用的作業系統版本

#### 常見錯誤
| 錯誤 | 解決方案 |
|-----|---------|
| 無法連線網路 | 檢查 Wi-Fi/網路線，重啟路由器 |

---

### 步驟 1：安裝 Node.js（執行環境）

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 10-15 分鐘 |
| **難度等級** | ⭐⭐ 中等 |

#### 操作說明 - macOS

1. **開啟終端機**
   - 按 `Cmd + 空白鍵` 開啟 Spotlight
   - 輸入 `Terminal` 並開啟

2. **安裝 Homebrew（套件管理器）**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   - 依照提示輸入密碼
   - 等待安裝完成（約 5-10 分鐘）

3. **安裝 Node.js**
   ```bash
   brew install node@22
   ```

4. **驗證安裝**
   ```bash
   node --version
   ```

#### 操作說明 - Linux (Ubuntu/Debian)

1. **開啟終端機**
   - 按 `Ctrl + Alt + T`

2. **安裝 Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **驗證安裝**
   ```bash
   node --version
   ```

#### 操作說明 - Windows（使用 WSL2 - 推薦）

1. **以系統管理員身分開啟 PowerShell**
   - 右鍵點選 PowerShell → 以系統管理員身分執行

2. **安裝 WSL2**
   ```powershell
   wsl --install
   ```
   - 安裝完成後**重新啟動電腦**

3. **設定 Ubuntu**
   - 重啟後，Ubuntu 會自動開啟
   - 設定使用者名稱和密碼

4. **在 Ubuntu 中安裝 Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

#### 驗證方法
```bash
node --version
npm --version
```
✅ 應顯示版本號：
- Node.js: v22.x.x 或更高
- npm: 10.x.x 或更高

#### 常見錯誤與解決方案

| 錯誤訊息 | 原因 | 解決方案 |
|---------|------|---------|
| `command not found: node` | 安裝未完成或路徑未設定 | 重新安裝，或執行 `exec bash` 重新載入 |
| `EACCES: permission denied` | 權限不足 | 在命令前加 `sudo` |
| `brew: command not found` | Homebrew 未安裝 | 重新執行 Homebrew 安裝指令 |
| WSL 安裝卡住 | 虛擬化未啟用 | 在 BIOS 啟用 Intel VT-x/AMD-V |

---

### 步驟 2：安裝 OpenClaw

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 5-10 分鐘 |
| **難度等級** | ⭐ 簡單 |

#### 操作說明 - macOS / Linux

1. **在終端機執行安裝指令**
   ```bash
   curl -fsSL https://openclaw.ai/install.sh | bash
   ```
   或透過 npm：
   ```bash
   npm install -g openclaw@latest
   ```

2. **重新載入終端機環境**
   ```bash
   exec bash
   ```

#### 操作說明 - Windows (PowerShell)

1. **開啟 PowerShell**

2. **執行安裝指令**
   ```powershell
   iwr -useb https://openclaw.ai/install.ps1 | iex
   ```

#### 驗證方法
```bash
openclaw --version
```
✅ 應顯示版本號，如 `openclaw v1.x.x`

#### 常見錯誤與解決方案

| 錯誤訊息 | 原因 | 解決方案 |
|---------|------|---------|
| `command not found: openclaw` | 全域安裝路徑問題 | 執行 `exec bash` 或重新開啟終端機 |
| `EACCES` 權限錯誤 | npm 權限問題 | 使用 `sudo` 或修復 npm 權限 |
| 安裝卡住 | 網路問題 | 檢查網路，或改用 npm 安裝 |

---

### 步驟 3：執行設定精靈

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 10-15 分鐘 |
| **難度等級** | ⭐⭐ 中等 |

#### 操作說明

1. **啟動設定精靈**
   ```bash
   openclaw onboard --install-daemon
   ```

2. **閱讀安全警告**
   - 使用方向鍵選擇 "Yes"
   - 按 Enter 確認「我了解這是強大且有風險的工具」

3. **選擇安裝模式**
   - 選擇 **"QuickStart"**（新手推薦）
   - 這會使用安全的預設設定

4. **選擇 LLM 供應商**
   - 使用方向鍵選擇你準備好的 API
   - 推薦順序：Anthropic → Gemini → OpenRouter

5. **輸入 API Key**
   - 複製你的 API Key（從供應商網站）
   - 貼上到終端機（貼上時可能不顯示，這是正常的）
   - 按 Enter

6. **選擇模型**
   - 推薦新手選擇：
     - **Anthropic**: `claude-sonnet-4.5`（平衡）
     - **Gemini**: `gemini-flash`（經濟）
   - 避免一開始就選最強大的模型（費用較高）

#### 驗證方法
- [ ] 精靈顯示 "Configuration saved successfully"
- [ ] 沒有出現紅色的錯誤訊息

#### 常見錯誤與解決方案

| 錯誤訊息 | 原因 | 解決方案 |
|---------|------|---------|
| `Invalid API key` | API Key 錯誤或過期 | 重新複製正確的 API Key |
| `API key not found` | 未輸入 API Key | 重新執行精靈 |
| `Connection timeout` | 網路連線問題 | 檢查網路，重試 |

---

### 步驟 4：設定訊息平台（以 Telegram 為例）

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 10 分鐘 |
| **難度等級** | ⭐⭐ 中等 |

#### 操作說明

1. **在精靈中選擇 Telegram**
   - 使用方向鍵選擇 "Telegram"
   - 按 Enter

2. **開啟 Telegram 應用程式**
   - 手機或電腦版都可以

3. **搜尋 @BotFather**
   - 在搜尋框輸入 `@BotFather`
   - 點擊開始對話

4. **建立新機器人**
   - 發送指令： `/newbot`
   - 輸入機器人名稱（如：MyOpenClawBot）
   - 輸入機器人使用者名稱（必須以 `bot` 結尾，如：myclaw_bot）

5. **複製 API Token**
   - BotFather 會回覆一個 token，格式如：`123456789:ABCdefGHIjklMNOpqrSTUvwxyz`
   - **複製這個 token**（點擊即可複製）

6. **貼上 Token 到精靈**
   - 回到終端機
   - 貼上 token
   - 按 Enter

7. **配對確認**
   - 在 Telegram 中對你的機器人發送任意訊息
   - 精靈會顯示一組配對碼
   - 在 Telegram 中確認配對

#### 驗證方法

1. **測試機器人回應**
   - 在 Telegram 對你的機器人發送：`Hello`
   - 等待 5-10 秒

2. **確認回應**
   - ✅ 機器人應回覆問候訊息
   - ✅ 表示連線成功

#### 常見錯誤與解決方案

| 錯誤訊息 | 原因 | 解決方案 |
|---------|------|---------|
| `Invalid token` | Token 複製不完整 | 重新向 BotFather 取得 token |
| `Bot not responding` | Gateway 未啟動 | 執行 `openclaw gateway restart` |
| `Access not configured` | 未配對 | 執行 `openclaw pairing approve telegram <CODE>` |
| `Bot is already in use` | Token 被其他服務使用 | 建立新的機器人 |

---

### 步驟 5：啟動 Gateway（閘道服務）

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 3-5 分鐘 |
| **難度等級** | ⭐ 簡單 |

#### 操作說明

1. **啟動 Gateway**
   ```bash
   openclaw gateway start
   ```
   或使用詳細模式查看日誌：
   ```bash
   openclaw gateway --verbose
   ```

2. **確認啟動訊息**
   - 應看到 "Gateway started on port 18789"
   - 或 "Daemon started successfully"

#### 驗證方法

**方法 A：檢查狀態**
```bash
openclaw gateway status
```
✅ 應顯示 "running"

**方法 B：測試 Web 介面**
1. 開啟瀏覽器
2. 訪問：http://localhost:18789
3. ✅ 應看到 OpenClaw 控制面板

**方法 C：測試 Telegram 機器人**
- 發送訊息給機器人
- ✅ 應收到回應

#### 常見錯誤與解決方案

| 錯誤訊息 | 原因 | 解決方案 |
|---------|------|---------|
| `Port 18789 already in use` | 端口被占用 | 執行 `sudo lsof -i :18789` 找出並關閉 |
| `Gateway failed to start` | 設定錯誤 | 執行 `openclaw doctor` 診斷 |
| `Permission denied` | 權限不足 | 使用 `sudo` 或檢查檔案權限 |

---

### 步驟 6：設定工作目錄與記憶檔案

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 5 分鐘 |
| **難度等級** | ⭐ 簡單 |

#### 操作說明

1. **找到工作目錄**
   - 預設位置：`~/.openclaw/workspace/`
   - 或精靈設定的位置

2. **了解重要檔案**
   ```
   workspace/
   ├── SOUL.md          # 機器人個性設定
   ├── USER.md          # 你的個人資訊
   ├── MEMORY.md        # 長期記憶
   ├── NOTES.md         # 筆記
   ├── HABITS.md        # 習慣追蹤
   └── PROJECTS.md      # 專案管理
   ```

3. **編輯 USER.md（推薦）**
   ```bash
   # 使用你喜歡的文字編輯器
   nano ~/.openclaw/workspace/USER.md
   # 或
   code ~/.openclaw/workspace/USER.md  # VS Code
   ```
   
   加入基本資訊：
   ```markdown
   # 使用者資訊
   - 名稱：你的名字
   - 時區：Asia/Taipei
   - 語言：繁體中文
   - 職業：你的職業
   ```

#### 驗證方法
- [ ] 能開啟並編輯工作目錄中的檔案
- [ ] 儲存後檔案內容正確

---

### 步驟 7：安全性設定（重要！）

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 5 分鐘 |
| **難度等級** | ⭐⭐ 中等 |

#### 操作說明

1. **編輯設定檔**
   ```bash
   nano ~/.openclaw/openclaw.json
   ```

2. **修改 Gateway 綁定設定**
   ```json
   {
     "gateway": {
       "host": "127.0.0.1",
       "port": 18789,
       "auth_token": "你的強密碼"
     }
   }
   ```
   - 將 `host` 從 `0.0.0.0` 改為 `127.0.0.1`（僅本地訪問）
   - 設定強密碼作為 `auth_token`

3. **啟用執行確認模式**
   ```json
   {
     "exec_approval": true
   }
   ```
   這會在執行危險指令前要求確認

4. **設定 Allowlist（Telegram）**
   ```json
   {
     "telegram": {
       "allowlist": ["你的 Telegram 使用者名稱"]
     }
   }
   ```

5. **重啟 Gateway**
   ```bash
   openclaw gateway restart
   ```

#### 驗證方法
- [ ] 從其他設備無法直接訪問 `http://你的IP:18789`
- [ ] 訪問 `http://localhost:18789` 需要輸入 token

#### 常見錯誤與解決方案

| 錯誤訊息 | 原因 | 解決方案 |
|---------|------|---------|
| `JSON parse error` | 設定檔格式錯誤 | 檢查逗號和括號 |
| `Config not loaded` | 設定檔路徑錯誤 | 確認檔案位置正確 |

---

### 步驟 8：安裝 Shell 自動完成（可選但推薦）

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 2 分鐘 |
| **難度等級** | ⭐ 簡單 |

#### 操作說明

1. **在精靈中選擇啟用**
   - 當問到 "Enable bash shell completion?" 時選擇 "Yes"

2. **或手動啟用**
   ```bash
   openclaw completion bash >> ~/.bashrc
   exec bash
   ```

#### 驗證方法
- [ ] 輸入 `openclaw ` 後按 Tab，應顯示可用指令

---

### 步驟 9：設定自動啟動（可選）

| 屬性 | 內容 |
|-----|------|
| **預估時間** | 3 分鐘 |
| **難度等級** | ⭐⭐ 中等 |

#### 操作說明 - macOS

1. **建立 LaunchAgent**
   ```bash
   nano ~/Library/LaunchAgents/com.openclaw.gateway.plist
   ```

2. **加入以下內容**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
   <plist version="1.0">
   <dict>
     <key>Label</key>
     <string>com.openclaw.gateway</string>
     <key>ProgramArguments</key>
     <array>
       <string>/usr/local/bin/openclaw</string>
       <string>gateway</string>
       <string>start</string>
     </array>
     <key>RunAtLoad</key>
     <true/>
     <key>KeepAlive</key>
     <true/>
   </dict>
   </plist>
   ```

3. **載入服務**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.openclaw.gateway.plist
   ```

#### 操作說明 - Linux

如果使用 `--install-daemon`，已自動設定 systemd 服務：
```bash
# 檢查服務狀態
sudo systemctl status openclaw

# 啟用開機自動啟動
sudo systemctl enable openclaw
```

#### 驗證方法
- [ ] 重啟電腦後，執行 `openclaw gateway status` 顯示 "running"

---

## 三、安裝完成後測試清單

### 3.1 基本功能測試

| 測試項目 | 操作 | 預期結果 |
|---------|------|---------|
| **Gateway 運行** | `openclaw gateway status` | 顯示 "running" |
| **Web 介面** | 訪問 http://localhost:18789 | 看到控制面板 |
| **Telegram 回應** | 發送 "Hello" | 收到問候回覆 |
| **記憶功能** | 說 "我叫小明"，然後問 "我叫什麼" | 正確回答 "小明" |
| **網路搜尋** | 問 "今天天氣如何" | 嘗試搜尋並回覆 |

### 3.2 指令測試

```bash
# 檢查整體健康狀態
openclaw doctor

# 查看日誌
openclaw logs --follow

# 檢查設定
openclaw config show

# 查看工具列表
openclaw tools list
```

### 3.3 進階功能測試（可選）

| 測試項目 | 指令/操作 | 預期結果 |
|---------|----------|---------|
| **檔案讀取** | "讀取我的 NOTES.md" | 顯示檔案內容 |
| **瀏覽器控制** | "搜尋 OpenClaw 教學" | 開啟瀏覽器搜尋 |
| **定時任務** | 設定每日提醒 | 在指定時間收到通知 |

---

## 四、所需工具和資源列表

### 4.1 必要工具

| 工具 | 用途 | 下載連結 |
|-----|------|---------|
| **終端機/命令列** | 執行安裝指令 | 系統內建 |
| **Node.js 22+** | 執行環境 | https://nodejs.org |
| **文字編輯器** | 編輯設定檔 | VS Code、Sublime、nano |

### 4.2 推薦工具

| 工具 | 用途 | 下載連結 |
|-----|------|---------|
| **VS Code** | 編輯設定檔 | https://code.visualstudio.com |
| **Telegram** | 訊息平台 | https://telegram.org |
| **Tailscale** | 安全遠端訪問 | https://tailscale.com |

### 4.3 API 服務

| 服務 | 用途 | 註冊連結 |
|-----|------|---------|
| **Anthropic Claude** | LLM API | https://console.anthropic.com |
| **OpenAI** | GPT API | https://platform.openai.com |
| **Google Gemini** | Gemini API | https://aistudio.google.com |
| **OpenRouter** | 統一 API | https://openrouter.ai |

### 4.4 學習資源

| 資源 | 說明 | 連結 |
|-----|------|------|
| **官方文件** | 完整文件 | https://openclaw.ai/docs |
| **GitHub** | 原始碼 | https://github.com/openclaw/openclaw |
| **Discord 社群** | 使用者討論 | 官方 Discord |

---

## 五、常見問題快速排解

### 5.1 安裝問題

| 問題 | 快速解決 |
|-----|---------|
| 安裝指令無法執行 | 檢查網路，或改用 `npm install -g openclaw` |
| Node.js 版本過舊 | 升級到 v22+：`npm install -g n && n 22` |
| 權限錯誤 | 使用 `sudo` 或修復 npm 權限 |

### 5.2 運行問題

| 問題 | 快速解決 |
|-----|---------|
| Gateway 無法啟動 | `openclaw doctor` → 依照建議修復 |
| API 錯誤 | 檢查 API Key 是否有效、有餘額 |
| Telegram 無回應 | 確認 token 正確，Gateway 運行中 |
| 回應很慢 | 檢查網路，或換用較輕量模型 |

### 5.3 安全問題

| 問題 | 快速解決 |
|-----|---------|
| Gateway 暴露在外網 | 修改 `host` 為 `127.0.0.1` |
| 忘記 auth token | 編輯 `~/.openclaw/openclaw.json` 重設 |
| 收到陌生人的訊息 | 設定 Telegram allowlist |

### 5.4 實用指令速查

```bash
# 診斷問題
openclaw doctor

# 查看日誌
openclaw logs --follow

# 重啟 Gateway
openclaw gateway restart

# 停止 Gateway
openclaw gateway stop

# 查看狀態
openclaw status

# 更新 OpenClaw
npm update -g openclaw
```

---

## 六、作業系統差異對照表

| 項目 | macOS | Linux | Windows (WSL) |
|-----|-------|-------|---------------|
| **安裝指令** | `curl ... \| bash` | `curl ... \| bash` | `iwr ... \| iex` |
| **套件管理** | Homebrew | apt/yum | apt (在 WSL) |
| **自動啟動** | launchd | systemd | systemd |
| **設定檔位置** | `~/.openclaw/` | `~/.openclaw/` | `~/.openclaw/` |
| **終端機** | Terminal | Terminal | PowerShell → WSL |
| **最佳用途** | 個人使用 | 伺服器部署 | 開發測試 |

---

## 七、下一步建議

完成安裝後，建議依序進行：

1. **閱讀 SOUL.md** - 了解如何自訂機器人個性
2. **編輯 USER.md** - 讓機器人更了解你
3. **嘗試基本對話** - 熟悉互動方式
4. **探索進階功能** - 瀏覽器控制、定時任務等
5. **加入社群** - Discord 或論壇尋求協助

---

*文件版本：v1.0*  
*適用 OpenClaw 版本：1.x*  
*最後更新：2025 年 6 月*
