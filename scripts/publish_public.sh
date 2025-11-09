#!/usr/bin/env zsh
set -e
REPO="/Users/ghogue/Desktop/CaliberVaultII"
cd "$REPO"
git remote set-url public https://github.com/geraldlhogue/CaliberVaultII-public.git
git config remote.pushDefault public
git config credential.helper osxkeychain
git fetch --all --prune
git switch main
git reset --hard public/main
printf "\n# publish test logs\n!test-artifacts/\n!test-artifacts/*.txt\n" >> .gitignore
git add -A
git commit -m "chore: publish code + configs + scripts + logs" || true
git push public main
git lfs install
git lfs push public --all
RAW_MAIN=https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main
curl -I -fSL "$RAW_MAIN/package.json"
curl -I -fSL "$RAW_MAIN/vitest.override.ts"
curl -I -fSL "$RAW_MAIN/test-artifacts/tsc.out.txt"
curl -I -fSL "$RAW_MAIN/test-artifacts/vitest.out.txt"
git rev-parse HEAD > .hash_head 2>/dev/null || echo N_A > .hash_head
git rev-parse public/main > .hash_pub 2>/dev/null || echo N_A > .hash_pub
printf "HEAD        = " ; cat .hash_head ; printf "\n"
printf "public/main = " ; cat .hash_pub ; printf "\n"
