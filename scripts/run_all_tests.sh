#!/usr/bin/env zsh
set -e
REPO="/Users/ghogue/Desktop/CaliberVaultII"
cd "$REPO"
mkdir -p test-artifacts artifacts
if [ -f "src/test/vitest.setup.ts" ]; then
  if grep -n "pbpaste >" "src/test/vitest.setup.ts" > artifacts/setup_pbpaste_check.txt ; then
    echo "ERROR: vitest.setup.ts still contains pbpaste line" >&2
    exit 1
  else
    head -n 3 "src/test/vitest.setup.ts" > artifacts/setup_head.txt
  fi
else
  echo "ERROR: src/test/vitest.setup.ts missing" >&2
  exit 1
fi
npm ci
rm -rf node_modules/.vitest node_modules/.vite .vitest .vite coverage || true
npx tsc -p tsconfig.json --noEmit > test-artifacts/tsc.out.txt 2>&1 || true
npx vitest run -c vitest.override.ts --reporter=verbose > test-artifacts/vitest.out.txt 2>&1 || echo "Vitest failed to start; see above" >> test-artifacts/vitest.out.txt
grep -E "^(Test Files|Tests|PASS|FAIL|Start|Duration)" test-artifacts/vitest.out.txt > artifacts/test_summary.txt || true
