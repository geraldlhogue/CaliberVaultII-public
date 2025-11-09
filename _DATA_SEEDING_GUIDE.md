# Test Data Seeding Guide

## Overview
Comprehensive test data management system for CaliberVault with seeding, fixtures, and cleanup utilities.

## Quick Start

### Seeding Test Data
```typescript
import { testDataSeeder } from '@/lib/testDataSeeder';

// Seed inventory items
const items = await testDataSeeder.seedInventory({
  userId: 'test-user-id',
  itemCount: 50,
});

// Seed team members
const team = await testDataSeeder.seedTeam('test-user-id', 5);

// Cleanup after tests
await testDataSeeder.cleanupTestData('test-user-id');
```

## Using Fixtures

### Import Mock Data
```typescript
import { 
  mockFirearm, 
  mockAmmunition, 
  createMockItem 
} from '@/test/fixtures/inventory.fixtures';

// Use predefined fixtures
const firearm = mockFirearm;

// Create custom mock
const customItem = createMockItem({
  name: 'Custom Item',
  category: 'optics',
  quantity: 5,
});
```

## Test Helpers

### E2E Test Helpers
```typescript
import { 
  loginAsTestUser, 
  createTestItem, 
  waitForToast 
} from '@/test/helpers/testHelpers';

test('should create item', async ({ page }) => {
  await loginAsTestUser(page);
  await createTestItem(page, { name: 'Test Gun' });
  await waitForToast(page, 'Item created');
});
```

## Database Seeding

### Seed Reference Data
```bash
# Run reference data seeder
npm run seed:reference

# Seed test data for development
npm run seed:test
```

### Custom Seeding Scripts
```typescript
// supabase/functions/seed-test-data/index.ts
import { testDataSeeder } from '../../../src/lib/testDataSeeder';

Deno.serve(async (req) => {
  const { userId, itemCount } = await req.json();
  
  const data = await testDataSeeder.seedInventory({
    userId,
    itemCount,
  });
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Cleanup Strategies

### After Each Test
```typescript
test.afterEach(async () => {
  await testDataSeeder.cleanupTestData('test-user-id');
});
```

### Bulk Cleanup
```typescript
// Clean all test data
await supabase
  .from('inventory')
  .delete()
  .like('name', 'Test%');
```

## Best Practices

1. **Isolation**: Each test should have independent data
2. **Cleanup**: Always cleanup after tests
3. **Realistic Data**: Use realistic values and relationships
4. **Performance**: Seed only necessary data
5. **Idempotency**: Seeding should be repeatable

## CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Seed test data
  run: npm run seed:test
  
- name: Run tests
  run: npm test
  
- name: Cleanup
  run: npm run cleanup:test
```
