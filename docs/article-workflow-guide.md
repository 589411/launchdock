# 文章截圖自動化工作流程

> 從選定文章到上架，一鍵完成所有截圖處理步驟

---

## 🚀 快速開始

```bash
# 互動模式（推薦）
./scripts/article-workflow.sh

# 直接指定文章
./scripts/article-workflow.sh ollama-openclaw
```

---

## 📋 完整流程

此腳本自動化執行以下所有步驟：

### Step 0: 檢查依賴
- ✅ 檢查 `auto-capture` 是否已安裝
- ✅ 檢查 Python 3 是否可用

### Step 1: 選定文章
- 📄 互動式列表選擇文章
- 📊 自動檢查文章中的 `@img` 標記數量
- ⚠️  若無標記，提示先執行 `--retrofit` 模式

### Step 2: 創建截圖資料夾
- 📁 自動在 `~/Desktop/captures/<slug>/` 創建目錄
- 🎯 所有截圖集中存放，方便管理

### Step 3: 啟動截圖
兩種模式：

#### 模式 1：自動截圖（推薦）
- 🖱 監聽滑鼠點擊，自動截取視窗
- 🎨 自動添加標註框（紅框或圓圈）
- 📐 自動生成縮放 GIF 動畫
- 🔒 可選：截圖時自動遮蔽敏感資訊

```bash
# 流程會詢問：
# - 視窗名稱（如 "Chrome", "Terminal", "OpenClaw"）
# - 完成後按 Ctrl+C 結束
```

#### 模式 2：手動截圖
- 📸 使用 Mac 內建截圖（⌘⇧4）
- 💾 手動將圖片放到 `~/Desktop/captures/<slug>/`
- ⏭️  跳過自動截圖步驟

### Step 4: 檢查機敏資訊
- 🔍 自動掃描所有截圖中的敏感資訊：
  - Email 地址
  - API Keys
  - 主機名稱
  - 用戶名
  - 用戶路徑（/Users/xxx/...）
  - 信用卡號
- 🔒 發現敏感資訊時詢問是否自動遮蔽（馬賽克）

### Step 5-6: Vision AI 辨識與配對
- 🤖 選擇 AI 供應商：
  1. **Claude** — 品質最好（推薦）
  2. **Gemini** — 快速、成本低
  3. **OpenAI** — 視覺理解強
- 🎯 自動配對截圖到文章中的 `@img` 標記
- ✍️  自動將圖片語法寫回 Markdown

### Step 7: 複製到 public/images
- 📋 複製所有 PNG 和 GIF 到 `public/images/articles/<slug>/`
- 📊 顯示複製的檔案數量

### Step 8: 上架前最終檢查
- 🔐 再次掃描 `public/images` 中的所有圖片
- ⚠️  確保沒有敏感資訊漏網
- ✅ 通過檢查才能上架

### Step 9: 完成提示
- 📊 顯示工作摘要
- 🎯 提供下一步操作指引：
  - 預覽文章
  - 提交到 Git

---

## 🎯 使用場景

### 場景 A：全新文章首次截圖

```bash
# 1. 執行工作流程
./scripts/article-workflow.sh my-new-article

# 2. 選擇自動截圖模式
# 3. 輸入視窗名稱（如 "Chrome"）
# 4. 按照文章步驟操作，每個動作自動截圖
# 5. 完成後 Ctrl+C 結束
# 6. 自動配對、寫入文章、複製圖片
# 7. 預覽確認
```

### 場景 B：已有手動截圖，需要配對

```bash
# 1. 手動截圖放到 ~/Desktop/captures/my-article/
# 2. 執行工作流程
./scripts/article-workflow.sh my-article

# 3. 選擇「手動截圖」模式
# 4. 自動檢查敏感資訊
# 5. 自動 AI 配對
# 6. 完成
```

### 場景 C：僅單獨執行某個步驟

如果只需要單獨執行某個步驟，可使用原有工具：

```bash
# 只檢查敏感資訊
python3 check_sensitive_images.py

# 只配對圖片
auto-capture match -a article.md -s ./captures/ --provider claude --apply

# 只處理圖片（不配對）
./scripts/add-image.sh article-slug ~/Desktop/*.png
```

---

## ⚙️ 設定

### 自訂截圖路徑

編輯 `scripts/article-workflow.sh`：

```bash
CAPTURES_BASE="$HOME/Desktop/captures"  # 改成你想要的路徑
```

### 自訂 AI 供應商

在腳本中可選擇：
- Claude（需要 `ANTHROPIC_API_KEY`）
- Gemini（需要 `GEMINI_API_KEY`）
- OpenAI（需要 `OPENAI_API_KEY`）

設定環境變數：

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="..."
export OPENAI_API_KEY="sk-..."
```

### 停用敏感資訊檢測

如果確定不需要檢查敏感資訊，可以在步驟 4 時選擇跳過。

---

## 🔧 故障排除

### 找不到 auto-capture

```bash
cd ~/Documents/github/auto-capture
pip install -e .
```

### 截圖數量為 0

- 確認視窗名稱正確（可用 `ps aux | grep <app>` 查看）
- 確認有實際點擊操作
- 改用手動截圖模式

### AI 配對失敗

- 檢查 API Key 是否設定
- 檢查網路連線
- 嘗試更換供應商

### 圖片仍有敏感資訊

- 手動檢查 `public/images/articles/<slug>/` 中的圖片
- 用 `python3 check_sensitive_images.py --redact` 批次處理
- 或手動編輯圖片

---

## 📊 工作流程對比

### 傳統流程（手動）

```
1. 手動截圖             ⏱️  20 分鐘
2. 手動命名和整理        ⏱️  10 分鐘
3. 手動檢查敏感資訊      ⏱️  5 分鐘
4. 手動配對到文章        ⏱️  15 分鐘
5. 手動調整 Markdown     ⏱️  10 分鐘
6. 手動複製圖片          ⏱️  5 分鐘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
總計                    ⏱️  65 分鐘
```

### 自動化流程（本腳本）

```
1. 執行 article-workflow.sh           ⏱️  1 分鐘
2. 按照文章步驟操作（自動截圖）        ⏱️  15 分鐘
3. 等待 AI 配對                      ⏱️  2 分鐘
4. 預覽確認                          ⏱️  2 分鐘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
總計                                ⏱️  20 分鐘
```

**節省時間：約 70%** 🎉

---

## 🎓 延伸閱讀

- [圖片工作流程完整指引](./image-workflow.md)
- [auto-capture 文檔](../../auto-capture/README.md)
- [@img 標記規範](./llm-article-prompt.md)

---

**Last updated:** 2026-03-04
