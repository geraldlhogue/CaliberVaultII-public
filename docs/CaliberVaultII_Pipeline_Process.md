# CaliberVaultII — Build / Test / Publish / Verify Process

## Overview
This document explains the end-to-end automation process used in the CaliberVaultII repository.
Two command-line tools handle the entire cycle:

- **cvpipe** — runs the overlay → install → test → publish → verify pipeline  
- **cvmemo** — builds a Famous-ready memo using the results from the most recent run

---

## Step 1 — Prepare the Overlay
**Purpose:** Replace local code with the latest drop from Famous.

```bash
OV=/Users/ghogue/Desktop/CaliberVaultII-From-Famous-Nov-9
REPO=/Users/ghogue/Desktop/CaliberVaultII
```

---

## Step 2 — Dependency Installation
Install or refresh all NPM packages deterministically.

---

## Step 3 — TypeScript Compilation
Validate that the TypeScript codebase compiles before tests run.

---

## Step 4 — Test Execution
Run all Vitest suites and capture results.

---

## Step 5 — Commit and Publish
Push the tested state to the public mirror for Famous.

---

## Step 6 — Verification
Confirm the public repo contains the expected artifacts.

---

## Step 7 — Build the Memo
Generate a formatted Markdown memo that summarizes the run.

---

## Step 8 — Famous Response Loop
Famous confirms by replying with verification values and log lines.

---

## Step 9 — Harness Policy Summary
`vitest.setup.ts` is **not frozen.**
Famous may modify it each drop but must document what changed and why.

---

## Directory Layout
```
CaliberVaultII/
├── src/test/vitest.setup.ts
├── scripts/pipeline.sh (cvpipe)
├── scripts/famous-memo.sh (cvmemo)
├── test-artifacts/vitest.out.txt
└── test-artifacts/famous-memo.<timestamp>.md
```

---

## Typical Usage Flow
```bash
cvpipe   # runs overlay → install → test → publish → verify
cvmemo   # builds memo with hashes and status
```

---

## Glossary
| Term | Meaning |
|------|----------|
| Overlay | Code package received from Famous |
| Harness | The `vitest.setup.ts` environment stubs |
| Artifact | Output files published to the public repo |
| Commit SHA | Unique identifier of the public main branch after publishing |
| SHA-256 | File fingerprint verifying exact content identity |
