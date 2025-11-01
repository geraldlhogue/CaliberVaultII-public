# Performance Testing Guide

## Overview
Performance testing ensures CaliberVault loads quickly and responds efficiently to user interactions.

## Setup

### 1. Install Dependencies
```bash
npm install --save-dev @playwright/test lighthouse
```

### 2. Test Files Location
- Performance tests: `src/test/performance/performance.spec.ts`
- Results: `test-results/performance/`

## Running Performance Tests

### Run All Performance Tests
```bash
npm run test:performance
```

### Run Specific Test
```bash
npm run test:performance -- --grep "homepage loads"
```

## Test Coverage

### Current Performance Tests

#### 1. Page Load Time
- **Target**: < 3 seconds
- **Measures**: Time from navigation to app-layout visible
- **Test**: Homepage initial load

#### 2. Core Web Vitals
- **FCP (First Contentful Paint)**: < 1.8s (Good)
- **LCP (Largest Contentful Paint)**: < 2.5s (Good)
- **CLS (Cumulative Layout Shift)**: < 0.1 (Good)
- **FID (First Input Delay)**: < 100ms (Good)

#### 3. Inventory List Rendering
- **Target**: < 2 seconds
- **Measures**: Time to render item cards
- **Test**: Large inventory list performance

#### 4. Search Performance
- **Target**: < 500ms
- **Measures**: Search debounce + filter time
- **Test**: Real-time search filtering

#### 5. Filter Application
- **Target**: < 1 second
- **Measures**: Category filter response time
- **Test**: Category switching performance

#### 6. Image Loading
- **Target**: All images loaded
- **Measures**: Image complete status
- **Test**: Optimized image loading

## Performance Budgets

### Page Weight
- **HTML**: < 50KB
- **CSS**: < 100KB
- **JavaScript**: < 500KB (initial bundle)
- **Images**: < 200KB per image
- **Total Page**: < 2MB

### Timing Budgets
- **Time to Interactive**: < 3.5s
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 300ms

## Lighthouse Integration

### Run Lighthouse Audit
```bash
npx lighthouse http://localhost:5173 --view
```

### Lighthouse CI
```yaml
- name: Run Lighthouse
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

### Lighthouse Configuration
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}]
      }
    }
  }
}
```

## Optimization Techniques

### 1. Code Splitting
```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 2. Image Optimization
- Use WebP format
- Implement lazy loading
- Compress images
- Use responsive images

### 3. Bundle Optimization
- Tree shaking
- Minification
- Compression (gzip/brotli)
- Code splitting

### 4. Caching Strategy
- Service Worker caching
- Browser caching headers
- CDN usage
- IndexedDB for offline data

## Monitoring

### Real User Monitoring (RUM)
```typescript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Performance Observer
```typescript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Performance Tests
  run: npm run test:performance
  
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
```

## Troubleshooting

### Slow Load Times
1. Check network waterfall
2. Identify render-blocking resources
3. Optimize critical rendering path
4. Reduce JavaScript execution time

### Poor Core Web Vitals
1. **FCP**: Reduce server response time, eliminate render-blocking resources
2. **LCP**: Optimize images, preload critical resources
3. **CLS**: Set dimensions on images/videos, avoid dynamic content insertion
4. **FID**: Break up long tasks, use web workers

## Best Practices

### 1. Test on Real Devices
- Use Playwright device emulation
- Test on actual mobile devices
- Throttle network (3G, 4G)

### 2. Consistent Testing Environment
- Same hardware/network conditions
- Warm vs cold cache scenarios
- Multiple runs for averages

### 3. Continuous Monitoring
- Track performance over time
- Set up alerts for regressions
- Review performance in PRs

## Adding New Performance Tests

```typescript
test('new feature performs well', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/new-feature');
  await page.waitForSelector('[data-testid="feature-loaded"]');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});
```
