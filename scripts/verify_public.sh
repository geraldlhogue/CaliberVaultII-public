set -euo pipefail
RAW="https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main"
echo "VERIFY_BEGIN"
for u in "$RAW/src/test/vitest.setup.ts" "$RAW/vitest.override.ts" "$RAW/test-artifacts/tsc.out.txt" "$RAW/test-artifacts/vitest.out.txt"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$u")
  echo "VERIFY_URL $code $u"
done
echo "VERIFY_END"
