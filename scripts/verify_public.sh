set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RAW="https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main"
echo "[verify] start"
for u in "$RAW/src/test/vitest.setup.ts" "$RAW/vitest.override.ts" "$RAW/test-artifacts/tsc.out.txt" "$RAW/test-artifacts/vitest.out.txt"; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$u")
  echo "[verify] $c $u"
done
echo "[verify] done"
