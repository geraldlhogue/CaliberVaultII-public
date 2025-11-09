#!/usr/bin/env zsh
set -e
RAW_MAIN=https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main
curl -I -fSL "$RAW_MAIN/src/test/vitest.setup.ts"
curl -I -fSL "$RAW_MAIN/vitest.override.ts"
curl -I -fSL "$RAW_MAIN/test-artifacts/tsc.out.txt"
curl -I -fSL "$RAW_MAIN/test-artifacts/vitest.out.txt"
git rev-parse HEAD > .hash_head 2>/dev/null || echo N_A > .hash_head
git rev-parse public/main > .hash_pub 2>/dev/null || echo N_A > .hash_pub
printf "HEAD        = " ; cat .hash_head ; printf "\n"
printf "public/main = " ; cat .hash_pub ; printf "\n"
