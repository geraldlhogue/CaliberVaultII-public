set -euo pipefail
OV="${1:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
mkdir -p "$LOG"
echo "[pipeline] start OV=$OV" | tee -a "$LOG/pipeline.log"

echo "[overlay] start" | tee -a "$LOG/overlay.log"
rsync -a --stats --prune-empty-dirs --exclude '.git' --exclude 'node_modules' --exclude 'test-artifacts' --exclude '.bak' "$OV"/ "$ROOT"/ | tee -a "$LOG/overlay.log"
git -C "$ROOT" add -A
git -C "$ROOT" status --porcelain > "$LOG/overlay.changed.txt" || true
git -C "$ROOT" commit -m "Overlay Famous drop $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
echo "[overlay] done" | tee -a "$LOG/overlay.log"

echo "[deps] installing" | tee -a "$LOG/tests.log"
cd "$ROOT"
npm config set fund false
npm config set audit false
npm config set progress false
if [ -f package-lock.json ]; then npm ci --loglevel=warn; else npm install --loglevel=warn; fi

echo "[tsc] checking" | tee -a "$LOG/tests.log"
set +e
tsc -p "$ROOT/commons.json" --noEmit > "$LOG/tsc.out.txt" 2>&1
set -e

echo "[vitest] starting" | tee -a "$LOG/tests.log"
rm -f "$LOG/vitest.out.txt"
( npx vitest run -c "$ROOT/vitest.override.ts" --reporter=verbose | tee "$LOG/vitest.out.txt" ) &
VPID=$!
while kill -0 "$VPID" 2>/dev/null; do
  printf "%s [heartbeat] " "$(date '+%H:%M:%S')"
  tail -n1 "$LOG/vitest.out.txt" 2>/dev/null || true
  sleep 15
done
wait "$VPID"; RC=$?
echo "[vitest] exit=$RC" | tee -a "$LOG/tests.log"

bash "$ROOT/scripts/publish_strict.sh" | tee -a "$LOG/publish.log"

bash "$ROOT/scripts/verify_public.sh" | tee -a "$LOG/verify.log"

echo "[pipeline] done" | tee -a "$LOG/pipeline.log"
