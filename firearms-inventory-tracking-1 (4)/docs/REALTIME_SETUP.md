# Real-Time Inventory Updates

## Overview
The inventory system now uses Supabase real-time subscriptions to automatically update the UI when items are added, updated, or deleted. This means:

- **Instant Updates**: When you add a firearm, optic, ammunition, or suppressor, it appears immediately in your inventory without refreshing the page
- **Multi-Device Sync**: Changes made on one device are instantly reflected on all other devices logged in with the same account
- **Automatic State Management**: No manual refresh needed - the app stays in sync automatically

## How It Works

### Subscriptions
The app subscribes to four database tables:
- `firearms` - Firearm inventory changes
- `optics` - Optic inventory changes  
- `bullets` - Ammunition inventory changes
- `suppressors` - Suppressor inventory changes

### Event Handling
For each table, the app listens for:
- **INSERT**: New item added → Fetches complete item data and adds to state
- **UPDATE**: Item modified → Fetches updated item data and updates state
- **DELETE**: Item removed → Removes item from state

## Enabling Real-Time in Supabase

If real-time updates aren't working, you may need to enable them in your Supabase project:

### Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the tables: `firearms`, `optics`, `bullets`, `suppressors`
4. Enable replication for each table by toggling the switch

### Via SQL (Alternative)
Run this SQL in your Supabase SQL Editor:

```sql
-- Enable real-time for inventory tables
ALTER PUBLICATION supabase_realtime ADD TABLE firearms;
ALTER PUBLICATION supabase_realtime ADD TABLE optics;
ALTER PUBLICATION supabase_realtime ADD TABLE bullets;
ALTER PUBLICATION supabase_realtime ADD TABLE suppressors;
```

## Debugging Real-Time

### Check Console Logs
The app logs real-time events to the browser console:
- "Setting up real-time subscriptions for user: [user_id]"
- "Firearms change detected: [payload]"
- "Real-time INSERT event on firearms: [details]"

### Verify Subscription Status
Check the console for subscription confirmation messages. If you see errors, verify:
1. Real-time is enabled in Supabase dashboard
2. Row Level Security policies allow the user to read their own data
3. Network connection is stable

### Test Real-Time
1. Open the app in two browser windows
2. Add an item in one window
3. It should appear immediately in the other window

## Performance Notes

- **Efficient Updates**: Only fetches the specific item that changed, not the entire inventory
- **Duplicate Prevention**: Checks if item already exists before adding to prevent duplicates
- **Automatic Cleanup**: Subscriptions are properly cleaned up when component unmounts
- **User-Scoped**: Only receives updates for the logged-in user's items (filtered by user_id)

## Fallback Behavior

The app maintains a manual refresh as a fallback:
- If real-time fails, the manual refresh in `addCloudItem` ensures the item appears
- This provides redundancy and reliability even if real-time is temporarily unavailable
