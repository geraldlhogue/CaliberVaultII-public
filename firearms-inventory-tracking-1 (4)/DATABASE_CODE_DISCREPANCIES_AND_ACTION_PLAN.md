# Database-Code Discrepancies and Action Plan

**Date**: October 27, 2025  
**Analysis Status**: ✅ COMPLETE

## Critical Discrepancies Found

### 1. Duplicate Action Tables 🔴 HIGH PRIORITY

**Issue**: Both `actions` and `firearm_actions` tables exist with similar but different data.

**Details**:
- `actions` table: 12 records, has `display_order` and `user_id` columns
- `firearm_actions` table: 8 records, missing `display_order` and `user_id` columns

**Code Usage**:
- `actions` used in: BackupRestore.tsx, EnhancedDatabaseViewer.tsx, databaseSeeder.ts
- `firearm_actions` used in: ActionManager.tsx

**Data Differences**:
- `actions` has: "Double Action", "Single Action", "Hogue-Action", "Semi-Auto"
- `firearm_actions` missing these but has most common ones

**Recommendation**: 
- Standardize on `actions` table (more complete, used in backup system)
- Update ActionManager.tsx to use `actions` instead of `firearm_actions`
- Migrate any unique data from `firearm_actions` to `actions`
- Drop `firearm_actions` table or create a view/alias

**Impact**: Medium - Both work but causes confusion and data inconsistency

---

### 2. Missing field_of_view_ranges Usage ✅ RESOLVED

**Issue**: Table was missing from database but code referenced it.

**Status**: ✅ Created table with 17 seed records in migration 023

**Code Files Using It**:
- FieldOfViewManager.tsx (admin component)
- AppContext.tsx (stores field_of_view as TEXT in optics table)

**Note**: The `optics` table stores FOV as TEXT, while `field_of_view_ranges` provides reference data for typical FOV values per magnification.

---

## Tables vs Code Analysis

### ✅ Fully Integrated Tables (Code + DB + Data)

1. **firearms** - FirearmsService.ts, AppContext.tsx
2. **optics** - AppContext.tsx, AttributeFieldsOptics.tsx
3. **ammunition** - AmmunitionService.ts, AppContext.tsx
4. **suppressors** - AppContext.tsx, AttributeFieldsSuppressors.tsx
5. **manufacturers** - ManufacturerManager.tsx, AppContext.tsx
6. **categories** - CategoryManager.tsx, AppContext.tsx
7. **calibers** - CaliberManager.tsx, AppContext.tsx
8. **storage_locations** - StorageLocationManager.tsx, AppContext.tsx
