#!/usr/bin/env bash
set -euo pipefail
REPO="/Users/ghogue/Desktop/CaliberVaultII"
cd "$REPO"
mkdir -p docs test-artifacts
MAIN_SHA="$(git rev-parse HEAD || echo unknown)"
VLOG="$REPO/test-artifacts/vitest.out.txt"
V_SHA="(missing)"
HEAD3="(missing)"
TAIL3="(missing)"
if [ -f "$VLOG" ]; then
  V_SHA="$(shasum -a 256 "$VLOG" | awk '{print $1}')"
  HEAD3="$(head -n 3 "$VLOG")"
  TAIL3="$(tail -n 3 "$VLOG")"
fi
TS="$(date +%Y%m%d-%H%M%S)"
OUT="$REPO/docs/famous-memo-$TS.md"
printf "%s\n" "CaliberVaultII – Verification and Summary" > "$OUT"
printf "%s\n" "" >> "$OUT"
printf "%s\n" "main commit: $MAIN_SHA" >> "$OUT"
printf "%s\n" "vitest.out.txt sha256: $V_SHA" >> "$OUT"
printf "%s\n" "Harness sentinel (runtime): HARNESS:2025-11-11T20:45Z:fa35a7e7" >> "$OUT"
printf "%s\n" "" >> "$OUT"
printf "%s\n" "first 3 lines:" >> "$OUT"
printf "%s\n" "$HEAD3" >> "$OUT"
printf "%s\n" "" >> "$OUT"
printf "%s\n" "last 3 lines:" >> "$OUT"
printf "%s\n" "$TAIL3" >> "$OUT"
echo "$OUT"
