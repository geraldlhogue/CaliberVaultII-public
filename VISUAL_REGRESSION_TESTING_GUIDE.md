# Visual Regression Testing Guide

## Overview
Visual regression testing captures screenshots and compares them to detect unintended UI changes.

## Setup

### Install Dependencies
```bash
npm install --save-dev @playwright/test playwright-chromium
npx playwright install chromium
```

### Configuration
Visual tests are configured in `src/test/visual/visual-regression.spec.ts`

## Running Tests

### Capture Baseline Screenshots
```bash
npm run test:visual:update
```

### Run Visual Tests
```bash
npm run test:visual
```

### View Test Report
```bash
npx playwright show-report
```

## Test Coverage

### Pages Tested
- ✅ Login Page
- ✅ Inventory Dashboard
- ✅ Add Item Modal
- ✅ Item Detail Modal
- ✅ Filter Panel
- ✅ Admin Dashboard
- ✅ Analytics Dashboard
- ✅ Settings Page

### Components Tested
- ✅ Navigation Bar
- ✅ Item Cards
- ✅ Stat Cards
- ✅ Modals
- ✅ Forms
- ✅ Tables
- ✅ Charts

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Nightly builds

## Troubleshooting

### False Positives
Adjust threshold in test:
```typescript
expect(await page.screenshot()).toMatchSnapshot('page.png', {
  threshold: 0.2 // 20% difference allowed
});
```

### Update Snapshots
```bash
npm run test:visual:update
```

## Best Practices
1. Test stable UI states
2. Use consistent viewport sizes
3. Wait for animations to complete
4. Mock dynamic data
5. Test across browsers
