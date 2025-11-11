#!/usr/bin/env bash
set -euo pipefail
OV="${1:?Usage: pipeline_publish_always.sh /path/to/OV}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
mkdir -p "$LOG"
echo "$(date '+%F %T') [pipeline] start OV=$OV" | tee -a "$LOG/pipeline.log"
bash "$ROOT/scripts/overlay_with_logging.sh" "$OV" | tee "$LOG/overlay.$(date +%s).log" || true
bash "$ROOT/scripts/run_all_tests.sh"           | tee "$LOG/run.$(date +%s).log" || true
bash "$ROOT/scripts/publish_public.sh"          | tee "$LOG/publish.$(date +%s).log" || true
bash "$ROOT/scripts/verify_public.sh"           | tee "$LOG/verify.$(date +%s).log" || true
bash "$ROOT/scripts/sync_check.sh"              | tee "$LOG/sync.$(date +%s).log" || true
echo "$(date '+%F %T') [pipeline] done (published)" | tee -a "$LOG/pipeline.log"
