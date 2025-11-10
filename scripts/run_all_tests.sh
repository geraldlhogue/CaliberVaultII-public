#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/test-artifacts"
mkdir -p "$LOG_DIR"

ts() { date +"%Y-%m-%d %H:%M:%S"; }

echo "$(ts) [tests] start" | tee -a "$LOG_DIR/tests.log"

cd "$REPO_ROOT"
rm -rf "$REPO_ROOT/.vitest" "$REPO_ROOT/.vite" "$REPO_ROOT/node_modules/.vitest" "$REPO_ROOT/node_modules/.vite" "$REPO_ROOT/coverage" || true

npm config set fund false
npm config set audit false
npm config set progress false

if [ -f package-lock.json ]; then
  npm ci --loglevel=warn
else
  npm install --loglevel=warn
fi

if command -v tsc >/dev/null 2>&1; then
  set +e
  tsc -p "$REPO_ROOT/tsconfig.json" --noEmit > "$LOG_DIR/tsc.out.txt" 2>&1
  TSC_RC=$?
  set -e
else
  echo "TypeScript compiler not found" > "$LOG_DIR/tsc.out.txt"
  TSC_RC=0
fi

npx vitest run -c vitest.config.ts --reporter=verbose | tee "$LOG_DIR/vitest.out.txt"

echo "$(ts) [tests] done (tsc_rc=$TSC_RC)" | tee -a "$LOG_DIR/tests.log"
exit 0
