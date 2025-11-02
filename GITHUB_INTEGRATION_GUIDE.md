# GitHub Integration Setup Guide

## Overview
Complete guide for integrating CaliberVault with GitHub for automated testing, deployments, and version control.

## 📍 Location
- **Guide**: `/GITHUB_INTEGRATION_GUIDE.md`
- **Workflows**: `/.github/workflows/`
- **Scripts**: `/scripts/`

---

## Step 1: Initialize Git Repository

### If Starting Fresh:
```bash
# Navigate to project root
cd /path/to/calibervault

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CaliberVault application"
```

### If Already Initialized:
```bash
# Check status
git status

# View current branch
git branch
```

---

## Step 2: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository Settings**:
   - Name: `calibervault`
   - Description: "Advanced firearms inventory management system"
   - Visibility: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license
3. **Click**: "Create repository"

---

## Step 3: Connect Local to GitHub

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/calibervault.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 4: Configure GitHub Secrets

### Required Secrets for CI/CD:

1. **Go to**: Repository → Settings → Secrets and variables → Actions
2. **Click**: "New repository secret"
3. **Add these secrets**:

#### SUPABASE_URL
- **Value**: Your Supabase project URL
- **Find it**: Supabase Dashboard → Settings → API
- **Format**: `https://xxxxx.supabase.co`

#### SUPABASE_ANON_KEY
- **Value**: Your Supabase anonymous key
- **Find it**: Supabase Dashboard → Settings → API
- **Format**: Long JWT token starting with `eyJ...`

#### VITE_SUPABASE_URL
- **Value**: Same as SUPABASE_URL
- **Purpose**: For Vite build process

#### VITE_SUPABASE_ANON_KEY
- **Value**: Same as SUPABASE_ANON_KEY
- **Purpose**: For Vite build process

#### VERCEL_TOKEN (for deployments)
- **Get it**: Vercel Dashboard → Settings → Tokens
- **Create**: New token with deployment permissions

#### VERCEL_ORG_ID
- **Find it**: Vercel Dashboard → Settings → General
- **Copy**: Organization ID

#### VERCEL_PROJECT_ID
- **Find it**: Vercel Project → Settings → General
- **Copy**: Project ID

---

## Step 5: Enable GitHub Actions

1. **Go to**: Repository → Actions tab
2. **Enable workflows**: Click "I understand my workflows, go ahead and enable them"
3. **Verify workflows**:
   - ✅ CI Pipeline
   - ✅ Auto Test on Commit
   - ✅ Deploy Production
   - ✅ Quality Gate
   - ✅ Test Coverage

---

## Step 6: Configure Branch Protection

1. **Go to**: Settings → Branches
2. **Click**: "Add rule"
3. **Branch name pattern**: `main`
4. **Enable**:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
5. **Status checks**: Select:
   - `lint`
   - `unit-tests`
   - `integration-tests`
   - `e2e-tests`

---

## Step 7: Set Up Webhooks (Optional)

### For Deployment Notifications:

1. **Go to**: Settings → Webhooks → Add webhook
2. **Payload URL**: Your notification endpoint
3. **Content type**: `application/json`
4. **Events**: Select:
   - Push events
   - Pull request events
   - Deployment events
5. **Click**: "Add webhook"

---

## Step 8: Test the Integration

### Run Auto-Commit Script:
```bash
# Install dependencies
npm install

# Run auto-commit
node scripts/auto-commit.js
```

### Verify CI/CD Pipeline:
```bash
# Make a test change
echo "# Test" >> TEST.md

# Commit and push
git add TEST.md
git commit -m "test: Verify CI/CD pipeline"
git push

# Watch Actions tab on GitHub
# All tests should run automatically
```

---

## Available GitHub Actions Workflows

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
- **Trigger**: Every push and PR
- **Runs**: Linting, unit tests, integration tests, E2E tests
- **Duration**: ~5-10 minutes

### 2. **Auto Test on Commit** (`.github/workflows/auto-test-on-commit.yml`)
- **Trigger**: Every commit to main
- **Runs**: Quick validation tests
- **Duration**: ~2-3 minutes

### 3. **Deploy Production** (`.github/workflows/deploy-production.yml`)
- **Trigger**: Manual or on release tag
- **Runs**: Build, test, deploy to production
- **Duration**: ~10-15 minutes

### 4. **Quality Gate** (`.github/workflows/quality-gate.yml`)
- **Trigger**: Every PR
- **Runs**: Code quality checks, test coverage
- **Duration**: ~5 minutes

### 5. **Test Coverage** (`.github/workflows/test-coverage.yml`)
- **Trigger**: Weekly or manual
- **Runs**: Comprehensive test coverage report
- **Duration**: ~15-20 minutes

---

## Using the Git Branch Manager

### Access in App:
1. Open CaliberVault
2. Go to Admin Dashboard
3. Click "Developer Tools"
4. Select "Git Branch Manager"

### Features:
- ✅ View all branches
- ✅ Create new branches
- ✅ Switch branches
- ✅ Merge branches
- ✅ Delete branches
- ✅ View commit history

---

## Troubleshooting

### "Permission denied" when pushing:
```bash
# Use SSH instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/calibervault.git

# Or use personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/calibervault.git
```

### "Secrets not found" in Actions:
1. Verify secrets are added in Settings → Secrets
2. Check secret names match exactly (case-sensitive)
3. Re-run workflow after adding secrets

### Workflows not running:
1. Check Actions are enabled in repository settings
2. Verify workflow files are in `.github/workflows/`
3. Check workflow syntax with GitHub Actions validator

---

## Next Steps

1. ✅ Set up GitHub repository
2. ✅ Configure secrets
3. ✅ Enable Actions
4. ✅ Test CI/CD pipeline
5. 📋 Review test results in dashboard
6. 🚀 Deploy to production

---

## Support

- **Documentation**: `/DEPLOYMENT_AND_TESTING_GUIDE.md`
- **Quick Start**: `/QUICK_START_GUIDE.md`
- **Test Dashboard**: Admin → Developer Tools → Test Results
- **Git Manager**: Admin → Developer Tools → Git Branch Manager
