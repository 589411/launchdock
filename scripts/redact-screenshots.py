#!/usr/bin/env python3
"""Redact sensitive info from a folder of screenshots (reverse-article workflow).

Two-pass redaction, matching the LaunchDock security rule:
  1. auto-capture's default OCR patterns (credit cards / API keys / emails / secrets)
  2. AI-vision second pass: mask any OCR text line containing a personal token
     you pass with --mask-text (usernames, hostnames, real names — the default
     regexes DO NOT catch these).
Then a final scan reports whether the folder is clean.

Usage:
  # scan only (no changes), report what would be flagged
  python3 scripts/redact-screenshots.py ~/Desktop/captures/_staging/<slug> --scan

  # redact in place: default patterns + mask lines containing "joseph"/"MacBook"
  python3 scripts/redact-screenshots.py ~/Desktop/captures/_staging/<slug> \
      --mask-text joseph --mask-text MacBook

Input images: <dir>/*.png (and .jpg/.jpeg). With --suffix, reads NN-raw.png and
writes NN-clean.png; otherwise edits files in place.

Requires the auto-capture package (macOS Vision OCR). This script auto-re-execs
under ~/Documents/github/auto-capture/.venv if that venv exists.
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import sys
from pathlib import Path

AUTO_CAPTURE_DIR = Path.home() / "Documents/github/auto-capture"
VENV_PY = AUTO_CAPTURE_DIR / ".venv/bin/python"


def _ensure_deps():
    """Re-exec under the auto-capture venv if auto_capture isn't importable.

    Uses an env sentinel (not interpreter-path comparison) because on macOS a
    venv built on the CommandLineTools python resolves to the same binary as
    /usr/bin/python3, yet only the venv has the deps on its path.
    """
    sys.path.insert(0, str(AUTO_CAPTURE_DIR))
    try:
        import auto_capture.redact  # noqa: F401
        return
    except ImportError:
        pass
    if VENV_PY.exists() and not os.environ.get("_REDACT_REEXEC"):
        os.environ["_REDACT_REEXEC"] = "1"
        os.execv(str(VENV_PY), [str(VENV_PY), *sys.argv])
    sys.exit(
        "❌ 找不到 auto-capture 套件。請先安裝：\n"
        f"   git clone https://github.com/589411/auto-capture.git {AUTO_CAPTURE_DIR}\n"
        f"   cd {AUTO_CAPTURE_DIR} && python3 -m venv .venv && .venv/bin/pip install -e ."
    )


def main() -> int:
    _ensure_deps()
    from auto_capture.redact import (
        _apply_mosaic,
        _bbox_to_pixels,
        _ocr_image,
        SensitiveRegion,
        redact_image,
    )
    from auto_capture.config import DEFAULT_REDACT_PATTERNS, RedactConfig
    from PIL import Image

    ap = argparse.ArgumentParser(description="Redact screenshots for LaunchDock articles")
    ap.add_argument("dir", type=Path, help="folder of screenshots")
    ap.add_argument("--mask-text", action="append", default=[],
                    help="personal token; any OCR line containing it gets mosaicked "
                         "(repeatable, case-insensitive)")
    ap.add_argument("--scan", action="store_true", help="scan only, do not modify images")
    ap.add_argument("--suffix", action="store_true",
                    help="read NN-raw.png, write NN-clean.png (default: edit in place)")
    ap.add_argument("--block-size", type=int, default=14, help="mosaic block size")
    args = ap.parse_args()

    stage: Path = args.dir
    if not stage.is_dir():
        return print(f"❌ 找不到資料夾：{stage}") or 1

    pat = "*-raw.png" if args.suffix else "*.png"
    imgs = sorted(p for p in stage.glob(pat)
                  if "-clean" not in p.name) + \
        sorted(stage.glob("*.jpg")) + sorted(stage.glob("*.jpeg"))
    if not imgs:
        return print(f"❌ {stage} 內沒有圖片（pattern: {pat}）") or 1

    config = RedactConfig(enabled=True, block_size=args.block_size)
    mask_tokens = [t.lower() for t in args.mask_text]
    total = 0

    print(f"{'🔍 掃描' if args.scan else '🔒 遮蔽'} {len(imgs)} 張圖片"
          f"{'（含人工 token: ' + ', '.join(args.mask_text) + '）' if mask_tokens else ''}\n")

    for src in imgs:
        dst = src.with_name(src.name.replace("-raw", "-clean")) if args.suffix else src
        if not args.scan and args.suffix:
            shutil.copy(src, dst)

        # Pass 1: default patterns (only writes when not --scan)
        regions = []
        if not args.scan:
            _, regions = redact_image(dst if args.suffix else src, config,
                                      output_path=dst)

        # Pass 2: personal-token line masking
        target = dst if (not args.scan and args.suffix) else src
        ocr, (w, h) = _ocr_image(target)
        line_hits = []
        if mask_tokens:
            img = Image.open(target)
            for r in ocr:
                t = r["text"].lower()
                if any(tok in t for tok in mask_tokens):
                    x, y, bw, bh = _bbox_to_pixels(r["bbox"], w, h, padding=6)
                    if bw > 0 and bh > 0:
                        line_hits.append(r["text"])
                        if not args.scan:
                            _apply_mosaic(img, SensitiveRegion(x, y, bw, bh,
                                          "personal_line", ""), args.block_size)
            if not args.scan and line_hits:
                img.save(target)
            img.close()

        n = len(regions) + len(line_hits)
        total += n
        tag = "⚠️ " if (args.scan and n) else ("🔒" if n else "✅")
        print(f"{tag} {src.name}: {n} 區"
              + (f"  {[r.pattern_name for r in regions] + line_hits}" if n else ""))

    print(f"\n📊 {'發現' if args.scan else '遮蔽'} {total} 個敏感區域，共 {len(imgs)} 張")
    if args.scan and total:
        print("➡️  重跑時拿掉 --scan 即會實際遮蔽。")
    elif not total:
        print("✅ 全部 clean。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
