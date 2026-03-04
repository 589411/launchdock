#!/usr/bin/env python3
"""單獨檢測一張圖片並顯示詳細 OCR 結果"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path.home() / "Documents/github/auto-capture"))

from auto_capture.redact import redact_image, _ocr_image
from auto_capture.config import RedactConfig

# 檢測第一張圖片
image_path = Path("public/images/articles/ollama-openclaw/026.png")

print(f"🔍 檢測圖片: {image_path}")
print("=" * 70)

# 先執行 OCR 看看能識別什麼
print("\n📝 OCR 識別結果（原始文字）：\n")
ocr_results, (img_w, img_h) = _ocr_image(image_path)

for i, result in enumerate(ocr_results, 1):
    print(f"  [{i}] {result['text']}")

print(f"\n共識別到 {len(ocr_results)} 段文字")
print("=" * 70)

# 再用 redact 檢測敏感資訊
print("\n🔒 敏感資訊檢測：\n")

config = RedactConfig(enabled=True)

import tempfile
with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
    tmp_path = Path(tmp.name)

_, regions = redact_image(image_path, config, tmp_path)
tmp_path.unlink()

if regions:
    print(f"  ⚠️  發現 {len(regions)} 個敏感區域：")
    for region in regions:
        print(f"     - {region.pattern_name}: {region.matched_text}")
else:
    print("  ✅ 未偵測到敏感資訊")
    print("\n💡 可能原因：")
    print("     1. OCR 未正確識別文字")
    print("     2. 模式匹配規則未涵蓋此類資訊")
    print("     3. 文字格式不符合預期模式")
