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
- main commit: b34a767524f8e58e4e993fe20015e498dc951e3b
- vitest.out.txt sha256: 8c397a4490db26b9b72386a47ceb12efd1ad0a0ccf412fd0d2ed5193005be5e5

Summary counts from this run
- Test Files: 27 failed | 163 passed
- Tests: 27 failed | 163 passed

Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt.

vitest.out.txt — first 3 lines


vitest.out.txt — last 3 lines


Notes:
- vitest.setup.ts is no longer frozen. If you need changes, include what changed and why in your drop notes; we will keep using your harness unless it clearly regresses other suites.
- Tips for current reds: confirm InventoryOperations export/import (invalid element), ensure supabase.auth.getSession/onAuthStateChange exist in the same client your StorageService imports, align useSubscription hasFeature/tier to the spec. If cache tests hang, use fake timers or reduce internal delays when NODE_ENV=test.
