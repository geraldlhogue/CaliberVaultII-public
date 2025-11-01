# Troubleshooting Category Count Cache Issue

## Problem
Category counts may be cached in browser and not reflecting actual database state.

## Solution Steps

### 1. Clear Browser Cache
```
Chrome/Edge: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
Firefox: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
Safari: Cmd+Option+E (Mac)
```

### 2. Clear Application Storage
1. Open Developer Tools (F12)
2. Go to Application tab
3. Clear:
   - Local Storage
   - Session Storage
   - IndexedDB
   - Cache Storage

### 3. Hard Refresh
```
Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
Safari: Cmd+Option+R (Mac)
```

### 4. Force Inventory Refresh
Click the green "Refresh" button in the dashboard to reload data from database.

### 5. Check Database Directly
Use Supabase Dashboard to verify actual counts:
```sql
-- Check user's items in each table
SELECT 'firearms' as table_name, COUNT(*) as count FROM firearms WHERE user_id = 'YOUR_USER_ID'
UNION ALL
SELECT 'optics', COUNT(*) FROM optics WHERE user_id = 'YOUR_USER_ID'
UNION ALL
SELECT 'bullets', COUNT(*) FROM bullets WHERE user_id = 'YOUR_USER_ID'
UNION ALL
SELECT 'suppressors', COUNT(*) FROM suppressors WHERE user_id = 'YOUR_USER_ID';
```

### 6. Verify Real-time Subscriptions
Check console for:
```
Setting up real-time subscriptions for user: xxx
Firearms change detected: {...}
```

If not seeing these, real-time updates may not be working.

## If Issue Persists

### Check for Stale Data
1. Sign out completely
2. Clear all browser data
3. Sign back in
4. Data should reload fresh from database

### Verify User ID
Console should show:
```
=== FETCHING CLOUD INVENTORY ===
User ID: xxx
```

Make sure this matches your actual user ID in Supabase.

### Check Network Requests
1. Open Network tab in DevTools
2. Filter by "firearms", "optics", "bullets", "suppressors"
3. Verify API calls are returning data
4. Check for any 401/403 errors (permission issues)

## Prevention

### Enable Debug Mode
The `CategoryCountDebug` component now logs all category data on every render. Check console regularly to catch issues early.

### Regular Refresh
Click the Refresh button periodically to ensure data is current, especially after:
- Adding new items
- Editing items
- Deleting items
- Changing categories

### Monitor Real-time Updates
Watch console for real-time subscription messages. If they stop appearing, refresh the page.
