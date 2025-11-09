#!/usr/bin/env zsh
set -e
REPO="/Users/ghogue/Desktop/CaliberVaultII"
DROP="${1:-/Users/ghogue/Desktop/CaliberVaultII-Update-Nov-1}"
cd "$REPO"
tar -czf ~/Desktop/CaliberVaultII.backup.tgz .
rsync -av "$DROP/" .
git status -sb
