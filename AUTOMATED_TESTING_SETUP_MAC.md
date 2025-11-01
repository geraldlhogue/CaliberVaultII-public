# Automated Testing Setup Guide for Mac

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

### 3. Install Git
```bash
brew install git
git --version
```

## Project Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd calibervault
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Playwright Browsers
```bash
npx playwright install
npx playwright install-deps
```

## Test Database Configuration

### 1. Create Test Environment File
Create `.env.test` in project root:

```env
VITE_SUPABASE_URL=your_test_supabase_url
VITE_SUPABASE_ANON_KEY=your_test_supabase_anon_key
```

### 2. Set Up Test Database (Supabase)

Option A: Use Supabase CLI
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize Supabase locally
supabase init

# Start local Supabase
supabase start

# Run migrations
supabase db reset
```

Option B: Use Separate Supabase Project
1. Create new project at https://supabase.com
2. Name it "CaliberVault-Test"
3. Run all migrations from `supabase/migrations/`
4. Update `.env.test` with test project credentials

## Running Tests

### Unit Tests (Vitest)
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test src/services/__tests__/inventory.service.test.ts
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e src/test/e2e/comprehensive-inventory-crud.spec.ts

# Run specific browser
npm run test:e2e -- --project=webkit

# Debug mode
npm run test:e2e -- --debug
```

### Integration Tests
```bash
npm run test:integration
```

## Test Scripts (add to package.json)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

## CI/CD Pipeline Setup

### GitHub Actions (Already Configured)

The repository includes:
- `.github/workflows/quality-gate.yml` - Runs on PR/push
- `.github/workflows/test-coverage.yml` - Coverage reporting
- `.github/workflows/ci.yml` - Continuous integration

### Quality Gates
- **Code Coverage**: 70% minimum (lines, functions, branches, statements)
- **Test Pass Rate**: 100%
- **Build**: Must succeed
- **Linting**: Must pass

## Running Quality Gate Locally

```bash
# Run full quality check
npm run lint && npm run test:coverage && npm run build

# Check coverage threshold
npm run test:coverage -- --coverage.thresholds.lines=70
```

## Playwright UI Mode (Recommended for Development)

```bash
# Open Playwright UI
npx playwright test --ui

# Features:
# - Visual test runner
# - Time travel debugging
# - Watch mode
# - Pick locator tool
```

## Test Data Management

### Seeding Test Data
```bash
# Run data seeder
npm run seed:test

# Or manually via Supabase function
curl -X POST \
  "YOUR_SUPABASE_URL/functions/v1/seed-test-data" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Cleaning Test Data
```bash
# Reset test database
supabase db reset --db-url "postgresql://..."
```

## Debugging Tests

### Vitest Debugging (VS Code)
1. Install "Vitest" extension
2. Click debug icon next to test
3. Set breakpoints in code

### Playwright Debugging
```bash
# Playwright Inspector
PWDEBUG=1 npx playwright test

# Trace viewer
npx playwright show-trace trace.zip
```

## Common Issues & Solutions

### Issue: Playwright browsers not found
```bash
npx playwright install --with-deps
```

### Issue: Port 5173 already in use
```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

### Issue: Test database connection fails
- Verify `.env.test` credentials
- Check Supabase project is running
- Verify network connectivity

### Issue: Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server started properly
- Verify test selectors are correct

## Performance Optimization

### Parallel Test Execution
```bash
# Run tests in parallel (default)
npm run test:e2e

# Limit workers
npm run test:e2e -- --workers=2
```

### Faster Feedback Loop
```bash
# Run only changed tests
npm run test -- --changed

# Run tests related to specific file
npm run test -- --related src/services/inventory.service.ts
```

## Continuous Monitoring

### Coverage Reports
After running tests, open:
```bash
open coverage/index.html
```

### Playwright Report
```bash
npx playwright show-report
```

## Next Steps

1. ✅ Install all dependencies
2. ✅ Configure test database
3. ✅ Run unit tests: `npm run test`
4. ✅ Run E2E tests: `npm run test:e2e`
5. ✅ Check coverage: `npm run test:coverage`
6. ✅ Set up CI/CD (push to GitHub)
7. ✅ Monitor quality gates in PRs

## Resources

- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Supabase Testing](https://supabase.com/docs/guides/testing)
- [GitHub Actions](https://docs.github.com/en/actions)
