# GitHub Integration & Developer Tools - Quick Reference

## 📍 Component Locations

### 1. Test Results Dashboard
- **File**: `src/components/testing/TestResultsDashboard.tsx`
- **Access**: Admin Dashboard → Developer Tools → Test Results
- **Features**: Real-time test results, one-click export for debugging

### 2. Git Branch Manager
- **File**: `src/components/developer/GitBranchManager.tsx`
- **Access**: Admin Dashboard → Developer Tools → Git Manager
- **Features**: Create/switch/merge branches visually

### 3. Version Management & Rollback
- **File**: `src/components/deployment/VersionManagementSystem.tsx`
- **Access**: Admin Dashboard → Developer Tools → Deployments
- **Features**: View history, one-click rollback to any version

---

## 🚀 Quick Setup

### Step 1: Initialize Git & GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/calibervault.git
git push -u origin main
```

### Step 2: Add GitHub Secrets
Go to: Settings → Secrets → Actions → New secret

Required secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Step 3: Enable GitHub Actions
Go to: Actions tab → Enable workflows

---

## 📊 Using Test Results Dashboard

### Export Summary for Debugging:
1. Open Admin Dashboard
2. Click "Developer Tools" → "Test Results"
3. Click "Copy Summary" button
4. Paste in chat for AI debugging

### Run Tests Locally:
```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:e2e           # E2E tests only
```

---

## 🔄 Deployment & Rollback

### Deploy New Version:
```bash
git tag v2.6.0
git push origin v2.6.0
# GitHub Actions automatically deploys
```

### Rollback to Previous Version:
1. Open Version Management dashboard
2. Find version to rollback to
3. Click "Rollback to this version"
4. Confirm action

---

## 📁 All GitHub Workflows

- `.github/workflows/ci.yml` - Run tests on every push
- `.github/workflows/auto-test-on-commit.yml` - Quick validation
- `.github/workflows/deploy-production.yml` - Production deployments
- `.github/workflows/release.yml` - Version releases with rollback
- `.github/workflows/quality-gate.yml` - Code quality checks

---

## 🔧 Troubleshooting

**Tests not running?**
- Check GitHub Actions are enabled
- Verify secrets are configured
- Check workflow syntax

**Rollback failed?**
- Check deployment logs
- Verify version exists
- Check Vercel permissions

**Need detailed guide?**
- See: `GITHUB_INTEGRATION_GUIDE.md`
- See: `DEPLOYMENT_AND_TESTING_GUIDE.md`
