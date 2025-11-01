# Processing Specification Document

## 1. Item Creation (CREATE)

### 1.1 Process Flow
```
User Input → Validation → Base Record → Detail Record → Success
```

### 1.2 Steps
1. **User selects category** (Firearms, Ammunition, etc.)
2. **Form displays** category-specific fields
3. **User fills form** with required data
4. **Client validation** checks required fields
5. **Submit triggers** `handleSubmit()`
6. **Service layer**:
   - Creates base `inventory` record
   - Creates category `*_details` record
   - Links via `inventory_id`
7. **Success response** or error handling

### 1.3 Code Path
```
AddItemModal.tsx 
  → FirearmsService.create() 
    → supabase.from('inventory').insert()
    → supabase.from('firearm_details').insert()
```

### 1.4 Validation Rules
- **Required**: category_id, name
- **Optional**: manufacturer, model, quantity
- **Category-specific**: Varies by category

---

## 2. Item Retrieval (READ)

### 2.1 Process Flow
```
User Request → Query Builder → Database → Transform → Display
```

### 2.2 Query Types
- **List All**: Get all items for user
- **Filter**: By category, manufacturer, location
- **Search**: Text search across fields
- **Detail**: Single item with all relations

### 2.3 Code Path
```
InventoryDashboard.tsx
  → useInventoryQuery()
    → FirearmsService.getAll()
      → supabase.from('inventory')
        .select('*, firearm_details(*)')
```

### 2.4 Join Strategy
```sql
SELECT 
  inventory.*,
  firearm_details.*,
  calibers.name as caliber_name,
  manufacturers.name as manufacturer_name
FROM inventory
LEFT JOIN firearm_details ON inventory.id = firearm_details.inventory_id
LEFT JOIN calibers ON firearm_details.caliber_id = calibers.id
LEFT JOIN manufacturers ON inventory.manufacturer_id = manufacturers.id
WHERE inventory.user_id = auth.uid()
```

---

## 3. Item Update (UPDATE)

### 3.1 Process Flow
```
Load Existing → User Edits → Validate → Update Base → Update Details → Success
```

### 3.2 Steps
1. **Load item** with all details
2. **Populate form** with current values
3. **User modifies** fields
4. **Validate changes**
5. **Update base** `inventory` record
6. **Update detail** record if exists
7. **Create detail** record if missing

### 3.3 Code Path
```
EditItemModal.tsx
  → FirearmsService.update(id, data)
    → supabase.from('inventory').update()
    → supabase.from('firearm_details').upsert()
```

### 3.4 Upsert Logic
```typescript
// Update or insert detail record
await supabase
  .from('firearm_details')
  .upsert({
    inventory_id: itemId,
    ...detailData
  }, {
    onConflict: 'inventory_id'
  });
```

---

## 4. Item Deletion (DELETE)

### 4.1 Process Flow
```
User Selects → Confirm → Soft Delete → Cascade → Success
```

### 4.2 Deletion Types
- **Soft Delete**: Set status = 'deleted'
- **Hard Delete**: Remove from database
- **Cascade**: Detail records auto-delete via FK

### 4.3 Code Path
```
ItemCard.tsx
  → handleDelete()
    → FirearmsService.delete(id)
      → supabase.from('inventory').delete()
        // Cascades to firearm_details
```

---

## 5. Category Services

### 5.1 Service Pattern
Each category has a dedicated service class:

```typescript
class FirearmsService extends BaseCategoryService {
  detailTable = 'firearm_details';
  
  async create(data) {
    // 1. Create base inventory record
    const inventory = await this.createBase(data);
    
    // 2. Create detail record
    await this.saveDetails(inventory.id, data);
    
    return inventory;
  }
}
```

### 5.2 Available Services
1. FirearmsService
2. AmmunitionService
3. OpticsService
4. MagazinesService
5. AccessoriesService
6. SuppressorsService
7. ReloadingService
8. CasesService
9. PrimersService
10. PowderService

---

## 6. Validation Layer

### 6.1 Schema Validation
Uses Zod schemas for type-safe validation:

```typescript
const firearmsSchema = z.object({
  name: z.string().min(1),
  manufacturer_id: z.string().uuid().optional(),
  caliber_id: z.string().uuid().optional(),
  serial_number: z.string().optional(),
});
```

### 6.2 Validation Points
- **Client-side**: Form inputs (React Hook Form)
- **Service-layer**: Before database operations
- **Database**: Constraints and triggers

---

## 7. Error Handling

### 7.1 Error Types
- **Validation Error**: Invalid input data
- **Database Error**: FK constraint, unique violation
- **Permission Error**: RLS policy denial
- **Network Error**: Connection issues

### 7.2 Error Flow
```
Error Occurs → Service Catches → Transform → UI Display
```

### 7.3 User Feedback
```typescript
try {
  await service.create(data);
  toast.success('Item created');
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

---

## 8. Real-time Sync

### 8.1 Subscription Pattern
```typescript
supabase
  .channel('inventory_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'inventory' },
    (payload) => {
      // Update local state
      queryClient.invalidateQueries(['inventory']);
    }
  )
  .subscribe();
```

### 8.2 Sync Events
- INSERT: New item added
- UPDATE: Item modified
- DELETE: Item removed

---

## 9. Testing Strategy

### 9.1 Unit Tests
Test individual services:
```typescript
describe('FirearmsService', () => {
  it('should create firearm with details', async () => {
    const result = await firearmsService.create(mockData);
    expect(result.id).toBeDefined();
  });
});
```

### 9.2 Integration Tests
Test full workflows:
```typescript
it('should create and retrieve firearm', async () => {
  const created = await firearmsService.create(data);
  const retrieved = await firearmsService.getById(created.id);
  expect(retrieved).toMatchObject(data);
});
```

### 9.3 E2E Tests
Test user interactions:
```typescript
test('user can add firearm', async ({ page }) => {
  await page.click('button:has-text("Add Item")');
  await page.fill('input[name="name"]', 'Glock 19');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Success')).toBeVisible();
});
```

---

## 10. Performance Optimization

### 10.1 Query Optimization
- Use indexes on frequently queried columns
- Limit result sets with pagination
- Use `select()` to fetch only needed columns

### 10.2 Caching Strategy
- React Query caches API responses
- Stale time: 5 minutes
- Background refetch on window focus

### 10.3 Batch Operations
- Bulk insert/update for multiple items
- Transaction support for atomic operations

---

## 11. Security

### 11.1 Row Level Security (RLS)
All tables have RLS policies:
```sql
CREATE POLICY "Users can view own inventory"
ON inventory FOR SELECT
USING (auth.uid() = user_id);
```

### 11.2 Data Access
- Users can only access their own data
- Team members can access shared inventory
- Admin can access all data

---

## 12. Migration Process

### 12.1 Schema Changes
1. Create migration file in `supabase/migrations/`
2. Test locally
3. Deploy to staging
4. Verify data integrity
5. Deploy to production

### 12.2 Data Migration
- Use migration scripts for data transformation
- Backup before migration
- Rollback plan required
