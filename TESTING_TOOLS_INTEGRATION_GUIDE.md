# Testing Tools Integration Guide for CaliberVault

## Overview
This guide provides detailed setup instructions for integrating and using testing tools with CaliberVault on MacBook Pro, iOS, and Android devices.

## 1. Testing Tools Setup

### Playwright (E2E Testing)
**Purpose:** End-to-end testing for offline functionality, API integrations, and user workflows

**Installation:**
```bash
# In VS Code Terminal
npm install --save-dev @playwright/test
npx playwright install
npx playwright install-deps
```

**VS Code Extension:**
1. Open Extensions (⌘⇧X)
2. Search "Playwright Test for VSCode"
3. Install by Microsoft

**Configuration:** Already configured in `playwright.config.ts`

**Running Tests:**
```bash
# Run all tests
npm run test:e2e

# Run in UI mode (recommended for debugging)
npx playwright test --ui

# Generate tests using Codegen
npx playwright codegen http://localhost:5173

# Run specific test file
npx playwright test src/test/e2e/comprehensive-categories.spec.ts
```

### Google Lighthouse (PWA Audit)
**Purpose:** Audit PWA offline capabilities, performance, and manifest

**Setup:**
1. Ensure Chrome is installed
2. Open CaliberVault in Chrome
3. Open DevTools (⌘⌥I)
4. Navigate to Lighthouse tab
5. Select categories: Performance, PWA, Accessibility
6. Click "Analyze page load"

**Weekly Audit Checklist:**
- [ ] PWA score > 90%
- [ ] Offline capability verified
- [ ] Performance score > 80%
- [ ] No manifest errors

### Thunder Client (API Testing)
**Purpose:** Test external API integrations (Dropbox, OneDrive, barcode lookups)

**Installation:**
1. Open VS Code Extensions (⌘⇧X)
2. Search "Thunder Client"
3. Install by Ranga Vadhineni
4. Access via Activity Bar icon

**Testing Workflow:**
```
1. Create Collections:
   - Barcode API Tests
   - Cloud Storage Tests
   - Supabase Tests

2. Environment Variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - DROPBOX_TOKEN
   - ONEDRIVE_TOKEN

3. Test Scenarios:
   - Offline queue sync
   - Barcode lookup with cache
   - Cloud backup/restore
```

### BrowserStack (Real Device Testing)
**Purpose:** Test on real iOS/Android devices before release

**Setup:**
1. Sign up at https://www.browserstack.com
2. Get free trial (or $29/month for teams)
3. Install BrowserStack Local:
```bash
brew install --cask browserstack-local
```

**Testing Process:**
```bash
# Build production bundle
npm run build

# Start BrowserStack tunnel
./BrowserStackLocal --key YOUR_ACCESS_KEY

# Upload to BrowserStack App Live
# Test on real devices via dashboard
```

**Device Test Matrix:**
- iOS: iPhone 12-15, iPad Pro
- Android: Pixel 6-8, Samsung Galaxy S22-24
- Test: PWA install, offline mode, camera, barcode scanning

### WebPageTest (Performance Benchmarking)
**Purpose:** Monthly performance audits for offline/online modes

**Usage:**
1. Visit https://www.webpagetest.org
2. Enter production URL
3. Advanced Settings:
   - Test Location: Nearest to users
   - Browser: Chrome
   - Connection: 3G Fast (worst case)
   - Number of Tests: 3
4. Save results for trend analysis

**Performance Targets:**
- First Contentful Paint: < 2s
- Time to Interactive: < 4s
- Offline cache: < 10MB
- Service Worker: Active

## 2. Deployment & Monitoring

### Supabase Hosting
**Setup:**
1. Login to Supabase Dashboard
2. Create new project or use existing
3. Settings > Hosting
4. Connect GitHub repository
5. Environment variables:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Auto-deployment:**
- Push to main branch triggers deployment
- Preview deployments for PRs
- Rollback via dashboard

### Sentry.io (Error Monitoring)
**Installation:**
```bash
npm install @sentry/react @sentry/integrations
```

**Configuration (already in src/lib/sentry.ts):**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

**Alert Rules:**
1. Dashboard > Alerts > Create Alert
2. Set conditions:
   - Error rate > 5% → Email/Slack
   - New error type → Immediate notification
   - Performance regression > 20% → Warning

## 3. Local Testing Workflows

### Offline Testing Checklist
```bash
# 1. Start dev server
npm run dev

# 2. Open Chrome DevTools > Network
# 3. Set to "Offline"
# 4. Test these features:
- [ ] View inventory (cached data)
- [ ] Add new items (queued)
- [ ] Edit items (queued)
- [ ] Take photos (local storage)
- [ ] Barcode scanning (cached lookups)
- [ ] Switch online - verify sync

# 5. Check IndexedDB
# DevTools > Application > IndexedDB
# Verify: inventory_cache, sync_queue, photo_cache
```

### Mobile Device Testing

#### iOS Testing (iPhone/iPad)
```bash
# 1. Connect iPhone via USB
# 2. Trust computer on device
# 3. Safari > Develop > [Device Name]

# Local network testing:
npm run dev -- --host
# Access via: http://[your-mac-ip]:5173

# PWA Installation:
# Safari > Share > Add to Home Screen
```

#### Android Testing
```bash
# 1. Enable Developer Mode on Android
# 2. USB Debugging ON
# 3. Chrome > chrome://inspect

# Or use wireless debugging:
adb connect [device-ip]:5555
# Access via local network URL
```

## 4. Continuous Integration

### GitHub Actions Workflow
Already configured in `.github/workflows/`:
- `ci.yml` - Runs on every push
- `test-coverage.yml` - Coverage reports
- `quality-gate.yml` - Code quality checks

### Pre-commit Testing
```bash
# Run before committing
npm run test:unit
npm run test:e2e
npm run lint
npm run type-check
```

## 5. Testing Schedule

### Daily
- [ ] Run unit tests locally
- [ ] Test critical user paths
- [ ] Check error logs in Sentry

### Weekly
- [ ] Full E2E test suite
- [ ] Lighthouse PWA audit
- [ ] Mobile device testing
- [ ] Performance benchmarks

### Before Release
- [ ] BrowserStack device matrix
- [ ] WebPageTest performance
- [ ] Offline scenario testing
- [ ] Security audit
- [ ] Accessibility testing

## 6. Troubleshooting

### Common Issues

**Playwright tests failing:**
```bash
# Clear test cache
rm -rf test-results/ playwright-report/
# Update browsers
npx playwright install --with-deps
```

**Service Worker not updating:**
```javascript
// Force update in console
navigator.serviceWorker.getRegistration().then(reg => {
  reg.unregister();
  location.reload();
});
```

**IndexedDB quota exceeded:**
```javascript
// Clear storage
await navigator.storage.estimate();
// If > 80% used, clear old cache
```

## 7. Contact & Support

- **Testing Issues:** Create issue in GitHub repo
- **Sentry Alerts:** Check dashboard daily
- **BrowserStack:** support@browserstack.com
- **Performance:** Use Lighthouse CI for trends