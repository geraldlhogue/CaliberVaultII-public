set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
OUT_V="$LOG/vitest.out.txt"
OUT_T="$LOG/tsc.out.txt"
mkdir -p "$LOG"
date +"%Y-%m-%d %H:%M:%S" | sed 's/.*/[tests] start &/' | tee -a "$LOG/tests.log"
cd "$ROOT"
rm -rf "$ROOT/.vitest" "$ROOT/.vite" "$ROOT/node_modules/.vitest" "$ROOT/node_modules/.vite" "$ROOT/coverage" || true
echo "[deps] installing" | tee -a "$LOG/tests.log"
npm config set fund false
npm config set audit false
npm config set progress false
if [ -f package-lock.json ]; then npm ci --loglevel=warn; else npm install --loglevel=warn; fi
echo "[tsc] checking" | tee -a "$LOG/tests.log"
set +e
tsc -b || tsc -p "$ROOT/commons.json"
set -e
echo "[vitest] starting" | tee -a "$LOG/tests.log"
rm -f "$OUT_V"
(
  while true; do
    if pgrep -f "node .*vitest" >/dev/null 2>&1; then
      printf "%s [heartbeat] " "$(date '+%H:%M:%S')" >> "$LOG/tests.log"
      tail -n1 "$OUT_V" >> "$LOG/tests.log" 2>/dev/null || true
    fi
    sleep 15
  done
) &
HB=$!
npx vitest run -c "$ROOT/vitest.override.ts" --reporter=verbose | tee "$OUT_V"; RC=${PIPELINES+0}
kill "$HB" >/dev/null 2>&1 || true
echo "$(date '+%Y-%m-%d %H:%M:%S') [vitest] exit=$RC" | tee -a "$LOG/tests.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') [tests] done" | tee -a "$LOG/tests.log"
exit 0
