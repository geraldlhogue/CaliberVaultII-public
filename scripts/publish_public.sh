#!/usr/bin/env zsh
set -e
REPO="/Users/ghogue/Desktop/CaliberVaultII"
cd "$REPO"
git remote set-url public https://github.com/geraldlhogue/CaliberVaultII-public.git
git config remote.pushDefault public
git config credential.helper osxkeychain
git add -A
git commit -m "chore: overlay+tests+logs" || true
git push public main
git lfs install
git lfs push public --all
RAW_MAIN=https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main
curl -I -fSL "$RAW_MAIN/src/test/vitest.setup.ts"      > artifacts/verify_setup.txt 2>&1 || true
curl -I -fSL "$RAW_MAIN/vitest.override.ts"            > artifacts/verify_override.txt 2>&1 || true
curl -I -fSL "$RAW_MAIN/test-artifacts/tsc.out.txt"    > artifacts/verify_tsc.txt 2>&1 || true
curl -I -fSL "$RAW_MAIN/test-artifacts/vitest.out.txt" > artifacts/verify_vitest.txt 2>&1 || true
git rev-parse HEAD        > .hash_head 2>/dev/null || echo N_A > .hash_head
git rev-parse public/main > .hash_pub  2>/dev/null || echo N_A > .hash_pub
printf "HEAD        = " ; cat .hash_head ; printf "\n" > artifacts/hash_compare.txt
printf "public/main = " ; cat .hash_pub  ; printf "\n" >> artifacts/hash_compare.txt
