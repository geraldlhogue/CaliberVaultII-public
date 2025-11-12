Subject: CaliberVaultII — consume these exact, current artifacts (run verified)

**Status:** Regression — 1 more failing tests than previous run.

Artifacts:
- vitest.setup.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/src/test/vitest.setup.ts
- vitest.override.ts
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/vitest.override.ts
- vitest.out.txt
  https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/test-artifacts/vitest.out.txt

Verification values for this run
- main commit: e8691f3663d7dd3e3c700e4127b5ca97a71f1d61
- vitest.out.txt sha256: bd42464835a2353286f66df3846c171db63b6fb77eae1dfddbb13a4a4230f684

Summary counts from this run
- Test Files: 27 failed | 163 passed
- Tests: 27 failed | 163 passed

Please confirm you’re reviewing this exact run by replying with those two values and the first 3 and last 3 lines of vitest.out.txt.

vitest.out.txt — first 3 lines


vitest.out.txt — last 3 lines


Key Focus Areas
1) InventoryOperations: align export/import (named vs default).
2) StorageService auth: ensure client has auth.getSession and onAuthStateChange (same instance as harness).
3) useSubscription mock: set tier/limits and hasFeature() to match assertions.
4) Integration builders: implement .insert() returning { data, error: null }.
5) API mocks: getAll()->array, create()->object, error->reject; add client.channel().on().subscribe().
6) SmartInstallPrompt: raise BeforeInstallPromptEvent and call prompt().
7) Barcode cache: use fake timers or lower delays under NODE_ENV=test.
8) ErrorHandler API: export names to match test imports.

Harness Policy
vitest.setup.ts is not frozen. Changes are allowed with a short what/why note; regressions will trigger rollback to the prior harness.
