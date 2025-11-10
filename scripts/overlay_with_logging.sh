#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${1:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/test-artifacts"
mkdir -p "$LOG_DIR"

ts() { date +"%Y-%m-%d %H:%M:%S"; }

echo "$(ts) [overlay] start SRC_DIR='$SRC_DIR'" | tee -a "$LOG_DIR/overlay.log"

if [ -z "$SRC_DIR" ] || [ ! -d "$SRC_DIR" ]; then
  echo "$(ts) [overlay] overlay directory missing; skipping copy" | tee -a "$LOG_DIR/overlay.log"
  exit 0
fi

COUNT="$(find "$SRC_DIR" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/test-artifacts/*' | wc -l | tr -d ' ')"
echo "$(ts) [overlay] files to overlay: $COUNT" | tee -a "$LOG_DIR/overlay.log"
if [ "$COUNT" = "0" ]; then
  echo "$(ts) [overlay] overlay directory empty; skipping copy" | tee -a "$LOG_DIR/overlay.log"
  exit 0
fi

find "$SRC_DIR" -maxdepth 2 -type f \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/test-artifacts/*' \
  | head -n 50 | sed 's/^/  [overlay] /' | tee -a "$LOG_DIR/overlay.log"

rsync -a \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'test-artifacts' \
  "$SRC_DIR"/ "$REPO_ROOT"/ | tee -a "$LOG_DIR/overlay.log"

git -C "$REPO_ROOT" add -A
git -C "$REPO_ROOT" status --porcelain > "$LOG_DIR/overlay.diff.txt" || true
echo "$(ts) [overlay] wrote $LOG_DIR/overlay.diff.txt" | tee -a "$LOG_DIR/overlay.log"
echo "$(ts) [overlay] done" | tee -a "$LOG_DIR/overlay.log"
