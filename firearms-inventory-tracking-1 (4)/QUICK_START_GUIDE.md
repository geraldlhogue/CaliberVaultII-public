# CaliberVault Quick Start Guide

## 🚀 Getting Started

### First Time Setup
1. **Sign Up**: Create account with email/password
2. **Seed Reference Data**: Go to Database screen → "Seed Reference Data" button
3. **Add First Item**: Click "+" button on dashboard

## 📱 Main Features

### Adding Inventory
1. **Manual Entry**: Click "+" → Fill form → Save
2. **Barcode Scan**: Click barcode icon → Scan UPC → Auto-fill data
3. **Batch Barcode Scan**: Scan multiple UPCs at once (NEW!)
4. **CSV Import**: Menu → Import → Upload CSV file


### Viewing Inventory
- **Dashboard**: See all items with stats
- **Filters**: Category, manufacturer, location, caliber
- **Search**: Type to find items instantly
- **Sort**: By name, date, value, quantity

### Editing Items
1. Click item card
2. Click "Edit" button
3. Modify fields
4. Save changes

### Categories
- **Firearms**: Rifles, pistols, shotguns
- **Ammunition**: Bullets, cartridges, rounds
- **Optics**: Scopes, red dots, magnifiers
- **Suppressors**: Silencers and muzzle devices

## 🔧 Database Tools

### Viewing Database (NEW!)
1. Navigate to **Database** screen
2. **Sync Status Dashboard**: Monitor offline queue
   - See pending/completed/failed operations
   - Sync manually or wait for auto-sync
   - Check online/offline status
3. **Database Health**: Check connection status
4. **Simple Database Viewer**: Query raw data
   - Select table from dropdown
   - Click "Load Data"
   - View all records in table
   - Refresh to see latest data

### Testing Data Persistence
1. Add item (e.g., ammunition)
2. Wait for "Saved to cloud" toast
3. Go to Database screen
4. Select "bullets" table
5. Click "Load Data"
6. Verify your item appears

### Console Logging
**Chrome/Edge**:
- Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- Click "Console" tab
- Look for prefixed logs: [InventoryService], [StorageService], etc.

**Firefox**:
- Press F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)
- Click "Console" tab

**Safari**:
- Enable Developer menu: Preferences → Advanced → Show Develop menu
- Develop → Show Web Inspector → Console

**Mobile (Chrome)**:
- Connect device via USB
- Desktop Chrome → chrome://inspect
- Click "Inspect" under your device

## 🔄 Offline Mode (Phase 3)

### How It Works
- **Auto-Detection**: App detects when offline
- **Queue Operations**: Changes saved locally
- **Auto-Sync**: Syncs when back online
- **Conflict Resolution**: Handles data conflicts

### Testing Offline Mode
1. **Go Offline**:
   - DevTools → Network → Select "Offline"
   - OR enable Airplane Mode
2. **Make Changes**: Add/edit/delete items
3. **Check Queue**: Database screen → Sync Status Dashboard
4. **Go Online**: Disable offline mode
5. **Watch Sync**: Operations process automatically

### Sync Status Dashboard
- **Online/Offline Badge**: Current connection status
- **Pending Count**: Operations waiting to sync
- **Completed Count**: Successfully synced
- **Failed Count**: Operations that need attention
- **Progress Bar**: Real-time sync progress
- **Sync Now Button**: Manually trigger sync
- **Clear Button**: Remove completed operations

## 📊 Analytics & Reports

### Analytics Screen
- Total inventory value
- Items by category
- Top manufacturers
- Low stock alerts
- Value trends

### Reports
- Generate PDF reports
- Export to CSV
- Custom date ranges
- Filter by category

## 🏷️ Labels & Barcodes (Phase 4)

### Barcode Scanner Features
1. **Enhanced Scanner**: Auto-fill product data from UPC
2. **Batch Scanner**: Look up multiple barcodes at once
3. **Smart Caching**: Reduces API costs, faster lookups
4. **Cache Management**: View stats, import/export cache

### Using Barcode Scanner
1. Click barcode icon in Add Item modal
2. Scan product UPC/barcode
3. System checks cache first (instant)
4. If not cached, queries external APIs
5. Product data auto-fills form

### Batch Barcode Lookup
1. Open Batch Scanner modal
2. Enter multiple barcodes
3. Click "Lookup All"
4. View success/failure for each
5. Add found products to inventory

### Cache Management
1. View cache statistics
2. See most used products
3. Export cache for backup
4. Import cache on new device
5. Clear cache if needed

### Print Labels
1. Select items (or print all)
2. Click "Print Labels"
3. Choose format (QR, barcode, detailed)
4. Print or save PDF

### Scan Locations
- Assign items to storage locations
- Scan location QR codes
- Track item movements


## 🔐 Security

### Profile Picture Upload
1. Go to Profile screen
2. Click avatar
3. Select image
4. Uploads to secure storage bucket

### Data Privacy
- All data encrypted in transit
- Row-level security (RLS) enabled
- Only you can see your inventory
- Secure cloud backups

## 🐛 Troubleshooting

### Item Not Saving
1. Check console for errors (F12)
2. Verify internet connection
3. Check Database Health on Database screen
4. Try logging out and back in

### Storage Bucket Errors
- Fixed in Phase 1 ✅
- All buckets created automatically
- If issues persist, contact support

### Offline Sync Issues
1. Check Sync Status Dashboard
2. Look for failed operations
3. Check console for [SyncService] logs
4. Try manual sync button
5. Clear queue and retry if needed

### Can't See Data
1. Go to Database screen
2. Use Simple Database Viewer
3. Select correct table for your category:
   - Firearms → "firearms" table
   - Ammunition → "bullets" table
   - Optics → "optics" table
   - Suppressors → "suppressors" table
4. If empty, data wasn't saved (check console)

### Barcode Scanner Issues
1. Check API usage in Cache Management
2. If limit reached, use cached items only
3. Cache expires after 30 days
4. Export/import cache to share between devices
5. Check console for [BarcodeService] logs

## 📚 Documentation

- **PHASE_1_CRITICAL_FIXES.md**: Infrastructure fixes
- **PHASE_2_REFACTORING_COMPLETE.md**: Service architecture
- **PHASE_3_OFFLINE_FIRST_COMPLETE.md**: Offline functionality
- **PHASE_4_BARCODE_ENHANCEMENT_COMPLETE.md**: Barcode scanner system
- **EMERGENCY_FIXES_APPLIED.md**: Latest bug fixes
- **USER_GUIDE.md**: Detailed user documentation


## 🎯 Pro Tips

1. **Seed Reference Data First**: Populates manufacturers, calibers, etc.
2. **Use Barcode Scanner**: Faster data entry with auto-fill
3. **Leverage Cache**: Scan same items instantly after first lookup
4. **Batch Operations**: Select multiple items for bulk actions
5. **Regular Backups**: Export CSV and barcode cache periodically
6. **Check Sync Status**: Monitor offline queue regularly
7. **Console Logging**: Keep DevTools open when testing
8. **Database Viewer**: Verify data persistence after saves
9. **Export Barcode Cache**: Share cache between devices


## 🆘 Getting Help

1. Check console logs (F12)
2. Review error messages
3. Check Database Health
4. View Sync Status Dashboard
5. Consult documentation files
6. Check GitHub issues

---


**Version**: 4.0.0 (Phase 4 Complete - Enhanced Barcode Scanner)
**Last Updated**: October 26, 2025

