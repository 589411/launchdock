# 📸 快速參考卡

## 自動化工作流程（推薦）

```bash
./scripts/article-workflow.sh [article-slug]
```

**一鍵執行所有步驟：**
1. 選文章 → 2. 截圖 → 3. 遮蔽敏感資訊 → 4. AI 配對 → 5. 寫入文章 → 6. 複製圖片 → 7. 安全檢查 → 8. 提示發布

---

## 手動步驟（進階）

### 1. 檢查文章 @img 標記

```bash
./scripts/add-image.sh <slug> --scan
```

### 2. 為文章添加 @img 標記

```bash
./scripts/add-image.sh <slug> --retrofit
```

### 3. 截圖

**自動截圖（推薦）：**
```bash
auto-capture --article <slug>.md --window "App名稱"
```

**手動截圖：**
- 按 ⌘⇧4 截圖
- 存到 `~/Desktop/captures/<slug>/`

### 4. 檢查敏感資訊

```bash
cd launchdock
python3 check_sensitive_images.py           # 檢查
python3 check_sensitive_images.py --redact  # 遮蔽
```

### 5. AI 配對圖片

```bash
auto-capture match \
  --article src/content/articles/<slug>.md \
  --shots ~/Desktop/captures/<slug>/ \
  --provider claude \
  --apply
```

### 6. 複製圖片到 public

```bash
cp ~/Desktop/captures/<slug>/*.{png,gif} public/images/articles/<slug>/
```

### 7. 預覽

```bash
npm run dev
# http://localhost:4321/articles/<slug>
```

### 8. 提交

```bash
git add src/content/articles/<slug>.md
git add public/images/articles/<slug>/
git commit -m "feat: add screenshots to <slug>"
```

---

## 敏感資訊檢測涵蓋

✅ Email 地址  
✅ API Keys（OpenAI、Anthropic、Google、AWS、GitHub）  
✅ 主機名稱（如 `MacBook-Pro.local`）  
✅ 用戶名（如 `yen-tangchang`）  
✅ 用戶路徑（如 `/Users/yen-tangchang/...`）  
✅ 信用卡號  
✅ Generic tokens/secrets  

---

## 常用指令

```bash
# 列出所有文章
ls src/content/articles/*.md

# 檢查圖片狀態
./scripts/add-image.sh <slug> --scan

# 驗證圖片連結
./scripts/add-image.sh <slug> --validate

# MCP 工具（在 Copilot Chat 中）
@workspace check_image_sensitive_info
@workspace redact_images
```

---

## 檔案位置

```
src/content/articles/<slug>.md          ← 文章 Markdown
public/images/articles/<slug>/          ← 發布的圖片
~/Desktop/captures/<slug>/              ← 截圖暫存
docs/article-workflow-guide.md          ← 完整文檔
scripts/article-workflow.sh             ← 自動化腳本
scripts/add-image.sh                    ← 圖片處理工具
check_sensitive_images.py               ← 敏感資訊檢測
```

---

## 故障排除

### auto-capture 找不到

```bash
cd ~/Documents/github/auto-capture
pip install -e .
```

### Vision AI 配對失敗

確認環境變數：
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="..."
export OPENAI_API_KEY="sk-..."
```

### 權限問題

```bash
chmod +x scripts/*.sh
```

---

**詳細文檔：** `docs/article-workflow-guide.md`  
**Last updated:** 2026-03-04
