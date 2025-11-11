#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
STAMP="$(date +%s)"
echo "[publish] start" | tee -a "$LOG/publish.$STAMP.log"
cd "$ROOT"
git add -A
git commit -m "Automated publish $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
git remote add public ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git 2>/dev/null || true
git remote set-url public ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git
export GIT_TERMINAL_PROMPT=0
export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/CaliberVaultII -o IdentitiesOnly=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=6 -o TCPKeepAlive=yes -p 443"
git push -v public HEAD:main || true
echo "[publish] pushed" | tee -a "$LOG/publish.$STAMP.log"
