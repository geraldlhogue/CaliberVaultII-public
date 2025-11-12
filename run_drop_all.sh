#!/usr/bin/env bash
set -u
OV="${1:-/Users/ghogue/Desktop/CaliberVaultII-From-Famous-Nov-9}"
REPO="${2:-/Users/ghogue/Desktop/CaliberVaultII}"
RAW="https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main"
TS="$(date +%Y%m%d%H%M%S)"
LOG="$REPO/test-artifacts"
PIPE="$LOG/pipeline.$TS.log"
ts(){ date "+%F %T"; }
say(){ printf "%s %s\n" "$(ts)" "$1" | tee -a "$PIPE"; }
need(){ [ -d "$1" ] || { echo "Missing: $1"; exit 1; }; }
mk(){ mkdir -p "$1"; }

overlay(){
  say "overlay start"
  need "$OV"; need "$REPO"; mk "$LOG"
  rsync -a \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "test-artifacts" \
    --exclude "scripts" \
    --exclude "scripts/**" \
    --exclude "src/test/vitest.setup.ts" \
    "$OV"/ "$REPO"/ 2>&1 | tee "$LOG/overlay.$TS.log"
  git -C "$REPO" add -A
  git -C "$REPO" status --porcelain > "$LOG/overlay.changed.$TS.txt" || true
  say "overlay done"
}

testit(){
  say "tests start"
  TSC="$LOG/tsc.out.txt"
  VLOG="$LOG/vitest.out.txt"
  (
    set -e
    cd "$REPO"
    rm -rf .vitest .vite node_modules/.vite node_modules/.cache coverage || true
    npm config set fund false
    npm config set audit false
    npm config set progress false
    if [ -f package-lock.json ]; then npm ci --loglevel=warn; else npm install --loglevel=warn; fi
    set +e
    tsc -b >"$TSC" 2>&1 || tsc -p "$REPO/commons.json" >"$TSC" 2>&1
    set -e
    set +e
    npx vitest run -c "$REPO/vitest.override.ts" --reporter=verbose | tee "$VLOG"
    set -e
  ) || true
  say "tests done"
}

publish(){
  say "publish start"
  PLOG="$LOG/publish.$TS.log"
  (
    set -e
    cd "$REPO"
    git remote | grep -q '^public$' || git remote add public "ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git"
    git remote set-url public "ssh://git@ssh.github.com:443/geraldlhogue/CaliberVaultII-public.git"
    git add -A
    git commit -m "Automated publish $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
    export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/CaliberVaultII -p 443 -o IdentitiesOnly=yes -o ServerAliveInterval=10 -o ServerAliveCountMax=3"
    git push -u public HEAD:main || true
  ) 2>&1 | tee "$PLOG"
  say "publish done"
}

verify(){
  say "verify start"
  VFY="$LOG/verify.$TS.log"
  {
    echo "verify begin"
    for u in "$RAW/src/test/vitest.setup.ts" "$RAW/vitest.override.ts" "$RAW/test-artifacts/vitest.out.txt"
    do
      code=$(curl -s -o /dev/null -w "%{http_code}" "$u")
      echo "verify $code $u"
    done
    echo "verify end"
  } | tee "$VFY"
  say "verify done"
}

sync(){
  say "sync start"
  SY="$LOG/sync.$TS.log"
  cd "$REPO" || exit 0
  L=$(git rev-parse HEAD 2>/dev/null || echo unknown)
  R=$(git ls-remote --heads public 2>/dev/null | awk '/[[:space:]]refs\/heads\/main$/{print $1; exit}')
  printf "SYNC HEAD local=%s\n" "$L" | tee -a "$SY"
  printf "SYNC HEAD remote=%s\n" "$R" | tee -a "$SY"
  if [ "$L" = "$R" ]; then echo "SYNC HEAD OK" | tee -a "$SY"; else echo "SYNC HEAD MISMATCH" | tee -a "$SY"; fi
  if [ -f "$LOG/vitest.out.txt" ]; then LS=$(shasum -a 256 "$LOG/vitest.out.txt" | awk '{print $1}'); else LS="missing_local_vitest"; fi
  RS=$(curl -s "$RAW/test-artifacts/vitest.out.txt" | shasum -a 256 | awk '{print $1}')
  printf "SYNC VITEST local_sha=%s\n" "$LS" | tee -a "$SY"
  printf "SYNC VITEST remote_sha=%s\n" "$RS" | tee -a "$SY"
  if [ "$LS" = "$RS" ]; then echo "SYNC VITEST OK" | tee -a "$SY"; else echo "SYNC VITEST MISMATCH" | tee -a "$SY"; fi
  say "sync done"
  echo
  echo "Verification values"
  echo "main commit: $R"
  echo "vitest.out.txt sha256: $RS"
}

mk "$LOG"
echo "$(ts) pipeline start OV=$OV REPO=$REPO" | tee -a "$PIPE"
overlay
testit
publish
verify
sync
echo "$(ts) pipeline done" | tee -a "$PIPE"
