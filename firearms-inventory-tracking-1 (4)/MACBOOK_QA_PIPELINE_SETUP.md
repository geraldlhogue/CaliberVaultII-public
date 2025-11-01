# MacBook Pro QA Pipeline Setup Guide

## Overview
Complete guide to setting up and running the full QA testing pipeline on your MacBook Pro.

## Prerequisites

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js and npm
```bash
brew install node
node --version  # Should be v18 or higher
npm --version
```

### 3. Install K6 for Load Testing
```bash
brew install k6
k6 version
```

## Project Setup

### 1. Clone and Install Dependencies
```bash
cd /path/to/calibervault
npm install
```

### 2. Install Playwright Browsers
```bash
npx playwright install
npx playwright install-deps
```

### 3. Set Up Environment Variables
Create `.env.local` file:
```bash
cp .env.test.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Running Tests

### Unit Tests (Vitest)
```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test src/test/e2e/auth.spec.ts
```

### Visual Regression Tests
```bash
# Run visual tests
npm run test:visual

# Update snapshots (after intentional UI changes)
npm run test:visual:update
```

### Performance Tests
```bash
# Run performance tests
npm run test:performance

# View performance report
npx playwright show-report
```

### Accessibility Tests
```bash
# Run accessibility tests
npm run test:accessibility

# View detailed report
npx playwright show-report
```

### Security Tests
```bash
# Run security tests
npm run test:security
```

### Load Tests (K6)
```bash
# Run smoke test (minimal load)
npm run load-test:smoke

# Run standard load test
npm run load-test

# Run stress test (high load)
npm run load-test:stress

# Run spike test (sudden traffic spike)
npm run load-test:spike
```

### Run All Tests
```bash
# Run complete test suite
npm run test:all
```

## Test Data Seeding

### Seed Development Data
```bash
npm run seed:dev
```

### Seed Test Data
```bash
npm run seed:test
```

### Seed Load Test Data
```bash
npm run seed:load
```

## Viewing Test Reports

### Playwright HTML Report
```bash
npx playwright show-report
```

### Vitest Coverage Report
```bash
npm run test:coverage
open coverage/index.html
```

### K6 Load Test Results
Results are displayed in terminal after test completion.

## Continuous Integration Locally

### Run Pre-Commit Checks
```bash
# Lint code
npm run lint

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e
```

### Full CI Pipeline Simulation
```bash
# Run everything the CI runs
npm run lint && \
npm run test:coverage && \
npm run test:e2e && \
npm run test:visual && \
npm run test:performance && \
npm run test:accessibility && \
npm run test:security
```

## Troubleshooting

### Playwright Issues
```bash
# Reinstall browsers
npx playwright install --force

# Clear cache
rm -rf ~/.cache/ms-playwright
npx playwright install
```

### Port Already in Use
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues
```bash
# Verify Supabase credentials
cat .env.local

# Test connection
npm run dev
# Open http://localhost:5173 and check console
```

### K6 Not Found
```bash
# Reinstall K6
brew uninstall k6
brew install k6
```

## Performance Optimization

### Parallel Test Execution
```bash
# Run tests in parallel (faster)
npx playwright test --workers=4
```

### Headed Mode (See Browser)
```bash
# Run tests with visible browser
npx playwright test --headed
```

### Debug Mode
```bash
# Run with debugger
npx playwright test --debug
```

## Best Practices

1. **Run Tests Before Committing**
   ```bash
   npm run test && npm run test:e2e
   ```

2. **Update Snapshots Carefully**
   - Only update after intentional UI changes
   - Review diff before committing

3. **Monitor Test Performance**
   - Keep tests fast (< 30s for E2E)
   - Use test.skip() for flaky tests temporarily

4. **Regular Test Maintenance**
   - Update test data monthly
   - Review and fix flaky tests
   - Keep dependencies updated

## Quick Reference

### Most Common Commands
```bash
# Development
npm run dev

# Unit tests
npm run test

# E2E tests with UI
npm run test:e2e:ui

# All tests
npm run test:all

# Load test
npm run load-test:smoke
```

### File Locations
- Unit tests: `src/**/__tests__/*.test.ts(x)`
- E2E tests: `src/test/e2e/*.spec.ts`
- Visual tests: `src/test/visual/*.spec.ts`
- Performance tests: `src/test/performance/*.spec.ts`
- Accessibility tests: `src/test/accessibility/*.spec.ts`
- Security tests: `src/test/security/*.spec.ts`
- Load tests: `k6-load-test.js`

## Related Documentation
- `AUTOMATED_TESTING_GUIDE.md` - Comprehensive testing guide
- `LOAD_TESTING_GUIDE.md` - K6 load testing details
- `SECURITY_TESTING_GUIDE.md` - Security testing procedures
- `VISUAL_REGRESSION_TESTING_GUIDE.md` - Visual testing guide
- `PERFORMANCE_TESTING_GUIDE.md` - Performance testing guide
- `ACCESSIBILITY_TESTING_GUIDE.md` - Accessibility testing guide
- `TEST_DATA_SEEDING_GUIDE.md` - Test data management
