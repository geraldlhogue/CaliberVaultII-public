#!/usr/bin/env zsh
set -e
DROP="${1:-/Users/ghogue/Desktop/CaliberVaultII-Update-Nov-1}"
"/Users/ghogue/Desktop/CaliberVaultII/scripts/overlay_with_logging.sh" "$DROP"
"/Users/ghogue/Desktop/CaliberVaultII/scripts/run_all_tests.sh"
"/Users/ghogue/Desktop/CaliberVaultII/scripts/publish_public.sh"
"/Users/ghogue/Desktop/CaliberVaultII/scripts/verify_public.sh"
