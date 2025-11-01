# CaliberVault Data Flow Documentation

## Complete Data Flow: Add Item → Database → Dashboard Display

### 1. ADD ITEM FLOW

#### Step 1: User Input (AddItemModal.tsx)
- User selects category (firearms, optics, ammunition, etc.)
- Fills form with manufacturer, model, caliber, etc.
- Uploads photos (optional)
- Clicks "Add Item"

#### Step 2: Form Submission
```
AddItemModal.handleSubmit() 
  → calls onAdd(itemData)
  → which is addCloudItem() from AppContext
```

#### Step 3: Database Insert (AppContext.addCloudItem)

**Tables Updated by Category:**

| Category | Database Table | Key Fields |
|----------|---------------|------------|
| firearms | `firearms` | user_id, name, manufacturer_id, caliber_id, action_id, barrel_length, serial_number |
| optics | `optics` | user_id, name, manufacturer_id, optic_type_id, magnification_id, reticle_type_id |
| ammunition | `ammunition` | user_id, name, manufacturer_id, caliber_id, bullet_type_id, grain_weight, round_count |
| suppressors | `suppressors` | user_id, name, manufacturer_id, caliber_id, mounting_type, material |
| magazines | `magazines` | user_id, name, manufacturer_id, caliber_id, capacity |
| accessories | `accessories` | user_id, name, manufacturer_id, category |
| bullets | `bullets` | user_id, name, manufacturer_id, caliber_id, bullet_type_id, weight_grains |
| reloading | `reloading_components` | user_id, name, manufacturer_id, component_type, caliber_id |
| cases | `cases` | user_id, name, manufacturer_id, caliber_id |
| primers | `primers` | user_id, name, manufacturer_id, primer_type |
| powder | `powder` | user_id, name, manufacturer_id, powder_type |

**Reference Tables Joined:**
- `manufacturers` - Brand names
- `calibers` - Cartridge/caliber names
- `locations` - Storage locations
- `action_types` - Firearm actions
- `bullet_types` - Bullet types
- `optic_types`, `reticle_types`, `magnifications`, `turret_types` - Optics data

#### Step 4: Real-time Update
- Supabase real-time subscription detects INSERT
- handleRealtimeChange() called
- fetchAndAddItem() queries the new item with all JOINs
- Item added to cloudInventory state

### 2. DASHBOARD RETRIEVAL FLOW

#### Step 1: Initial Load (AppContext.fetchCloudInventory)
Queries ALL 11 tables in parallel:
```javascript
Promise.allSettled([
  supabase.from('firearms').select('*, manufacturers(...), calibers(...), locations(...)'),
  supabase.from('optics').select('*, manufacturers(...), locations(...)'),
  supabase.from('ammunition').select('*, manufacturers(...), calibers(...), bullet_types(...)'),
  // ... 8 more tables
])
```

#### Step 2: Data Transformation
Each table result converted to InventoryItem:
```javascript
{
  id, name, category, manufacturer, storageLocation,
  images, purchasePrice, currentValue, purchaseDate,
  // + category-specific fields
}
```

#### Step 3: State Update
```javascript
setCloudInventory(allItems) // Combined array of all items
```

#### Step 4: Dashboard Display (InventoryDashboard.tsx)

**Stats Cards:**
```javascript
totalItems = inventory.length
totalValue = inventory.reduce((sum, item) => sum + item.currentValue, 0)
```

**Category Cards with Counts:**
```javascript
firearms: inventory.filter(i => i.category === 'firearms').length
optics: inventory.filter(i => i.category === 'optics').length
ammunition: inventory.filter(i => i.category === 'ammunition').length
// ... for all 11 categories
```

**Item Grid:**
```javascript
filteredInventory = inventory
  .filter(category match)
  .filter(search query)
  .slice(0, displayedItems) // Pagination
```

### 3. COMPLETE FLOW DIAGRAM

```
USER ACTION
    ↓
AddItemModal Form
    ↓
handleSubmit()
    ↓
addCloudItem(itemData)
    ↓
INSERT INTO [category_table]
    ↓
Real-time Subscription
    ↓
fetchAndAddItem()
    ↓
setCloudInventory([...prev, newItem])
    ↓
InventoryDashboard Re-renders
    ↓
Stats Updated | Category Counts Updated | Item Grid Updated
```

### 4. KEY OPTIMIZATION POINTS

1. **Optimistic Updates**: Item appears immediately before DB confirmation
2. **Parallel Queries**: All 11 tables fetched simultaneously
3. **Real-time Sync**: Changes propagate instantly via Supabase subscriptions
4. **Efficient Filtering**: Client-side filtering for instant search/category selection
5. **Pagination**: Only render visible items (20 at a time)

### 5. TROUBLESHOOTING

**Item not appearing after add:**
- Check console for INSERT errors
- Verify user_id matches current user
- Check RLS policies on category table
- Verify real-time subscription is active

**Count mismatch on dashboard:**
- Check category field matches exactly (case-sensitive)
- Verify fetchCloudInventory completed
- Check for duplicate items (same ID)

**Slow dashboard load:**
- Check number of items (pagination helps)
- Verify indexes on user_id columns
- Check JOIN performance on reference tables
