#!/usr/bin/env bash
set -euo pipefail
OV="${1:?Usage: $0 /path/to/OV}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
mkdir -p "$LOG"
echo "$(date '+%F %T') [pipeline] start OV=$OV" | tee -a "$LOG/pipeline.log"
bash "$ROOT/scripts/overlay_with_logging.sh" "$OV" | tee "$LOG/overlay.$(date +%s).log"
if bash "$ROOT/scripts/run_all_tests.sh" | tee "$LOG/run.$(date +%s).log"; then
  bash "$ROOT/scripts/publish_public.sh" | tee "$LOG/publish.$(date +%s).log"
  bash "$ROOT/scripts/verify_public.sh"  | tee "$LOG/verify.$(date +%s).log"
  echo "$(date '+%F %T') [pipeline] done (published)" | tee -a "$LOG/pipeline.log"
else
  echo "$(date '+000') [pipeline] tests failed — not publishing. See $LOG/vitest.out.txt" | tee -a "$LOG/pipeline.log"
  exit 1
fi
