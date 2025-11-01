# Development Flow Process Guide

## 🚀 Quick Start Development Flow

### 1. Before Starting Work
```bash
git pull origin main
npm install
npm run dev
```

### 2. Making Changes
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make code changes
3. Run tests: `npm test`
4. Check coverage: `npm run test:coverage`

### 3. Database Changes
**When to create migration:**
- Adding/removing tables
- Adding/removing columns
- Changing data types
- Adding indexes or constraints

**Process:**
1. Create migration file: `supabase/migrations/XXX_description.sql`
2. Test locally first
3. Document in migration comments
4. Update TypeScript types to match

### 4. Quality Checks
```bash
npm test                    # Run all tests
npm run test:coverage      # Check coverage
npm run lint               # Check code style
npm run type-check         # TypeScript validation
```

### 5. Commit & Push
```bash
git add .
git commit -m "feat: description"
git push origin feature/your-feature
```

### 6. Pull Request
- GitHub Actions run automatically
- Quality gates must pass
- Code review required
- Merge when approved

## 🧪 Testing Strategy

### Test Types
1. **Unit Tests** - Individual functions/services
2. **Integration Tests** - Service + database
3. **E2E Tests** - Full user workflows

### Coverage Requirements
- Minimum: 80% line coverage
- Critical paths: 100% coverage
- New code: Must include tests

## 📊 QA Pipeline Access

### Admin Dashboard
**Path:** Login → Admin → Testing
- View coverage metrics
- Configure quality gates
- Run tests manually
- Analyze test quality

### GitHub Actions
**Location:** Repository → Actions tab
- Automatic on every PR
- Blocks merge if tests fail
- Coverage reports generated

## 🔧 Common Tasks

### Add New Category
1. Create migration for detail table
2. Create service extending BaseCategoryService
3. Update types in inventory.ts
4. Add form component
5. Write tests
6. Update documentation

### Fix Bug
1. Write failing test first
2. Fix the bug
3. Verify test passes
4. Check no regressions
5. Update docs if needed

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- No `any` types
- Proper interfaces

### Database
- Follow 3NF
- Use foreign keys
- Add indexes for performance

### Testing
- Descriptive test names
- Test edge cases
- Mock external dependencies

## 🚨 Troubleshooting

### Tests Failing
1. Check error message
2. Run single test: `npm test -- testname`
3. Check database schema matches types
4. Clear cache: `npm run clean`

### Database Issues
1. Check migration ran: Query information_schema
2. Verify RLS policies
3. Check foreign key constraints
4. Review error logs

### Build Errors
1. `npm run type-check`
2. Fix TypeScript errors
3. Check imports
4. Verify all dependencies installed
