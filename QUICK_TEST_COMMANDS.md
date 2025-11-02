# Quick Test Commands Reference

## Essential Commands

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```
Then open http://localhost:51204/__vitest__/

## Specific Test Commands

### Run Single Test File
```bash
npm test storage.service.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- barcode
```

### Run Tests in Specific Directory
```bash
npm test src/services/__tests__/
```

## Coverage Commands

### Generate Coverage Report
```bash
npm run test:coverage
```

### View HTML Coverage Report
```bash
npm run test:coverage
open coverage/index.html
```
Or on Windows:
```bash
start coverage/index.html
```

### View Coverage Summary
```bash
npm run test:coverage -- --reporter=text
```

## Debug Commands

### Run Tests in Debug Mode
```bash
node --inspect-brk node_modules/.bin/vitest
```

### Clear Test Cache
```bash
npm test -- --clearCache
```

### Update Snapshots
```bash
npm test -- -u
```

## CI/CD Commands

### Run Tests Once (No Watch)
```bash
npm test -- --run
```

### Run Tests with Reporter
```bash
npm test -- --reporter=verbose
```

### Run Tests with Minimum Output
```bash
npm test -- --reporter=basic
```

## Filter Commands

### Run Only Changed Tests
```bash
npm test -- --changed
```

### Run Tests Related to Files
```bash
npm test -- --related src/services/storage.service.ts
```

### Run Failed Tests Only
```bash
npm test -- --only-failed
```

## Coverage Thresholds

Current thresholds (set in vitest.config.ts):
- Lines: 85%
- Functions: 85%
- Branches: 85%
- Statements: 85%

### Check If Coverage Meets Thresholds
```bash
npm run test:coverage
```
Will fail if coverage is below 85%

## Quick Troubleshooting

### Tests Not Running?
```bash
npm install
npm test -- --clearCache
```

### Coverage Not Generating?
```bash
rm -rf coverage
npm run test:coverage
```

### Port Already in Use (UI)?
```bash
npm run test:ui -- --port 51205
```

## GitHub Actions Integration

Tests run automatically on:
- Every push to main/develop
- Every pull request
- Manual workflow dispatch

View results at:
https://github.com/YOUR_USERNAME/YOUR_REPO/actions

## Test File Locations

```
src/
├── components/__tests__/      # Component tests
├── services/__tests__/         # Service tests
├── hooks/__tests__/            # Hook tests
├── lib/__tests__/              # Library tests
└── utils/__tests__/            # Utility tests
```

## Coverage Report Locations

```
coverage/
├── index.html                  # Main coverage report
├── lcov.info                   # LCOV format
├── coverage-summary.json       # JSON summary
└── [various directories]       # Detailed reports
```

## Quick Reference Table

| Command | Purpose | Output |
|---------|---------|--------|
| `npm test` | Run all tests | Terminal |
| `npm run test:coverage` | Run with coverage | Terminal + HTML |
| `npm run test:watch` | Watch mode | Terminal |
| `npm run test:ui` | Visual UI | Browser |
| `npm test -- -u` | Update snapshots | Terminal |
| `npm test filename` | Run specific test | Terminal |

## Environment Variables

Set these for different behaviors:

```bash
# Run in CI mode
CI=true npm test

# Set custom port for UI
VITE_PORT=3001 npm run test:ui

# Verbose output
DEBUG=* npm test
```

## Tips

1. **Use Watch Mode During Development**
   ```bash
   npm run test:watch
   ```

2. **Use UI for Visual Debugging**
   ```bash
   npm run test:ui
   ```

3. **Check Coverage Before Commit**
   ```bash
   npm run test:coverage
   ```

4. **Run Specific Tests While Developing**
   ```bash
   npm test storage.service
   ```

5. **Update Snapshots Carefully**
   ```bash
   npm test -- -u
   # Review changes before committing!
   ```

---

**Quick Start**: `npm test`
**Full Coverage**: `npm run test:coverage`
**Interactive**: `npm run test:ui`
