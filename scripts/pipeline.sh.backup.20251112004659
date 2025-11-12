#!/usr/bin/env bash
OV=/Users/ghogue/Desktop/CaliberVaultII-From-Famous-Nov-9
REPO=/Users/ghogue/Desktop/CaliberVaultII
cd "$REPO"

mkdir -p src/test test-artifacts

[ -f "$REPO/vitest.override.ts" ] || printf 'import config from "./vitest.config"; export default { ...config };\'$'\n' > "$REPO/vitest.override.ts"

rsync -a \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "test-artifacts" \
  --exclude "scripts" \
  --exclude "scripts/**" \
  "$OV"/ "$REPO"/

git add -A
git status --porcelain > "test-artifacts/overlay.changed.$(date +%s).txt" || true

npm config set fund false
npm config set audit false
npm config set progress false
if [ -f package-lock.json ]; then npm ci --loglevel=warn; else npm install --loglevel=warn; fi

tsc -b > "test-artifacts/tsc.out.txt" 2>&1 || tsc -p "$REPO/commons.json" > "test-artifacts/tsc.out.txt" 2>&1

npx vitest run -c "$REPO/vitest.override.ts" --reporter=verbose | tee "test-artifacts/vitest.out.txt"

git add -A
git -c user.name="CaliberVault Bot" -c user.email="bot@calibervault.local" commit -m "Automated publish $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true

export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/CaliberVaultII -p 443 -o IdentitiesOnly=yes -o ServerAliveInterval=10 -o ServerAliveCountMax=3"
git remote add public ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git 2>/dev/null || true
git remote set-url public ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git
git push -u public HEAD:main || true

RAW=https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main
curl -s -o /dev/null -w 'verify %{http_code} %{size_download}\n' "$RAW/src/test/vitest.setup.ts"
curl -s -o /dev/null -w 'verify %{http_code} %{size_download}\n' "$RAW/vitest.override.ts"
curl -s -o /dev/null -w 'verify %{http_code} %{size_download}\n' "$RAW/test-artifacts/vitest.out.txt"

echo main_commit=$(git ls-remote --heads public | awk '/refs\/heads\/main$/{print $1}')
echo vitest_sha256=$(curl -s "$RAW/test-artifacts/vitest.out.txt" | shasum -a 256 | awk '{print $1}')
