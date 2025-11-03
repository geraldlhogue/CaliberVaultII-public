#!/usr/bin/env bash
set -euo pipefail
REPO="/Users/ghogue/Library/CloudStorage/OneDrive-InsightfulOutcomes,LLC/IS-LTD/APPS/CaliberVaultII"
cd "$REPO"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "feature/famous-drop-20251101-1631" ]; then
  git checkout feature/famous-drop-20251101-1631 || git checkout -b feature/famous-drop-20251101-1631
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
fi

git add src/test/setup.ts src/lib/formatters.ts TEST_SETUP_FIX_NOV2_2024.md 2>/dev/null || true
git commit -m "test(setup): comprehensive mocks + doc; keep formatter fixes" || true

[ -f package-lock.json ] && npm install || npm install
npx playwright install || true

mkdir -p artifacts
export NODE_ENV=test

npm run test --silent > artifacts/unit-log.txt 2>&1 || true
npx vitest run --reporter=json > artifacts/unit-vitest.json 2>&1 || true
grep -E "^(FAIL|●|✕|×|Error|TypeError|ReferenceError|AssertionError)" artifacts/unit-log.txt | tail -n 400 > artifacts/unit-fail-summary.txt || true

npm run test:coverage || true
[ -d coverage ] && zip -r artifacts/coverage-html.zip coverage >/dev/null 2>&1 || true

git add -f artifacts/unit-log.txt artifacts/unit-vitest.json artifacts/unit-fail-summary.txt artifacts/coverage-html.zip 2>/dev/null || true
git commit -m "chore(test): publish CI artifacts on ${BRANCH}" || true

git push -u origin "${BRANCH}" || git push -u origin "${BRANCH}" --force-with-lease
git remote | grep -q '^public$' || git remote add public git@github.com:geraldlhogue/CaliberVaultII-public.git
git push -u public "${BRANCH}" || git push -u public "${BRANCH}" --force-with-lease

echo "Branch URL:"
echo "https://github.com/geraldlhogue/CaliberVaultII-public/tree/${BRANCH}"
echo "Unit log (raw):"
echo "https://github.com/geraldlhogue/CaliberVaultII-public/raw/refs/heads/${BRANCH}/artifacts/unit-log.txt"
echo "Failure summary:"
echo "https://github.com/geraldlhogue/CaliberVaultII-public/blob/${BRANCH}/artifacts/unit-fail-summary.txt"
echo "Vitest JSON:"
echo "https://github.com/geraldlhogue/CaliberVaultII-public/raw/refs/heads/${BRANCH}/artifacts/unit-vitest.json"
echo "Coverage ZIP (if present):"
echo "https://github.com/geraldlhogue/CaliberVaultII-public/blob/${BRANCH}/artifacts/coverage-html.zip"
