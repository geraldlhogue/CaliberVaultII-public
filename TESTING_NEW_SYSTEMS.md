# Testing Guide for New Systems

## Quick Start Testing Guide

### Prerequisites
1. Ensure you have at least 2 test accounts (for collaboration testing)
2. Clear browser cache if experiencing issues
3. Have both desktop and mobile devices ready for PWA testing

## 1. Real-time Collaboration Testing

### Setup
1. Open two browser windows (or use incognito + regular)
2. Log in with different accounts in each window
3. Navigate to **Teams → Live** tab in both windows

### Test Cases

#### User Presence
- [ ] Both users should appear in "Active Team Members" list
- [ ] Green dot indicator should show next to each user
- [ ] Email addresses should be displayed
- [ ] Current page location should update when navigating

#### Activity Feed
- [ ] In Window 1: Add a new inventory item
- [ ] In Window 2: Verify activity appears in "Recent Activity"
- [ ] In Window 1: Edit an item
- [ ] In Window 2: Verify edit activity appears
- [ ] Check timestamps are accurate

#### Presence Updates
- [ ] Wait 30 seconds - verify presence still shows
- [ ] Close one window - verify user disappears after 5 minutes
- [ ] Navigate to different pages - verify "current page" updates

## 2. Advanced Analytics Testing

### Setup
1. Log in to your account
2. Navigate to **Reports → Advanced Analytics**
3. Ensure you have some inventory items created

### Test Cases

#### Portfolio Metrics
- [ ] Verify "Total Value" matches sum of all purchase prices
- [ ] Verify "Total Items" matches inventory count
- [ ] Verify "Avg Value" = Total Value / Total Items
- [ ] Check "Categories" count is accurate

#### Category Breakdown
- [ ] Click "Categories" tab
- [ ] Verify all categories are listed
- [ ] Check item counts are correct for each category
- [ ] Verify value calculations are accurate
- [ ] Confirm progress bars reflect percentages correctly

#### Manufacturer Analysis
- [ ] Click "Manufacturers" tab
- [ ] Verify top 5 manufacturers are listed
- [ ] Check item counts are accurate
- [ ] Verify sorting (highest count first)

#### Real-time Updates
- [ ] Keep analytics page open
- [ ] In another tab: Add a new inventory item
- [ ] Return to analytics - verify metrics updated automatically
- [ ] Delete an item - verify analytics refresh
- [ ] Edit item price - verify total value updates

## 3. PWA Features Testing

### Desktop Testing

#### Install Prompt
- [ ] Open app in Chrome/Edge
- [ ] Interact with app (click 3+ times)
- [ ] Wait 2 seconds for install prompt
- [ ] Click "Install App" button
- [ ] Verify app installs to desktop/taskbar
- [ ] Launch installed app - verify it opens in standalone window

#### Offline Mode (Desktop)
- [ ] With app installed, open it
- [ ] Turn off internet connection
- [ ] Navigate through app - verify pages load from cache
- [ ] Try to add item - verify it queues for sync
- [ ] Turn internet back on - verify sync occurs

### Mobile Testing (iOS)

#### Install on iOS
- [ ] Open app in Safari on iPhone/iPad
- [ ] Look for install prompt mentioning Share button
- [ ] Tap Share button (square with arrow)
- [ ] Tap "Add to Home Screen"
- [ ] Verify app icon appears on home screen
- [ ] Launch from home screen - verify full-screen experience

#### Offline Mode (iOS)
- [ ] Enable Airplane Mode
- [ ] Open app from home screen
- [ ] Verify app loads and functions
- [ ] Navigate between pages
- [ ] Try to add/edit items
- [ ] Disable Airplane Mode - verify sync

### Mobile Testing (Android)

#### Install on Android
- [ ] Open app in Chrome on Android
- [ ] Wait for install banner to appear
- [ ] Tap "Install" button
- [ ] Verify app installs
- [ ] Find app in app drawer
- [ ] Launch app - verify standalone mode

#### Push Notifications
- [ ] Navigate to Mobile → PWA section
- [ ] Tap "Enable" under Push Notifications
- [ ] Grant notification permission
- [ ] Verify test notification appears
- [ ] Check notification settings in app

## 4. Integration Testing

### Cross-Feature Testing
- [ ] Add item while analytics page open - verify real-time update
- [ ] Have two users collaborate - verify both see analytics update
- [ ] Test offline mode with collaboration features
- [ ] Verify PWA works with all features when installed

### Performance Testing
- [ ] Load analytics with 100+ items - verify performance
- [ ] Have 5+ users active - verify presence tracking
- [ ] Test real-time updates with rapid changes
- [ ] Check memory usage over extended session

## 5. Database Schema Verification

### New Schema Compatibility
- [ ] Add items in all 11 categories
- [ ] Verify analytics shows all categories
- [ ] Check category-specific fields save correctly
- [ ] Verify foreign key relationships work
- [ ] Test cascade deletes (delete item with details)

### Migration Verification
- [ ] Run database diagnostic tool
- [ ] Verify no old tables remain (firearms, optics, etc.)
- [ ] Check all data migrated to inventory table
- [ ] Verify detail tables populated correctly
- [ ] Test reference data integrity

## Common Issues and Solutions

### Real-time Not Updating
- Check browser console for subscription errors
- Verify Supabase real-time is enabled for tables
- Clear browser cache and reload
- Check RLS policies allow real-time access

### Analytics Not Loading
- Verify inventory table has data
- Check user_id matches logged-in user
- Look for console errors
- Verify purchase_price field exists on items

### PWA Install Not Showing
- Ensure HTTPS connection (required for PWA)
- Check manifest.json is accessible
- Verify service worker registered
- Try different browser (Chrome/Edge recommended)

### Offline Mode Not Working
- Check service worker is active (DevTools → Application → Service Workers)
- Verify cache is populated
- Clear cache and reload to re-register service worker
- Check for service worker errors in console

## Success Criteria

### Real-time Collaboration ✅
- Multiple users can see each other's presence
- Activity updates appear within 2 seconds
- No memory leaks after extended use
- Presence updates every 30 seconds

### Advanced Analytics ✅
- All metrics calculate correctly
- Real-time updates work automatically
- Performance acceptable with 1000+ items
- Visual elements render properly

### PWA Features ✅
- App installs on all platforms
- Offline mode works reliably
- Notifications can be enabled
- App feels native when installed

## Reporting Issues

When reporting issues, please include:
1. Browser/device information
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (if any)
5. Screenshots/screen recordings

## Next Steps After Testing

Once testing is complete:
1. Document any bugs found
2. Verify all critical paths work
3. Test with real user data
4. Perform load testing with multiple users
5. Validate on different devices/browsers
