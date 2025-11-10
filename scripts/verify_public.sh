#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/test-artifacts"
mkdir -p "$LOG_DIR"

ts() { date +"%Y-%m-%d %H:%M:%S"; }

URLS=(
  "https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/src/test/vitest.setup.ts"
  "https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/vitest.override.ts"
  "https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/tsc.out.txt"
  "https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt"
)

echo "$(ts) [verify] start" | tee -a "$LOG_DIR/verify.log"

for u in "${URLS[@]}"; do
  code=$(curl -I --max-time 15 -s "$u" | awk 'NR==1{print $2}')
  echo "$(ts) [verify] $code $u" | tee -a "$LOG_DIR/verify.log"
done

echo "$(ts) [verify] done" | tee -a "$LOG_DIR/verify.log"
