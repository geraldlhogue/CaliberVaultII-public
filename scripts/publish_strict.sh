set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
git remote add public ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git 2>/dev/null || true
git remote set-url public ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git
export GIT_TERMINAL_PROMPT=0
export GIT_SSH_COMMAND='ssh -i /Users/ghogue/.ssh/CaliberVaultII -o IdentitiesOnly=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=6 -o TCPKeepAlive=yes -p 443'
git add -A
git commit -m "Automated publish $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
git push -v public HEAD:main || true
LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git ls-remote --heads public | awk '/refs\/heads\/main$/{print $1}')"
if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
  git push -v --force-with-lease public HEAD:main
  REMOTE_HEAD="$(git ls-remote --heads public | awk '/refs\/heads\/main$/{print $1}')"
fi
if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
  echo "PUB_FAIL head_mismatch"
  exit 1
fi
LOCAL_SHA="$(shasum -a 256 "$ROOT/test-artifacts/vitest.out.txt" | awk '{print $1}')"
REMOTE_SHA="$(curl -s https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt | shasum -a 256 | awk '{print $1}')"
if [ "$LOCAL_SHA" != "$REMOTE_SHA" ]; then
  echo "PUB_FAIL sha_mismatch"
  exit 1
fi
echo "PUB_OK $LOCAL_HEAD"
