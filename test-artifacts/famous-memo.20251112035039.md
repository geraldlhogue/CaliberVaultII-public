Subject: CaliberVaultII — consume these exact, current artifacts (run verified)

**Status:** Progress — 1 fewer failing tests than previous run.

Artifacts:
- vitest.setup.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/src/test/vitest.setup.ts
- vitest.override.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/vitest.override.ts
- vitest.out.txt
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt

Verification values for this run
- main commit: 8c88b2985a4ce3dd02ea4e6a8776ae942a83443a
- vitest.out.txt sha256: ce41d1ebfc82098ca7f4a1ac7c9e8ba89f8968a032e8f60a57fe7477b299f1b2

Summary counts from this run
- Test Files: 26 failed | 164 passed
- Tests: 26 failed | 164 passed

Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt.

vitest.out.txt — first 3 lines


vitest.out.txt — last 3 lines


Notes:
- vitest.setup.ts is no longer frozen. If you need changes, include what changed and why in your drop notes; we will keep using your harness unless it clearly regresses other suites.
- Tips for current reds: confirm InventoryOperations export/import (invalid element), ensure supabase.auth.getSession/onAuthStateChange exist in the same client your StorageService imports, align useSubscription hasFeature/tier to the spec. If cache tests hang, use fake timers or reduce internal delays when NODE_ENV=test.
