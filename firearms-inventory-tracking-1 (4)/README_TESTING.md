# CaliberVault Testing Documentation

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 85%+ coverage  
- **E2E Tests**: 80%+ coverage
- **Overall**: 85%+ coverage

## Test Structure

```
src/
├── components/__tests__/       # Component tests
├── services/__tests__/         # Service tests
├── hooks/__tests__/            # Hook tests
├── lib/__tests__/              # Library tests
├── utils/__tests__/            # Utility tests
├── test/
│   ├── e2e/                   # E2E tests
│   ├── integration/           # Integration tests
│   ├── fixtures/              # Test fixtures
│   └── setup.ts               # Test setup
```

## Test Files Created (31 Total)

### Service Tests (5)
1. barcode.service.comprehensive.test.ts
2. sync.service.test.ts
3. team.service.test.ts
4. reports.service.test.ts
5. inventory.service.enhanced.test.ts

### Library Tests (2)
6. barcodeCache.test.ts
7. errorHandler.test.ts

### Component Tests (13)
8. PhotoCapture.test.tsx
9. FilterPanel.test.tsx
10. ItemCard.test.tsx
11. InventoryOperations.test.tsx
12. SyncStatusDashboard.test.tsx
13. MobileBarcodeScanner.test.tsx
14. TierEnforcement.test.tsx
15. FeedbackSystem.test.tsx
16. EnhancedBulkImport.test.tsx
17. AIValuationModal.test.tsx
18. DatabaseMigrationSystem.test.tsx
19. SmartInstallPrompt.test.tsx
20. AddItemModal.enhanced.test.tsx

### Hook Tests (4)
21. useInventoryFilters.enhanced.test.ts
22. useOfflineSync.test.ts
23. usePullToRefresh.test.ts
24. useSwipeGesture.test.ts

### Utility Tests (3)
25. barcodeUtils.test.ts
26. csvParser.test.ts
27. csvValidator.test.ts

### E2E Tests (3)
28. comprehensive-user-flows.spec.ts
29. barcode-scanning.spec.ts
30. authentication.spec.ts

### Integration Tests (2)
31. comprehensive-categories.test.ts
32. api.test.ts

## Running Specific Tests

```bash
# Run specific test file
npm test -- barcode.service

# Run tests matching pattern
npm test -- --grep "barcode"

# Run only E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### Component Test Example
```typescript
import { render, screen } from '@testing-library/react';

it('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
  await expect(page.locator('text=Success')).toBeVisible();
});
```

## CI/CD Integration

Tests run automatically on:
- Every push to main
- Every pull request
- Nightly builds

Quality gates:
- All tests must pass
- Coverage ≥85%
- No critical vulnerabilities

## Troubleshooting

### Tests Failing
```bash
# Clear cache
npm test -- --clearCache

# Update snapshots
npm test -- -u
```

### Coverage Too Low
```bash
# See uncovered lines
npm run test:coverage
open coverage/index.html
```

### E2E Tests Failing
```bash
# Install browsers
npx playwright install

# Run in debug mode
npm run test:e2e:debug
```

## Best Practices

1. Write tests before code (TDD)
2. Test behavior, not implementation
3. Use descriptive test names
4. Mock external dependencies
5. Keep tests isolated
6. Use fixtures for test data
7. Test edge cases
8. Maintain test coverage

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [COMPREHENSIVE_TESTING_PLAN_FINAL.md](./COMPREHENSIVE_TESTING_PLAN_FINAL.md)
- [MACBOOK_LOCAL_TESTING_GUIDE.md](./MACBOOK_LOCAL_TESTING_GUIDE.md)
