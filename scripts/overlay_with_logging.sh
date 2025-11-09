#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${1:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/test-artifacts"
mkdir -p "$LOG_DIR"

ts() { date +"%Y-%m-%d %H:%M:%S"; }

echo "$(ts) [overlay] start SRC_DIR='$SRC_DIR'" | tee -a "$LOG_DIR/overlay.log"

if [ -z "$SRC_DIR" ] || [ ! -d "$SRC_DIR" ]; then
  echo "$(ts) [overlay] no overlay directory; skipping" | tee -a "$LOG_DIR/overlay.log"
  exit 0
fi

HAS_FILES="$(find "$SRC_DIR" -type f -not -path '*/\.*' -print -quit || true)"
if [ -z "$HAS_FILES" ]; then
  echo "$(ts) [overlay] directory is empty; skipping" | tee -a "$LOG_DIR/overlay.log"
  exit 0
fi

echo "$(ts) [overlay] listing sources (first 50):" | tee -a "$LOG_DIR/overlay.log"
find "$SRC_DIR" -type f \
  -not -path '*/\.*' \
  -not -path '*/node_modules/*' \
  -not -path '*/test-artifacts/*' \
  | head -n 50 | tee -a "$LOG_DIR/overlay.log"

rsync -a --delete-before \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'test-artifacts' \
  "$SRC_DIR"/ "$REPO_ROOT"/ | tee -a "$LOG_DIR/overlay.log"

set +e
git -C "$REPO_ROOT" add -A
git -C "$REPO_ROOT" status --porcelain > "$LOG_DIR/overlay.diff.txt"
echo "$(ts) [overlay] wrote $LOG_DIR/overlay.diff.txt" | tee -a "$LOG_DIR/overlay.log"
set -e

echo "$(ts) [overlay] done" | tee -a "$LOG_DIR/overlay.log"
