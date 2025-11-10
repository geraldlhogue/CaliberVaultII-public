set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
out_v="$LOG/vitest.out.txt"
out_t="$LOG/tsc.out.txt"
mkdir -p "$LOG"
ts(){ date +"%Y-%m-%d %H:%M:%S"; }

echo "$(ts) [tests] start" | tee -a "$LOG/tests.log"
cd "$ROOT"
rm -rf "$ROOT/.vitest" "$ROOT/.vite" "$ROOT/node_modules/.vitest" "$ROOT/node_modules/.vite" "$ROOT/coverage" || true

echo "$(ts) [deps] installing" | tee -a "$LOG/tests.log"
npm config set fund false
npm config set audit false
npm config set progress false
if [ -f package-lock.json ]; then npm ci --loglevel=warn; else npm install --loglevel=warn; fi

echo "$(ts) [tsc] checking" | tee -a "$LOG/tests.log"
set +e
tsc -p "$ROOT/commons.json" --noEmit > "$out_t" 2>&1
set -e

echo "$(ts) [vitest] starting" | tee -a "$LOG/tests.log"
rm -f "$out_v"
( npx vitest run -c "$ROOT/vitest.override.ts" --reporter=verbose | tee "$out_v" ) &
VPID=$!

while kill -0 "$VPID" 2>/dev/null; do
  printf "%s [heartbeat] " "$(date '+%H:%M:%S')"
  tail -n1 "$out_v" 2>/dev/null || true
  sleep 15
done

wait "$VPID"; RC=$?
echo "$(ts) [vitest] exit=$RC" | tee -a "$LOG/tests.log"
echo "$(ts) [tests] done"       | tee -a "$LOG/tests.log"
exit 0
