set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/test-artifacts"
cd "$ROOT"
echo "[publish] start"
git add -A
git commit -m "Automated publish $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
git remote add public git@github.com:geraldlhogue/CaliberVaultII-public.git 2>/dev/null || true
git remote set-url public git@github.com:geraldlhogue/CaliberVaultII-public.git
export GIT_TERMINAL_PROMPT=0
export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/CaliberVaultII -o IdentitiesOnly=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=6 -o TCPKeepAlive=yes"
git push -v public HEAD:main || true
LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git ls-remote --heads public | awk '/refs\/heads\/main$/{print $1}')"
if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
  echo "[publish] ref mismatch, retrying with force-with-lease"
  git push -v --force-with-lease public HEAD:main
  REMOTE_HEAD="$(git ls-remote --heads public | awk '/refs\/heads\/main$/{print $1}')"
fi
echo "[publish] local=$LOCAL_HEAD"
echo "[publish] remote=$REMOTE_HEAD"
if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
  echo "[publish] failed to update remote head"
  exit 1
fi
LOCAL_SHA="$(shasum -a 256 "$ROOT/test-artifacts/vitest.out.txt" | awk '{print $1}')"
REMOTE_SHA="$(curl -s https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt | shasum -a 256 | awk '{print $1}')"
echo "[publish] vitest.out.txt local_sha=$LOCAL_SHA"
echo "[publish] vitest.out.txt remote_sha=$REMOTE_SHA"
if [ "$LOCAL_SHA" != "$REMOTE_SHA" ]; then
  echo "[publish] artifact sha mismatch"
  exit 1
fi
echo "[publish] ok"
