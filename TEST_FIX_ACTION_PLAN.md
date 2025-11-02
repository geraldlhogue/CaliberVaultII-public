# Test Fix Action Plan

## Phase 1: Critical Fixes (IMMEDIATE - 30 minutes)

### Step 1: Add Test Scripts to package.json ⚡ CRITICAL
**Priority:** P0  
**Time:** 5 minutes  
**Blocks:** Everything

**Action:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --exclude src/test/e2e/** --exclude src/test/integration/**",
    "test:integration": "vitest run src/test/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:visual": "playwright test src/test/visual",
    "test:performance": "playwright test src/test/performance",
    "test:accessibility": "playwright test src/test/accessibility"
  }
}
```

### Step 2: Create .env.test File
**Priority:** P0  
**Time:** 5 minutes

**Action:**
Create `.env.test` with test credentials:
```bash
VITE_SUPABASE_URL=https://okmekurgdidqnvblnakj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Run Tests Locally
**Priority:** P0  
**Time:** 10 minutes

**Commands:**
```bash
npm test
npm run test:coverage
```

**Expected:** See which tests actually fail vs configuration issues

### Step 4: Fix Import Inconsistencies
**Priority:** P1  
**Time:** 10 minutes

**Files to Update:**
- src/components/__tests__/ItemCard.test.tsx
- Any other tests importing from @testing-library/react directly

**Change:**
```typescript
// FROM:
import { render, screen } from '@testing-library/react';

// TO:
import { render, screen } from '@/test/testUtils';
```

---

## Phase 2: Component Test Fixes (1-2 hours)

### Fix Pattern for All Component Tests

**Standard Test Structure:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/testUtils';
import { ComponentName } from '../path/to/component';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('ComponentName', () => {
  it('should render', () => {
    render(<ComponentName {...requiredProps} />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });
});
```
