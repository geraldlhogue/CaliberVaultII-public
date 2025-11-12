#!/usr/bin/env bash
set -euo pipefail
REPO=/Users/ghogue/Desktop/CaliberVaultII
RAW=https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main
cd "$REPO"
main_commit=$(git ls-remote --heads public 2>/dev/null | awk '/refs\/heads\/main$/{print $1}')
vitest_sha256=$(curl -s "$RAW/test-artifacts/vitest.out.txt" | shasum -a 256 | awk '{print $1}')
if [ -f test-artifacts/vitest.out.txt ]; then first3=$(head -n 3 test-artifacts/vitest.out.txt); last3=$(tail -n 3 test-artifacts/vitest.out.txt); else first3=$(curl -s "$RAW/test-artifacts/vitest.out.txt" | head -n 3); last3=$(curl -s "$RAW/test-artifacts/vitest.out.txt" | tail -n 3); fi
ts=$(date -u +%Y%m%d%H%M%S)
out="test-artifacts/famous-memo.$ts.md"
{
  echo "Subject: CaliberVaultII — consume these exact, current artifacts (run verified)"
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
  echo "Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt."
  echo
  echo "vitest.out.txt — first 3 lines"
  echo '```'
  echo "$first3"
  echo '```'
  echo
  echo "vitest.out.txt — last 3 lines"
  echo '```'
  echo "$last3"
  echo '```'
  echo
  echo "Notes:"
  echo "- vitest.setup.ts is no longer frozen. If you need changes, include what changed and why in your drop notes; we’ll keep using your harness unless it clearly regresses other suites."
  echo "- Tips for current reds: ensure Supabase builder ops are chainable (double .eq), API mocks return arrays/objects exactly as asserted and reject on error paths, expose auth.getSession/onAuthStateChange, and confirm UI exports (named vs default) match test imports."
} > "$out"
echo "Wrote memo: $out"
