Subject: CaliberVaultII — consume these exact, current artifacts (run verified)

Artifacts:
- vitest.setup.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/src/test/vitest.setup.ts
- vitest.override.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/vitest.override.ts
- vitest.out.txt
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt

Verification values for this run
- main commit: 87e75db0ccaef23dda34b9b5fb755ea15b156f53
- vitest.out.txt sha256: a76ab050c1dcd9f801f47fe6ff52d7150b1297d6f47e7438c4b836fb6726846f

Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt.

vitest.out.txt — first 3 lines
```

 RUN  v2.1.9 /Users/ghogue/Desktop/CaliberVaultII
```

vitest.out.txt — last 3 lines
```
   Start at  18:57:49
   Duration  56.98s (transform 1.46s, setup 15.73s, collect 18.75s, tests 54.83s, environment 61.13s, prepare 5.33s)
```

Notes:
- vitest.setup.ts is no longer frozen. If you need changes, include what changed and why in your drop notes; we’ll keep using your harness unless it clearly regresses other suites.
- Tips for current reds: ensure Supabase builder ops are chainable (double .eq), API mocks return arrays/objects exactly as asserted and reject on error paths, expose auth.getSession/onAuthStateChange, and confirm UI exports (named vs default) match test imports.
