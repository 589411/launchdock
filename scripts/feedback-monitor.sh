#!/usr/bin/env bash
# ============================================================
# LaunchDock 回饋監控 CLI
# 用法:
#   ./scripts/feedback-monitor.sh              # 顯示總覽
#   ./scripts/feedback-monitor.sh --alerts     # 只顯示需要注意的文章
#   ./scripts/feedback-monitor.sh --sections   # 顯示段落層級卡關
#   ./scripts/feedback-monitor.sh --questions  # 顯示最近卡關提問
#   ./scripts/feedback-monitor.sh --slug <slug> # 查看特定文章
#   ./scripts/feedback-monitor.sh --watch      # 持續監控（每 60 秒刷新）
#   ./scripts/feedback-monitor.sh --json       # JSON 輸出（可接管線）
#   ./scripts/feedback-monitor.sh --help       # 顯示幫助
#
# 前置需求:
#   - 設定環境變數 SUPABASE_URL 和 SUPABASE_SERVICE_KEY
#   - 或在 .env 中設定 PUBLIC_SUPABASE_URL 和 PUBLIC_SUPABASE_ANON_KEY
#   - 需要 curl 和 jq
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# ============================================================
# Load env
# ============================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Try loading from .env
if [[ -f "$PROJECT_ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  source <(grep -E '^(PUBLIC_SUPABASE_URL|PUBLIC_SUPABASE_ANON_KEY|SUPABASE_URL|SUPABASE_SERVICE_KEY)=' "$PROJECT_ROOT/.env" 2>/dev/null || true)
fi

# Resolve Supabase credentials
SB_URL="${SUPABASE_URL:-${PUBLIC_SUPABASE_URL:-}}"
SB_KEY="${SUPABASE_SERVICE_KEY:-${PUBLIC_SUPABASE_ANON_KEY:-}}"

if [[ -z "$SB_URL" || -z "$SB_KEY" ]]; then
  echo -e "${RED}錯誤：缺少 Supabase 設定${NC}"
  echo "請設定環境變數：SUPABASE_URL + SUPABASE_SERVICE_KEY"
  echo "或在 .env 中設定 PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY"
  exit 1
fi

# Check for jq
if ! command -v jq &>/dev/null; then
  echo -e "${RED}錯誤：需要安裝 jq${NC}"
  echo "  macOS: brew install jq"
  echo "  Linux: sudo apt install jq"
  exit 1
fi

# ============================================================
# API helpers
# ============================================================
sb_get() {
  local endpoint="$1"
  curl -s \
    -H "apikey: $SB_KEY" \
    -H "Authorization: Bearer $SB_KEY" \
    -H "Content-Type: application/json" \
    "${SB_URL}/rest/v1/${endpoint}"
}

sb_rpc() {
  local func_name="$1"
  local body="${2:-{}}"
  curl -s \
    -X POST \
    -H "apikey: $SB_KEY" \
    -H "Authorization: Bearer $SB_KEY" \
    -H "Content-Type: application/json" \
    -d "$body" \
    "${SB_URL}/rest/v1/rpc/${func_name}"
}

# ============================================================
# Formatting helpers
# ============================================================
severity_icon() {
  local pct=$1
  if (( $(echo "$pct >= 60" | bc -l) )); then echo "🔴"
  elif (( $(echo "$pct >= 40" | bc -l) )); then echo "🟠"
  elif (( $(echo "$pct >= 20" | bc -l) )); then echo "🟡"
  else echo "🟢"
  fi
}

print_header() {
  echo ""
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}  📡 LaunchDock 回饋監控${NC}"
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
  echo -e "${DIM}  $(date '+%Y-%m-%d %H:%M:%S')${NC}"
  echo ""
}

print_section() {
  echo ""
  echo -e "${BOLD}── $1 ──${NC}"
  echo ""
}

# ============================================================
# Commands
# ============================================================

cmd_overview() {
  local json_mode="${1:-false}"

  # Fetch article reactions
  local reactions
  reactions=$(sb_get "article_reactions?select=slug,reaction_type")

  if [[ "$reactions" == "[]" || -z "$reactions" ]]; then
    if [[ "$json_mode" == "true" ]]; then
      echo '{"articles":[],"summary":{"total_articles":0,"total_stuck":0,"total_cry":0,"critical":0}}'
    else
      print_header
      echo -e "  ${GREEN}🎉 目前沒有任何回饋數據${NC}"
    fi
    return
  fi

  # Process with jq
  local summary
  summary=$(echo "$reactions" | jq -r '
    group_by(.slug) | map({
      slug: .[0].slug,
      total: length,
      rocket: [.[] | select(.reaction_type == "rocket")] | length,
      like: [.[] | select(.reaction_type == "like")] | length,
      stuck: [.[] | select(.reaction_type == "stuck")] | length,
      cry: [.[] | select(.reaction_type == "cry")] | length,
      distress: ([.[] | select(.reaction_type == "stuck" or .reaction_type == "cry")] | length),
      distress_pct: (([.[] | select(.reaction_type == "stuck" or .reaction_type == "cry")] | length) / length * 100 | . * 10 | round / 10)
    }) | sort_by(-.distress_pct, -.distress)
  ')

  if [[ "$json_mode" == "true" ]]; then
    local total_stuck total_cry critical
    total_stuck=$(echo "$summary" | jq '[.[].stuck] | add // 0')
    total_cry=$(echo "$summary" | jq '[.[].cry] | add // 0')
    critical=$(echo "$summary" | jq '[.[] | select(.distress_pct >= 40)] | length')

    echo "$summary" | jq --argjson ts "$total_stuck" --argjson tc "$total_cry" --argjson cr "$critical" '{
      articles: .,
      summary: { total_articles: (. | length), total_stuck: $ts, total_cry: $tc, critical: $cr }
    }'
    return
  fi

  print_header

  # Summary stats
  local total_articles total_stuck total_cry critical
  total_articles=$(echo "$summary" | jq 'length')
  total_stuck=$(echo "$summary" | jq '[.[].stuck] | add // 0')
  total_cry=$(echo "$summary" | jq '[.[].cry] | add // 0')
  critical=$(echo "$summary" | jq '[.[] | select(.distress_pct >= 40)] | length')

  echo -e "  📄 有回饋文章: ${BOLD}${total_articles}${NC}"
  echo -e "  😵 總卡關數:   ${BOLD}${total_stuck}${NC}"
  echo -e "  😢 總哭哭數:   ${BOLD}${total_cry}${NC}"
  if [[ "$critical" -gt 0 ]]; then
    echo -e "  ${RED}🔴 需要注意:   ${BOLD}${critical} 篇文章${NC}"
  else
    echo -e "  ${GREEN}🟢 狀態:       一切正常${NC}"
  fi

  print_section "文章卡關排行"

  echo "$summary" | jq -r '.[] | "\(.slug)\t\(.total)\t\(.stuck)\t\(.cry)\t\(.distress_pct)"' | \
  while IFS=$'\t' read -r slug total stuck cry pct; do
    local icon
    icon=$(severity_icon "$pct")
    printf "  %s %-40s  互動 %3s  😵 %2s  😢 %2s  卡關率 %5s%%\n" \
      "$icon" "$slug" "$total" "$stuck" "$cry" "$pct"
  done
}

cmd_alerts() {
  local reactions
  reactions=$(sb_get "article_reactions?select=slug,reaction_type")

  local alerts
  alerts=$(echo "$reactions" | jq -r '
    group_by(.slug) | map({
      slug: .[0].slug,
      total: length,
      stuck: [.[] | select(.reaction_type == "stuck")] | length,
      cry: [.[] | select(.reaction_type == "cry")] | length,
      distress: ([.[] | select(.reaction_type == "stuck" or .reaction_type == "cry")] | length),
      distress_pct: (([.[] | select(.reaction_type == "stuck" or .reaction_type == "cry")] | length) / length * 100 | . * 10 | round / 10)
    }) | [.[] | select(.distress_pct >= 30 or .distress >= 2)] | sort_by(-.distress_pct)
  ')

  local count
  count=$(echo "$alerts" | jq 'length')

  print_header
  print_section "⚠️  卡關警報（卡關率 ≥ 30% 或卡關數 ≥ 2）"

  if [[ "$count" -eq 0 ]]; then
    echo -e "  ${GREEN}🎉 沒有需要注意的文章！${NC}"
    return
  fi

  echo "$alerts" | jq -r '.[] | "\(.slug)\t\(.total)\t\(.stuck)\t\(.cry)\t\(.distress_pct)"' | \
  while IFS=$'\t' read -r slug total stuck cry pct; do
    local icon
    icon=$(severity_icon "$pct")
    printf "  %s %-40s  😵 %2s  😢 %2s  卡關率 %5s%%\n" \
      "$icon" "$slug" "$stuck" "$cry" "$pct"
  done

  echo ""
  echo -e "  ${DIM}💡 建議：前往 /admin/feedback 查看詳細段落分析${NC}"
}

cmd_sections() {
  local target_slug="${1:-}"

  local filter=""
  if [[ -n "$target_slug" ]]; then
    filter="&slug=eq.${target_slug}"
  fi

  local reactions
  reactions=$(sb_get "section_reactions?select=slug,section_id,reaction_type${filter}")

  if [[ "$reactions" == "[]" || -z "$reactions" ]]; then
    print_header
    echo -e "  ${GREEN}沒有段落層級的回饋數據${NC}"
    return
  fi

  local sections
  sections=$(echo "$reactions" | jq -r '
    group_by(.slug + "::" + .section_id) | map({
      slug: .[0].slug,
      section_id: .[0].section_id,
      total: length,
      stuck: [.[] | select(.reaction_type == "stuck")] | length,
      cry: [.[] | select(.reaction_type == "cry")] | length,
      distress: ([.[] | select(.reaction_type == "stuck" or .reaction_type == "cry")] | length),
      distress_pct: (([.[] | select(.reaction_type == "stuck" or .reaction_type == "cry")] | length) / length * 100 | . * 10 | round / 10)
    }) | [.[] | select(.distress > 0)] | sort_by(-.distress, -.distress_pct)
  ')

  print_header
  print_section "📍 段落層級卡關分析"

  local count
  count=$(echo "$sections" | jq 'length')

  if [[ "$count" -eq 0 ]]; then
    echo -e "  ${GREEN}沒有段落層級的卡關回饋${NC}"
    return
  fi

  printf "  ${DIM}%-30s %-25s %4s %4s %7s${NC}\n" "文章" "段落" "😵" "😢" "卡關率"
  echo -e "  ${DIM}$(printf '─%.0s' {1..90})${NC}"

  echo "$sections" | jq -r '.[] | "\(.slug)\t\(.section_id)\t\(.stuck)\t\(.cry)\t\(.distress_pct)"' | \
  while IFS=$'\t' read -r slug section_id stuck cry pct; do
    local icon
    icon=$(severity_icon "$pct")
    printf "  %s %-28s %-23s %4s %4s %6s%%\n" \
      "$icon" "$slug" "$section_id" "$stuck" "$cry" "$pct"
  done
}

cmd_questions() {
  local limit="${1:-20}"

  local questions
  questions=$(sb_get "qa_questions?select=id,slug,section_id,section_title,question,created_at&order=created_at.desc&limit=${limit}")

  print_header
  print_section "💬 最近卡關提問（最新 ${limit} 筆）"

  local count
  count=$(echo "$questions" | jq 'length')

  if [[ "$count" -eq 0 ]]; then
    echo -e "  ${GREEN}目前沒有卡關提問${NC}"
    return
  fi

  echo "$questions" | jq -r '.[] | "\(.created_at)\t\(.slug)\t\(.section_title // "-")\t\(.question)"' | \
  while IFS=$'\t' read -r created_at slug section question; do
    local date_str
    date_str=$(echo "$created_at" | cut -d'T' -f1)
    echo -e "  ${DIM}${date_str}${NC}  ${CYAN}${slug}${NC}"
    if [[ "$section" != "-" ]]; then
      echo -e "           → ${section}"
    fi
    echo -e "           ${question}"
    echo ""
  done
}

cmd_slug() {
  local slug="$1"

  print_header
  echo -e "  🔍 查看文章: ${BOLD}${slug}${NC}"

  # Article reactions
  local reactions
  reactions=$(sb_get "article_reactions?select=reaction_type&slug=eq.${slug}")

  local count
  count=$(echo "$reactions" | jq 'length')

  if [[ "$count" -eq 0 ]]; then
    echo -e "  ${DIM}此文章尚無互動數據${NC}"
  else
    local rocket like stuck cry
    rocket=$(echo "$reactions" | jq '[.[] | select(.reaction_type == "rocket")] | length')
    like=$(echo "$reactions" | jq '[.[] | select(.reaction_type == "like")] | length')
    stuck=$(echo "$reactions" | jq '[.[] | select(.reaction_type == "stuck")] | length')
    cry=$(echo "$reactions" | jq '[.[] | select(.reaction_type == "cry")] | length')

    echo ""
    echo -e "  🚀 ${rocket}  👍 ${like}  😵 ${stuck}  😢 ${cry}  (共 ${count} 則互動)"
  fi

  # Section breakdown
  cmd_sections "$slug"

  # Recent questions for this slug
  local questions
  questions=$(sb_get "qa_questions?select=id,slug,section_title,question,created_at&slug=eq.${slug}&order=created_at.desc&limit=10")

  local q_count
  q_count=$(echo "$questions" | jq 'length')

  if [[ "$q_count" -gt 0 ]]; then
    print_section "💬 相關提問"
    echo "$questions" | jq -r '.[] | "\(.created_at)\t\(.section_title // "-")\t\(.question)"' | \
    while IFS=$'\t' read -r created_at section question; do
      local date_str
      date_str=$(echo "$created_at" | cut -d'T' -f1)
      echo -e "  ${DIM}${date_str}${NC}  ${question}"
    done
  fi
}

cmd_watch() {
  local interval="${1:-60}"

  echo -e "${BOLD}📡 監控模式啟動（每 ${interval} 秒刷新，Ctrl+C 停止）${NC}"
  echo ""

  while true; do
    clear
    cmd_overview false
    echo ""
    echo -e "${DIM}  下次刷新: ${interval} 秒後 (Ctrl+C 停止)${NC}"
    sleep "$interval"
  done
}

cmd_help() {
  echo ""
  echo -e "${BOLD}LaunchDock 回饋監控 CLI${NC}"
  echo ""
  echo "用法:"
  echo "  ./scripts/feedback-monitor.sh              顯示總覽"
  echo "  ./scripts/feedback-monitor.sh --alerts     只顯示需要注意的文章"
  echo "  ./scripts/feedback-monitor.sh --sections   顯示段落層級卡關"
  echo "  ./scripts/feedback-monitor.sh --questions   顯示最近卡關提問"
  echo "  ./scripts/feedback-monitor.sh --slug <slug> 查看特定文章"
  echo "  ./scripts/feedback-monitor.sh --watch [秒]  持續監控"
  echo "  ./scripts/feedback-monitor.sh --json       JSON 輸出"
  echo "  ./scripts/feedback-monitor.sh --help       顯示幫助"
  echo ""
  echo "環境變數:"
  echo "  SUPABASE_URL         Supabase 專案 URL"
  echo "  SUPABASE_SERVICE_KEY Supabase service role key"
  echo "  或在 .env 中設定 PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY"
  echo ""
  echo "管理後台:"
  echo "  瀏覽器開啟 /admin/feedback 查看視覺化儀表板"
  echo ""
}

# ============================================================
# Main
# ============================================================
case "${1:-}" in
  --alerts)    cmd_alerts ;;
  --sections)  cmd_sections "${2:-}" ;;
  --questions) cmd_questions "${2:-20}" ;;
  --slug)
    if [[ -z "${2:-}" ]]; then
      echo -e "${RED}錯誤：請指定文章 slug${NC}"
      echo "用法: ./scripts/feedback-monitor.sh --slug <slug>"
      exit 1
    fi
    cmd_slug "$2"
    ;;
  --watch)     cmd_watch "${2:-60}" ;;
  --json)      cmd_overview true ;;
  --help|-h)   cmd_help ;;
  "")          cmd_overview false ;;
  *)
    echo -e "${RED}未知選項: $1${NC}"
    cmd_help
    exit 1
    ;;
esac
