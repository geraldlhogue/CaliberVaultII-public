Subject: CaliberVaultII — consume these exact, current artifacts (run verified)

**Status:** No change — failing test count unchanged.

Artifacts:
- vitest.setup.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/src/test/vitest.setup.ts
- vitest.override.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/vitest.override.ts
- vitest.out.txt
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt

Verification values for this run
- main commit: 8172f48e5908c063ad38385b62b2100b682c2a25
- vitest.out.txt sha256: fdabbebefc18e47649190d5a3899671196029e95225d59055da65e3acf298d70

Summary counts from this run
- Test Files: 0 failed | 0 passed
- Tests: 0 failed | 0 passed

Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt.

vitest.out.txt — first 3 lines


vitest.out.txt — last 3 lines


Notes:
- vitest.setup.ts is no longer frozen. If you need changes, include what changed and why in your drop notes; we will keep using your harness unless it clearly regresses other suites.
- Tips for current reds: ensure Supabase builder ops are chainable (double .eq), API mocks return arrays/objects exactly as asserted and reject on error paths, expose auth.getSession/onAuthStateChange, and confirm UI exports (named vs default) match test imports. Resolve 10s cache timeouts by using fake timers or lowering internal delays under NODE_ENV=test.
