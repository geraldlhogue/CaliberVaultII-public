#!/usr/bin/env bash
set -euo pipefail
REPO=/Users/ghogue/Desktop/CaliberVaultII
RAW=https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main
cd "$REPO"
main_commit=$(git ls-remote --heads public 2>/dev/null | awk '/refs\/heads\/main$/{print $1}')
vitest_sha256=$(curl -s "$RAW/test-artifacts/vitest.out.txt" | shasum -a 256 | awk '{print $1}')
ts=$(date -u +%Y%m%d%H%M%S)
out="test-artifacts/famous-memo.$ts.md"
local_log="test-artifacts/vitest.out.txt"
work_log="test-artifacts/vitest.out.$ts.parse.txt"
if [ -f "$local_log" ]; then cp "$local_log" "$work_log"; else curl -s "$RAW/test-artifacts/vitest.out.txt" -o "$work_log"; fi
first3=$(head -n 3 "$work_log" || true)
last3=$(tail -n 3 "$work_log" || true)
# Try Vitest summary lines first
files_failed=$(awk '/^Test Files/{for(i=1;i<=NF;i++){if($i=="failed") f=$(i-1)} } END{print (f?f:0)}' "$work_log")
files_passed=$(awk '/^Test Files/{for(i=1;i<=NF;i++){if($i=="passed") p=$(i-1)} } END{print (p?p:0)}' "$work_log")
tests_failed=$(awk '/^Tests/{for(i=1;i<=NF;i++){if($i=="failed") f=$(i-1)} } END{print (f?f:0)}' "$work_log")
tests_passed=$(awk '/^Tests/{for(i=1;i<=NF;i++){if($i=="passed") p=$(i-1)} } END{print (p?p:0)}' "$work_log")
# Fallback: count ✓ / × when summaries are missing
if [ "$tests_failed" -eq 0 ] && [ "$tests_passed" -eq 0 ]; then
  tests_passed=$(grep -E "^[[:space:]]*✓ " "$work_log" | wc -l | tr -d " ")
  tests_failed=$(grep -E "^[[:space:]]*× " "$work_log" | wc -l | tr -d " ")
fi
if [ "$files_failed" -eq 0 ] && [ "$files_passed" -eq 0 ]; then
  files_passed="$tests_passed"
  files_failed="$tests_failed"
fi
prev_stats="test-artifacts/prev.stats"
prev_tests_failed=""
if [ -f "$prev_stats" ]; then prev_tests_failed=$(grep "^tests_failed=" "$prev_stats" | cut -d"=" -f2 || echo ""); fi
if [ -n "$prev_tests_failed" ]; then
  if [ "$tests_failed" -lt "$prev_tests_failed" ]; then delta=$((prev_tests_failed - tests_failed)); status="**Status:** Progress — $delta fewer failing tests than previous run."; elif [ "$tests_failed" -gt "$prev_tests_failed" ]; then delta=$((tests_failed - prev_tests_failed)); status="**Status:** Regression — $delta more failing tests than previous run."; else status="**Status:** No change — failing test count unchanged."; fi
else
  status="**Status:** Baseline — no prior run to compare."
fi
{
  echo "Subject: CaliberVaultII — consume these exact, current artifacts (run verified)"
  echo
  echo "$status"
  echo
  echo "Artifacts:"
  echo "- vitest.setup.ts"
  echo "  $RAW/src/test/vitest.setup.ts"
  echo "- vitest.override.ts"
  echo "  $RAW/vitest.override.ts"
  echo "- vitest.out.txt"
  echo "  $RAW/test-artifacts/vitest.out.txt"
  echo
  echo "Verification values for this run"
  echo "- main commit: $main_commit"
  echo "- vitest.out.txt sha256: $vitest_sha256"
  echo
  echo "Summary counts from this run"
  echo "- Test Files: $files_failed failed | $files_passed passed"
  echo "- Tests: $tests_failed failed | $tests_passed passed"
  echo
  echo "Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt."
  echo
  echo "vitest.out.txt — first 3 lines"
  echo "```"
  echo "$first3"
  echo "```"
  echo
  echo "vitest.out.txt — last 3 lines"
  echo "```"
  echo "$last3"
  echo "```"
  echo
  echo "Notes:"
  echo "- vitest.setup.ts is no longer frozen. If you need changes, include what changed and why in your drop notes; we will keep using your harness unless it clearly regresses other suites."
  echo "- Tips for current reds: confirm InventoryOperations export/import (invalid element), ensure supabase.auth.getSession/onAuthStateChange exist in the same client your StorageService imports, align useSubscription hasFeature/tier to the spec. If cache tests hang, use fake timers or reduce internal delays when NODE_ENV=test."
} > "$out"
printf "tests_failed=%s\n" "$tests_failed" > "$prev_stats"
printf "tests_passed=%s\n" "$tests_passed" >> "$prev_stats"
printf "files_failed=%s\n" "$files_failed" >> "$prev_stats"
printf "files_passed=%s\n" "$files_passed" >> "$prev_stats"
echo "Wrote memo: $out"
