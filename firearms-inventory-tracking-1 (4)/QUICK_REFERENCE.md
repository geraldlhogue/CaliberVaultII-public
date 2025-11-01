# Quick Reference - Build & QA Cheat Sheet

## 🚀 Essential Commands

```bash
npm run dev              # Start dev server
npm test                 # Run all tests
npm run test:coverage    # Coverage report
npm run build            # Production build
npm run lint             # Check code style
```

## 📊 QA Pipeline Locations

### Admin Dashboard
**Path:** Login → Admin Panel → Testing
- Coverage metrics
- Quality gates
- Test runner

### GitHub Actions
**Path:** Repository → Actions
- Auto-runs on PR
- Blocks bad code
- Coverage reports

### Local Testing
```bash
npm test -- firearm      # Test specific file
npm test -- --watch      # Watch mode
npm run test:e2e         # E2E tests
```

## 🎯 Quality Gates

| Metric | Threshold | Action |
|--------|-----------|--------|
| Line Coverage | 80% | Blocks merge |
| Branch Coverage | 75% | Blocks merge |
| Function Coverage | 80% | Blocks merge |

## 🔧 Common Workflows

### Add Feature
1. Branch: `git checkout -b feature/name`
2. Code + Tests
3. `npm test`
4. Push + PR

### Fix Bug
1. Write failing test
2. Fix code
3. Test passes
4. Push

### Database Change
1. Create migration file
2. Update TypeScript types
3. Update services
4. Test thoroughly

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/services/category/*.ts` | Category services |
| `src/types/inventory.ts` | Type definitions |
| `supabase/migrations/*.sql` | Database changes |
| `.github/workflows/*.yml` | CI/CD pipelines |

## 🚨 Troubleshooting

**Tests Fail:** Check schema matches types  
**Build Fails:** Run `npm run type-check`  
**DB Error:** Verify migration ran  
**Import Error:** Check file exists

## ✅ Pre-Commit Checklist

- [ ] Tests pass locally
- [ ] Coverage meets threshold
- [ ] No TypeScript errors
- [ ] Code formatted
- [ ] Types updated if schema changed

## 📞 Help

- `DEVELOPMENT_FLOW_PROCESS.md` - Full guide
- `TESTING_GUIDE.md` - Testing details
- `COMPREHENSIVE_CRUD_FIX_REPORT.md` - Recent fixes
