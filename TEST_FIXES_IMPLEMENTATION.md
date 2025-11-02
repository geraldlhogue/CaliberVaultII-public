# Test Fixes - Implementation Guide

## Quick Start: Fix Tests in 30 Minutes

### 1. Update package.json (5 min)

Add these scripts to the "scripts" section:

```json
"test": "vitest run",
"test:unit": "vitest run --exclude src/test/e2e/** --exclude src/test/integration/**",
"test:integration": "vitest run src/test/integration",
"test:e2e": "playwright test",
"test:coverage": "vitest run --coverage",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

### 2. Create .env.test (2 min)

```bash
VITE_SUPABASE_URL=https://okmekurgdidqnvblnakj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Update vitest.config.ts (3 min)

Add env file loading:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      ...process.env
    },
    // ... rest of config
  }
});
```

### 4. Fix ItemCard.test.tsx (2 min)

Change line 2:
```typescript
// FROM:
import { render, screen } from '@testing-library/react';

// TO:
import { render, screen } from '@/test/testUtils';
```

### 5. Run Tests (5 min)

```bash
npm test
```

Review output and identify remaining failures.

### 6. Common Fixes for Remaining Issues

#### Issue: "Cannot find module"
**Fix:** Check import paths use @ alias correctly

#### Issue: "Component not rendering"
**Fix:** Ensure all required props are provided in test

#### Issue: "Supabase mock not working"
**Fix:** Use this standard mock:
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }))
    }))
  }
}));
```

---

## Verification Checklist

After implementing fixes:

- [ ] `npm test` runs without "command not found"
- [ ] Tests execute and show pass/fail results
- [ ] Coverage report generates
- [ ] E2E tests can be run with `npm run test:e2e`
- [ ] CI/CD pipeline test job passes
- [ ] Coverage meets 70% threshold

---

## Expected Results

After fixes:
- ✅ 80%+ tests passing
- ✅ Coverage reports generated
- ✅ CI/CD unblocked
- ✅ Can deploy to production
