#!/usr/bin/env zsh
set -e
REPO="/Users/ghogue/Desktop/CaliberVaultII"
cd "$REPO"
npm ci
rm -rf node_modules/.vitest node_modules/.vite .vitest .vite coverage || true
mkdir -p test-artifacts
npx tsc -p tsconfig.json --noEmit > test-artifacts/tsc.out.txt 2>&1 || true
npx vitest run -c vitest.override.ts --reporter=verbose > test-artifacts/vitest.out.txt 2>&1 || echo "Vitest failed to start; see above" >> test-artifacts/vitest.out.txt
