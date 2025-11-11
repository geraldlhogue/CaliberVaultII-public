set -euo pipefail
OV="${1:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
mkdir -p "$LOG"
echo "[pipeline] start OV=$OV" | tee -a "$LOG/pipeline.log"
node "$ROOT/scripts/ornaments.js" >/dev/null 2>&1 || true
node "$ROOT/scripts/overlay_with_logging.mjs" "$OV" | tee "$LOG/overlay.$(date +%s).log"
bash -e "$ROOT/scripts/run_all_tests.js"       | tee "$LOG/run.$(date +%s).log"
bash -e "$ROOT/scripts/publish_public.sh"      | tee "$LOG/publish.$(date +%s).log"
bash -e "$ROOT/scripts/verify_public.js"       | tee "$LOG/verify.$(date +%s).log"
echo "[pipeline] done" | tee -a "$LOG/pipeline.log"
