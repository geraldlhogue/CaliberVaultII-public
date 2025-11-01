# Comprehensive Testing Guide

## Overview
This application uses a multi-layered testing strategy with Vitest for unit/integration tests and Playwright for E2E tests.

## Test Structure

### Unit Tests (`src/utils/__tests__/`)
- **csvParser.test.ts**: CSV parsing logic
- **csvValidator.test.ts**: CSV validation rules
- **barcodeUtils.test.ts**: Barcode generation/validation

### Integration Tests (`src/components/__tests__/`)
- **ItemCard.test.tsx**: Item card rendering and interactions
- **AddItemModal.test.tsx**: Add item form validation and submission
- **FilterPanel.test.tsx**: Filter controls and state management
- **AIValuationModal.test.tsx**: AI valuation UI and API calls

### E2E Tests (`src/test/e2e/`)
- **addItem.spec.ts**: Complete add item user flow
- **editItem.spec.ts**: Edit item workflow
- **aiValuation.spec.ts**: AI valuation and batch operations

## Running Tests

### Unit & Integration Tests
```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium
```

## Coverage Goals
- Unit tests: >80% coverage
- Integration tests: All critical components
- E2E tests: All major user flows

## CI/CD
Tests run automatically on push/PR via GitHub Actions.
