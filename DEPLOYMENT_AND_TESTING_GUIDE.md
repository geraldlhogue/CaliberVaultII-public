# Deployment and Testing Guide

Complete guide for using the Test Results Dashboard, Git Branch Manager, and Automated Deployment System.

## 📊 Test Results Dashboard

### Location
- **Component**: `src/components/testing/TestResultsDashboard.tsx`
- **Access**: Add to your admin panel or developer tools section

### Features
1. **Real-time Test Results**: View all test suites and individual test results
2. **Summary Export**: One-click copy of formatted test summary for chat
3. **Auto-refresh**: Automatically reload test results
4. **Visual Status**: Color-coded pass/fail indicators

### Usage

#### Adding to Your App
```tsx
import { TestResultsDashboard } from '@/components/testing/TestResultsDashboard';

// In your admin or developer section:
<TestResultsDashboard />
```

#### Exporting Summary for Chat
1. Click "Copy Summary" button
2. Paste into chat window for debugging
3. Summary includes:
   - Total tests run
   - Pass/fail counts and percentages
   - Duration
   - Failed test details with error messages

#### Example Export Format
```
TEST RESULTS SUMMARY
===================
Total Tests: 156
Passed: 154 (98.7%)
Failed: 2
Duration: 12,345ms

DETAILS:
Unit Tests: 89/90 passed
  ❌ InventoryService.test.ts: Expected 5 but got 4

Integration Tests: 65/66 passed
  ❌ CategoryServices.test.ts: Timeout exceeded
```

### Integration with CI/CD
The dashboard can read from:
- Local test results: `npm test -- --json --outputFile=test-results.json`
- CI/CD artifacts: Download from GitHub Actions
- Real-time: Connect to test runner via WebSocket

---

## 🌿 Git Branch Manager

### Location
- **Component**: `src/components/developer/GitBranchManager.tsx`
- **Access**: Developer tools or admin panel

### Features
1. **Create Branches**: Quick branch creation with naming
2. **Switch Branches**: One-click branch switching
3. **Merge Branches**: Visual merge interface
4. **Branch Status**: See ahead/behind commits
5. **Current Branch Indicator**: Always know which branch you're on

### Usage

#### Adding to Your App
```tsx
import { GitBranchManager } from '@/components/developer/GitBranchManager';

<GitBranchManager />
```

#### Creating a New Branch
1. Enter branch name in input field
2. Click "Create" button
3. Branch is created from current HEAD
4. Notification confirms creation

#### Switching Branches
1. Find branch in list
2. Click "Switch" button
3. Working directory updates
4. Current branch indicator moves

#### Merging Branches
1. Switch to target branch (e.g., main)
2. Click merge icon on source branch
3. Confirm merge
4. Changes are merged

### Git Commands Reference
```bash
# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/old-feature

# View all branches
git branch -a
```

---

## 🚀 Automated Deployment System

### Location
- **Component**: `src/components/deployment/DeploymentDashboard.tsx`
- **CI/CD Pipeline**: `.github/workflows/deploy-production.yml`

### Environments
1. **Production**: Live application (main branch)
2. **Staging**: Pre-production testing (develop branch)
3. **Development**: Feature testing (feature/* branches)

### Features
1. **One-Click Deploy**: Deploy to any environment
2. **Deployment History**: Track all deployments
3. **Status Monitoring**: Real-time deployment status
4. **Rollback Support**: Quick rollback to previous version
5. **Environment URLs**: Direct links to deployed apps

### Usage

#### Adding to Your App
```tsx
import { DeploymentDashboard } from '@/components/deployment/DeploymentDashboard';

<DeploymentDashboard />
```

#### Deploying to Production
1. Ensure all tests pass
2. Click "Deploy to Production"
3. Confirm deployment
4. Monitor progress in deployment history
5. Visit production URL when complete

#### Deployment Workflow
```
1. Developer pushes to branch
2. CI/CD runs tests automatically
3. If tests pass, build is created
4. Click deploy button in dashboard
5. Application is deployed
6. Health checks run
7. Deployment marked as success/failed
```

### CI/CD Pipeline Setup

#### GitHub Actions Workflow
File: `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

#### Required Secrets
Add these to GitHub Settings > Secrets:
- `VERCEL_TOKEN`: Vercel deployment token
- `SUPABASE_URL`: Production Supabase URL
- `SUPABASE_ANON_KEY`: Production Supabase key

### Environment Configuration

#### Production
- URL: `https://app.calibervault.com`
- Branch: `main`
- Auto-deploy: On push to main (after tests pass)

#### Staging
- URL: `https://staging.calibervault.com`
- Branch: `develop`
- Auto-deploy: On push to develop

#### Development
- URL: `https://dev-*.calibervault.com`
- Branch: `feature/*`
- Auto-deploy: On demand

---

## 🔄 Complete Workflow

### Development Workflow
```
1. Create feature branch
   → Use Git Branch Manager

2. Make changes and commit
   → Use auto-commit script

3. Run tests locally
   → View in Test Results Dashboard

4. Push to GitHub
   → CI/CD runs automatically

5. Deploy to dev environment
   → Use Deployment Dashboard

6. Test in dev environment
   → Export test results for debugging

7. Merge to develop
   → Deploy to staging

8. Final testing in staging
   → Review test results

9. Merge to main
   → Auto-deploy to production
```

### Quick Commands

#### Run All Tests
```bash
npm test
```

#### Run Tests with JSON Output
```bash
npm test -- --json --outputFile=test-results.json
```

#### Build for Production
```bash
npm run build
```

#### Deploy to Vercel
```bash
vercel --prod
```

---

## 📍 File Locations

### Components
- Test Dashboard: `src/components/testing/TestResultsDashboard.tsx`
- Git Manager: `src/components/developer/GitBranchManager.tsx`
- Deployment: `src/components/deployment/DeploymentDashboard.tsx`

### Scripts
- Auto-commit: `scripts/auto-commit.js`
- Test runner: `package.json` (scripts section)

### CI/CD
- Auto-test: `.github/workflows/auto-test-on-commit.yml`
- Deploy: `.github/workflows/deploy-production.yml`

### Documentation
- This guide: `DEPLOYMENT_AND_TESTING_GUIDE.md`
- Git automation: `GIT_AUTOMATION_GUIDE.md`
- Changes log: `CHANGES_LOG.md`

---

## 🆘 Troubleshooting

### Test Dashboard Not Loading
- Check test-results.json exists
- Verify file permissions
- Run tests to generate results

### Git Manager Not Working
- Ensure Git is installed
- Check repository is initialized
- Verify Git credentials

### Deployment Fails
- Check all tests pass
- Verify environment variables
- Review build logs in CI/CD
- Check deployment secrets

### Getting Test Results for Chat
1. Open Test Results Dashboard
2. Click "Copy Summary"
3. Paste into chat window
4. Include any error messages

---

## 📞 Support

For issues or questions:
1. Check test results in dashboard
2. Export summary for debugging
3. Review deployment logs
4. Check CI/CD pipeline status

---

**Last Updated**: Session 2025-01-01
**Version**: 1.0.0
