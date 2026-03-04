#!/bin/bash
# ============================================================
# LaunchDock 文章截圖完整工作流程
# 
# 自動化流程：
#   1. 選定文章
#   2. 自動創建截圖資料夾
#   3. 啟動 auto-capture 截圖（含縮圖、標註）
#   4. 檢查機敏資訊並遮蔽
#   5. Vision AI 辨識圖片內容
#   6. 配對回饋到文章
#   7. 複製圖片到 public/images
#   8. 上架前最終機敏檢查
#   9. 提示預覽與提交
#
# 用法：
#   ./scripts/article-workflow.sh [article-slug]
# ============================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ─── Config ──────────────────────────────────────────────
ARTICLES_DIR="src/content/articles"
PUBLIC_IMAGES="public/images/articles"
CAPTURES_BASE="$HOME/Desktop/captures"
AUTO_CAPTURE_PATH="$HOME/Documents/github/auto-capture"

# ─── Helper functions ────────────────────────────────────

print_banner() {
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  📸 LaunchDock 文章截圖工作流程${NC}"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_step() {
  local num=$1
  local title=$2
  echo ""
  echo -e "${BOLD}${CYAN}━━━ Step $num: $title${NC}"
  echo ""
}

list_articles() {
  echo -e "${BOLD}可用的文章：${NC}"
  echo ""
  local i=1
  for f in ${ARTICLES_DIR}/*.md; do
    local slug=$(basename "$f" .md)
    local title=$(grep '^title:' "$f" | head -1 | sed 's/title: *//; s/"//g; s/^"//; s/"$//')
    echo -e "  ${CYAN}[$i]${NC} $slug"
    echo -e "      ${DIM}$title${NC}"
    i=$((i + 1))
  done
  echo ""
}

select_article() {
  list_articles
  
  echo -n "選擇文章編號或輸入 slug: "
  read -r choice
  
  # 檢查是否為數字
  if [[ "$choice" =~ ^[0-9]+$ ]]; then
    local i=1
    for f in ${ARTICLES_DIR}/*.md; do
      if [ "$i" -eq "$choice" ]; then
        basename "$f" .md
        return
      fi
      i=$((i + 1))
    done
    echo -e "${RED}❌ 無效的編號${NC}"
    exit 1
  else
    # 直接使用 slug
    if [ -f "${ARTICLES_DIR}/${choice}.md" ]; then
      echo "$choice"
      return
    else
      echo -e "${RED}❌ 找不到文章: ${choice}${NC}"
      exit 1
    fi
  fi
}

check_dependencies() {
  local missing=0
  
  # 檢查 auto-capture
  if ! command -v auto-capture &> /dev/null; then
    echo -e "${RED}❌ 未安裝 auto-capture${NC}"
    echo -e "   安裝方式: cd $AUTO_CAPTURE_PATH && pip install -e ."
    missing=1
  fi
  
  # 檢查 Python
  if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ 未安裝 Python 3${NC}"
    missing=1
  fi
  
  if [ $missing -eq 1 ]; then
    exit 1
  fi
}

# ─── Main Workflow ───────────────────────────────────────

main() {
  print_banner
  
  # Step 0: 檢查依賴
  print_step 0 "檢查依賴"
  check_dependencies
  echo -e "${GREEN}✅ 所有依賴都已安裝${NC}"
  
  # Step 1: 選定文章
  print_step 1 "選定文章"
  
  if [ $# -eq 0 ]; then
    SLUG=$(select_article)
  else
    SLUG="$1"
    if [ ! -f "${ARTICLES_DIR}/${SLUG}.md" ]; then
      echo -e "${RED}❌ 找不到文章: ${SLUG}${NC}"
      exit 1
    fi
  fi
  
  ARTICLE_PATH="${ARTICLES_DIR}/${SLUG}.md"
  TITLE=$(grep '^title:' "$ARTICLE_PATH" | head -1 | sed 's/title: *//; s/"//g')
  
  echo -e "${GREEN}✅ 已選定文章：${SLUG}${NC}"
  echo -e "${DIM}   $TITLE${NC}"
  
  # 檢查是否有 @img 標記
  MARKER_COUNT=$(grep -c '<!-- @img:' "$ARTICLE_PATH" || echo "0")
  echo -e "${CYAN}📌 文章中有 $MARKER_COUNT 個 @img 標記${NC}"
  
  if [ "$MARKER_COUNT" -eq 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  文章中沒有 @img 標記${NC}"
    echo -e "   建議先執行: ${CYAN}./scripts/add-image.sh $SLUG --retrofit${NC}"
    echo ""
    echo -n "是否繼續？(y/N) "
    read -r continue
    if [[ ! "$continue" =~ ^[yY]$ ]]; then
      echo "已取消"
      exit 0
    fi
  fi
  
  # Step 2: 創建截圖資料夾
  print_step 2 "創建截圖資料夾"
  
  CAPTURES_DIR="${CAPTURES_BASE}/${SLUG}"
  mkdir -p "$CAPTURES_DIR"
  
  echo -e "${GREEN}✅ 截圖將存放到：${CAPTURES_DIR}${NC}"
  
  # Step 3: 啟動 auto-capture 截圖
  print_step 3 "啟動 auto-capture 截圖"
  
  echo -e "${BOLD}請選擇截圖方式：${NC}"
  echo -e "  ${CYAN}[1]${NC} 自動截圖（監聽滑鼠點擊）"
  echo -e "  ${CYAN}[2]${NC} 手動截圖（已完成，跳過此步驟）"
  echo ""
  echo -n "選擇 (1/2): "
  read -r capture_mode
  
  if [ "$capture_mode" = "1" ]; then
    echo ""
    echo -e "${YELLOW}請輸入要監聽的視窗名稱（如 'Chrome', 'Terminal'）：${NC}"
    echo -n "> "
    read -r window_name
    
    echo ""
    echo -e "${CYAN}正在啟動 auto-capture...${NC}"
    echo -e "${DIM}提示：截圖完成後按 Ctrl+C 結束${NC}"
    echo ""
    
    # 啟動 auto-capture
    auto-capture \
      --article "$ARTICLE_PATH" \
      --output "$CAPTURES_DIR" \
      --window "$window_name" \
      --redact || true
    
    echo ""
    echo -e "${GREEN}✅ 截圖完成${NC}"
  else
    echo -e "${CYAN}已跳過自動截圖${NC}"
  fi
  
  # 檢查截圖數量
  SCREENSHOT_COUNT=$(ls -1 "$CAPTURES_DIR"/*.png 2>/dev/null | wc -l | xargs)
  
  if [ "$SCREENSHOT_COUNT" -eq 0 ]; then
    echo ""
    echo -e "${RED}❌ 截圖目錄中沒有 PNG 圖片${NC}"
    echo -e "   請手動截圖後重新執行，或將圖片放到：${CAPTURES_DIR}"
    exit 1
  fi
  
  echo -e "${CYAN}📊 共有 $SCREENSHOT_COUNT 張截圖${NC}"
  
  # Step 4: 檢查機敏資訊
  print_step 4 "檢查機敏資訊並遮蔽"
  
  echo -e "${CYAN}正在掃描截圖中的敏感資訊...${NC}"
  
  python3 << PYTHON_EOF
import sys
from pathlib import Path
sys.path.insert(0, "$AUTO_CAPTURE_PATH")

from auto_capture.redact import redact_image
from auto_capture.config import RedactConfig

captures_dir = Path("$CAPTURES_DIR")
config = RedactConfig(enabled=True)

images = sorted(captures_dir.glob("*.png"))
sensitive_count = 0

for img_path in images:
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        tmp_path = Path(tmp.name)
    
    _, regions = redact_image(img_path, config, tmp_path)
    tmp_path.unlink()
    
    if regions:
        sensitive_count += 1

if sensitive_count > 0:
    print(f"⚠️  發現 {sensitive_count} 張圖片包含敏感資訊")
    sys.exit(1)
else:
    print(f"✅ 所有 {len(images)} 張圖片都安全")
    sys.exit(0)
PYTHON_EOF
  
  if [ $? -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}是否要自動遮蔽這些敏感資訊？(Y/n)${NC}"
    read -r redact_choice
    
    if [[ ! "$redact_choice" =~ ^[nN]$ ]]; then
      python3 << PYTHON_EOF
import sys
from pathlib import Path
sys.path.insert(0, "$AUTO_CAPTURE_PATH")

from auto_capture.redact import redact_image
from auto_capture.config import RedactConfig

captures_dir = Path("$CAPTURES_DIR")
config = RedactConfig(enabled=True)

for img_path in sorted(captures_dir.glob("*.png")):
    _, regions = redact_image(img_path, config, output_path=img_path)
    if regions:
        print(f"🔒 已遮蔽: {img_path.name} ({len(regions)} 個區域)")
PYTHON_EOF
      echo ""
      echo -e "${GREEN}✅ 敏感資訊已遮蔽${NC}"
    fi
  fi
  
  # Step 5 & 6: Vision AI 辨識並配對到文章
  print_step "5-6" "Vision AI 辨識圖片內容並配對到文章"
  
  echo -e "${BOLD}請選擇 AI 供應商：${NC}"
  echo -e "  ${CYAN}[1]${NC} Claude (推薦，品質最好)"
  echo -e "  ${CYAN}[2]${NC} Gemini (快速，成本低)"
  echo -e "  ${CYAN}[3]${NC} OpenAI"
  echo ""
  echo -n "選擇 (1/2/3): "
  read -r ai_choice
  
  case "$ai_choice" in
    1) PROVIDER="claude" ;;
    2) PROVIDER="gemini" ;;
    3) PROVIDER="openai" ;;
    *) PROVIDER="claude" ;;
  esac
  
  echo ""
  echo -e "${CYAN}正在使用 $PROVIDER 辨識圖片內容...${NC}"
  
  auto-capture match \
    --article "$ARTICLE_PATH" \
    --shots "$CAPTURES_DIR" \
    --provider "$PROVIDER" \
    --apply
  
  echo ""
  echo -e "${GREEN}✅ 圖片內容已配對並寫入文章${NC}"
  
  # Step 7: 複製圖片到 public/images
  print_step 7 "複製圖片到 public/images"
  
  PUBLIC_DIR="${PUBLIC_IMAGES}/${SLUG}"
  mkdir -p "$PUBLIC_DIR"
  
  # 複製所有 PNG 和 GIF
  cp "$CAPTURES_DIR"/*.png "$PUBLIC_DIR/" 2>/dev/null || true
  cp "$CAPTURES_DIR"/*.gif "$PUBLIC_DIR/" 2>/dev/null || true
  
  COPIED_COUNT=$(ls -1 "$PUBLIC_DIR"/*.{png,gif} 2>/dev/null | wc -l | xargs)
  
  echo -e "${GREEN}✅ 已複製 $COPIED_COUNT 個檔案到 $PUBLIC_DIR${NC}"
  
  # Step 8: 上架前最終機敏檢查（強制，發現即自動遮蔽）
  print_step 8 "上架前最終機敏檢查（強制）"
  
  echo -e "${CYAN}正在掃描 public/images 中的截圖...${NC}"
  
  python3 << PYTHON_EOF
import sys
from pathlib import Path
sys.path.insert(0, "$AUTO_CAPTURE_PATH")

from auto_capture.redact import redact_image
from auto_capture.config import RedactConfig

public_dir = Path("$PUBLIC_DIR")
config = RedactConfig(enabled=True)

images = sorted(public_dir.glob("*.png"))
sensitive_count = 0
sensitive_files = []

for img_path in images:
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        tmp_path = Path(tmp.name)
    _, regions = redact_image(img_path, config, tmp_path)
    tmp_path.unlink()
    if regions:
        sensitive_count += 1
        sensitive_files.append((img_path.name, len(regions)))

if sensitive_count > 0:
    print(f"🔍 發現 {sensitive_count} 張圖片含敏感資訊，立即自動遮蔽...")
    for img_path in images:
        _, regions = redact_image(img_path, config, output_path=img_path)
        if regions:
            print(f"   🔒 已遮蔽：{img_path.name} ({len(regions)} 個區域)")
    # 遮蔽後再掃一次確認
    still_sensitive = []
    for img_path in images:
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
            tmp_path = Path(tmp.name)
        _, regions = redact_image(img_path, config, tmp_path)
        tmp_path.unlink()
        if regions:
            still_sensitive.append(img_path.name)
    if still_sensitive:
        print(f"\n❌ 遮蔽後仍有問題，請人工檢查：")
        for name in still_sensitive:
            print(f"   - {name}")
        sys.exit(2)  # 硬封鎖
    else:
        print(f"✅ 遮蔽完成，所有 {len(images)} 張圖片已安全")
        sys.exit(0)
else:
    print(f"✅ 所有 {len(images)} 張圖片都安全")
    sys.exit(0)
PYTHON_EOF
  
  FINAL_CHECK_STATUS=$?
  
  if [ $FINAL_CHECK_STATUS -eq 2 ]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ 硬封鎖：機敏資訊遮蔽後仍有殘留，禁止上架！${NC}"
    echo -e "${RED}   請人工檢查上方列出的圖片，確認後再重新執行${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
  fi
  
  # Step 9: 完成提示
  print_step 9 "完成！"
  
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${BOLD}📊 工作流程摘要：${NC}"
  echo -e "   文章：${CYAN}${SLUG}${NC}"
  echo -e "   截圖：${SCREENSHOT_COUNT} 張"
  echo -e "   AI 配對：${PROVIDER}"
  echo -e "   標記：${MARKER_COUNT} 個"
  echo ""
  
  if [ $FINAL_CHECK_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有安全檢查通過，可以上架！${NC}"
  fi
  
  echo ""
  echo -e "${BOLD}🎯 下一步：${NC}"
  echo ""
  echo -e "1. ${CYAN}預覽文章${NC}"
  echo -e "   npm run dev"
  echo -e "   http://localhost:4321/articles/${SLUG}"
  echo ""
  echo -e "2. ${CYAN}提交變更${NC}"
  echo -e "   git add ${ARTICLE_PATH}"
  echo -e "   git add ${PUBLIC_DIR}/"
  echo -e "   git commit -m \"feat: add screenshots to ${SLUG}\""
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# ─── Execute ─────────────────────────────────────────────

main "$@"
