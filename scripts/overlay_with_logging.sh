#!/usr/bin/env bash
set -euo pipefail
SRC="${1:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
mkdir -p "$LOG"
ts(){ date "+%F %T"; }
echo "$(ts) [overlay] start SRC=$SRC" | tee -a "$LOG/overlay.log"
if [ -z "$SRC" ] || [ ! -d "$SRC" ]; then
  echo "$(ts) [overlay] missing or invalid SRC" | tee -a "$LOG/overlay.log"
  exit 0
fi
COUNT=$(find "$SRC" -type f ! -path '*/.git/*' ! -path '*/node_modules/*' ! -path '*/test-artifacts/*' | wc -l | tr -d ' ')
echo "$(ts) [overlay] files=$COUNT" | tee -a "$LOG/overlay.log"
find "$SRC" -maxdepth 2 -type f ! -path '*/.git/*' ! -path '*/node_modules/*' ! -path '*/test-artifacts/*' | head -n 40 | sed 's#^#  [overlay] #' | tee -a "$LOG/overlay.log"
rsync -a --stats --prune-empty-dirs --exclude '.git' --exclude 'node_modules' --exclude 'test-artifacts' --exclude '.*.swp' "$SRC"/ "$ROOT"/ | tee -a "$LOG/overlay.log"
git -C "$ROOT" add -A
git -C "$ROOT" status --porcelain > "$LOG/overlay.changed.txt" || true
echo "$(ts) [overlay] done" | tee -a "$LOG/overlay.log"
