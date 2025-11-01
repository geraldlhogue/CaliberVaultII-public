# Inventory Database Redesign Implementation Plan

## Executive Summary
Migrate from 11 separate category tables to a single normalized inventory table with category-specific detail tables.

## Phase 1: Schema Creation (Week 1)

### 1.1 Create Core Inventory Table
```sql
-- Migration: 035_create_inventory_table.sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id),
  model TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_of_measure_id UUID REFERENCES units_of_measure(id),
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  current_value DECIMAL(10,2),
  storage_location_id UUID REFERENCES storage_locations(id),
  condition TEXT,
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_inventory_category ON inventory(category_id);
CREATE INDEX idx_inventory_org ON inventory(organization_id);
```

### 1.2 Create Detail Tables
- firearm_details
- optic_details
- suppressor_details
- magazine_details
- ammunition_details
- accessory_details
- case_details
- powder_details
- primer_details
- reloading_details

### 1.3 Set Up RLS Policies
```sql
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON inventory FOR SELECT
  USING (auth.uid() = user_id OR organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));
```

## Phase 2: Data Migration (Week 2)

### 2.1 Backup Existing Data
```sql
-- Rename old tables
ALTER TABLE firearms RENAME TO firearms_old;
ALTER TABLE optics RENAME TO optics_old;
-- ... repeat for all 11 tables
```

### 2.2 Migration Script
```sql
-- Migration: 036_migrate_data_to_inventory.sql

-- Migrate Firearms
INSERT INTO inventory (
  id, user_id, organization_id, category_id, name, manufacturer_id, 
  model, quantity, purchase_price, purchase_date, storage_location_id,
  condition, notes, photos, created_at, updated_at
)
SELECT 
  id, user_id, organization_id, 
  (SELECT id FROM categories WHERE name = 'Firearms'),
  name, manufacturer_id, model, quantity, purchase_price, purchase_date,
  storage_location_id, condition, notes, photos, created_at, updated_at
FROM firearms_old;

INSERT INTO firearm_details (
  inventory_id, serial_number, firearm_type_id, caliber_id,
  barrel_length, action_type, finish, round_count
)
SELECT 
  id, serial_number, firearm_type_id, caliber_id,
  barrel_length, action_type, finish, round_count
FROM firearms_old;

-- Repeat for all 11 categories...
```

### 2.3 Verification Queries
```sql
-- Verify counts match
SELECT 'firearms' as table_name, COUNT(*) FROM firearms_old
UNION ALL
SELECT 'inventory (firearms)', COUNT(*) FROM inventory 
WHERE category_id = (SELECT id FROM categories WHERE name = 'Firearms');
```

## Phase 3: Application Code Updates (Week 3-4)

### 3.1 Update Base Service
```typescript
// src/services/inventory/InventoryService.ts
export class InventoryService {
  async getAll(userId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        category:categories(*),
        manufacturer:manufacturers(*),
        storage_location:storage_locations(*)
      `)
      .eq('user_id', userId);
    
    return data || [];
  }
  
  async getByCategory(userId: string, categoryId: string) {
    return this.getAll(userId).then(items => 
      items.filter(item => item.category_id === categoryId)
    );
  }
}
```

### 3.2 Update Category Services
```typescript
// src/services/category/FirearmsService.ts
export class FirearmsService {
  async getFirearms(userId: string) {
    const { data } = await supabase
      .from('inventory')
      .select(`
        *,
        firearm_details(*)
      `)
      .eq('user_id', userId)
      .eq('category_id', (await this.getFirearmsCategoryId()));
    
    return data;
  }
  
  async addFirearm(item: FirearmInput) {
    // Insert into inventory
    const { data: inventory } = await supabase
      .from('inventory')
      .insert({
        user_id: item.user_id,
        category_id: await this.getFirearmsCategoryId(),
        name: item.name,
        // ... common fields
      })
      .select()
      .single();
    
    // Insert into firearm_details
    await supabase
      .from('firearm_details')
      .insert({
        inventory_id: inventory.id,
        serial_number: item.serial_number,
        // ... firearm-specific fields
      });
  }
}
```

### 3.3 Update Components
```typescript
// src/components/inventory/InventoryDashboard.tsx
const { data: items } = useQuery({
  queryKey: ['inventory', userId],
  queryFn: () => inventoryService.getAll(userId)
});

// Filter by category in UI
const firearms = items?.filter(item => 
  item.category?.name === 'Firearms'
);
```

## Phase 4: Testing (Week 5)

### 4.1 Unit Tests
- Test InventoryService CRUD operations
- Test each category service
- Test data integrity constraints

### 4.2 Integration Tests
- Test full add item flow
- Test category filtering
- Test search and filters
- Test bulk operations

### 4.3 E2E Tests
```typescript
test('Add firearm creates inventory and detail records', async () => {
  // Add firearm
  await addFirearm(testData);
  
  // Verify inventory record
  const inventory = await getInventory();
  expect(inventory).toHaveLength(1);
  
  // Verify detail record
  const details = await getFirearmDetails(inventory[0].id);
  expect(details.serial_number).toBe(testData.serial_number);
});
```

## Phase 5: Deployment (Week 6)

### 5.1 Pre-Deployment
- [ ] All tests passing
- [ ] Code review complete
- [ ] Migration scripts tested on staging
- [ ] Rollback plan documented

### 5.2 Deployment Steps
1. Announce maintenance window
2. Backup production database
3. Run schema migrations (035)
4. Run data migration (036)
5. Verify data integrity
6. Deploy application code
7. Monitor for errors
8. Verify all features working

### 5.3 Post-Deployment
- Monitor error logs for 48 hours
- Keep old tables for 30 days as backup
- After verification, drop old tables

## Rollback Plan

If issues arise:
```sql
-- Restore old tables
ALTER TABLE firearms_old RENAME TO firearms;
ALTER TABLE optics_old RENAME TO optics;
-- ... repeat for all

-- Revert application code
git revert <commit-hash>
```

## Success Metrics

- ✅ All data migrated successfully (0% data loss)
- ✅ All tests passing
- ✅ Query performance improved (measure before/after)
- ✅ Code complexity reduced (fewer lines of code)
- ✅ No production errors for 7 days

## Timeline

- Week 1: Schema creation
- Week 2: Data migration
- Week 3-4: Code updates
- Week 5: Testing
- Week 6: Deployment

**Total: 6 weeks**

## Approval Required

This is a major architectural change. Please confirm:
- [ ] Business stakeholders approve
- [ ] Technical team approves
- [ ] Timeline is acceptable
- [ ] Resources allocated

Once approved, we can proceed with implementation.
