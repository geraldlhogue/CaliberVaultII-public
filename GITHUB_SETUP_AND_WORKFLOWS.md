# GitHub Setup and Workflows Guide

## GitHub Repository Access

### Finding Your Repository
**IMPORTANT:** Your CaliberVault code is stored locally on your machine, not yet on GitHub. Here's how to set it up:

### Step 1: Create GitHub Repository
1. Go to https://github.com
2. Sign in with gerry@sageforce.net
3. Click the "+" icon (top right) → "New repository"
4. Repository settings:
   - Name: `calibervault` or `calibervault-pwa`
   - Description: "Professional inventory management PWA for firearms and accessories"
   - Private repository (recommended initially)
   - DO NOT initialize with README (you already have one)
   - Click "Create repository"

### Step 2: Connect Local Code to GitHub

**Using Terminal (Recommended):**
```bash
# Navigate to your project folder
cd /path/to/your/calibervault/project

# Initialize git if not already done
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: CaliberVault PWA with 11 categories"

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/calibervault.git

# Push to GitHub
git push -u origin main
```

**Using GitHub Desktop (Easier for Beginners):**
1. Download GitHub Desktop: https://desktop.github.com
2. Sign in with gerry@sageforce.net
3. Click "Add" → "Add Existing Repository"
4. Browse to your CaliberVault folder
5. If not a git repo, it will offer to create one
6. Commit all files with message "Initial commit"
7. Click "Publish repository"
8. Choose private/public
9. Click "Publish"

### Step 3: Repository Structure
Your repository will have this structure:
```
calibervault/
├── .github/workflows/    # CI/CD pipelines
├── src/                  # Source code
│   ├── components/       # React components
│   ├── services/         # Business logic
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── supabase/            # Database migrations
├── public/              # Static assets
├── docs/                # Documentation
└── package.json         # Dependencies
```

## Development Workflows

### 1. Daily Development Workflow

```bash
# Start your day
git pull origin main          # Get latest changes
npm install                   # Update dependencies
npm run dev                   # Start dev server

# Make changes and test
npm run test:unit            # Run unit tests
npm run lint                 # Check code quality

# Commit changes
git add .
git commit -m "feat: add Excel export for inventory"
git push origin main
```

### 2. Feature Branch Workflow

```bash
# Create feature branch
git checkout -b feature/add-barcode-scanning

# Work on feature
# ... make changes ...

# Commit and push
git add .
git commit -m "feat: implement barcode scanning"
git push origin feature/add-barcode-scanning

# Create Pull Request on GitHub
# After review and approval, merge to main
```

### 3. Commit Message Convention

Use conventional commits for clear history:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

Examples:
```bash
git commit -m "feat: add Excel template generator for all 11 categories"
git commit -m "fix: resolve AI valuation JSON parsing error"
git commit -m "docs: add testing tools integration guide"
```

## CI/CD Pipeline Setup

### GitHub Actions Configuration
Your `.github/workflows/` already contains:

**ci.yml** - Runs on every push:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run lint
      - run: npm run type-check
```

### Setting Up Secrets
1. Go to repository Settings → Secrets
2. Add these secrets:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token
```

## Deployment Workflows

### 1. Automatic Deployment to Supabase

**Setup:**
1. In Supabase Dashboard → Settings → Git Integration
2. Connect GitHub repository
3. Select branch: `main`
4. Enable auto-deploy

**Workflow:**
```
Push to main → GitHub Actions → Tests Pass → Deploy to Supabase
```

### 2. Manual Release Process

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Generate release notes
npm run generate:release-notes

# 3. Create git tag
git tag -a v1.0.1 -m "Release version 1.0.1"

# 4. Push with tags
git push origin main --tags

# 5. Create GitHub Release
# Go to Releases → Create new release
# Select tag, add release notes
```

## Mobile Testing Workflows

### iOS Testing via GitHub

1. **TestFlight Distribution:**
```bash
# Build for iOS
npm run build

# Use GitHub Actions for TestFlight
# .github/workflows/ios-deploy.yml
```

2. **Local iOS Testing:**
```bash
# Share via local network
npm run dev -- --host

# Access on iPhone/iPad
# http://[your-mac-ip]:5173
```

### Android Testing

```bash
# Build APK for testing
npm run build
npx cap add android
npx cap sync
npx cap open android

# Or use GitHub Actions
# .github/workflows/android-build.yml
```

## Collaboration Workflows

### 1. Team Development

**Adding Collaborators:**
1. Repository Settings → Manage access
2. Invite collaborator: Add team member's GitHub username
3. Set permission level (Write recommended)

**Branch Protection:**
1. Settings → Branches
2. Add rule for `main`
3. Require:
   - Pull request reviews
   - Status checks (tests must pass)
   - Up-to-date branches

### 2. Code Review Process

**Creating Pull Requests:**
1. Push feature branch
2. Go to GitHub repository
3. Click "Compare & pull request"
4. Add description:
   - What changed
   - Why it changed
   - How to test
5. Request reviewers

**Review Checklist:**
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Offline functionality works

## Backup and Recovery

### 1. Automatic Backups

GitHub provides automatic backups, but also:

```bash
# Local backup
git bundle create calibervault-backup.bundle --all

# Restore from bundle
git clone calibervault-backup.bundle calibervault-restored
```

### 2. Database Backups

```bash
# Export Supabase data
npm run db:backup

# This creates backups/database-[date].sql
```

## Monitoring and Analytics

### 1. GitHub Insights

Access via repository Insights tab:
- Code frequency
- Commit activity
- Contributors
- Traffic
- Dependencies

### 2. Deployment Monitoring

```javascript
// Track deployments in Sentry
Sentry.captureMessage('Deployment successful', {
  tags: {
    version: process.env.npm_package_version,
    environment: 'production'
  }
});
```

## Troubleshooting

### Common Issues and Solutions

**1. Permission Denied (Push)**
```bash
# Check remote URL
git remote -v

# Update to use token
git remote set-url origin https://TOKEN@github.com/USERNAME/calibervault.git
```

**2. Merge Conflicts**
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in VS Code
# Look for <<<<<<< markers

# After resolving
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

**3. Large File Issues**
```bash
# If file > 100MB
git lfs track "*.psd"
git add .gitattributes
git add large-file.psd
git commit -m "Add large file with LFS"
```

## Security Best Practices

### 1. Never Commit Secrets
```bash
# Check .gitignore includes:
.env
.env.local
*.key
*.pem
```

### 2. Use Environment Variables
```javascript
// Good
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Bad
const supabaseUrl = "https://xyzabc.supabase.co";
```

### 3. Enable 2FA
1. GitHub Settings → Security
2. Enable two-factor authentication
3. Save recovery codes securely

## Quick Reference Commands

```bash
# Status and info
git status                    # Check changes
git log --oneline -10        # Recent commits
git branch -a                 # All branches

# Daily workflow
git pull                      # Get updates
git add .                     # Stage changes
git commit -m "message"       # Commit
git push                      # Upload

# Branching
git checkout -b feature-name  # New branch
git checkout main            # Switch to main
git merge feature-name       # Merge branch

# Undoing
git reset HEAD~1             # Undo last commit
git checkout -- file.ts      # Discard changes
git revert COMMIT_HASH       # Revert commit

# Stashing
git stash                    # Save changes
git stash pop                # Restore changes
```

## Next Steps

1. **Immediate Actions:**
   - [ ] Create GitHub repository
   - [ ] Push initial code
   - [ ] Set up branch protection
   - [ ] Configure secrets

2. **This Week:**
   - [ ] Set up CI/CD pipeline
   - [ ] Configure Supabase deployment
   - [ ] Add team members

3. **Ongoing:**
   - [ ] Daily commits with clear messages
   - [ ] Weekly dependency updates
   - [ ] Monthly security audits