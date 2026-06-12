#!/usr/bin/env bash
# compress-images.sh
# Resizes and compresses all product images using ImageMagick.
#
# Requirements: ImageMagick (https://imagemagick.org)
#   macOS:  brew install imagemagick
#   Ubuntu: sudo apt-get install imagemagick
#   Windows (Git Bash): install from https://imagemagick.org/script/download.php
#
# Usage (from project root):
#   bash compress-images.sh
#
# What it does:
#   - Finds all .jpg/.jpeg/.png files under images/products/
#   - Resizes to max 800px wide (preserves aspect ratio; never upscales)
#   - Re-encodes at quality 82 (good balance of size vs. quality)
#   - Strips EXIF metadata to save extra bytes
#   - Overwrites files in-place (back up first if needed)

set -euo pipefail

# ── Config ──────────────────────────────────────────────────
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/images/products"
MAX_W=800
QUALITY=82
# ────────────────────────────────────────────────────────────

# Check ImageMagick is available
if ! command -v convert &>/dev/null; then
  echo "Error: ImageMagick 'convert' not found."
  echo ""
  echo "Install it first:"
  echo "  macOS:   brew install imagemagick"
  echo "  Ubuntu:  sudo apt-get install imagemagick"
  echo "  Windows: https://imagemagick.org/script/download.php"
  exit 1
fi

if [ ! -d "$DIR" ]; then
  echo "Error: Directory not found: $DIR"
  echo "Run this script from the project root."
  exit 1
fi

echo "======================================"
echo " Tekton India — Image Compressor"
echo "======================================"
echo "Source:    $DIR"
echo "Max width: ${MAX_W}px"
echo "Quality:   ${QUALITY}"
echo "--------------------------------------"

count=0
saved_total=0

while IFS= read -r -d '' file; do
  # Get file size before (cross-platform: try macOS stat, then GNU stat)
  before=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

  convert "$file" \
    -resize "${MAX_W}x>" \
    -quality "$QUALITY" \
    -strip \
    "$file"

  after=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

  saved=$((before - after))
  saved_total=$((saved_total + saved))
  count=$((count + 1))

  # Relative path for cleaner output
  rel="${file#$DIR/}"
  printf "  %-48s %6d → %6d bytes" "$rel" "$before" "$after"
  if [ "$saved" -gt 0 ]; then
    printf "  (-%d)\n" "$saved"
  else
    printf "\n"
  fi
done < <(find "$DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | sort -z)

echo "--------------------------------------"
echo "Done. Processed $count image(s)."
if [ "$saved_total" -gt 0 ]; then
  echo "Total saved: ${saved_total} bytes ($(( saved_total / 1024 )) KB)"
fi
echo ""
echo "Next step: upload images/ to GoDaddy File Manager."
