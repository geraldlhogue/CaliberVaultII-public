# Visual Regression Testing Guide

## Overview
Visual regression testing captures screenshots of your application and compares them against baseline images to detect unintended visual changes.

## Setup

### 1. Install Dependencies
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Test Files Location
- Visual tests: `src/test/visual/visual-regression.spec.ts`
- Baseline images: `src/test/visual/*.spec.ts-snapshots/`

## Running Visual Tests

### Create Baseline Images (First Time)
```bash
npm run test:visual:update
```

### Run Visual Regression Tests
```bash
npm run test:visual
```

### Update Snapshots After Intentional Changes
```bash
npm run test:visual:update
```

## Test Coverage

### Current Visual Tests
1. **Homepage** - Full page screenshot
2. **Inventory Dashboard** - Main dashboard view
3. **Add Item Modal** - Modal dialog appearance
4. **Filter Panel** - Filter UI components
5. **Item Card** - Individual item card rendering
6. **Category Views** - All 11 categories (Firearms, Ammunition, Optics, etc.)
7. **Mobile View** - 375x667 viewport
8. **Tablet View** - 768x1024 viewport
9. **Dark Mode** - Theme toggle verification

## Configuration

### Tolerance Settings
- `maxDiffPixels: 100` - Allows up to 100 pixels difference for full page
- `maxDiffPixels: 50` - Stricter tolerance for components

### Viewports Tested
- Desktop: 1280x720 (default)
- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)

## Best Practices

### 1. Wait for Content
Always wait for dynamic content to load:
```typescript
await page.waitForSelector('[data-testid="app-layout"]');
```

### 2. Handle Animations
Add delays for animations to complete:
```typescript
await page.waitForTimeout(500);
```

### 3. Exclude Dynamic Content
Use CSS to hide timestamps, random data:
```typescript
await page.addStyleTag({
  content: '.timestamp { visibility: hidden; }'
});
```

### 4. Test Across Browsers
Run on all browsers to catch browser-specific issues:
```bash
npm run test:visual -- --project=chromium
npm run test:visual -- --project=firefox
npm run test:visual -- --project=webkit
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Visual Tests
  run: npm run test:visual
  
- name: Upload Failed Screenshots
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: visual-regression-failures
    path: test-results/
```

## Troubleshooting

### Flaky Tests
- Increase wait times for animations
- Use `waitForLoadState('networkidle')`
- Disable animations in test mode

### Large Diffs
- Check for font rendering differences
- Verify image loading is complete
- Consider platform-specific baselines

### Storage
Baseline images are stored in git. Keep them optimized:
- Use PNG format (lossless)
- Compress large screenshots
- Consider separate baselines per OS if needed

## Adding New Visual Tests

```typescript
test('new component renders correctly', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("New Component")');
  await page.waitForSelector('[data-testid="new-component"]');
  
  await expect(page).toHaveScreenshot('new-component.png', {
    maxDiffPixels: 50,
  });
});
```

## Maintenance

### Regular Updates
- Update baselines after intentional UI changes
- Review failed tests for legitimate changes
- Keep test suite fast by limiting full-page screenshots

### Cleanup
```bash
# Remove old snapshots
rm -rf src/test/visual/*.spec.ts-snapshots/

# Regenerate all baselines
npm run test:visual:update
```
