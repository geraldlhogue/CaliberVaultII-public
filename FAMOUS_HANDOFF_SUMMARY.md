CaliberVaultII — Handoff Summary

Working repo and staging
Repo path:     /Users/ghogue/Desktop/CaliberVaultII
Staging (OV):  /Users/ghogue/Desktop/CaliberVaultII-From-Famous-Nov-9

What the pipeline does
Overlay OV into REPO without deleting other local files
Install deps
Type-check with tsc
Run vitest with a PID-tracked heartbeat
Commit and push public mirror
Verify four public raw URLs

How to run
cd /Users/ghogue/Desktop/CaliberVaultII
bash -x scripts/famous_full_pipeline.sh /Users/ghogue/Desktop/CaliberVaultII-From-Famous-Nov-9

Where to look
Local logs in test-artifacts
Public artifacts at CaliberVaultII-public main branch

Frozen test setup
src/test/vitest.setup.ts remains pinned to the SHA communicated earlier and must not be modified.

Acceptance signal
All category exports resolve under partial mocks
No unsupported Supabase chain methods in source
InventoryAPIService matches tested method names and shapes
React providers and navigation guarded for tests
ITF-14 detection present
ResizeObserver polyfilled or guarded in tests
CSV and validation utilities exported with expected names
