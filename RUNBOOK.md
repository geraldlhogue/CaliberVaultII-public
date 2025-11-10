CaliberVaultII Runbook

One place to run everything end-to-end.

Primary paths
Staging OV: /Users/ghogue/Desktop/CaliberVaultII-From-Famous-Nov-9
Repo    REPO: /Users/ghogue/Desktop/CaliberVaultII

End-to-end run
cd /Users/ghogue/Desktop/CaliberVaultII
bash -x scripts/famous_full_pipeline.sh /Users/ghogue/Desktop/CaliberVaultII-From-Famous-Nov-9

Watch live logs
cd /Users/ghogue/Desktop/CaliberVaultII
scripts/tail_live.sh

Quick test re-run only
cd /Users/ghogue/Desktop/CaliberVaultII
scripts/quick_rerun_tests.sh

Sanity checks
tail -n 80 test-artifacts/vitest.out.txt
scripts/extract_progress.sh test-artifacts/vitest.out.txt | tail -n 120

Publish and verify are included in the full pipeline. If publish is needed alone:
cd /Users/ghogue/Desktop/CaliberVaultII
scripts/publish_public.sh
scripts/verify_public.sh

Artifacts
test-artifacts/overlay.log
test-artifacts/overlay.changed.txt
test-artifacts/tests.log
test-artifacts/tsc.out.txt
test-artifacts/vitest.out.txt
test-artifacts/publish.log
test-artifacts/verify.log
test-artifacts/pipeline.log
