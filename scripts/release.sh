#!/usr/bin/env bash
set -e
/Users/ghogue/Desktop/CaliberVaultII/scripts/pipeline.sh
/Users/ghogue/Desktop/CaliberVaultII/scripts/famous-memo.sh
latest=$(ls -t /Users/ghogue/Desktop/CaliberVaultII/test-artifacts/famous-memo.*.md | head -n1)
echo "Latest memo: $latest"
command -v pbcopy >/dev/null 2>&1 && pbcopy < "$latest" && echo "(Memo copied to clipboard)"
command -v open   >/dev/null 2>&1 && open "$latest" || true
