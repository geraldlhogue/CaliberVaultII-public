Subject: CaliberVaultII — consume these exact, current artifacts (run verified)

**Status:** Baseline — no prior run to compare.

Artifacts:
- vitest.setup.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/src/test/vitest.setup.ts
- vitest.override.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/vitest.override.ts
- vitest.out.txt
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt

Verification values for this run
- main commit: 'fe8368e30c65b1aa31977b8c3f083f049dbae7c8'
  echo - vitest.out.txt sha256: $vitest_sha256

Summary counts from this run
- Test Files: '0' failed | '0' passed
- Tests: '0' failed | '0' passed

Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt.

vitest.out.txt — first 3 lines
```

 RUN  v2.1.9 /Users/ghogue/Desktop/CaliberVaultII
```

vitest.out.txt — last 3 lines
```
   Start at  19:30:10
   Duration  61.12s (transform 2.27s, setup 25.52s, collect 19.71s, tests 54.88s, environment 102.17s, prepare 5.63s)
```

Notes:
- vitest.setup.ts is no longer frozen. If you need changes, include what changed and why in your drop notes; we will keep using your harness unless it clearly regresses other suites.
- Tips for current reds: ensure Supabase builder ops are chainable (double .eq), API mocks return arrays/objects exactly as asserted and reject on error paths, expose auth.getSession/onAuthStateChange, and confirm UI exports (named vs default) match test imports. Resolve 10s cache timeouts by using fake timers or lowering internal delays under NODE_ENV=test.
