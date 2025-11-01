# Testing Guide - Where Everything Is & How to Use It

## 📍 WHERE IS THE TESTING FUNCTIONALITY?

### Test Configuration Files (Root Directory)
- **`vitest.config.ts`** - Unit test configuration
- **`playwright.config.ts`** - E2E test configuration
- **`package.json`** - Test scripts (lines with "test:")

### Test Files Location
```
src/test/
├── setup.ts                    ← Test environment setup
├── testUtils.tsx              ← Reusable test helpers
├── helpers/
│   └── testHelpers.ts         ← Common test functions
├── e2e/                       ← End-to-end tests
│   ├── auth.spec.ts
│   ├── inventory-crud.spec.ts
│   ├── search-filter.spec.ts
│   ├── export.spec.ts
│   └── comprehensive.spec.ts
└── integration/
    └── api.test.ts            ← API integration tests

src/components/__tests__/      ← Component unit tests
src/hooks/__tests__/           ← Hook unit tests
src/services/__tests__/        ← Service unit tests
src/utils/__tests__/           ← Utility unit tests
```

---

## 🎯 HOW TO ACCESS TESTING

### Option 1: Terminal Commands (Recommended)
See `TERMINAL_COMMANDS_GUIDE.md` for exact commands

### Option 2: VS Code Testing Panel
1. Open VS Code
2. Click the beaker/flask icon in the left sidebar (Testing)
3. Click "Run All Tests" or run individual tests
4. View results in the panel

### Option 3: Browser UI (Most Visual)
1. Open terminal
2. Type: `npm run test:ui`
3. Browser opens with interactive test interface
4. Click tests to run them
5. See results, coverage, and details visually

---

## 📚 TYPES OF TESTS & WHEN TO USE THEM

### 1. Unit Tests
**What they test:** Individual functions, components, hooks
**Files:** `src/**/__tests__/*.test.ts(x)`
**When to run:** After changing any code
**Command:** `npm test`

**Example locations:**
- Component tests: `src/components/__tests__/ItemCard.test.tsx`
- Hook tests: `src/hooks/__tests__/useInventoryFilters.test.ts`
- Service tests: `src/services/__tests__/inventory.service.test.ts`
- Utility tests: `src/utils/__tests__/csvParser.test.ts`

### 2. Integration Tests
**What they test:** How different parts work together
**Files:** `src/test/integration/*.test.ts`
**When to run:** Before releases
**Command:** `npm test` (included in unit tests)

**Example:**
- API tests: `src/test/integration/api.test.ts`

### 3. End-to-End (E2E) Tests
**What they test:** Complete user workflows
**Files:** `src/test/e2e/*.spec.ts`
**When to run:** Before major releases
**Command:** `npm run test:e2e`

**Example workflows:**
- Login/signup: `src/test/e2e/auth.spec.ts`
- Add/edit/delete items: `src/test/e2e/inventory-crud.spec.ts`
- Search and filter: `src/test/e2e/search-filter.spec.ts`
- Export data: `src/test/e2e/export.spec.ts`

---

## 🔍 HOW TO USE EACH TESTING FEATURE

### Running All Tests
```bash
npm test
```
**Shows:** Pass/fail status for all unit tests
**Use when:** Before committing code

### Interactive Test UI
```bash
npm run test:ui
```
**Shows:** Visual interface with:
- List of all tests
- Pass/fail status with colors
- Code coverage visualization
- Test execution time
- Ability to filter and search tests

**Use when:** 
- Debugging failing tests
- Exploring what's tested
- Checking coverage visually

### Coverage Report
```bash
npm run test:coverage
```
**Shows:** 
- Percentage of code covered by tests
- Which files need more tests
- Line-by-line coverage in HTML report

**Files created:**
- `coverage/index.html` - Open in browser for detailed report
- `coverage/lcov-report/` - Detailed coverage by file

**Use when:**
- Before releases (aim for 70%+)
- Identifying untested code

### E2E Tests with UI
```bash
npm run test:e2e:ui
```
**Shows:**
- Playwright test interface
- Watch tests run in browser
- Screenshots of failures
- Step-by-step execution

**Use when:**
- Testing complete user flows
- Debugging E2E test failures

### E2E Debug Mode
```bash
npm run test:e2e:debug
```
**Shows:**
- Step-by-step test execution
- Pause at each step
- Inspect page state

**Use when:**
- E2E test is failing and you need to see exactly where

---

## 📖 HOW TO READ TEST RESULTS

### Successful Test Output
```
✓ src/components/__tests__/ItemCard.test.tsx (3)
  ✓ ItemCard > renders item details correctly
  ✓ ItemCard > handles click events
  ✓ ItemCard > shows edit button for owner

Test Files  1 passed (1)
Tests  3 passed (3)
```
**Meaning:** All tests passed ✅

### Failed Test Output
```
✗ src/components/__tests__/ItemCard.test.tsx (3)
  ✓ ItemCard > renders item details correctly
  ✗ ItemCard > handles click events
    Expected: "Item clicked"
    Received: undefined
  ✓ ItemCard > shows edit button for owner
```
**Meaning:** One test failed ❌
**Action:** Fix the code causing the failure

### Coverage Report
```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
All files           |   75.23 |    68.45 |   72.11 |   75.23
 ItemCard.tsx       |   90.00 |    85.00 |   88.00 |   90.00
 FilterPanel.tsx    |   45.00 |    30.00 |   50.00 |   45.00
```
**Meaning:** 
- ItemCard: Well tested (90% coverage) ✅
- FilterPanel: Needs more tests (45% coverage) ⚠️

---

## 🛠️ HOW TO WRITE NEW TESTS

### 1. Component Test Example
**Location:** `src/components/__tests__/MyComponent.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles button click', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### 2. Hook Test Example
**Location:** `src/hooks/__tests__/useMyHook.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });

  it('updates value', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.setValue(5);
    });
    expect(result.current.value).toBe(5);
  });
});
```

### 3. E2E Test Example
**Location:** `src/test/e2e/myFeature.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('user can add item', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Add Item');
  await page.fill('input[name="name"]', 'Test Item');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Test Item')).toBeVisible();
});
```

---

## 🎓 TESTING WORKFLOW FOR DEVELOPERS

### Daily Development
1. Make code changes
2. Run `npm test` to verify nothing broke
3. Fix any failing tests
4. Commit code

### Before Committing
```bash
npm test                 # Quick check
npm run build           # Ensure it builds
```

### Before Pull Request
```bash
npm run test:coverage   # Check coverage
npm run test:e2e        # Run E2E tests
npm run build           # Final build check
```

### Before Release
```bash
npm run test:coverage   # Verify 70%+ coverage
npm run test:e2e        # Full E2E suite
npm run build           # Production build
npm run preview         # Test production build
```

---

## 📊 UNDERSTANDING TEST COVERAGE

### What is Coverage?
Coverage measures how much of your code is executed during tests.

### Coverage Metrics:
- **Statements:** Individual lines of code
- **Branches:** if/else paths
- **Functions:** Function definitions
- **Lines:** Physical lines in files

### Target: 70%+ for all metrics

### How to View Coverage:
```bash
npm run test:coverage
open coverage/index.html  # Mac
start coverage/index.html # Windows
```

### Coverage Colors:
- **Green:** Well tested (>80%)
- **Yellow:** Partially tested (50-80%)
- **Red:** Poorly tested (<50%)

---

## 🐛 DEBUGGING FAILED TESTS

### Step 1: Read the Error
```
✗ ItemCard > handles click events
  Expected: "Item clicked"
  Received: undefined
```
**Meaning:** Click handler not working

### Step 2: Run Test in UI Mode
```bash
npm run test:ui
```
Click the failing test to see details

### Step 3: Check Test File
Open the test file and review the test code

### Step 4: Check Component Code
Open the component and verify the implementation

### Step 5: Add Console Logs
```typescript
it('handles click', () => {
  render(<MyComponent />);
  console.log(screen.debug()); // Shows DOM
  fireEvent.click(button);
});
```

### Step 6: Fix and Re-run
Make changes and run `npm test` again

---

## 📞 GETTING HELP

### Test Not Working?
1. Check `TERMINAL_COMMANDS_GUIDE.md` for correct commands
2. Verify you ran `npm install`
3. Check test file syntax
4. Look at similar passing tests for examples

### Coverage Too Low?
1. Run `npm run test:coverage`
2. Open `coverage/index.html`
3. Find red/yellow files
4. Write tests for uncovered code

### E2E Test Failing?
1. Run `npm run test:e2e:debug`
2. Watch test execute step-by-step
3. Check for timing issues
4. Verify selectors are correct

---

## 📁 QUICK REFERENCE

| What | Where | Command |
|------|-------|---------|
| Run all tests | Terminal | `npm test` |
| Test UI | Browser | `npm run test:ui` |
| Coverage | Terminal/Browser | `npm run test:coverage` |
| E2E tests | Terminal | `npm run test:e2e` |
| Test config | `vitest.config.ts` | - |
| Component tests | `src/components/__tests__/` | - |
| Hook tests | `src/hooks/__tests__/` | - |
| E2E tests | `src/test/e2e/` | - |
| Test helpers | `src/test/testUtils.tsx` | - |

---

## ✅ TESTING CHECKLIST

Before every commit:
- [ ] Run `npm test`
- [ ] All tests pass
- [ ] No new errors

Before every release:
- [ ] Run `npm run test:coverage`
- [ ] Coverage is 70%+
- [ ] Run `npm run test:e2e`
- [ ] All E2E tests pass
- [ ] Run `npm run build`
- [ ] Build succeeds

See `MOBILE_DEPLOYMENT_GUIDE.md` for mobile testing checklist.
