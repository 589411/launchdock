#!/usr/bin/env python3
"""檢查 ollama-openclaw 文章圖片中的敏感資訊"""

import sys
from pathlib import Path

# 確保可以 import auto_capture
sys.path.insert(0, str(Path.home() / "Documents/github/auto-capture"))

from auto_capture.redact import redact_image
from auto_capture.config import RedactConfig

image_dir = Path("public/images/articles/ollama-openclaw")
config = RedactConfig(enabled=True)

# 檢查是否要執行遮蔽
redact_mode = "--redact" in sys.argv

print(f"🔍 {'遮蔽' if redact_mode else '掃描'} ollama-openclaw 文章圖片中的敏感資訊...\n")
print("=" * 70)

# 只檢查 PNG 和 JPG 圖片
image_files = sorted(list(image_dir.glob("*.png")) + list(image_dir.glob("*.jpg")) + list(image_dir.glob("*.jpeg")))

total_files = len(image_files)
files_with_sensitive = []

for i, img_path in enumerate(image_files, 1):
    print(f"\n[{i}/{total_files}] {'處理' if redact_mode else '檢查'}: {img_path.name}")
    
    try:
        if redact_mode:
            # 直接遮蔽原圖
            output_path, regions = redact_image(img_path, config, output_path=img_path)
            
            if regions:
                print(f"  🔒 已遮蔽 {len(regions)} 個敏感區域")
                files_with_sensitive.append((img_path.name, regions))
                for region in regions:
                    print(f"     - {region.pattern_name}: {region.matched_text}")
            else:
                print(f"  ✅ 無敏感資訊")
        else:
            # 只檢測，不修改
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
                tmp_path = Path(tmp.name)
            
            output_path, regions = redact_image(img_path, config, tmp_path)
            tmp_path.unlink()
            
            if regions:
                print(f"  ⚠️  發現 {len(regions)} 個敏感區域：")
                files_with_sensitive.append((img_path.name, regions))
                for region in regions:
                    print(f"     - {region.pattern_name}: {region.matched_text}")
            else:
                print(f"  ✅ 無敏感資訊")
            
    except Exception as e:
        print(f"  ❌ 處理失敗: {e}")

print("\n" + "=" * 70)
print(f"\n📊 {'遮蔽' if redact_mode else '檢測'}完成：共 {total_files} 張圖片")
print(f"   - ✅ 安全: {total_files - len(files_with_sensitive)} 張")
print(f"   - {'🔒 已遮蔽' if redact_mode else '⚠️  有敏感資訊'}: {len(files_with_sensitive)} 張")

if files_with_sensitive:
    print(f"\n{'⚠️  已處理的圖片' if redact_mode else '⚠️  需要處理的圖片'}：")
    for filename, regions in files_with_sensitive:
        print(f"\n   {filename}")
        for region in regions:
            print(f"     - {region.pattern_name}: {region.matched_text}")
    
    if not redact_mode:
        print("\n" + "=" * 70)
        print("\n如要自動遮蔽這些敏感資訊，請執行：")
        print("python3 check_sensitive_images.py --redact")
else:
    print("\n✅ 所有圖片都安全！")
