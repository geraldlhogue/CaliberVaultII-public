#!/usr/bin/env bash
set -euo pipefail

OVERLAY_DIR="${1:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/test-artifacts"
mkdir -p "$LOG_DIR"

ts() { date +"%Y-%m-%d %H:%M:%S"; }

echo "$(ts) [pipeline] start OVERLAY_DIR='$OVERLAY_DIR'" | tee -a "$LOG_DIR/pipeline.log"

bash -x "$REPO_ROOT/scripts/overlay_with_logging.sh" "$OVERLAY_DIR" | tee "$LOG_DIR/overlay.trace.txt"
bash -x "$REPO_ROOT/scripts/run_all_tests.sh"        | tee "$LOG_DIR/run_all_tests.trace.txt"
bash -x "$REPO_ROOT/scripts/publish_public.sh"       | tee "$LOG_DIR/publish.trace.txt"
bash -x "$REPO_ROOT/scripts/verify_public.sh"        | tee "$LOG_DIR/verify.trace.txt"

echo "$(ts) [pipeline] done" | tee -a "$LOG_DIR/pipeline.log"
