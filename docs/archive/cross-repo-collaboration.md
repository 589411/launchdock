# 跨 Repo 協作最佳實踐

## 問題分析

### 當前挑戰
1. **環境隔離**：auto-capture 有獨立 venv，launchdock 可能有另一個
2. **路徑依賴**：auto-capture 工具要寫入 launchdock 的目錄
3. **執行上下文**：不確定在哪個 repo 執行命令
4. **依賴衝突**：兩個 venv 可能有版本衝突

### 風險
- ❌ 在錯誤的 venv 中執行工具
- ❌ 路徑錯誤導致文件寫到錯誤位置
- ❌ 環境變數不一致
- ❌ 依賴版本衝突

---

## 專業解決方案

### 1️⃣ 使用 VS Code Multi-Root Workspace（已完成 ✅）

**優點**：
- 單一 VS Code 窗口管理兩個 repo
- 共享設定和擴充功能
- 明確的 repo 邊界

**配置**：`auto-capture.code-workspace`

```json
{
  "folders": [
    {
      "name": "auto-capture",
      "path": "."
    },
    {
      "name": "launchdock",
      "path": "../launchdock"
    }
  ],
  "settings": {
    "github.copilot.chat.mcp.enabled": true
  }
}
```

### 2️⃣ 明確 Repo 職責分工

| Repo | 職責 | 不做什麼 |
|------|------|---------|
| **auto-capture** | ✅ 提供 CLI 工具<br>✅ 提供 MCP server<br>✅ 處理截圖邏輯<br>✅ Vision AI 配對 | ❌ 不知道 launchdock 結構<br>❌ 不直接修改 launchdock 文件 |
| **launchdock** | ✅ 定義文章結構<br>✅ 管理圖片位置<br>✅ 提供 wrapper 腳本<br>✅ 呼叫 auto-capture 工具 | ❌ 不實作截圖邏輯<br>❌ 不實作 Vision AI |

### 3️⃣ 使用 Wrapper Scripts（已實作 ✅）

**設計模式**：Facade Pattern

launchdock 的腳本作為「門面」，內部處理：
- 環境準備
- 路徑轉換
- 呼叫 auto-capture
- 結果處理

```bash
# launchdock/scripts/article-workflow.sh

# ✅ 明確設定 auto-capture 路徑
AUTO_CAPTURE_PATH="$HOME/Documents/github/auto-capture"

# ✅ 使用絕對路徑
ARTICLE_PATH="${PWD}/src/content/articles/${SLUG}.md"
CAPTURES_DIR="${HOME}/Desktop/captures/${SLUG}"
PUBLIC_DIR="${PWD}/public/images/articles/${SLUG}"

# ✅ 呼叫 auto-capture（會自動使用正確的 venv）
auto-capture match \
  --article "$ARTICLE_PATH" \
  --shots "$CAPTURES_DIR" \
  --provider "$PROVIDER" \
  --apply
```

### 4️⃣ 環境變數規範

創建 `.env.template` 在兩個 repo 中：

```bash
# auto-capture/.env.template
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
AUTO_CAPTURE_LOG_DIR=~/.auto-capture-logs
```

```bash
# launchdock/.env.template
AUTO_CAPTURE_PATH=~/Documents/github/auto-capture
CAPTURES_BASE=~/Desktop/captures
PUBLIC_IMAGES_DIR=./public/images/articles
```

### 5️⃣ 路徑解析策略

#### 原則：永遠使用絕對路徑

```bash
# ❌ 錯誤：相對路徑
./scripts/add-image.sh article-slug ../captures/*.png

# ✅ 正確：絕對路徑
./scripts/add-image.sh article-slug ~/Desktop/captures/article-slug/*.png
```

#### 實作：Path Resolution Helper

```bash
# launchdock/scripts/lib/paths.sh

resolve_article_path() {
  local slug=$1
  echo "${PWD}/src/content/articles/${slug}.md"
}

resolve_captures_dir() {
  local slug=$1
  echo "${HOME}/Desktop/captures/${slug}"
}

resolve_public_dir() {
  local slug=$1
  echo "${PWD}/public/images/articles/${slug}"
}
```

### 6️⃣ 依賴管理策略

#### Option A：auto-capture 作為系統工具（推薦 ✅）

```bash
# 安裝為全域 CLI
cd ~/Documents/github/auto-capture
pip install -e .

# 從任何地方都能執行
auto-capture --version
```

**優點**：
- ✅ 從任何 repo 都能使用
- ✅ 不用管 venv 切換
- ✅ 路徑明確

**缺點**：
- ⚠️ 需要全域安裝依賴

#### Option B：明確啟動 auto-capture venv（備案）

```bash
# launchdock/scripts/article-workflow.sh

AUTO_CAPTURE_VENV="$AUTO_CAPTURE_PATH/.venv/bin/activate"

if [ -f "$AUTO_CAPTURE_VENV" ]; then
  source "$AUTO_CAPTURE_VENV"
fi

python3 "$AUTO_CAPTURE_PATH/mcp_server.py" ...
```

**優點**：
- ✅ 依賴隔離
- ✅ 可控的環境

**缺點**：
- ⚠️ 腳本複雜度增加
- ⚠️ 需要記得啟動 venv

### 7️⃣ Git 管理策略

#### .gitignore 規範

```bash
# auto-capture/.gitignore
.venv/
*.pyc
__pycache__/
captures/      # 暫存截圖不入版控
*.egg-info/

# launchdock/.gitignore
node_modules/
dist/
.astro/
# ⚠️ public/images/articles/ 要入版控（實際圖片）
```

#### Git Submodule（進階選項，不推薦此 case）

如果 launchdock 需要「鎖定」特定版本的 auto-capture：

```bash
cd launchdock
git submodule add ../auto-capture tools/auto-capture
```

**不推薦的原因**：
- auto-capture 是獨立工具，不應綁定
- 增加複雜度
- 更新麻煩

### 8️⃣ 測試與驗證

#### Pre-flight Check Script

```bash
# launchdock/scripts/preflight-check.sh

check_auto_capture() {
  if ! command -v auto-capture &> /dev/null; then
    echo "❌ auto-capture 未安裝"
    echo "請執行: cd $AUTO_CAPTURE_PATH && pip install -e ."
    return 1
  fi
  echo "✅ auto-capture 可用"
}

check_paths() {
  local article_path="$1"
  if [ ! -f "$article_path" ]; then
    echo "❌ 找不到文章: $article_path"
    return 1
  fi
  echo "✅ 文章路徑正確"
}

check_env_vars() {
  if [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  警告：未設定 AI API Key"
  fi
  echo "✅ 環境變數檢查完成"
}
```

#### Integration Test

```bash
# test/integration/test-cross-repo.sh

test_auto_capture_from_launchdock() {
  cd /path/to/launchdock
  
  # 測試能否呼叫 auto-capture
  auto-capture --version || exit 1
  
  # 測試能否處理 launchdock 的文章
  auto-capture match \
    --article "$(pwd)/src/content/articles/test.md" \
    --shots "$(pwd)/test/fixtures/screenshots" \
    --provider claude \
    --dry-run
}
```

### 9️⃣ 文檔約定

#### README.md 明確說明

```markdown
# launchdock/README.md

## 依賴的外部工具

### auto-capture
- **Repo**: `~/Documents/github/auto-capture`
- **安裝**: `cd ~/Documents/github/auto-capture && pip install -e .`
- **用途**: 截圖、Vision AI 配對
- **版本要求**: >= 0.2.0

## 使用流程
1. 確保 auto-capture 已安裝
2. 執行 `./scripts/article-workflow.sh`
3. 工作流程會自動處理跨 repo 的路徑
```

---

## 🎯 推薦架構（已實作）

```
~/Documents/github/
├── auto-capture/              # Repo 1: 工具庫
│   ├── .venv/                 # 獨立 venv
│   ├── auto_capture/          # Python package
│   ├── mcp_server.py          # MCP server
│   └── pyproject.toml         # pip install -e . 讓全域可用
│
└── launchdock/                # Repo 2: 網站專案
    ├── scripts/
    │   ├── article-workflow.sh        # 主工作流程（呼叫 auto-capture）
    │   ├── add-image.sh               # 圖片處理（呼叫 auto-capture）
    │   └── lib/paths.sh               # 路徑解析 helper
    ├── src/content/articles/          # 文章（auto-capture 寫入）
    ├── public/images/articles/        # 圖片（auto-capture 產生）
    └── check_sensitive_images.py      # 使用 auto-capture library
```

### 關鍵決策：

1. ✅ **auto-capture 作為全域 CLI**
   - `pip install -e .` 安裝到系統
   - launchdock 直接呼叫 `auto-capture` 指令
   - 不需要管 venv 切換

2. ✅ **launchdock 使用 wrapper scripts**
   - 所有路徑轉換在 launchdock 內部處理
   - auto-capture 只收到絕對路徑

3. ✅ **明確的 interface**
   - auto-capture 提供 CLI + MCP
   - launchdock 消費這些 interface
   - 清楚的輸入輸出約定

4. ✅ **Multi-root workspace**
   - 統一的開發環境
   - 共享 MCP 設定
   - 清楚的邊界

---

## 🚨 常見錯誤避免

### ❌ 錯誤 1：在錯誤的 repo 執行命令

```bash
# 在 auto-capture repo 執行了 launchdock 的腳本
cd ~/Documents/github/auto-capture
./scripts/article-workflow.sh   # ❌ 找不到！
```

**解決**：使用絕對路徑或明確 cd

```bash
cd ~/Documents/github/launchdock && ./scripts/article-workflow.sh
```

### ❌ 錯誤 2：venv 混亂

```bash
# 在 launchdock 中啟動了 auto-capture 的 venv
cd ~/Documents/github/launchdock
source ../auto-capture/.venv/bin/activate
npm run dev   # ❌ 可能有問題（雖然通常無害）
```

**解決**：使用全域安裝的 auto-capture

### ❌ 錯誤 3：相對路徑陷阱

```bash
# article-workflow.sh 中使用相對路徑
CAPTURES_DIR="../captures"   # ❌ 從哪裡開始？
```

**解決**：永遠使用絕對路徑或 `$PWD`

```bash
CAPTURES_DIR="${HOME}/Desktop/captures"  # ✅
```

---

## 📋 部署檢查清單

- [ ] auto-capture 已 pip install -e .
- [ ] 可從任何目錄執行 `auto-capture --version`
- [ ] launchdock workspace 包含兩個 folder
- [ ] MCP 設定在兩個 repo 都配置
- [ ] 環境變數已設定（API Keys）
- [ ] 測試跨 repo 工作流程
- [ ] 文檔明確說明依賴關係

---

**設計原則**：
1. **單一職責**：每個 repo 只管自己的事
2. **明確介面**：清楚的輸入輸出約定
3. **路徑絕對化**：避免相對路徑混亂
4. **環境隔離**：各自的 venv，但工具全域可用
5. **文檔完善**：避免認知負擔

**Last updated**: 2026-03-04
