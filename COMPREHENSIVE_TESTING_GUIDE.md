# Comprehensive Testing Guide

## Overview
Complete testing strategy for CaliberVault covering E2E, performance, and test data management.

## Testing Pyramid

```
        /\
       /E2E\          <- Few, slow, expensive
      /------\
     /Integration\    <- Some, medium speed
    /------------\
   /  Unit Tests  \   <- Many, fast, cheap
  /________________\
```

## 1. E2E Testing Suite

### Location
`src/test/e2e/`

### Available Tests
- `authentication.spec.ts` - Login, signup, password reset
- `inventory-crud.spec.ts` - Create, read, update, delete items
- `team-collaboration.spec.ts` - Team invites, sharing, comments
- `mobile-features.spec.ts` - Pull-to-refresh, camera, offline
- `subscription-tiers.spec.ts` - Tier limits and upgrades
- `barcode-scanning.spec.ts` - Barcode scanning workflows

### Running E2E Tests
```bash
# All E2E tests
npm run test:e2e

# Specific test file
npx playwright test src/test/e2e/team-collaboration.spec.ts

# With UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed
```

## 2. Performance Testing Framework

### Location
`k6-performance-tests.js` and `src/test/performance/`

### Running Performance Tests
```bash
# k6 load tests
k6 run k6-performance-tests.js

# Playwright performance tests
npm run test:performance

# With custom load
k6 run --vus 100 --duration 5m k6-performance-tests.js
```

### Performance Targets
- Page load: < 2s
- API response: < 500ms (p95)
- Error rate: < 1%
- Support: 100+ concurrent users

## 3. Test Data Management

### Seeding Data
```typescript
import { testDataSeeder } from '@/lib/testDataSeeder';

// Seed inventory
await testDataSeeder.seedInventory({
  userId: 'user-123',
  itemCount: 50,
});

// Cleanup
await testDataSeeder.cleanupTestData('user-123');
```

### Using Fixtures
```typescript
import { mockFirearm, createMockItem } from '@/test/fixtures/inventory.fixtures';
```

### Test Helpers
```typescript
import { loginAsTestUser, createTestItem } from '@/test/helpers/testHelpers';
```

## 4. Unit Testing

### Location
`src/**/__tests__/`

### Running Unit Tests
```bash
# All unit tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

### Coverage Requirements
- Statements: 85%
- Branches: 80%
- Functions: 85%
- Lines: 85%

## CI/CD Integration

### GitHub Actions Workflows
- `.github/workflows/ci.yml` - Run on every push
- `.github/workflows/test-coverage.yml` - Coverage reports
- `.github/workflows/quality-gate.yml` - Quality checks

### Running in CI
```yaml
- name: Run E2E tests
  run: npm run test:e2e

- name: Run unit tests
  run: npm run test:coverage

- name: Run performance tests
  run: k6 run k6-performance-tests.js
```

## Best Practices

### E2E Tests
1. Test user journeys, not implementation
2. Use data-testid for stable selectors
3. Mock external APIs
4. Keep tests independent
5. Clean up after each test

### Performance Tests
1. Test realistic scenarios
2. Monitor key metrics
3. Set appropriate thresholds
4. Test under load
5. Profile bottlenecks

### Test Data
1. Use fixtures for consistency
2. Seed only necessary data
3. Always cleanup
4. Keep data realistic
5. Maintain data relationships

## Troubleshooting

### E2E Tests Failing
```bash
# Check test output
npx playwright test --reporter=html

# View trace
npx playwright show-trace trace.zip

# Debug
npx playwright test --debug
```

### Performance Issues
```bash
# Profile with Chrome DevTools
npx playwright test --trace on

# Check k6 metrics
k6 run --out json=results.json k6-performance-tests.js
```

## Quick Reference

```bash
# Run all tests
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run test:performance   # Performance tests

# Coverage
npm run test:coverage      # Generate coverage report

# Development
npm run test:watch         # Watch mode
npm run test:ui            # Interactive UI

# CI/CD
npm run test:ci            # All tests for CI
```
