# Category Add Function Documentation
**Complete guide to data flow and table mappings for all inventory categories**

---

## Overview
When adding an item through `AddItemModal`, the system performs a two-step save:
1. **Base Record:** Insert into `inventory` table (common fields)
2. **Detail Record:** Insert into category-specific detail table (specialized fields)

---

## Data Flow Architecture

```
AddItemModal (UI)
    ↓
InventoryService.saveItem()
    ↓
1. Insert into `inventory` table (base data)
    ↓
2. Call saveDetails() with category
    ↓
3. Insert into category-specific detail table
```

---

## Base Inventory Table
**Table:** `inventory`
**Fields saved for ALL categories:**
- user_id (UUID) - Owner
- category_id (UUID) - FK to categories table
- name (TEXT) - Item name
- manufacturer_id (UUID) - FK to manufacturers
- model (TEXT) - Model name/number
- description (TEXT) - Item description
- quantity (INTEGER) - Number of items
- location_id (UUID) - FK to locations
- purchase_price (DECIMAL) - Purchase cost
- purchase_date (DATE) - Date purchased
- current_value (DECIMAL) - Current estimated value
- barcode (TEXT) - Barcode/UPC
- upc (TEXT) - UPC code
- photos (ARRAY) - Image URLs
- notes (TEXT) - Additional notes
- status (TEXT) - 'active', 'deleted', etc.

---

## Category-Specific Detail Tables

### 1. FIREARMS
**Category Value:** `firearms`
**Detail Table:** `firearm_details`

**Fields Saved:**
- inventory_id (UUID) - FK to inventory
- caliber_id (UUID) - FK to calibers
- cartridge_id (UUID) - FK to cartridges
- serial_number (TEXT) - Firearm serial
- barrel_length (DECIMAL) - Length in inches
- capacity (INTEGER) - Magazine capacity
- action_id (UUID) - FK to action_types
- round_count (INTEGER) - Rounds fired

**Lookup Functions Used:**
- getCaliberId(item.caliber)
- getCartridgeId(item.cartridge)
- getActionId(item.action)

---

### 2. AMMUNITION
**Category Value:** `ammunition`
**Detail Table:** `ammunition_details`

**Fields Saved:**
- inventory_id (UUID)
- caliber_id (UUID) - FK to calibers
- cartridge_id (UUID) - FK to cartridges
- bullet_type_id (UUID) - FK to bullet_types
- grain_weight (DECIMAL) - Bullet weight
- round_count (INTEGER) - Number of rounds
- primer_type_id (UUID) - FK to primer_types

**Lookup Functions Used:**
- getCaliberId(item.caliber)
- getCartridgeId(item.cartridge)
- getBulletTypeId(item.bulletType)
- getPrimerTypeId(item.primerType)

---

### 3. OPTICS
**Category Value:** `optics`
**Detail Table:** `optic_details`

**Fields Saved:**
- inventory_id (UUID)
- magnification_id (UUID) - FK to magnifications
- objective_diameter (DECIMAL) - Lens diameter
- reticle_type_id (UUID) - FK to reticle_types
- turret_type_id (UUID) - FK to turret_types

**Lookup Functions Used:**
- getMagnificationId(item.magnification)
- getReticleTypeId(item.reticleType)
- getTurretTypeId(item.turretType)

---

### 4. SUPPRESSORS
**Category Value:** `suppressors`
**Detail Table:** `suppressor_details`

**Fields Saved:**
- inventory_id (UUID)
- caliber_id (UUID) - FK to calibers
- serial_number (TEXT)
- length (DECIMAL) - Suppressor length
- weight (DECIMAL) - Weight in ounces
- material_id (UUID) - FK to suppressor_materials

**Lookup Functions Used:**
- getCaliberId(item.caliber)
- getSuppressorMaterialId(item.material)

---

### 5. MAGAZINES
**Category Value:** `magazines`
**Detail Table:** `magazine_details`

**Fields Saved:**
- inventory_id (UUID)
- caliber_id (UUID) - FK to calibers
- capacity (INTEGER) - Round capacity
- material (TEXT) - Construction material

**Lookup Functions Used:**
- getCaliberId(item.caliber)

---

### 6. ACCESSORIES
**Category Value:** `accessories`
**Detail Table:** `accessory_details`

**Fields Saved:**
- inventory_id (UUID)
- accessory_type (TEXT) - Type of accessory
- compatibility (TEXT) - Compatible with

**Lookup Functions Used:** None

---

### 7. POWDER
**Category Value:** `powder`
**Detail Table:** `powder_details`

**Fields Saved:**
- inventory_id (UUID)
- powder_type_id (UUID) - FK to powder_types
- weight (DECIMAL) - Weight amount
- unit_of_measure_id (UUID) - FK to units_of_measure
- burn_rate (TEXT) - Burn rate classification

**Lookup Functions Used:**
- getPowderTypeId(item.powderType)
- getUnitOfMeasureId(item.unitOfMeasure)

---

### 8. PRIMERS
**Category Value:** `primers`
**Detail Table:** `primer_details`

**Fields Saved:**
- inventory_id (UUID)
- primer_type_id (UUID) - FK to primer_types
- size (TEXT) - Primer size

**Lookup Functions Used:**
- getPrimerTypeId(item.primerType)

---

### 9. CASES
**Category Value:** `cases`
**Detail Table:** `case_details`

**Fields Saved:**
- inventory_id (UUID)
- caliber_id (UUID) - FK to calibers
- material (TEXT) - Brass, steel, etc.
- times_fired (INTEGER) - Reload count

**Lookup Functions Used:**
- getCaliberId(item.caliber)

---

### 10. BULLETS
**Category Value:** `bullets`
**Detail Table:** `bullet_details`

**Fields Saved:**
- inventory_id (UUID)
- caliber_id (UUID) - FK to calibers
- bullet_type_id (UUID) - FK to bullet_types
- grain_weight (DECIMAL) - Bullet weight

**Lookup Functions Used:**
- getCaliberId(item.caliber)
- getBulletTypeId(item.bulletType)

---

### 11. RELOADING
**Category Value:** `reloading`
**Detail Table:** `reloading_details`

**Fields Saved:**
- inventory_id (UUID)
- equipment_type (TEXT) - Press, scale, etc.
- compatibility (TEXT) - Compatible calibers

**Lookup Functions Used:** None

---

## Lookup Function Reference

All lookup functions follow this pattern:
```typescript
private async getXxxId(name: string): Promise<string | null> {
  if (!name) return null;
  const { data } = await supabase
    .from('xxx_table')
    .select('id')
    .ilike('name', name)
    .single();
  return data?.id || null;
}
```

**Available Lookup Functions:**
- getCategoryId(name) → categories.id
- getManufacturerId(name) → manufacturers.id
- getLocationId(name, userId) → locations.id
- getCaliberId(name) → calibers.id
- getCartridgeId(name) → cartridges.id
- getActionId(name) → action_types.id
- getBulletTypeId(name) → bullet_types.id
- getPrimerTypeId(name) → primer_types.id
- getMagnificationId(name) → magnifications.id
- getReticleTypeId(name) → reticle_types.id
- getTurretTypeId(name) → turret_types.id
- getSuppressorMaterialId(name) → suppressor_materials.id
- getPowderTypeId(name) → powder_types.id
- getUnitOfMeasureId(name) → units_of_measure.id

---

## Error Handling

**Category Not Found:**
```
Error: Category "xyz" not found. Please select a valid category.
```

**Detail Save Failed:**
```
Error: Failed to save [category] details: [database error message]
```

**Inventory Save Failed:**
```
Error: Failed to save item: [database error message]
```

---

## Complete Save Example (Firearms)

**Input Data:**
```javascript
{
  name: "Ruger 10/22",
  category: "firearms",
  manufacturer: "Ruger",
  model: "10/22",
  serialNumber: "ABC123",
  caliber: ".22 LR",
  cartridge: ".22 Long Rifle",
  action: "Semi-Auto",
  barrelLengthValue: 18.5,
  capacity: 10,
  roundCount: 500,
  purchasePrice: 299.99,
  storageLocation: "Gun Safe",
  notes: "Great plinker"
}
```

**Database Operations:**
1. Lookup category_id for "firearms"
2. Lookup manufacturer_id for "Ruger"
3. Lookup location_id for "Gun Safe"
4. Insert into `inventory` table
5. Lookup caliber_id for ".22 LR"
6. Lookup cartridge_id for ".22 Long Rifle"
7. Lookup action_id for "Semi-Auto"
8. Insert into `firearm_details` table

**Result:** Two records created with proper foreign key relationships

---

## Third Normal Form (3NF) Compliance

✅ **No Repeating Groups:** Each field contains atomic values
✅ **Primary Keys:** All tables have UUID primary keys
✅ **Foreign Keys:** All relationships use proper FK constraints
✅ **No Transitive Dependencies:** Non-key attributes depend only on primary key
✅ **Referential Integrity:** Cascading deletes and SET NULL on FK tables

---

## Testing Checklist

For each category, verify:
- [ ] Item appears in inventory list after save
- [ ] All base fields saved correctly
- [ ] All detail fields saved correctly
- [ ] Foreign keys resolve properly
- [ ] Photos upload and display
- [ ] Edit functionality works
- [ ] Delete functionality works
- [ ] Filters work for category

---

**Last Updated:** October 29, 2024
**Service File:** `src/services/inventory.service.ts`
**Modal File:** `src/components/inventory/AddItemModal.tsx`
