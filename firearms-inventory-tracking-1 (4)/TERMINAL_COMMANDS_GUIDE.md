# Terminal Commands Guide for CaliberVault

## How to Use This Guide
1. Open your terminal application
2. Navigate to your project folder (the CaliberVault folder)
3. Copy and paste the commands exactly as shown below
4. Press Enter after each command

---

## 📦 INITIAL SETUP (Do this once after cloning or updating package.json)

```bash
npm install
```
**What it does:** Installs all required dependencies including @types/qrcode

---

## 🧪 TESTING COMMANDS

### Run All Unit Tests
```bash
npm test
```
**What it does:** Runs all unit tests with Vitest
**When to use:** Before committing code, after making changes

### Run Tests with Visual UI
```bash
npm run test:ui
```
**What it does:** Opens an interactive test interface in your browser
**When to use:** When you want to see test results visually and debug

### Run Tests with Coverage Report
```bash
npm run test:coverage
```
**What it does:** Runs tests and shows how much code is covered by tests
**When to use:** Before releases to ensure 70%+ coverage

### Run E2E (End-to-End) Tests
```bash
npm run test:e2e
```
**What it does:** Tests the entire app like a real user would
**When to use:** Before major releases

### Run E2E Tests with Visual UI
```bash
npm run test:e2e:ui
```
**What it does:** Opens Playwright test UI to watch tests run
**When to use:** When debugging E2E test failures

### Run E2E Tests in Debug Mode
```bash
npm run test:e2e:debug
```
**What it does:** Runs E2E tests step-by-step for debugging
**When to use:** When an E2E test is failing and you need to see why

---

## 🚀 DEVELOPMENT COMMANDS

### Start Development Server
```bash
npm run dev
```
**What it does:** Starts the app locally at http://localhost:5173
**When to use:** During development to see changes in real-time

### Build for Production
```bash
npm run build
```
**What it does:** Creates optimized production files in the `dist` folder
**When to use:** Before deploying to production

### Preview Production Build
```bash
npm run preview
```
**What it does:** Previews the production build locally
**When to use:** After building to test the production version

### Type Check
```bash
npm run type-check
```
**What it does:** Checks for TypeScript errors without building
**When to use:** Before committing to catch type errors

---

## 📱 MOBILE TESTING WORKFLOW

See `MOBILE_DEPLOYMENT_GUIDE.md` for complete mobile testing instructions.

### Quick Mobile Test Commands
```bash
# 1. Install dependencies
npm install

# 2. Run tests
npm test

# 3. Build production version
npm run build

# 4. Deploy to hosting (Netlify/Vercel)
# Follow MOBILE_DEPLOYMENT_GUIDE.md for deployment steps
```

---

## 🔧 TROUBLESHOOTING COMMANDS

### Clear Node Modules and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```
**When to use:** When dependencies seem corrupted

### Clear Build Cache
```bash
rm -rf dist .vite
npm run build
```
**When to use:** When build seems stuck or corrupted

### Check for Outdated Packages
```bash
npm outdated
```
**When to use:** Monthly maintenance check

---

## 📋 RECOMMENDED WORKFLOW

### Before Every Commit:
```bash
npm test
npm run build
```

### Before Every Release:
```bash
npm run test:coverage
npm run test:e2e
npm run build
```

### Weekly Maintenance:
```bash
npm outdated
npm audit
```

---

## 🆘 COMMON ERRORS AND FIXES

### Error: "Command not found"
**Fix:** Make sure you're in the project directory
```bash
cd path/to/CaliberVault
```

### Error: "Cannot find module"
**Fix:** Install dependencies
```bash
npm install
```

### Error: "Port 5173 already in use"
**Fix:** Kill the existing process or use a different port
```bash
# Kill process on port 5173 (Mac/Linux)
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

### Error: Tests failing
**Fix:** Check test output and see TESTING_GUIDE.md for details
```bash
npm run test:ui
```

---

## 📚 Additional Resources

- **Testing Guide:** `TESTING_GUIDE.md`
- **Mobile Deployment:** `MOBILE_DEPLOYMENT_GUIDE.md`
- **Feature Locations:** `FEATURE_LOCATION_GUIDE.md`
- **Quick Start:** `QUICK_START_GUIDE.md`
