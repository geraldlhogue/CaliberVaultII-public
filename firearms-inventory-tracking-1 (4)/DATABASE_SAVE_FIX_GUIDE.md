# Database Save Fix Guide

## Issues Identified and Fixed

### 1. ✅ Foreign Key Resolution
**Problem**: Form was sending string names (e.g., "Glock") but database expects UUIDs for foreign keys.

**Fixed in**: `src/hooks/useInventoryQuery.ts`
- Added `resolveManufacturerId()` helper function
- Added `resolveCaliberId()` helper function
- These functions look up the UUID from the name before inserting

### 2. ✅ Enhanced Logging
**Added comprehensive console logging** to track the entire save process:
- 🔵 Blue logs for process start
- 📦 Package icon for data inspection
- 👤 User authentication status
- 📋 Table name resolution
- 🔗 Foreign key resolution
- 💾 Final insert object
- ✅ Success confirmation
- ❌ Error details with code, message, hint

### 3. ✅ Database Diagnostic Tool
**Created**: `src/components/database/ComprehensiveDatabaseDiagnostic.tsx`

This tool tests:
1. Supabase connection
2. Authentication status
3. Read permissions (manufacturers table)
4. Write permissions (firearms table with test insert/delete)

**How to use**: Click "Health Check" button in Admin Dashboard

### 4. ⚠️ Supabase Key Format
**IMPORTANT**: Check your Supabase configuration in `src/lib/supabase.ts`

Current key: `sb_publishable_DCv6ykEtF2aG0p_w_1vtmw_aykVYQyI`

Standard Supabase anon keys start with `eyJ...`. If your key is different:
1. Go to Supabase Dashboard → Settings → API
2. Copy the "anon public" key
3. Update `src/lib/supabase.ts` with the correct key

## Testing Steps

1. **Open Browser Console** (F12)
2. **Go to Admin Dashboard** → Click "Health Check"
3. **Run All Tests** - This will show:
   - Connection status
   - Authentication status
   - Permission issues
   - Exact error messages

4. **Try Adding an Item**:
   - Fill in Category, Manufacturer, Model (all required)
   - Click "Add Item"
   - Watch console for detailed logs:
     ```
     🔵 [ADD ITEM] Starting mutation...
     📦 Raw item: {...}
     👤 User check: {...}
     📋 Target table: firearms
     🔗 Resolved IDs: {...}
     💾 Final insert object: {...}
     ✅ INSERT SUCCESS
     ```

## Common Errors and Solutions

### Error: "User not authenticated"
- **Solution**: Make sure you're logged in
- Check console for: `👤 User check: { userId: null }`

### Error: "null value in column 'user_id' violates not-null constraint"
- **Solution**: Authentication issue - user_id not being attached
- This should be fixed by the updated mutation code

### Error: "insert or update on table 'firearms' violates foreign key constraint"
- **Solution**: Manufacturer or caliber name couldn't be resolved to UUID
- Check console for: `🔗 Resolved IDs: { manufacturerId: null, caliberId: null }`
- Make sure reference data is seeded (Admin → Seed Reference Tables)

### Error: "permission denied for table firearms"
- **Solution**: RLS policy issue
- Run migrations 017 and 018 to create tables and policies
- Check that you're logged in with the correct user

## Next Steps if Still Broken

1. **Check Supabase Key**: Verify anon key format
2. **Run Migrations**: Ensure all migrations are applied
3. **Seed Data**: Run "Seed Reference Tables" in Admin
4. **Check RLS Policies**: In Supabase Dashboard → Authentication → Policies
5. **Review Console Logs**: Look for the exact error message with emoji indicators
