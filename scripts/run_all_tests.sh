#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
OUT_V="$LOG/vitest.out.txt"
OUT_T="$LOG/tsc.out.txt"
mkdir -p "$LOG"
echo "$(date '+%F %T') [tests] start" | tee -a "$LOG/tests.log"
cd "$ROOT"
rm -rf .vitest .vite node_modules/.vitest node_modules/.vite coverage || true
echo "$(date '+%F %T') [deps] installing" | tee -a "$LOG/tests.log"
npm config set fund false
npm config set audit false
npm config set progress false
if [ -f package-lock.json ]; then npm ci --loglevel=warn; else npm install --loglevel=warn; fi
echo "$(date '+%F %T') [tsc] checking" | tee -a "$LOG/tests.log"
set +e
tsc -b >"$OUT_T" 2>&1 || tsc -p "$ROOT/commons.json" >"$OUT_T" 2>&1
set -e
echo "$(date '+%F %T') [vitest] running" | tee -a "$LOG/tests.log"
set +e
npx vitest run -c "$ROOT/vitest.override.ts" --reporter=verbose | tee "$OUT_V"
RC=${PIPESTATUS[0]}
set -e
echo "$(date '+%F %T') [vitest] exit=$RC" | tee -a "$LOG/tests.log"
exit "$RC"
