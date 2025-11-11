#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
STAMP="$(date +%s)"
RAW="https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main"
OUT="$LOG/verify.$STAMP.log"
mkdir -p "$LOG"
echo "[verify] start" | tee -a "$OUT"
for u in "$RAW/src/test/vitest.setup.ts" "$RAW/vitest.override.ts" "$RAW/test-artifacts/vitest.out.txt"; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$u")
  echo "[verify] $c $u" | tee -a "$OUT"
done
echo "[verify] done" | tee -a "$OUT"
