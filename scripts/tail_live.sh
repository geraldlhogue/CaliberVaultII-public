set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
tail -n +1 -f test-artifacts/pipeline.log test-artifacts/tests.log test-artifacts/vitest.out.txt | sed -u 's/[^[:print:]\t]//g'
