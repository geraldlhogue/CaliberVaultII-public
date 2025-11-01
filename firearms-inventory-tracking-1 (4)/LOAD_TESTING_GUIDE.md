# Load Testing Guide for CaliberVault

## Overview
This guide covers load testing infrastructure using K6 to ensure CaliberVault can handle production traffic loads.

## Installation

### Mac Setup
```bash
# Install K6 using Homebrew
brew install k6

# Verify installation
k6 version
```

### Linux Setup
```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Running Load Tests

### Basic Load Test
```bash
k6 run k6-load-test.js
```

### With Environment Variables
```bash
k6 run \
  -e BASE_URL=https://your-app.vercel.app \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_ANON_KEY=your-anon-key \
  k6-load-test.js
```

### Generate HTML Report
```bash
k6 run --out json=test-results.json k6-load-test.js
k6 report test-results.json --out html=report.html
```

## Test Scenarios

### 1. Smoke Test (Quick Validation)
```bash
k6 run --vus 1 --duration 1m k6-load-test.js
```

### 2. Load Test (Normal Traffic)
```bash
k6 run --vus 10 --duration 5m k6-load-test.js
```

### 3. Stress Test (Breaking Point)
```bash
k6 run --vus 100 --duration 10m k6-load-test.js
```

### 4. Spike Test (Sudden Traffic)
```bash
k6 run --stage 0s:0,10s:100,1m:100,10s:0 k6-load-test.js
```

### 5. Soak Test (Sustained Load)
```bash
k6 run --vus 50 --duration 2h k6-load-test.js
```

## Performance Thresholds

### Current Thresholds
- **Response Time (p95)**: < 500ms
- **Response Time (p99)**: < 1000ms
- **Error Rate**: < 1%
- **Inventory Load Time (p95)**: < 1000ms
- **Search Time (p95)**: < 300ms
- **Add Item Time (p95)**: < 800ms

### Adjusting Thresholds
Edit `k6-load-test.js`:
```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};
```

## Metrics Explained

### Built-in Metrics
- **http_req_duration**: Total request time
- **http_req_waiting**: Time to first byte (TTFB)
- **http_req_sending**: Time sending data
- **http_req_receiving**: Time receiving data
- **http_req_failed**: Failed request rate
- **http_reqs**: Total HTTP requests
- **vus**: Number of virtual users
- **vus_max**: Max virtual users

### Custom Metrics
- **inventory_load_time**: Time to load inventory page
- **search_time**: Search operation duration
- **add_item_time**: Time to add new item
- **errors**: Custom error rate

## Analyzing Results

### Key Indicators
1. **Response Time Trends**: Should remain stable under load
2. **Error Rate**: Should stay below 1%
3. **Throughput**: Requests per second
4. **Virtual Users**: Concurrent users supported

### Red Flags
- Response time increasing linearly with users
- Error rate above 5%
- Memory leaks (increasing response times over time)
- Database connection pool exhaustion

## CI/CD Integration

### GitHub Actions
Add to `.github/workflows/load-test.yml`:
```yaml
name: Load Testing
on:
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday 2am
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install K6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run Load Test
        run: |
          k6 run \
            -e BASE_URL=${{ secrets.PRODUCTION_URL }} \
            -e SUPABASE_URL=${{ secrets.SUPABASE_URL }} \
            -e SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }} \
            k6-load-test.js
```

## Best Practices

### 1. Start Small
- Begin with smoke tests (1 user)
- Gradually increase load
- Identify baseline performance

### 2. Test Realistic Scenarios
- Mix of read/write operations
- Typical user workflows
- Peak traffic patterns

### 3. Monitor System Resources
- CPU usage
- Memory consumption
- Database connections
- Network bandwidth

### 4. Test in Production-Like Environment
- Same infrastructure
- Similar data volumes
- Realistic network conditions

### 5. Regular Testing
- Weekly load tests
- Before major releases
- After infrastructure changes

## Troubleshooting

### High Response Times
- Check database query performance
- Review API endpoint optimization
- Verify CDN configuration
- Check connection pooling

### High Error Rates
- Review application logs
- Check database connection limits
- Verify rate limiting configuration
- Monitor third-party API limits

### Memory Issues
- Check for memory leaks
- Review caching strategy
- Optimize large queries
- Implement pagination

## Advanced Features

### Cloud Execution
```bash
# Run on K6 Cloud
k6 cloud k6-load-test.js
```

### Custom Scenarios
```javascript
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
    },
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
    },
  },
};
```

## Resources
- [K6 Documentation](https://k6.io/docs/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [K6 Cloud](https://k6.io/cloud/)
