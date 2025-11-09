# Test Setup Fixes - November 2, 2024 (Part 2)

## Issue
Tests were failing with `ReferenceError: expect is not defined` despite having `globals: true` in vitest config.

## Root Cause
The vitest globals weren't being properly loaded due to:
1. Missing `@testing-library/jest-dom/vitest` import
2. Missing TypeScript type declarations for vitest globals
3. Incomplete test file patterns in vitest config

## Files Modified

### 1. vitest.config.ts
**Changes:**
- Added explicit `include` pattern: `['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']`
- Added comprehensive `exclude` patterns to avoid scanning unnecessary directories
- Improved test discovery and loading

### 2. src/test/setup.ts
**Changes:**
- Added `import '@testing-library/jest-dom/vitest'` to properly load jest-dom matchers for vitest
- Reorganized imports to ensure proper loading order
- Kept all comprehensive mocks (Supabase, Capacitor, browser APIs, etc.)

### 3. src/test/vitest.d.ts (NEW)
**Purpose:**
- TypeScript declarations for vitest globals
- Ensures `expect`, `describe`, `it`, `vi`, etc. are recognized globally
- Adds jest-dom matcher types to vitest assertions

## How to Update Your Test Environment

1. **Update vitest.config.ts** - Replace entire file with new version
2. **Update src/test/setup.ts** - Replace lines 1-4 with new imports
3. **Create src/test/vitest.d.ts** - New file with TypeScript declarations

## Verification Steps

After updating files, run:

```bash
# Clear any cached test data
rm -rf node_modules/.vitest

# Run tests
npm run test

# Or run with verbose output
npm run test -- --reporter=verbose
```

## Expected Result

Tests should now run without "ReferenceError: expect is not defined" errors. The vitest globals (`expect`, `describe`, `it`, `vi`, etc.) should be available in all test files.

## If Tests Still Fail

1. **Check package.json** - Ensure you have:
   - `vitest`: latest version
   - `@testing-library/jest-dom`: latest version
   - `@testing-library/react`: latest version

2. **Clear all caches:**
   ```bash
   rm -rf node_modules/.vitest
   rm -rf node_modules/.cache
   npm run test -- --no-cache
   ```

3. **Verify tsconfig includes test directory:**
   - Check that `tsconfig.app.json` includes `src` directory
   - Ensure no conflicting TypeScript configurations

## Technical Details

### Why @testing-library/jest-dom/vitest?
The `/vitest` export is specifically designed for vitest compatibility and properly extends vitest's assertion types with jest-dom matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.

### Why vitest.d.ts?
TypeScript needs explicit type declarations for vitest globals when using `globals: true`. This file tells TypeScript that `expect`, `describe`, `it`, etc. are available globally in test files.

### Why explicit include/exclude?
Vitest needs to know exactly which files to treat as tests. Explicit patterns prevent it from trying to load non-test files or scanning unnecessary directories, which can cause module loading issues.
