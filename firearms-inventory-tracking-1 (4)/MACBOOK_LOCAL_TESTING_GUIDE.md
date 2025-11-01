# MacBook Pro Local Testing Environment - Complete Setup Guide

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
2. **npm** or **yarn** package manager
3. **Git** for version control
4. **VS Code** (recommended IDE)
5. **Terminal** (built-in macOS Terminal or iTerm2)

## Initial Setup

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js and npm
```bash
brew install node
node --version  # Should show v18 or higher
npm --version
```

### 3. Clone Repository
```bash
cd ~/Documents  # Or your preferred directory
git clone <your-repo-url>
cd calibervault
```

### 4. Install Dependencies
```bash
npm install
```

This will install all packages from `package.json` including:
- React and Vite
- Supabase client
- Testing libraries (Vitest, Playwright)
- UI components (shadcn/ui)
- All other dependencies

## Environment Configuration

### 1. Create .env.local File
```bash
touch .env.local
```

### 2. Add Environment Variables
Open `.env.local` in VS Code and add:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (for AI features)
VITE_OPENAI_API_KEY=your_openai_api_key

# Sentry (for error tracking)
VITE_SENTRY_DSN=your_sentry_dsn

# Environment
VITE_ENVIRONMENT=development
```

**Get your Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy URL and anon/public key

## Running the Development Server

### Start Dev Server
```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

### Access from Other Devices (iPhone, iPad)
```bash
npm run dev -- --host
```

Then access via your Mac's IP address:
1. Find your Mac's IP: System Settings > Network
2. Access from device: `http://192.168.1.XXX:5173`

## Testing Environment

### 1. Unit and Integration Tests

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Run Specific Test File
```bash
npm test -- barcode.service
npm test -- PhotoCapture
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### View Coverage Report
```bash
open coverage/index.html
```

### 2. E2E Tests with Playwright

#### Install Playwright Browsers
```bash
npx playwright install
```

#### Run E2E Tests
```bash
npm run test:e2e
```

#### Run E2E Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

#### Run Specific E2E Test
```bash
npx playwright test comprehensive-user-flows
```

#### Debug E2E Test
```bash
npx playwright test --debug
```

### 3. Component Testing

#### Run Component Tests
```bash
npm test -- src/components
```

#### Test Specific Component
```bash
npm test -- AddItemModal
```

## Database Testing

### 1. Local Supabase (Optional)
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# Stop local Supabase
supabase stop
```

### 2. Run Migrations Locally
```bash
supabase db reset
```

### 3. Seed Test Data
```bash
npm run seed:test-data
```

## Mobile Testing on MacBook

### 1. iOS Simulator (Requires Xcode)

#### Install Xcode
```bash
# Install from App Store or
xcode-select --install
```

#### Open iOS Simulator
```bash
open -a Simulator
```

#### Access Dev Server from Simulator
Use `http://localhost:5173` in Safari within simulator

### 2. Android Emulator (Requires Android Studio)

#### Install Android Studio
Download from: https://developer.android.com/studio

#### Start Emulator
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33
```

## Debugging

### 1. VS Code Debugging

#### Create launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### 2. Browser DevTools
- Chrome DevTools: Cmd + Option + I
- React DevTools: Install extension
- Network tab for API calls
- Console for errors

### 3. Test Debugging
```bash
# Debug specific test
npm test -- --inspect-brk PhotoCapture

# Then open chrome://inspect in Chrome
```

## Performance Testing

### 1. Lighthouse
```bash
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

### 2. Bundle Analysis
```bash
npm run build
npm run analyze
```

## Common Issues and Solutions

### Issue: Port 5173 Already in Use
```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Issue: Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase Connection Error
- Check .env.local has correct credentials
- Verify Supabase project is active
- Check network connection

### Issue: Tests Failing
```bash
# Clear test cache
npm test -- --clearCache

# Update snapshots if needed
npm test -- -u
```

## CI/CD Testing Locally

### Run GitHub Actions Locally
```bash
# Install act
brew install act

# Run workflow
act -j test
```

## Performance Optimization

### 1. Enable Fast Refresh
Already enabled in Vite config

### 2. Use SWC Instead of Babel
```bash
npm install -D @vitejs/plugin-react-swc
```

### 3. Optimize Dependencies
```bash
npm run build -- --profile
```

## Testing Checklist

### Before Committing
- [ ] All unit tests pass: `npm test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] E2E tests pass: `npm run test:e2e`

### Before Deploying
- [ ] Coverage ≥85%: `npm run test:coverage`
- [ ] No console errors in dev
- [ ] Performance audit passes
- [ ] Mobile responsive
- [ ] Accessibility audit passes

## Useful Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run dev -- --host         # Expose to network
npm run build                 # Production build
npm run preview               # Preview production build

# Testing
npm test                      # Run all tests
npm test -- --watch          # Watch mode
npm run test:coverage        # With coverage
npm run test:e2e             # E2E tests
npx playwright test --ui     # E2E UI mode

# Code Quality
npm run lint                 # Run ESLint
npm run type-check          # TypeScript check
npm run format              # Format with Prettier

# Database
supabase start              # Start local Supabase
supabase stop               # Stop local Supabase
supabase db reset           # Reset database

# Utilities
npm run clean               # Clean build artifacts
npm audit                   # Security audit
npm outdated                # Check for updates
```

## Next Steps

1. ✅ Complete initial setup
2. ✅ Run `npm install`
3. ✅ Configure `.env.local`
4. ✅ Start dev server
5. ✅ Run test suite
6. ✅ Verify all tests pass
7. ✅ Set up debugging in VS Code
8. ✅ Test on iOS Simulator
9. ✅ Review coverage report
10. ✅ Start developing!

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Testing Library](https://testing-library.com/react)

## Support

For issues or questions:
1. Check this guide first
2. Review test output carefully
3. Check browser console
4. Review Supabase logs
5. Consult documentation

Happy testing! 🚀
