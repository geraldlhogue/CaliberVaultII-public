# Performance Testing Guide

## Overview
Comprehensive performance testing framework for CaliberVault using k6 and Playwright.

## Load Testing with k6

### Installation
```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Running Load Tests
```bash
# Basic load test
k6 run k6-performance-tests.js

# With custom base URL
k6 run --env BASE_URL=https://calibervault.com k6-performance-tests.js

# With custom VUs and duration
k6 run --vus 100 --duration 5m k6-performance-tests.js

# Output to JSON
k6 run --out json=test-results.json k6-performance-tests.js
```

## Playwright Performance Tests

### Running Performance Tests
```bash
# Run all performance tests
npm run test:performance

# Run with UI
npx playwright test src/test/performance --ui

# Run specific test
npx playwright test src/test/performance/load-testing.spec.ts
```

## Performance Metrics

### Key Metrics to Monitor
- **Page Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **API Response Time**: < 500ms (p95)
- **Error Rate**: < 1%
- **Concurrent Users**: Support 100+ simultaneous users

### Thresholds
```javascript
{
  http_req_duration: ['p(95)<500'],  // 95th percentile under 500ms
  http_req_failed: ['rate<0.01'],    // Less than 1% failures
  http_reqs: ['rate>100'],           // More than 100 req/s
}
```

## CI/CD Integration

Performance tests run automatically on:
- Pull requests to main
- Scheduled nightly runs
- Manual workflow dispatch

## Analyzing Results

### k6 Output
```bash
# View summary
k6 run k6-performance-tests.js

# Generate HTML report
k6 run --out json=results.json k6-performance-tests.js
k6-reporter results.json
```

### Playwright Traces
```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Performance Optimization Tips

1. **Code Splitting**: Lazy load routes and components
2. **Image Optimization**: Use WebP, lazy loading
3. **Caching**: Implement service workers
4. **Database**: Add indexes, optimize queries
5. **CDN**: Use CDN for static assets
