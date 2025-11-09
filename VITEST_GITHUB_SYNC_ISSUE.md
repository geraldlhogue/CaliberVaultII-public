# Critical Issue: vitest.setup.ts Not Synced to GitHub

## Current Status
- ✅ **Local file** (`/Users/ghogue/Desktop/CaliberVaultII/src/test/vitest.setup.ts`): Contains valid TypeScript (79 lines)
- ❌ **GitHub file** (main branch): Contains `pbpaste > /Users/ghogue/Desktop/CaliberVaultII/src/test/vitest.setup.ts`
- 🔴 **Result**: All 49 test suites fail with syntax error

## Root Cause
The file content was not properly committed to Git. The GitHub version still has the shell command instead of TypeScript code.

## Immediate Fix (Copy/Paste These Commands)

```bash
cd /Users/ghogue/Desktop/CaliberVaultII

# Verify local file is correct
echo "=== Checking local file (should show TypeScript imports) ==="
head -3 src/test/vitest.setup.ts

# Check git status
echo "=== Git status ==="
git status

# Force stage the file
git add -f src/test/vitest.setup.ts

# Verify it's staged
git diff --cached src/test/vitest.setup.ts | head -20

# Commit
git commit -m "fix: restore vitest.setup.ts with proper TypeScript code (79 lines)"

# Push to main
git push origin main

# Wait 5 seconds, then verify on GitHub
sleep 5
echo "=== Verifying GitHub (should show TypeScript imports) ==="
curl -s https://raw.githubusercontent.com/geraldlhogue/CaliberVaultII-public/main/src/test/vitest.setup.ts | head -3
```

## After Verification Passes

```bash
# Run tests
npx vitest run 2>&1 | tee test-artifacts/vitest.out.txt

# Commit results
git add test-artifacts/
git commit -m "test: vitest results after setup file fix"
git push origin main
```
