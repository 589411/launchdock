#!/bin/bash
# ============================================================
# LaunchDock 圖片處理工具
# 用法：./scripts/add-image.sh <article-slug> [image-path...]
#
# 功能：
#   1. 自動複製圖片到 public/images/articles/<slug>/
#   2. 自動壓縮（需要 sips，macOS 內建）
#   3. 輸出 Markdown 語法直接貼到文章
#
# 範例：
#   ./scripts/add-image.sh google-api-key-guide ~/Desktop/step1.png ~/Desktop/step2.png
#   ./scripts/add-image.sh why-openclaw screenshot.gif
#
# 支援格式：png, jpg, jpeg, gif, webp, svg
# ============================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SLUG="${1:?用法: ./scripts/add-image.sh <article-slug> [image-path...]}"
shift

TARGET_DIR="public/images/articles/${SLUG}"
mkdir -p "$TARGET_DIR"

# Max width for compression (px)
MAX_WIDTH=1200
# Max file size before warning (bytes) - 500KB
WARN_SIZE=$((500 * 1024))

if [ $# -eq 0 ]; then
  echo -e "${YELLOW}提示：沒有指定圖片，進入互動模式${NC}"
  echo -e "把圖片拖曳到這個終端視窗，然後按 Enter："
  read -r FILE_PATH
  set -- "$FILE_PATH"
fi

echo -e "${CYAN}📁 目標目錄: ${TARGET_DIR}${NC}"
echo ""

for SRC in "$@"; do
  # Remove quotes that drag-and-drop might add
  SRC="${SRC%\'}"
  SRC="${SRC#\'}"
  SRC="${SRC%\"}"
  SRC="${SRC#\"}"
  # Remove trailing whitespace
  SRC="$(echo "$SRC" | xargs)"

  if [ ! -f "$SRC" ]; then
    echo -e "${YELLOW}⚠️  找不到: ${SRC}，跳過${NC}"
    continue
  fi

  FILENAME=$(basename "$SRC")
  EXT="${FILENAME##*.}"
  EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
  
  # Sanitize filename: lowercase, replace spaces with hyphens
  SAFE_NAME=$(echo "$FILENAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9._-]//g')
  DEST="${TARGET_DIR}/${SAFE_NAME}"

  # Copy
  cp "$SRC" "$DEST"

  # Get original size
  ORIG_SIZE=$(stat -f%z "$DEST" 2>/dev/null || stat --printf="%s" "$DEST" 2>/dev/null)

  # Auto-compress PNG/JPG (not GIF/SVG)
  if [[ "$EXT_LOWER" =~ ^(png|jpg|jpeg)$ ]]; then
    # Get width
    WIDTH=$(sips -g pixelWidth "$DEST" 2>/dev/null | tail -1 | awk '{print $2}')
    
    if [ -n "$WIDTH" ] && [ "$WIDTH" -gt "$MAX_WIDTH" ]; then
      sips --resampleWidth "$MAX_WIDTH" "$DEST" >/dev/null 2>&1
      echo -e "  📐 縮小 ${WIDTH}px → ${MAX_WIDTH}px"
    fi
  fi

  FINAL_SIZE=$(stat -f%z "$DEST" 2>/dev/null || stat --printf="%s" "$DEST" 2>/dev/null)
  SIZE_KB=$((FINAL_SIZE / 1024))

  # GIF warning
  if [ "$EXT_LOWER" = "gif" ] && [ "$FINAL_SIZE" -gt "$((2 * 1024 * 1024))" ]; then
    echo -e "${YELLOW}  ⚠️  GIF 超過 2MB (${SIZE_KB}KB)，建議用 gifski 或 ezgif.com 壓縮${NC}"
  fi

  # Size warning
  if [ "$FINAL_SIZE" -gt "$WARN_SIZE" ]; then
    echo -e "${YELLOW}  ⚠️  檔案較大 (${SIZE_KB}KB)${NC}"
  fi

  # Generate markdown
  IMG_PATH="/images/articles/${SLUG}/${SAFE_NAME}"
  ALT_TEXT="${SAFE_NAME%.*}"
  
  if [ "$EXT_LOWER" = "gif" ]; then
    MD="![${ALT_TEXT}](${IMG_PATH})"
    echo -e "${GREEN}✅ ${SAFE_NAME}${NC} (${SIZE_KB}KB) — GIF"
  else
    MD="![${ALT_TEXT}](${IMG_PATH})"
    echo -e "${GREEN}✅ ${SAFE_NAME}${NC} (${SIZE_KB}KB)"
  fi

  echo -e "${CYAN}   Markdown: ${MD}${NC}"
  echo ""
done

echo -e "${GREEN}完成！${NC} 把上面的 Markdown 貼到文章中即可。"
echo -e "圖片位置: ${TARGET_DIR}/"
