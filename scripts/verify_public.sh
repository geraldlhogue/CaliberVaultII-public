set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
RAW="https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main"
OUT="$LOG/verify.$(date +%s).log"
mkdir -p "$LOG"
echo "[verify] start" | tee -a "$OUT"
urls=(
  "$RAW/src/test/vitest.setup.ts"
  "$RAW/vitest.override.ts"
  "$RAW/test-artifacts/tsc.out.txt"
  "$RAW/test-artifacts/vitest.out.txt"
)
for u in "${urls[@]}"; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$u")
  echo "[verify] $c $u" | tee -a "$OUT"
done
echo "[verify] done" | tee -a "$OUT"
