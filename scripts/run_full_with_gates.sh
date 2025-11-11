set -euo pipefail
OV="${1:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
mkdir -p "$LOG"
BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
  echo "GATE_FAIL not on main branch"
  exit 1
fi
echo "GATE_OK branch main"
echo "[overlay] start"
rsync -a --stats --prune-empty-dirs --exclude '.git' --exclude 'node_modules' --exclude 'test-artifacts' --exclude '.bak' "$OV"/ "$ROOT"/ | tee -a "$LOG/overlay.log"
git -C "$ROOT" add -A
git -C "$ROOT" commit -m "Overlay drop $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
echo "[overlay] done"
echo "[deps] installing"
cd "$ROOT"
npm config set fund false
npm config set audit false
npm config set progress false
if [ -f package-lock.json ]; then npm ci --loglevel=warn; else npm install --loglevel=warn; fi
echo "[tsc] checking"
set +e
tsc -p "$ROOT/commons.json" --noEmit > "$LOG/tsc.out.txt" 2>&1
set -e
echo "[vitest] starting"
rm -f "$LOG/vitest.out.txt"
( npx vitest run -c "$ROOT/vitest.override.ts" --reporter=verbose | tee "$LOG/vitest.out.txt" ) &
VPID=$!
while kill -0 "$VPID" 2>/dev/null; do
  printf "%s " "$(date '+%H:%M:%S')"
  tail -n1 "$LOG/vitest.out.txt" 2>/dev/null || true
  sleep 15
done
wait "$VPID" || true
bash "$ROOT/scripts/publish_strict.sh" || { echo "GATE_FAIL publish"; exit 1; }
bash "$ROOT/scripts/verify_public.sh" | tee -a "$LOG/verify.log"
echo "GATE_OK publish_and_verify"
