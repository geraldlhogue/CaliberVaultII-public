#!/usr/bin/env zsh
set -e
REPO="/Users/ghogue/Desktop/CaliberVaultII"
DROP="${1:-/Users/ghogue/Desktop/CaliberVaultII-Update-Nov-1}"
cd "$REPO"
mkdir -p artifacts
tar -czf ~/Desktop/CaliberVaultII.backup.tgz .
rsync -avni "$DROP/" . > artifacts/overlay.dryrun.txt
rsync -avi "$DROP/" . > artifacts/overlay.applied.txt
git status -sb > artifacts/git_status_after_overlay.txt
git diff --name-status > artifacts/git_diff_name_status.txt || true
