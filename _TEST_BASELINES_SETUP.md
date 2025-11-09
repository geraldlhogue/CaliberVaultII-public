# Visual Test Baselines Setup Guide

## Overview
Visual regression testing captures screenshots of your application and compares them against baseline images to detect unintended visual changes.

## Setup Instructions

### 1. Generate Initial Baselines

```bash
# Generate baselines for all visual tests
npm run test:visual:update

# Or using Playwright directly
npx playwright test src/test/visual --update-snapshots
```

### 2. Baseline Storage

Baselines are stored in:
```
src/test/visual/__screenshots__/
├── chromium/
│   ├── inventory-dashboard-baseline.png
│   ├── login-page-baseline.png
│   └── ...
├── firefox/
└── webkit/
```

### 3. Running Visual Tests

```bash
# Run all visual regression tests
npm run test:visual

# Run specific test
npx playwright test src/test/visual/visual-tests.spec.ts

# Run with UI mode
npx playwright test --ui
```

## Test Coverage

### Current Visual Tests
1. **Login Page** - Authentication UI
2. **Inventory Dashboard** - Main inventory view
3. **Add Item Modal** - Item creation form
4. **Item Card** - Individual item display
5. **Filter Panel** - Search and filter UI
6. **Analytics Dashboard** - Charts and metrics
7. **Mobile Views** - Responsive layouts

### Baseline Update Triggers
- UI component changes
- Style/theme updates
- Layout modifications
- New features added

## Configuration

### Playwright Visual Config
```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

### Threshold Settings
- **Pixel Difference**: 0.2% (adjustable)
- **Max Diff Pixels**: 100
- **Threshold**: 0.3

## Best Practices

### 1. Baseline Management
- Review all baseline changes in PR reviews
- Update baselines only for intentional changes
- Keep baselines in version control
- Document baseline update reasons

### 2. Test Stability
- Wait for animations to complete
- Ensure data is loaded
- Use fixed viewport sizes
- Disable dynamic content (dates, random data)

### 3. CI/CD Integration
```yaml
# .github/workflows/visual-tests.yml
- name: Run Visual Tests
  run: npm run test:visual
- name: Upload Failed Screenshots
  if: failure()
  uses: actions/upload-artifact@v3
```

## Troubleshooting

### Flaky Tests
- Add explicit waits for content
- Disable animations in test mode
- Use stable test data
- Increase timeout values

### Baseline Mismatches
```bash
# View diff images
open src/test/visual/__screenshots__/chromium/*-diff.png

# Update specific baseline
npx playwright test visual-tests.spec.ts:15 --update-snapshots
```

### Cross-Browser Differences
- Expect slight variations between browsers
- Adjust thresholds per browser if needed
- Focus on critical visual regressions

## Maintenance Schedule

### Weekly
- Review failed visual tests
- Update baselines for approved changes

### Monthly
- Audit baseline coverage
- Add tests for new features
- Clean up obsolete baselines

### Quarterly
- Review threshold settings
- Optimize test performance
- Update documentation

## Integration with QA Process

1. **Pre-Commit**: Run visual tests locally
2. **PR Review**: Check baseline changes
3. **CI Pipeline**: Automated visual testing
4. **Release**: Full visual regression suite

## Metrics

Track these metrics:
- Number of visual tests
- Baseline update frequency
- False positive rate
- Test execution time
- Coverage percentage
