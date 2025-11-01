# Test Data Seeding Guide

## Overview
Comprehensive test data seeding system for CaliberVault supporting all 11 inventory categories.

## Features
- Seed data for all 11 categories (firearms, ammunition, optics, suppressors, magazines, accessories, powder, primers, bullets, cases, reloading)
- Configurable items per category
- Optional clearing of existing test data
- Progress tracking
- Reference data seeding (manufacturers, locations)
- Realistic test data generation

## Quick Start

### Using the UI Component
1. Navigate to Admin Dashboard or Testing Panel
2. Find "Test Data Seeder" card
3. Configure options:
   - Items per Category: 1-50 (default: 5)
   - Clear Existing: Checkbox to remove old test data
4. Click "Seed Test Data"
5. Monitor progress bar
6. Review results summary

### Using the API
```typescript
import { testDataSeeder } from '@/lib/testDataSeeder';
import { useAuth } from '@/components/auth/AuthProvider';

const { user } = useAuth();

const results = await testDataSeeder.seedAll({
  userId: user.id,
  itemsPerCategory: 10,
  clearExisting: true,
});

console.log('Seeding results:', results);
```

### Using Edge Function
```bash
curl -X POST https://your-project.supabase.co/functions/v1/seed-test-data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid"}'
```

## Seeding Options

### SeedOptions Interface
```typescript
interface SeedOptions {
  userId: string;           // Required: User ID for data ownership
  categories?: string[];    // Optional: Specific categories to seed
  itemsPerCategory?: number; // Optional: Items per category (default: 5)
  clearExisting?: boolean;  // Optional: Clear existing data (default: false)
}
```

### Examples

#### Seed All Categories
```typescript
await testDataSeeder.seedAll({
  userId: user.id,
  itemsPerCategory: 10,
});
```

#### Seed Specific Categories
```typescript
await testDataSeeder.seedAll({
  userId: user.id,
  categories: ['firearms', 'ammunition', 'optics'],
  itemsPerCategory: 5,
});
```

#### Clear and Reseed
```typescript
await testDataSeeder.seedAll({
  userId: user.id,
  itemsPerCategory: 20,
  clearExisting: true,
});
```

## Generated Data Structure

### Reference Data
**Manufacturers:**
- Glock
- Smith & Wesson
- Sig Sauer
- Ruger
- Vortex
- Federal

**Locations:**
- Main Safe
- Bedroom Safe
- Gun Cabinet

### Inventory Items

#### Firearms
- Name: "Test Firearm 1", "Test Firearm 2", etc.
- Purchase Price: $500-$1000+
- Purchase Date: Sequential dates in 2024
- Manufacturer: Rotates through available manufacturers
- Location: Rotates through available locations

#### Ammunition
- Name: "Test Ammo 1", "Test Ammo 2", etc.
- Quantity: 100-500+ rounds
- Purchase Price: $20-$100+

#### Optics
- Name: "Test Optic 1", "Test Optic 2", etc.
- Purchase Price: $200-$500+

#### Suppressors
- Name: "Test Suppressor 1", etc.
- Purchase Price: $800-$1500+

#### Magazines
- Name: "Test Magazine 1", etc.
- Quantity: 5-15 units
- Purchase Price: $30-$80+

#### Accessories
- Name: "Test Accessory 1", etc.
- Purchase Price: $50-$200+

#### Powder
- Name: "Test Powder 1", etc.
- Quantity: 1-10 lbs
- Purchase Price: $35-$80+

#### Primers
- Name: "Test Primer 1", etc.
- Quantity: 1000-2000 units
- Purchase Price: $40-$90+

#### Bullets
- Name: "Test Bullet 1", etc.
- Quantity: 500-1500 units
- Purchase Price: $25-$75+

#### Cases
- Name: "Test Case 1", etc.
- Quantity: 200-500 units
- Purchase Price: $20-$50+

#### Reloading Equipment
- Name: "Test Reloading Equipment 1", etc.
- Purchase Price: $150-$500+

## Testing Workflows

### Development Testing
```bash
# Seed small dataset for quick testing
npm run seed:dev
# Equivalent to: 5 items per category
```

### Integration Testing
```bash
# Seed medium dataset for integration tests
npm run seed:test
# Equivalent to: 10 items per category
```

### Load Testing
```bash
# Seed large dataset for load testing
npm run seed:load
# Equivalent to: 50 items per category
```

### Demo Data
```bash
# Seed realistic demo data
npm run seed:demo
# Equivalent to: 20 items per category with realistic details
```

## Best Practices

### 1. Use Separate Test Accounts
- Create dedicated test user accounts
- Don't seed production user data
- Use clear naming: test@example.com

### 2. Clear Before Seeding
- Enable `clearExisting: true` for clean state
- Prevents duplicate test data
- Ensures consistent test results

### 3. Appropriate Data Volume
- **Unit Tests**: 1-5 items per category
- **Integration Tests**: 10-20 items per category
- **Load Tests**: 50-100 items per category
- **Demo**: 15-25 items per category

### 4. Verify Seeding Results
```typescript
const results = await testDataSeeder.seedAll({...});

// Verify counts
expect(results.firearms).toBeGreaterThan(0);
expect(results.ammunition).toBeGreaterThan(0);
expect(results.manufacturers).toBeGreaterThan(0);
```

### 5. Clean Up After Tests
```typescript
afterAll(async () => {
  await testDataSeeder.seedAll({
    userId: testUserId,
    clearExisting: true,
    itemsPerCategory: 0, // Just clear, don't seed
  });
});
```

## Automated Seeding

### GitHub Actions
```yaml
- name: Seed Test Data
  run: |
    npm run seed:test
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    TEST_USER_ID: ${{ secrets.TEST_USER_ID }}
```

### Pre-Test Hook
```typescript
// vitest.setup.ts
import { testDataSeeder } from './src/lib/testDataSeeder';

beforeAll(async () => {
  const testUserId = 'test-user-uuid';
  
  await testDataSeeder.seedAll({
    userId: testUserId,
    itemsPerCategory: 5,
    clearExisting: true,
  });
});
```

## Troubleshooting

### Seeding Fails
**Issue**: Seeding returns errors

**Solutions**:
1. Check user authentication
2. Verify RLS policies allow inserts
3. Check database connection
4. Review Supabase logs

### Slow Seeding
**Issue**: Seeding takes too long

**Solutions**:
1. Reduce items per category
2. Use batch inserts (already implemented)
3. Check database performance
4. Verify network connection

### Duplicate Data
**Issue**: Test data duplicated

**Solutions**:
1. Enable `clearExisting: true`
2. Use unique identifiers
3. Check for concurrent seeding operations

### Missing Reference Data
**Issue**: Items created without manufacturers/locations

**Solutions**:
1. Ensure reference data seeded first
2. Check foreign key constraints
3. Verify manufacturer/location IDs

## Advanced Usage

### Custom Seeding Logic
```typescript
import { TestDataSeeder } from '@/lib/testDataSeeder';

class CustomSeeder extends TestDataSeeder {
  async seedCustomFirearms(userId: string) {
    const manufacturers = await this.seedManufacturers(userId);
    const locations = await this.seedLocations(userId);
    
    const customFirearms = [
      {
        user_id: userId,
        category: 'firearms',
        name: 'Custom Glock 19',
        manufacturer_id: manufacturers[0].id,
        storage_location_id: locations[0].id,
        serial_number: 'CUSTOM123',
        purchase_price: 599.99,
      },
      // Add more custom items
    ];
    
    const { data } = await supabase
      .from('inventory')
      .insert(customFirearms)
      .select();
      
    return data || [];
  }
}
```

### Seeding with Relationships
```typescript
// Seed firearms with attached optics
const firearms = await testDataSeeder.seedFirearms(userId, mfgs, locs, 5);
const optics = await testDataSeeder.seedOptics(userId, mfgs, locs, 5);

// Create relationships
for (let i = 0; i < firearms.length; i++) {
  await supabase
    .from('firearm_builds')
    .insert({
      firearm_id: firearms[i].id,
      optic_id: optics[i].id,
      user_id: userId,
    });
}
```

## Performance Optimization

### Batch Inserts
```typescript
// Already implemented in testDataSeeder
// Inserts all items in single query per category
const items = Array.from({ length: count }, (_, i) => ({...}));
const { data } = await supabase.from('inventory').insert(items).select();
```

### Parallel Seeding
```typescript
// Seed multiple categories simultaneously
await Promise.all([
  testDataSeeder.seedFirearms(userId, mfgs, locs, 10),
  testDataSeeder.seedAmmunition(userId, mfgs, locs, 10),
  testDataSeeder.seedOptics(userId, mfgs, locs, 10),
]);
```

## Integration with Testing

### Playwright E2E Tests
```typescript
import { test, expect } from '@playwright/test';
import { testDataSeeder } from '../src/lib/testDataSeeder';

test.beforeEach(async ({ page }) => {
  // Seed data before each test
  await testDataSeeder.seedAll({
    userId: 'test-user-id',
    itemsPerCategory: 3,
    clearExisting: true,
  });
});

test('should display seeded inventory', async ({ page }) => {
  await page.goto('/inventory');
  
  // Verify seeded data appears
  await expect(page.locator('.item-card')).toHaveCount(33); // 11 categories × 3 items
});
```

### Vitest Unit Tests
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { testDataSeeder } from '@/lib/testDataSeeder';

describe('Inventory Service', () => {
  beforeEach(async () => {
    await testDataSeeder.seedAll({
      userId: 'test-user',
      itemsPerCategory: 2,
      clearExisting: true,
    });
  });

  it('should fetch all inventory items', async () => {
    const items = await inventoryService.getAll('test-user');
    expect(items.length).toBeGreaterThan(0);
  });
});
```

## Resources
- [Supabase Data Seeding](https://supabase.com/docs/guides/database/seed-data)
- [Test Data Management Best Practices](https://martinfowler.com/articles/data-test-patterns.html)
