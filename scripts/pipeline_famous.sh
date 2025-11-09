#!/usr/bin/env zsh
set -e
REPO="/Users/ghogue/Desktop/CaliberVaultII"
DROP="${1:-/Users/ghogue/Desktop/CaliberVaultII-Update-Nov-1}"
"$REPO/scripts/overlay_famous.sh" "$DROP"
"$REPO/scripts/run_tests_and_logs.sh"
"$REPO/scripts/publish_public.sh"
