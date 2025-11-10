set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -rf .vitest .vite node_modules/.vitest node_modules/.vite coverage
npm ci --loglevel=warn
rm -f test-artifacts/vitest.out.txt
( npx vitest run -c vitest.override.ts --reporter=verbose | tee test-artifacts/vitest.out.txt ) &
VPID=$!
while kill -0 "$VPID" 2>/dev/null; do
  printf "%s [heartbeat] " "$(date '+%H:%M:%S')"
  tail -n1 test-artifacts/vitest.out.txt 2>/dev/null || true
  sleep 15
done
wait "$VPID"
