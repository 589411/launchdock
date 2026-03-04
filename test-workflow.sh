#!/bin/bash
# 測試 article-workflow.sh 的各個組件

set -e

echo "🧪 測試工作流程腳本組件..."
echo ""

# 測試 1: 檢查腳本存在
echo "✓ 檢查腳本存在"
if [ ! -f "scripts/article-workflow.sh" ]; then
  echo "❌ 找不到 scripts/article-workflow.sh"
  exit 1
fi

# 測試 2: 檢查執行權限
echo "✓ 檢查執行權限"
if [ ! -x "scripts/article-workflow.sh" ]; then
  echo "❌ 腳本沒有執行權限"
  exit 1
fi

# 測試 3: 檢查語法
echo "✓ 檢查語法"
bash -n scripts/article-workflow.sh || {
  echo "❌ 腳本語法錯誤"
  exit 1
}

# 測試 4: 檢查文章目錄
echo "✓ 檢查文章目錄"
if [ ! -d "src/content/articles" ]; then
  echo "❌ 找不到文章目錄"
  exit 1
fi

# 測試 5: 檢查文章數量
echo "✓ 檢查文章數量"
ARTICLE_COUNT=$(ls -1 src/content/articles/*.md 2>/dev/null | wc -l | xargs)
echo "  發現 $ARTICLE_COUNT 篇文章"

# 測試 6: 檢查 public/images 目錄
echo "✓ 檢查 public/images 目錄"
if [ ! -d "public/images/articles" ]; then
  echo "⚠️  警告：public/images/articles 目錄不存在，將創建"
  mkdir -p public/images/articles
fi

# 測試 7: 檢查 check_sensitive_images.py
echo "✓ 檢查敏感資訊檢測腳本"
if [ ! -f "check_sensitive_images.py" ]; then
  echo "❌ 找不到 check_sensitive_images.py"
  exit 1
fi

# 測試 8: 檢查 Python
echo "✓ 檢查 Python"
if ! command -v python3 &> /dev/null; then
  echo "❌ 找不到 Python 3"
  exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo "  $PYTHON_VERSION"

# 測試 9: 檢查 auto-capture（可選）
echo "✓ 檢查 auto-capture（可選）"
if command -v auto-capture &> /dev/null; then
  AUTO_CAPTURE_VERSION=$(auto-capture --version 2>&1 | head -1 || echo "unknown")
  echo "  ✓ 已安裝 auto-capture: $AUTO_CAPTURE_VERSION"
else
  echo "  ⚠️  未安裝 auto-capture（可選，但建議安裝）"
fi

# 測試 10: 檢查文檔
echo "✓ 檢查文檔"
for doc in "docs/article-workflow-guide.md" "docs/image-workflow.md" "QUICK_REFERENCE.md"; do
  if [ -f "$doc" ]; then
    echo "  ✓ $doc"
  else
    echo "  ⚠️  缺少 $doc"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 所有測試通過！"
echo ""
echo "🚀 可以開始使用工作流程："
echo "   ./scripts/article-workflow.sh"
echo ""
echo "📖 或查看快速參考："
echo "   cat QUICK_REFERENCE.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
