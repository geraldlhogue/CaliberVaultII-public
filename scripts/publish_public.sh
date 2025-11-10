set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
echo "[publish] start" | tee -a "$LOG/publish.log"
cd "$ROOT"
git add -A
git commit -m "Automated publish $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
git remote add public git@github.com:geraldlhogue/CaliberVaultII-public.git 2>/dev/null || true
git remote set-url public git@github.com:geraldlhogue/CaliberVaultII-public.git
export GIT_TERMINAL_PROMPT=0
export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/CaliberVaultII -o IdentitiesOnly=yes"
ssh -T git@github.com || true
git push -u public HEAD:main | tee -a "$LOG/publish.log" || true
echo "[publish] pushed" | tee -a "$LOG/publish.log"
