# Git Automation System - Complete Guide

## 🎯 Overview

This system provides three powerful tools for managing Git commits and CI/CD:

1. **Git Auto-Commit Script** - Automatically creates organized commits from CHANGES_LOG.md
2. **Change Diff Viewer** - Visual UI to review changes before committing
3. **CI/CD Pipeline** - Automated testing on every commit

---

## 📋 Prerequisites

- Node.js 20+ installed
- Git initialized in project
- GitHub repository connected
- Local testing environment running

---

## 🚀 Quick Start

### 1. Make Script Executable

```bash
chmod +x scripts/auto-commit.js
```

### 2. Run Auto-Commit

```bash
node scripts/auto-commit.js
```

This will:
- Parse CHANGES_LOG.md
- Stage all changed files
- Create organized commits with detailed messages
- Group changes by session

### 3. Push to GitHub

```bash
git push origin main
```

---

## 🔍 Change Diff Viewer

### Access the Viewer

The Change Diff Viewer component is available at:
- Component: `src/components/developer/ChangeDiffViewer.tsx`
- Can be integrated into admin dashboard or developer tools

### Features

- **Session-based view** - Review changes by session
- **File status badges** - See which files are new/modified/deleted
- **Detailed descriptions** - Each change includes context
- **Download script** - Get the auto-commit script directly from UI

### Integration Example

```tsx
import { ChangeDiffViewer } from '@/components/developer/ChangeDiffViewer';

function DeveloperTools() {
  return (
    <div>
      <h1>Developer Tools</h1>
      <ChangeDiffViewer />
    </div>
  );
}
```

---

## ⚙️ CI/CD Pipeline

### Workflow: Auto Test on Commit

Located at: `.github/workflows/auto-test-on-commit.yml`

### Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Pipeline Stages

1. **Lint** - Code quality checks
2. **Unit Tests** - Component and function tests
3. **Integration Tests** - Service and API tests
4. **E2E Tests** - Full user flow tests with Playwright
5. **Build** - Production build verification

### Test Results

- Uploaded as GitHub Actions artifacts
- Automatic PR comments with results
- Detailed reports in Actions tab

### Required Secrets

Add these to GitHub repository settings:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📝 CHANGES_LOG.md Format

The auto-commit script expects this format:

```markdown
## Session: 2024-01-15 10:30 AM

**Description:** Fixed preview loading issue

1. `src/App.tsx` - Added AuthProvider wrapper
2. `src/pages/Index.tsx` - Fixed useAuth hook usage
3. `EMERGENCY_PREVIEW_FIX.md` - Created documentation
```

---

## 🎨 Advanced Usage

### Custom Commit Messages

Edit `scripts/auto-commit.js` to customize commit message format:

```javascript
const commitMsg = `${session.description}

Changes:
${session.changes.map(c => `- ${c.file}: ${c.description}`).join('\n')}

Session: ${session.date}`;
```

### Selective Commits

To commit only specific sessions, modify the script:

```javascript
const sessions = parseChangesLog().filter(s => 
  s.date.includes('2024-01-15')
);
```

### Skip CI

Add `[skip ci]` to commit message to skip pipeline:

```javascript
const commitMsg = `[skip ci] ${session.description}`;
```

---

## 🔧 Troubleshooting

### Script Won't Run

```bash
# Make executable
chmod +x scripts/auto-commit.js

# Run with node directly
node scripts/auto-commit.js
```

### No Changes Detected

- Verify CHANGES_LOG.md exists
- Check file paths are correct
- Ensure files aren't already committed

### CI/CD Not Triggering

- Check GitHub Actions is enabled
- Verify workflow file is in `.github/workflows/`
- Check branch protection rules

### Tests Failing

- Review test results in Actions artifacts
- Run tests locally: `npm run test`
- Check environment variables are set

---

## 📊 Monitoring

### View Pipeline Status

```bash
# Check latest workflow run
gh run list

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

### Local Test Commands

```bash
# Run all tests
npm run test

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e

# With coverage
npm run test:coverage
```

---

## 🎯 Best Practices

1. **Update CHANGES_LOG.md** after every session
2. **Review changes** in Diff Viewer before committing
3. **Run tests locally** before pushing
4. **Use descriptive commit messages** in session descriptions
5. **Group related changes** in same session
6. **Monitor CI/CD results** after pushing

---

## 🚀 Next Steps

1. Set up GitHub repository connection
2. Configure GitHub Actions secrets
3. Run first auto-commit
4. Monitor CI/CD pipeline results
5. Integrate Change Diff Viewer into admin panel

---

## 📞 Support

- Review test results in GitHub Actions
- Check CHANGES_LOG.md for session history
- Use Change Diff Viewer for visual inspection
- Monitor CI/CD pipeline for automated feedback
