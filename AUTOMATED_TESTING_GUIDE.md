# Automated Testing & CI/CD Guide

## 🎯 Overview

CaliberVault now has a complete automated testing and deployment system that runs every time you push code to GitHub.

---

## 🤖 What Happens Automatically

### When You Push Code to GitHub:

1. **Automated Tests Run** - All unit and E2E tests execute
2. **Code Coverage Calculated** - Shows how much code is tested
3. **Build Verification** - Ensures the app builds successfully
4. **Test Reports Generated** - Detailed results saved

### When You Create a Release Tag:

1. **All Tests Run** - Ensures quality before release
2. **App Builds** - Production-ready version created
3. **Release Notes Generated** - Automatic changelog from commits
4. **GitHub Release Created** - Downloadable build artifacts

---

## 📊 Test Coverage Dashboard

### Accessing the Dashboard

The Test Coverage Dashboard shows you how much of your code is tested.

**Location:** Built into the app (will be added to admin panel)

**What It Shows:**
- **Lines Coverage** - Percentage of code lines tested
- **Statements Coverage** - Percentage of statements tested
- **Functions Coverage** - Percentage of functions tested
- **Branches Coverage** - Percentage of code branches tested

**Coverage Goals:**
- 🟢 **80%+** = Excellent (Green)
- 🟡 **60-79%** = Good (Yellow)
- 🔴 **Below 60%** = Needs Improvement (Red)

### Viewing Coverage Reports

After running tests locally:

1. **Run tests with coverage:**
   ```bash
   npm run test:coverage
   ```

2. **Open the HTML report:**
   - Find the file: `coverage/index.html`
   - Double-click to open in your browser
   - Browse detailed coverage by file

---

## 🚀 CI/CD Pipeline Details

### Pipeline Stages

#### 1. **Code Quality Check**
- Runs ESLint to check code style
- Continues even if warnings exist

#### 2. **Unit Tests**
- Runs all Vitest unit tests
- Generates coverage report
- Uploads to Codecov (if configured)

#### 3. **E2E Tests**
- Runs Playwright browser tests
- Tests real user workflows
- Saves screenshots on failure

#### 4. **Build Verification**
- Builds production version
- Ensures no build errors
- Saves build artifacts

### Where to See Results

1. **Go to GitHub.com**
2. **Navigate to your repository**
3. **Click the "Actions" tab**
4. **See all test runs and results**

---

## 📝 Automated Release Notes

### How It Works

The system automatically generates release notes from your git commits.

### Commit Message Format

Use these prefixes for automatic categorization:

**Features:**
```bash
git commit -m "feat: Add barcode scanning"
git commit -m "feature: New export functionality"
```

**Bug Fixes:**
```bash
git commit -m "fix: Resolve photo upload issue"
git commit -m "bug: Fix database sync"
```

**Improvements:**
```bash
git commit -m "improve: Faster search performance"
git commit -m "enhance: Better mobile UI"
```

### Creating a Release

#### Step 1: Update Version Number

Edit `package.json`:
```json
{
  "version": "1.2.0"
}
```

#### Step 2: Commit the Version Change

```bash
git add package.json
git commit -m "chore: Bump version to 1.2.0"
```

#### Step 3: Create and Push a Tag

```bash
git tag v1.2.0
git push origin v1.2.0
```

#### Step 4: Automated Release Happens

The system will:
1. Run all tests
2. Build the app
3. Generate release notes from commits
4. Create a GitHub release
5. Attach build files

### Viewing Releases

1. **Go to GitHub.com**
2. **Navigate to your repository**
3. **Click "Releases" on the right side**
4. **See all versions with notes and downloads**

---

## 🧪 Testing Features Location

### Where Testing Features Are Located:

#### 1. **Automated Test Runner**
- **File:** `src/components/testing/AutomatedTestRunner.tsx`
- **Access:** Admin Dashboard → Testing Section
- **Purpose:** Run tests from within the app

#### 2. **Test Coverage Dashboard**
- **File:** `src/components/testing/TestCoverageDashboard.tsx`
- **Access:** Admin Dashboard → Testing Section
- **Purpose:** View coverage metrics

#### 3. **Testing Guide Component**
- **File:** `src/components/testing/TestingGuide.tsx`
- **Access:** Admin Dashboard → Testing Section
- **Purpose:** In-app testing documentation

### Adding to Admin Dashboard

To make testing features accessible, add to `src/components/admin/AdminDashboard.tsx`:

```tsx
import { TestCoverageDashboard } from '@/components/testing/TestCoverageDashboard';
import { AutomatedTestRunner } from '@/components/testing/AutomatedTestRunner';

// Add a new tab for Testing
```

---

## 📱 Mobile Testing Workflow

### Before Each Mobile Deployment:

1. **Run Tests Locally:**
   ```bash
   npm test
   ```

2. **Check Coverage:**
   ```bash
   npm run test:coverage
   ```

3. **Run E2E Tests:**
   ```bash
   npm run test:e2e
   ```

4. **If All Pass, Build:**
   ```bash
   npm run build
   ```

5. **Deploy to Mobile** (see MOBILE_DEPLOYMENT_GUIDE.md)

---

## 🔧 Configuring GitHub Actions

### Required Secrets

Add these to your GitHub repository:

1. **Go to GitHub.com**
2. **Your repository → Settings**
3. **Secrets and variables → Actions**
4. **Click "New repository secret"**

**Required Secrets:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional: Codecov Integration

For advanced coverage tracking:

1. **Sign up at codecov.io**
2. **Connect your GitHub repository**
3. **Add `CODECOV_TOKEN` secret to GitHub**

---

## 📈 Monitoring Test Health

### Key Metrics to Watch:

1. **Test Pass Rate** - Should be 100%
2. **Coverage Percentage** - Aim for 80%+
3. **Build Success Rate** - Should be 100%
4. **Test Execution Time** - Monitor for slowdowns

### Where to Check:

- **GitHub Actions Tab** - See all runs
- **Coverage Dashboard** - In-app metrics
- **Codecov.io** - Detailed coverage trends (if configured)

---

## 🎓 Best Practices

### Writing Good Commits

**Good:**
```bash
git commit -m "feat: Add photo gallery swipe gestures"
git commit -m "fix: Resolve iOS camera permission issue"
git commit -m "improve: Optimize database query performance"
```

**Bad:**
```bash
git commit -m "updates"
git commit -m "fixed stuff"
git commit -m "wip"
```

### Release Frequency

- **Patch (1.0.X)** - Bug fixes, weekly
- **Minor (1.X.0)** - New features, monthly
- **Major (X.0.0)** - Breaking changes, quarterly

---

## 🆘 Troubleshooting

### Tests Failing in CI but Pass Locally

**Possible Causes:**
- Environment variables not set in GitHub
- Different Node.js version
- Missing dependencies

**Solution:**
- Check GitHub Actions logs
- Verify secrets are configured
- Ensure package.json is committed

### Coverage Report Not Generating

**Solution:**
```bash
# Delete old coverage
rm -rf coverage

# Run tests again
npm run test:coverage

# Check if coverage folder was created
ls coverage
```

### Release Notes Not Generating

**Possible Causes:**
- No previous tag exists
- Script not executable

**Solution:**
```bash
# Make script executable
chmod +x scripts/generate-release-notes.js

# Create initial tag if none exist
git tag v1.0.0
git push origin v1.0.0
```

---

## 📚 Related Documentation

- **TERMINAL_COMMANDS_GUIDE.md** - All terminal commands
- **MACBOOK_TERMINAL_BASICS.md** - Terminal basics for beginners
- **MOBILE_DEPLOYMENT_GUIDE.md** - Mobile deployment process
- **TESTING_GUIDE.md** - Manual testing guide
- **FEATURE_LOCATION_GUIDE.md** - Where features are located

---

## ✅ Quick Checklist

Before pushing code:
- [ ] Run `npm test` - All tests pass
- [ ] Run `npm run test:coverage` - Coverage adequate
- [ ] Run `npm run build` - Build succeeds
- [ ] Commit with descriptive message
- [ ] Push to GitHub
- [ ] Check Actions tab for results

Before creating a release:
- [ ] All tests passing in CI
- [ ] Update version in package.json
- [ ] Commit version change
- [ ] Create and push tag
- [ ] Verify release created on GitHub
- [ ] Download and test build artifact
