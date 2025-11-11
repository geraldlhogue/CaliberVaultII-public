set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -rf .vitest .vite node_modules/.vitest node_modules/.vite coverage
npm ci --loglevel=warn
rm -f test-artifacts/vitest.out.txt
( npx vitest run -c vitest.override.ts --reporter=verbose | tee test-artifacts/vitest.out.txt )
