#!/bin/bash
# ============================================================
# LaunchDock 圖片工作流程 CLI
# 
# 用法：
#   ./scripts/add-image.sh <article-slug> [options] [image-path...]
#
# 模式：
#   (預設)           處理圖片 + 互動配對到 @img 標記
#   --scan           列出文章中所有 @img 標記狀態
#   --dry-run        預覽配對結果，不修改文章
#   --retrofit       為現有文章（無 @img）自動建議並插入標記
#   --add-marker     互動式在文章中新增 @img 標記
#   --validate       檢查文章中所有圖片連結是否有效
#   --migrate-markers 將舊的 📸 標記轉為 @img 格式
#
# 範例：
#   ./scripts/add-image.sh deploy-openclaw-cloud ~/Desktop/step1.png
#   ./scripts/add-image.sh google-api-key-guide --scan
#   ./scripts/add-image.sh deploy-openclaw-cloud --retrofit
#   ./scripts/add-image.sh --migrate-markers
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
IMAGES_DIR="public/images/articles"
MAX_WIDTH=1200
WARN_SIZE=$((500 * 1024))

# ─── Global flags ────────────────────────────────────────
DRY_RUN=false
MODE="default"  # default | scan | retrofit | add-marker | validate | migrate

# ─── Helper functions ────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  📸 LaunchDock 圖片工作流程${NC}"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

find_article() {
  local slug="$1"
  local article_path="${ARTICLES_DIR}/${slug}.md"
  
  if [ ! -f "$article_path" ]; then
    echo -e "${RED}❌ 找不到文章: ${article_path}${NC}"
    echo ""
    echo "可用的文章："
    for f in ${ARTICLES_DIR}/*.md; do
      local name=$(basename "$f" .md)
      echo "  - $name"
    done
    exit 1
  fi
  
  echo "$article_path"
}

# 掃描文章中的 @img 標記，輸出格式：行號|檔名|alt文字
scan_markers() {
  local article_path="$1"
  grep -n '<!-- @img:' "$article_path" 2>/dev/null | \
    sed 's/<!-- @img: *//; s/ *-->//' | \
    sed 's/ *| */|/' || true
}

# 掃描文章中已插入的圖片
scan_existing_images() {
  local article_path="$1"
  grep -n '!\[.*\](/images/articles/' "$article_path" 2>/dev/null || true
}

# 掃描舊的 📸 標記
scan_old_markers() {
  local article_path="$1"
  grep -n '<!-- 📸' "$article_path" 2>/dev/null || true
}

# 取得文章的所有 heading（含行號）
scan_headings() {
  local article_path="$1"
  grep -n '^##' "$article_path" 2>/dev/null || true
}

# 處理一張圖片（複製、壓縮、回傳路徑）
process_image() {
  local src="$1"
  local slug="$2"
  local target_dir="${IMAGES_DIR}/${slug}"
  
  mkdir -p "$target_dir"
  
  # Clean path
  src="${src%\'}"
  src="${src#\'}"
  src="${src%\"}"
  src="${src#\"}"
  src="$(echo "$src" | xargs)"
  
  if [ ! -f "$src" ]; then
    echo ""
    return 1
  fi
  
  local filename=$(basename "$src")
  local ext="${filename##*.}"
  local ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  local safe_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9._-]//g')
  local dest="${target_dir}/${safe_name}"
  
  cp "$src" "$dest"
  
  # Compress PNG/JPG
  if [[ "$ext_lower" =~ ^(png|jpg|jpeg)$ ]]; then
    local width=$(sips -g pixelWidth "$dest" 2>/dev/null | tail -1 | awk '{print $2}')
    if [ -n "$width" ] && [ "$width" -gt "$MAX_WIDTH" ]; then
      sips --resampleWidth "$MAX_WIDTH" "$dest" >/dev/null 2>&1
      echo -e "  ${DIM}📐 縮小 ${width}px → ${MAX_WIDTH}px${NC}" >&2
    fi
  fi
  
  local final_size=$(stat -f%z "$dest" 2>/dev/null || stat --printf="%s" "$dest" 2>/dev/null)
  local size_kb=$((final_size / 1024))
  
  if [ "$final_size" -gt "$WARN_SIZE" ]; then
    echo -e "  ${YELLOW}⚠️  檔案較大 (${size_kb}KB)${NC}" >&2
  fi
  
  echo -e "  ${GREEN}✅ ${safe_name}${NC} (${size_kb}KB)" >&2
  
  # Return the safe filename
  echo "$safe_name"
}

# 在文章中替換 @img 標記為正式圖片
replace_marker() {
  local article_path="$1"
  local marker_line="$2"     # 完整的 <!-- @img: ... --> 行（或行號）
  local img_filename="$3"    # 圖片檔名
  local alt_text="$4"        # alt 文字
  local slug="$5"
  local line_num="${6:-}"    # 可選：行號（更精確）
  
  local img_path="/images/articles/${slug}/${img_filename}"
  local replacement="![${alt_text}](${img_path})"
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${DIM}(預覽) ${marker_line}${NC}"
    echo -e "  ${CYAN}  → ${replacement}${NC}"
    return
  fi
  
  # Use sed with line number for precise replacement (avoids regex issues)
  if [ -n "$line_num" ]; then
    # Replace the entire line at the given line number
    sed -i '' "${line_num}s|.*|${replacement}|" "$article_path"
  else
    # Fallback: match by literal string using awk index() + full-line replace
    local tmp_file=$(mktemp)
    awk -v old="$marker_line" -v new="$replacement" '{
      if (index($0, old) > 0) {
        print new
      } else {
        print
      }
    }' "$article_path" > "$tmp_file" && mv "$tmp_file" "$article_path"
  fi
  
  echo -e "  ${GREEN}✅ 已替換${NC}"
}

# ─── Mode: scan ─────────────────────────────────────────

do_scan() {
  local slug="$1"
  local article_path
  article_path=$(find_article "$slug")
  
  echo -e "${CYAN}📄 文章: ${article_path}${NC}"
  echo ""
  
  # @img markers
  echo -e "${BOLD}📌 @img 標記（等待截圖）：${NC}"
  local markers
  markers=$(scan_markers "$article_path")
  if [ -z "$markers" ]; then
    echo -e "  ${DIM}（無）${NC}"
  else
    local count=0
    while IFS= read -r line; do
      count=$((count + 1))
      local line_num=$(echo "$line" | cut -d: -f1)
      local rest=$(echo "$line" | cut -d: -f2-)
      local name=$(echo "$rest" | cut -d'|' -f1 | xargs)
      local alt=$(echo "$rest" | cut -d'|' -f2 | xargs)
      echo -e "  ${YELLOW}[$count]${NC} L${line_num}: ${BOLD}${name}${NC} — ${alt}"
    done <<< "$markers"
  fi
  echo ""
  
  # Already inserted images
  echo -e "${BOLD}🖼  已插入的圖片：${NC}"
  local existing
  existing=$(scan_existing_images "$article_path")
  if [ -z "$existing" ]; then
    echo -e "  ${DIM}（無）${NC}"
  else
    while IFS= read -r line; do
      local line_num=$(echo "$line" | cut -d: -f1)
      echo -e "  ${GREEN}✓${NC} L${line_num}: $(echo "$line" | cut -d: -f2-)"
    done <<< "$existing"
  fi
  echo ""
  
  # Old 📸 markers
  local old
  old=$(scan_old_markers "$article_path")
  if [ -n "$old" ]; then
    echo -e "${BOLD}⚠️  舊的 📸 標記（建議遷移）：${NC}"
    while IFS= read -r line; do
      echo -e "  ${YELLOW}${line}${NC}"
    done <<< "$old"
    echo ""
    echo -e "  執行 ${CYAN}./scripts/add-image.sh ${slug} --migrate-markers${NC} 可自動轉換"
    echo ""
  fi
  
  # Image files on disk
  local img_dir="${IMAGES_DIR}/${slug}"
  if [ -d "$img_dir" ]; then
    local file_count=$(find "$img_dir" -type f | wc -l | xargs)
    echo -e "${BOLD}📁 圖片資料夾 (${img_dir}): ${file_count} 個檔案${NC}"
    find "$img_dir" -type f -exec basename {} \; | sort | while read -r f; do
      echo -e "  ${DIM}${f}${NC}"
    done
  else
    echo -e "${BOLD}📁 圖片資料夾: ${DIM}尚未建立${NC}"
  fi
}

# ─── Mode: retrofit ─────────────────────────────────────

do_retrofit() {
  local slug="$1"
  local article_path
  article_path=$(find_article "$slug")
  
  echo -e "${CYAN}📄 為現有文章加入 @img 標記: ${article_path}${NC}"
  echo ""
  
  # Get all headings
  echo -e "${BOLD}文章結構：${NC}"
  echo ""
  
  local headings
  headings=$(scan_headings "$article_path")
  
  if [ -z "$headings" ]; then
    echo -e "${YELLOW}找不到任何 heading${NC}"
    return
  fi
  
  local i=0
  local -a heading_lines=()
  local -a heading_texts=()
  
  while IFS= read -r line; do
    i=$((i + 1))
    local line_num=$(echo "$line" | cut -d: -f1)
    local text=$(echo "$line" | cut -d: -f2- | sed 's/^#* *//')
    heading_lines+=("$line_num")
    heading_texts+=("$text")
    echo -e "  ${YELLOW}[${i}]${NC} L${line_num}: ${text}"
  done <<< "$headings"
  
  echo ""
  echo -e "輸入要在哪些 heading 之後加入 @img 標記"
  echo -e "（輸入數字，用空格分隔，例如：${CYAN}1 3 5${NC}）"
  echo -e "輸入 ${CYAN}a${NC} = 全部，${CYAN}q${NC} = 取消"
  echo -n "> "
  read -r selection
  
  if [ "$selection" = "q" ]; then
    echo "已取消"
    return
  fi
  
  local selected_indices=()
  if [ "$selection" = "a" ]; then
    for ((j=1; j<=i; j++)); do
      selected_indices+=("$j")
    done
  else
    read -ra selected_indices <<< "$selection"
  fi
  
  local inserted=0
  for idx in "${selected_indices[@]}"; do
    if [ "$idx" -lt 1 ] || [ "$idx" -gt "$i" ]; then
      echo -e "${YELLOW}跳過無效的索引: ${idx}${NC}"
      continue
    fi
    
    local arr_idx=$((idx - 1))
    local line_num="${heading_lines[$arr_idx]}"
    local heading_text="${heading_texts[$arr_idx]}"
    
    echo ""
    echo -e "${BOLD}${heading_text}${NC} (L${line_num})"
    echo -n "  @img 檔名 (按 Enter 跳過): "
    read -r marker_name
    
    if [ -z "$marker_name" ]; then
      continue
    fi
    
    echo -n "  alt 說明 [${heading_text}]: "
    read -r marker_alt
    if [ -z "$marker_alt" ]; then
      marker_alt="$heading_text"
    fi
    
    local marker="<!-- @img: ${marker_name} | ${marker_alt} -->"
    
    # Find insertion point: first blank line after some content
    local total_lines=$(wc -l < "$article_path")
    local insert_after=$line_num
    local next_heading_line=$total_lines
    
    for ((j=arr_idx+1; j<i; j++)); do
      next_heading_line="${heading_lines[$j]}"
      break
    done
    
    local content_found=false
    for ((k=line_num+1; k<next_heading_line; k++)); do
      local this_line=$(sed -n "${k}p" "$article_path")
      if [ -n "$this_line" ]; then
        content_found=true
      elif [ "$content_found" = true ]; then
        insert_after=$k
        break
      fi
    done
    
    if [ "$DRY_RUN" = true ]; then
      echo -e "  ${DIM}(預覽) 會在 L${insert_after} 插入: ${marker}${NC}"
    else
      sed -i '' "${insert_after}i\\
${marker}
" "$article_path"
      inserted=$((inserted + 1))
      echo -e "  ${GREEN}✅ 已在 L${insert_after} 插入標記${NC}"
      
      # Adjust subsequent line numbers
      for ((j=arr_idx+1; j<i; j++)); do
        heading_lines[$j]=$((${heading_lines[$j]} + 1))
      done
    fi
  done
  
  echo ""
  if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}預覽完成，未修改文章${NC}"
  else
    echo -e "${GREEN}完成！已插入 ${inserted} 個 @img 標記${NC}"
    echo -e "接下來截圖後執行: ${CYAN}./scripts/add-image.sh ${slug} <圖片...>${NC}"
  fi
}

# ─── Mode: add-marker ───────────────────────────────────

do_add_marker() {
  local slug="$1"
  local article_path
  article_path=$(find_article "$slug")
  
  echo -e "${CYAN}📄 手動新增 @img 標記: ${article_path}${NC}"
  echo ""
  
  echo -e "${BOLD}文章結構：${NC}"
  echo ""
  
  local headings
  headings=$(scan_headings "$article_path")
  local i=0
  local -a heading_lines=()
  local -a heading_texts=()
  
  while IFS= read -r line; do
    i=$((i + 1))
    local line_num=$(echo "$line" | cut -d: -f1)
    local text=$(echo "$line" | cut -d: -f2- | sed 's/^#* *//')
    heading_lines+=("$line_num")
    heading_texts+=("$text")
    echo -e "  ${YELLOW}[${i}]${NC} L${line_num}: ${text}"
  done <<< "$headings"
  
  echo ""
  echo -n "在哪個 heading 之後新增？(輸入數字) > "
  read -r idx
  
  if [ -z "$idx" ] || [ "$idx" -lt 1 ] || [ "$idx" -gt "$i" ]; then
    echo "已取消"
    return
  fi
  
  local arr_idx=$((idx - 1))
  local line_num="${heading_lines[$arr_idx]}"
  
  echo -n "@img 檔名: "
  read -r marker_name
  if [ -z "$marker_name" ]; then
    echo "已取消"
    return
  fi
  
  echo -n "alt 說明: "
  read -r marker_alt
  if [ -z "$marker_alt" ]; then
    marker_alt="$marker_name"
  fi
  
  local marker="<!-- @img: ${marker_name} | ${marker_alt} -->"
  
  local total_lines=$(wc -l < "$article_path")
  local insert_after=$((line_num + 1))
  local content_found=false
  
  for ((k=line_num+1; k<=total_lines; k++)); do
    local this_line=$(sed -n "${k}p" "$article_path")
    if [[ "$this_line" =~ ^## ]]; then
      insert_after=$((k - 1))
      break
    fi
    if [ -n "$this_line" ]; then
      content_found=true
    elif [ "$content_found" = true ]; then
      insert_after=$k
      break
    fi
  done
  
  sed -i '' "${insert_after}i\\
\\
${marker}
" "$article_path"
  
  echo -e "${GREEN}✅ 已在 L${insert_after} 插入: ${marker}${NC}"
}

# ─── Mode: validate ─────────────────────────────────────

do_validate() {
  local slug="$1"
  local article_path
  article_path=$(find_article "$slug")
  
  echo -e "${CYAN}📄 驗證圖片連結: ${article_path}${NC}"
  echo ""
  
  local images
  images=$(grep -o '!\[.*\]([^)]*)' "$article_path" 2>/dev/null | sed 's/.*(\(.*\))/\1/' || true)
  
  if [ -z "$images" ]; then
    echo -e "${DIM}文章中沒有圖片連結${NC}"
    return
  fi
  
  local ok=0
  local broken=0
  
  while IFS= read -r img_path; do
    local local_path="public${img_path}"
    if [ -f "$local_path" ]; then
      echo -e "  ${GREEN}✓${NC} ${img_path}"
      ok=$((ok + 1))
    else  
      echo -e "  ${RED}✗${NC} ${img_path} — ${RED}檔案不存在${NC}"
      broken=$((broken + 1))
    fi
  done <<< "$images"
  
  echo ""
  echo -e "結果: ${GREEN}${ok} 有效${NC}, ${RED}${broken} 失效${NC}"
}

# ─── Mode: migrate-markers ──────────────────────────────

do_migrate_markers() {
  local target_slug="${1:-}"
  local files=()
  
  if [ -n "$target_slug" ]; then
    local article_path
    article_path=$(find_article "$target_slug")
    files=("$article_path")
  else
    for f in ${ARTICLES_DIR}/*.md; do
      files+=("$f")
    done
  fi
  
  local total_migrated=0
  
  for article_path in "${files[@]}"; do
    local old_markers
    old_markers=$(scan_old_markers "$article_path")
    
    if [ -z "$old_markers" ]; then
      continue
    fi
    
    echo -e "${CYAN}📄 ${article_path}${NC}"
    
    # Collect all markers first, then process in REVERSE order
    # so line deletions don't affect earlier line numbers
    local -a m_line_nums=()
    local -a m_descs=()
    
    while IFS= read -r line; do
      local line_num=$(echo "$line" | cut -d: -f1)
      local content=$(echo "$line" | cut -d: -f2-)
      local desc=$(echo "$content" | sed 's/.*📸[^：:]*[：:] *//; s/ *-->.*//')
      m_line_nums+=("$line_num")
      m_descs+=("$desc")
    done <<< "$old_markers"
    
    # Process in reverse order
    local count=${#m_line_nums[@]}
    for ((idx=count-1; idx>=0; idx--)); do
      local line_num="${m_line_nums[$idx]}"
      local desc="${m_descs[$idx]}"
      local auto_name="screenshot-L${line_num}"
      
      local old_line=$(sed -n "${line_num}p" "$article_path")
      local new_line="<!-- @img: ${auto_name} | ${desc} -->"
      
      if [ "$DRY_RUN" = true ]; then
        echo -e "  ${DIM}L${line_num}: ${old_line}${NC}"
        echo -e "  ${CYAN}  → ${new_line}${NC}"
      else
        # Check if next line is a commented-out image, remove it first
        local next_line_num=$((line_num + 1))
        local next_line=$(sed -n "${next_line_num}p" "$article_path")
        
        if echo "$next_line" | grep -q '<!-- !\['; then
          sed -i '' "${next_line_num}d" "$article_path"
          echo -e "  ${DIM}移除 L${next_line_num}: ${next_line}${NC}"
        fi
        
        # Replace the old marker with new @img marker
        local tmp_file=$(mktemp)
        awk -v old="$old_line" -v new="$new_line" '{
          if (index($0, old) > 0) {
            sub(old, new)
          }
          print
        }' "$article_path" > "$tmp_file" && mv "$tmp_file" "$article_path"
        echo -e "  ${GREEN}✅ L${line_num}: ${new_line}${NC}"
      fi
      
      total_migrated=$((total_migrated + 1))
    done
    
    echo ""
  done
  
  if [ "$total_migrated" -eq 0 ]; then
    echo -e "${DIM}沒有找到需要遷移的 📸 標記${NC}"
  else
    if [ "$DRY_RUN" = true ]; then
      echo -e "${CYAN}預覽完成，共 ${total_migrated} 個標記待遷移${NC}"
    else
      echo -e "${GREEN}完成！已遷移 ${total_migrated} 個標記${NC}"
    fi
  fi
}

# ─── Mode: default (process images + pair) ──────────────

do_default() {
  local slug="$1"
  shift
  local article_path
  article_path=$(find_article "$slug")
  
  local target_dir="${IMAGES_DIR}/${slug}"
  mkdir -p "$target_dir"
  
  # Collect image files
  local -a image_args=()
  if [ $# -eq 0 ]; then
    echo -e "${YELLOW}提示：沒有指定圖片，進入互動模式${NC}"
    echo -e "把圖片拖曳到終端（可多張），每行一個，空行結束："
    while true; do
      read -r file_path
      if [ -z "$file_path" ]; then
        break
      fi
      image_args+=("$file_path")
    done
  else
    image_args=("$@")
  fi
  
  if [ ${#image_args[@]} -eq 0 ]; then
    echo -e "${RED}沒有圖片可處理${NC}"
    exit 1
  fi
  
  # ─── Step 1: Process images ─────────────────────────
  echo -e "${BOLD}Step 1: 處理圖片${NC}"
  echo -e "${CYAN}📁 目標目錄: ${target_dir}${NC}"
  echo ""
  
  local -a processed_files=()
  
  for src in "${image_args[@]}"; do
    local safe_name
    safe_name=$(process_image "$src" "$slug")
    if [ -n "$safe_name" ]; then
      processed_files+=("$safe_name")
    else
      echo -e "${YELLOW}⚠️  找不到: ${src}，跳過${NC}"
    fi
  done
  
  if [ ${#processed_files[@]} -eq 0 ]; then
    echo -e "${RED}沒有成功處理的圖片${NC}"
    exit 1
  fi
  
  echo ""
  
  # ─── Step 2: Scan markers ──────────────────────────
  echo -e "${BOLD}Step 2: 掃描 @img 標記${NC}"
  echo ""
  
  local raw_markers
  raw_markers=$(scan_markers "$article_path")
  
  local -a marker_line_nums=()
  local -a marker_names=()
  local -a marker_alts=()
  local -a marker_full_lines=()
  local marker_count=0
  
  if [ -n "$raw_markers" ]; then
    while IFS= read -r line; do
      marker_count=$((marker_count + 1))
      local line_num=$(echo "$line" | cut -d: -f1)
      local rest=$(echo "$line" | cut -d: -f2-)
      local name=$(echo "$rest" | cut -d'|' -f1 | xargs)
      local alt=$(echo "$rest" | cut -d'|' -f2 | xargs)
      local full_line=$(sed -n "${line_num}p" "$article_path")
      
      marker_line_nums+=("$line_num")
      marker_names+=("$name")
      marker_alts+=("$alt")
      marker_full_lines+=("$full_line")
      
      echo -e "  ${YELLOW}[${marker_count}]${NC} ${BOLD}${name}${NC} — ${alt} ${DIM}(L${line_num})${NC}"
    done <<< "$raw_markers"
  fi
  
  # Also collect headings for "new position" option
  local headings
  headings=$(scan_headings "$article_path")
  local -a heading_line_nums=()
  local -a heading_texts=()
  local heading_count=0
  
  if [ -n "$headings" ]; then
    while IFS= read -r line; do
      heading_count=$((heading_count + 1))
      local line_num=$(echo "$line" | cut -d: -f1)
      local text=$(echo "$line" | cut -d: -f2- | sed 's/^#* *//')
      heading_line_nums+=("$line_num")
      heading_texts+=("$text")
    done <<< "$headings"
  fi
  
  if [ "$marker_count" -eq 0 ]; then
    echo -e "  ${YELLOW}文章中沒有 @img 標記${NC}"
    echo ""
    echo -e "  選項："
    echo -e "    ${CYAN}r${NC} — 進入 retrofit 模式（自動建議標記位置）"
    echo -e "    ${CYAN}h${NC} — 直接選 heading 位置插入圖片"
    echo -e "    ${CYAN}q${NC} — 退出"
    echo -n "  > "
    read -r choice
    
    case "$choice" in
      r) do_retrofit "$slug"; return ;;
      h) ;; # fall through to heading-based pairing
      *) echo "已退出"; return ;;
    esac
  fi
  
  echo ""
  
  # ─── Step 3: Interactive pairing ───────────────────
  echo -e "${BOLD}Step 3: 配對圖片到位置${NC}"
  echo ""
  
  local -a used_markers=()
  local replacements_made=0
  
  for img_file in "${processed_files[@]}"; do
    echo -e "${BOLD}🖼  ${img_file}${NC}"
    echo ""
    
    # Show available markers
    local available=0
    for ((j=0; j<marker_count; j++)); do
      local already_used=false
      for used in "${used_markers[@]+"${used_markers[@]}"}"; do
        if [ "$used" = "$j" ]; then
          already_used=true
          break
        fi
      done
      
      if [ "$already_used" = false ]; then
        available=$((available + 1))
        echo -e "  ${YELLOW}[$((j + 1))]${NC} ${marker_names[$j]} — ${marker_alts[$j]}"
      fi
    done
    
    # Also offer heading positions
    echo ""
    echo -e "  ${DIM}── 或選擇在 heading 之後新增 ──${NC}"
    for ((j=0; j<heading_count; j++)); do
      echo -e "  ${CYAN}[h$((j + 1))]${NC} ${heading_texts[$j]} ${DIM}(L${heading_line_nums[$j]})${NC}"
    done
    echo -e "  ${DIM}[s] 跳過這張圖${NC}"
    echo ""
    echo -n "  選擇 > "
    read -r choice
    
    if [ "$choice" = "s" ]; then
      echo -e "  ${DIM}已跳過${NC}"
      echo ""
      continue
    fi
    
    # Heading choice (h1, h2, ...)
    if [[ "$choice" =~ ^h([0-9]+)$ ]]; then
      local h_idx=$((${BASH_REMATCH[1]} - 1))
      if [ "$h_idx" -ge 0 ] && [ "$h_idx" -lt "$heading_count" ]; then
        local h_line="${heading_line_nums[$h_idx]}"
        
        echo -n "  alt 說明文字 [${heading_texts[$h_idx]}]: "
        read -r custom_alt
        if [ -z "$custom_alt" ]; then
          custom_alt="${heading_texts[$h_idx]}"
        fi
        
        local img_path="/images/articles/${slug}/${img_file}"
        local img_md="![${custom_alt}](${img_path})"
        
        if [ "$DRY_RUN" = true ]; then
          echo -e "  ${DIM}(預覽) 會在 L${h_line} 之後插入: ${img_md}${NC}"
        else
          # Find first blank line after heading content
          local total_lines=$(wc -l < "$article_path")
          local insert_at=$((h_line + 1))
          local cf=false
          for ((k=h_line+1; k<=total_lines; k++)); do
            local this_line=$(sed -n "${k}p" "$article_path")
            if [[ "$this_line" =~ ^## ]]; then
              insert_at=$((k - 1))
              break
            fi
            if [ -n "$this_line" ]; then
              cf=true
            elif [ "$cf" = true ]; then
              insert_at=$k
              break
            fi
          done
          
          sed -i '' "${insert_at}i\\
\\
${img_md}
" "$article_path"
          
          echo -e "  ${GREEN}✅ 已插入到 L${insert_at}${NC}"
          replacements_made=$((replacements_made + 1))
          
          # Adjust line numbers (inserted 2 lines: blank + image)
          for ((j=0; j<marker_count; j++)); do
            if [ "${marker_line_nums[$j]}" -ge "$insert_at" ]; then
              marker_line_nums[$j]=$((${marker_line_nums[$j]} + 2))
            fi
          done
          for ((j=0; j<heading_count; j++)); do
            if [ "${heading_line_nums[$j]}" -ge "$insert_at" ]; then
              heading_line_nums[$j]=$((${heading_line_nums[$j]} + 2))
            fi
          done
        fi
      fi
      echo ""
      continue
    fi
    
    # Marker choice (number)
    local m_idx=$((choice - 1))
    if [ "$m_idx" -ge 0 ] && [ "$m_idx" -lt "$marker_count" ]; then
      used_markers+=("$m_idx")
      
      replace_marker \
        "$article_path" \
        "${marker_full_lines[$m_idx]}" \
        "$img_file" \
        "${marker_alts[$m_idx]}" \
        "$slug" \
        "${marker_line_nums[$m_idx]}"
      
      replacements_made=$((replacements_made + 1))
    else
      echo -e "  ${YELLOW}無效選擇，跳過${NC}"
    fi
    
    echo ""
  done
  
  # ─── Summary ───────────────────────────────────────
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}預覽完成，未修改文章${NC}"
  else
    echo -e "${GREEN}完成！${replacements_made} 張圖片已配對插入${NC}"
  fi
  
  local remaining=$((marker_count - ${#used_markers[@]}))
  if [ "$remaining" -gt 0 ]; then
    echo -e "${YELLOW}還有 ${remaining} 個 @img 標記等待截圖${NC}"
    echo -e "執行 ${CYAN}./scripts/add-image.sh ${slug} --scan${NC} 查看"
  fi
  
  echo -e "圖片位置: ${target_dir}/"
}

# ─── Parse arguments ─────────────────────────────────────

print_header

# Handle --migrate-markers without slug
if [ "${1:-}" = "--migrate-markers" ]; then
  do_migrate_markers ""
  exit 0
fi

# Usage
if [ $# -eq 0 ]; then
  echo "用法: ./scripts/add-image.sh <article-slug> [options] [image-path...]"
  echo ""
  echo "模式："
  echo "  (預設)             處理圖片 + 互動配對"
  echo "  --scan             列出文章中所有 @img 標記"
  echo "  --dry-run          預覽模式"
  echo "  --retrofit         為文章加入 @img 標記"
  echo "  --add-marker       手動新增 @img 標記"
  echo "  --validate         檢查圖片連結有效性"
  echo "  --migrate-markers  遷移舊的 📸 標記"
  echo ""
  echo "範例："
  echo "  ./scripts/add-image.sh google-api-key-guide ~/Desktop/*.png"
  echo "  ./scripts/add-image.sh deploy-openclaw-cloud --scan"
  echo "  ./scripts/add-image.sh deploy-openclaw-cloud --retrofit"
  echo "  ./scripts/add-image.sh --migrate-markers"
  exit 0
fi

SLUG="$1"
shift

# Parse options and image args
IMAGE_ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --scan)          MODE="scan" ;;
    --dry-run)       DRY_RUN=true ;;
    --retrofit)      MODE="retrofit" ;;
    --add-marker)    MODE="add-marker" ;;
    --validate)      MODE="validate" ;;
    --migrate-markers) MODE="migrate" ;;
    *)               IMAGE_ARGS+=("$1") ;;
  esac
  shift
done

# Dispatch
case "$MODE" in
  scan)       do_scan "$SLUG" ;;
  retrofit)   do_retrofit "$SLUG" ;;
  add-marker) do_add_marker "$SLUG" ;;
  validate)   do_validate "$SLUG" ;;
  migrate)    do_migrate_markers "$SLUG" ;;
  default)    do_default "$SLUG" "${IMAGE_ARGS[@]+"${IMAGE_ARGS[@]}"}" ;;
esac
