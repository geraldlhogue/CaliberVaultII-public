#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RAW="https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main"
LOCAL_HEAD="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
REMOTE_HEAD="$(git -C "$ROOT" ls-remote --heads public 2>/dev/null | awk '/refs\/heads\/main$/{print $1}' || echo unknown)"
echo "SYNC HEAD local=$LOCAL_HEAD"
echo "SYNC HEAD remote=$REMOTE_HEAD"
if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then echo "SYNC HEAD OK"; else echo "SYNC HEAD MISMATCH"; fi
if [ -f "$ROOT/test-artifacts/vitest.out.txt" ]; then
  LOCAL_SHA="$(shasum -a 256 "$ROOT/test-artifacts/vitest.out.txt" | awk '{print $1}')"
else
  LOCAL_SHA="missing_local_vitest.out.txt"
fi
REMOTE_SHA="$(curl -s "$RAW/test-artifacts/vitest.out.txt" | shasum -a 256 | awk '{print $1}')"
echo "SYNC VITEST local_sha=$LOCAL_SHA"
echo "SYNC VITEST remote_sha=$REMOTE_SHA"
if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then echo "SYNC VITEST OK"; else echo "SYNC VITEST MISMATCH"; fi
