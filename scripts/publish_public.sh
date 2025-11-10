#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/test-artifacts"
mkdir -p "$LOG_DIR"

ts() { date +"%Y-%m-%d %H:%M:%S"; }

echo "$(ts) [publish] start" | tee -a "$LOG_DIR/publish.log"

cd "$REPO_ROOT"

git remote add public git@github.com:geraldlhogue/CaliberVaultII-public.git 2>/dev/null || true
git remote set-url public git@github.com:geraldlhogue/CaliberVaultII-public.git

export GIT_TERMINAL_PROMPT=0
export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/CaliberVaultII -o IdentitiesOnly=yes"
ssh -T git@github.com || true

git add -A
CHANGES="$(git status --porcelain | wc -l | tr -d ' ')"
if [ "$CHANGES" != "0" ]; then
  git commit -m "Automated overlay+test publish ($(date -u +'%Y-%m-%dT%H:%M:%SZ'))"
fi

git push public HEAD:main
echo "$(ts) [publish] pushed to public: main" | tee -a "$LOG_DIR/publish.log"
echo "$(ts) [publish] done" | tee -a "$LOG_DIR/publish.log"
