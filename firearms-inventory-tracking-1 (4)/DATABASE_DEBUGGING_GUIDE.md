# Database Debugging Guide

## Common Issues and Solutions

### Issue 1: "Reference tables are empty" Error
**Symptoms:**
- Add Item form shows "No reference data available"
- Form fields don't appear initially
- Need to click "Retry" to load form

**Root Causes:**
1. Reference tables not seeded
2. User not authenticated
3. Database connection issues
4. Incorrect table permissions

**Solutions:**
1. **Seed Reference Tables:**
   - Go to Admin panel
   - Click "Seed Reference Tables"
   - Wait for completion message
   - Refresh the page

2. **Check Authentication:**
   ```javascript
   // In browser console:
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user);
   ```

3. **Verify Table Data:**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT COUNT(*) as count, 'manufacturers' as table_name FROM manufacturers
   UNION ALL
   SELECT COUNT(*), 'categories' FROM categories
   UNION ALL
   SELECT COUNT(*), 'calibers' FROM calibers
   UNION ALL
   SELECT COUNT(*), 'cartridges' FROM cartridges;
   ```

### Issue 2: "Cannot add items" Error
**Symptoms:**
- Form submits but item doesn't save
- Error: "e[(intermediate value)] is not a function"
- Console shows database errors

**Root Causes:**
1. Missing required fields
2. Incorrect data types
3. Foreign key constraints
4. RLS policies blocking insert

**Solutions:**
1. **Check Required Fields:**
   - Ensure category is selected
   - Ensure storage location is selected
   - For firearms: cartridge and caliber required

2. **Verify RLS Policies:**
   ```sql
   -- Check if user can insert:
   SELECT * FROM firearms WHERE false;
   -- Should return empty set, not permission error
   ```

3. **Enable Detailed Logging:**
   - Open browser console
   - Try adding item
   - Look for "=== INSERT ERROR ===" logs

### Issue 3: Admin Panel Not Scrolling
**Symptoms:**
- Can't scroll to see all reference data managers
- Content cut off at bottom
- Tabs not accessible

**Root Causes:**
1. CSS overflow issues
2. Fixed positioning conflicts
3. ScrollArea component issues

**Solutions:**
1. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear site data in DevTools > Application > Storage

2. **Check CSS Classes:**
   - Ensure parent has `overflow-auto` or `overflow-y-auto`
   - Remove conflicting `fixed` positioning
   - Use `flex` layout with proper `flex-1`

## Debugging Steps

### Step 1: Check Database Connection
```javascript
// Run in browser console:
const { data, error } = await supabase.from('categories').select('*');
console.log('Categories:', data);
console.log('Error:', error);
```

### Step 2: Verify User Authentication
```javascript
// Run in browser console:
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

### Step 3: Test Direct Insert
```javascript
// Run in browser console:
const { data, error } = await supabase
  .from('firearms')
  .insert([{
    user_id: session.user.id,
    category: 'firearms',
    manufacturer: 'Test',
    model: 'Test Model',
    serial_number: 'TEST123',
    cartridge: '.223 Remington',
    caliber: '.223'
  }])
  .select();
console.log('Insert result:', data);
console.log('Insert error:', error);
```

### Step 4: Check Reference Data Loading
```javascript
// Check what's actually in the tables:
const tables = [
  'manufacturers', 'categories', 'calibers', 
  'cartridges', 'locations', 'action_types'
];

for (const table of tables) {
  const { data, count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  console.log(`${table}: ${count} records`);
}
```

## Console Commands for Quick Fixes

### Reset and Reseed All Reference Data
```javascript
// WARNING: This will delete and recreate reference data
async function reseedReferenceData() {
  const tables = [
    'manufacturers', 'calibers', 'cartridges', 
    'categories', 'action_types', 'ammo_types'
  ];
  
  for (const table of tables) {
    console.log(`Reseeding ${table}...`);
    // Seed logic here
  }
}
```

### Clear Local Storage and Refresh
```javascript
// Clear all app data and refresh:
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

## Error Filtering

The app filters these known third-party errors:
- `vo.open is not a function` - Third-party analytics
- `DataCloneError` - Service worker issues
- `e[(intermediate value)]` - Minification artifacts

These are safely ignored and don't affect functionality.

## Monitoring Queries

### Check Recent Errors
```sql
-- In Supabase SQL Editor:
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 20;
```

### Check User's Items
```sql
-- Replace USER_ID with actual ID:
SELECT category, COUNT(*) as count 
FROM (
  SELECT 'firearms' as category, user_id FROM firearms
  UNION ALL
  SELECT 'ammunition', user_id FROM ammunition
  UNION ALL
  SELECT 'optics', user_id FROM optics
) t
WHERE user_id = 'USER_ID'
GROUP BY category;
```

## Quick Recovery Actions

1. **If nothing works:**
   - Log out and log back in
   - Clear browser cache
   - Try incognito/private mode
   - Check Supabase dashboard for service issues

2. **Database Health Check:**
   - Go to Admin panel
   - Run "Database Health Check"
   - Review any errors reported
   - Run "Seed Reference Tables" if needed

3. **Form Not Loading:**
   - Click "Retry" button when it appears
   - Check browser console for errors
   - Verify you're logged in
   - Ensure reference tables have data

## Contact Support

If issues persist after trying these solutions:
1. Copy any error messages from console
2. Note the exact steps to reproduce
3. Check Supabase service status
4. Review recent code changes