# Feature Location Guide - Where Everything Is

## 🗺️ HOW TO FIND ANY FEATURE IN CALIBERVAULT

---

## 🏠 MAIN NAVIGATION

### Location: `src/components/navigation/MainNavigation.tsx`
**How to access:** Always visible at the top of the app

### Features:
- **Dashboard** - Home page with overview
- **Inventory** - Main inventory management
- **Reports** - Generate reports and analytics
- **Settings** - App configuration
- **Profile** - User account settings

---

## 📦 INVENTORY MANAGEMENT

### Main Dashboard
**Location:** `src/components/inventory/InventoryDashboard.tsx`
**Access:** Click "Inventory" in main navigation

### Features Available:

#### 1. Add Item
**Button:** "Add Item" (top right)
**Component:** `src/components/inventory/AddItemModal.tsx`
**What it does:** Add new firearms, ammo, optics, suppressors

#### 2. Search & Filter
**Component:** `src/components/inventory/FilterPanel.tsx`
**Location:** Left sidebar on inventory page
**Features:**
- Search by name, serial number
- Filter by category, manufacturer
- Filter by location, condition
- Price range filter
- Date range filter

#### 3. Item Cards
**Component:** `src/components/inventory/ItemCard.tsx`
**Location:** Main grid on inventory page
**Features:**
- View item details
- Quick edit
- Quick delete
- View photos
- See valuation

#### 4. Item Details
**Component:** `src/components/inventory/ItemDetailModal.tsx`
**Access:** Click any item card
**Features:**
- Full item information
- Photo gallery
- Edit item
- Delete item
- View history
- Comments
- Maintenance records

#### 5. Edit Item
**Component:** `src/components/inventory/EditItemModal.tsx`
**Access:** Click "Edit" on item card or detail modal
**Features:**
- Update all fields
- Change photos
- Update location
- Modify attributes

#### 6. Bulk Operations
**Component:** `src/components/inventory/SelectionToolbar.tsx`
**Access:** Select multiple items (checkbox on cards)
**Features:**
- Bulk delete
- Bulk edit
- Bulk export
- Bulk move location

---

## 📸 PHOTO & IMAGE FEATURES

### Photo Capture
**Component:** `src/components/inventory/PhotoCapture.tsx`
**Access:** Inside Add/Edit item modals
**Features:**
- Take photo with camera
- Upload from gallery
- Multiple photos per item
- Photo preview

### Photo Gallery
**Component:** `src/components/inventory/PhotoGallery.tsx`
**Access:** Item detail modal
**Features:**
- View all photos
- Zoom photos
- Delete photos
- Set primary photo

### Direct Photo Upload
**Component:** `src/components/inventory/DirectPhotoUpload.tsx`
**Access:** Add/Edit modals
**Features:**
- Drag and drop upload
- Multiple file selection
- Image optimization

---

## 🔍 BARCODE & SCANNING

### Barcode Scanner
**Component:** `src/components/inventory/BarcodeScanner.tsx`
**Access:** "Scan Barcode" button in Add Item modal
**Features:**
- Scan UPC/EAN codes
- Auto-lookup product info
- Camera-based scanning

### Batch Scanner
**Component:** `src/components/inventory/BarcodeBatchScanner.tsx`
**Access:** Inventory page → "Batch Scan" button
**Features:**
- Scan multiple items
- Queue items for review
- Bulk add scanned items

### Camera UPC Scanner
**Component:** `src/components/inventory/CameraUPCScanner.tsx`
**Access:** Mobile devices in Add Item
**Features:**
- Mobile-optimized scanning
- Real-time barcode detection
- Offline barcode cache

### Barcode Generator
**Component:** `src/components/inventory/BarcodeGenerator.tsx`
**Access:** Item detail modal → "Generate Label"
**Features:**
- Generate QR codes
- Generate barcodes
- Print labels

---

## 📊 REPORTS & ANALYTICS

### Report Generator
**Component:** `src/components/inventory/ReportGenerator.tsx`
**Access:** Reports page or Inventory → "Generate Report"
**Features:**
- Inventory summary
- Valuation report
- Category breakdown
- Custom date ranges
- Export to PDF/CSV

### Analytics Dashboard
**Component:** `src/components/analytics/AnalyticsDashboard.tsx`
**Access:** Reports → "Analytics"
**Features:**
- Total value charts
- Category distribution
- Acquisition timeline
- Value trends

### Advanced Analytics
**Component:** `src/components/analytics/AdvancedAnalytics.tsx`
**Access:** Reports → "Advanced Analytics"
**Features:**
- Predictive analytics
- Market trends
- Investment analysis
- Custom metrics

---

## 💰 VALUATION & PRICING

### AI Valuation
**Component:** `src/components/valuation/AIValuationModal.tsx`
**Access:** Item detail → "Get AI Valuation"
**Features:**
- AI-powered price estimation
- Market comparison
- Condition-based pricing
- Historical value tracking

### Valuation History
**Component:** `src/components/valuation/ValuationHistory.tsx`
**Access:** Item detail → "Valuation History"
**Features:**
- View past valuations
- Price trend charts
- Market changes

### Price Alerts
**Component:** `src/components/valuation/PriceAlertManager.tsx`
**Access:** Settings → "Price Alerts"
**Features:**
- Set price thresholds
- Get notifications
- Track market changes

---

## 📥 IMPORT & EXPORT

### CSV Import
**Component:** `src/components/inventory/CSVImportModal.tsx`
**Access:** Inventory → "Import" button
**Features:**
- Upload CSV files
- Map columns
- Preview import
- Validate data

### Bulk Import
**Component:** `src/components/import/EnhancedBulkImport.tsx`
**Access:** Inventory → "Bulk Import"
**Features:**
- Import multiple formats
- Advanced mapping
- Error handling
- Progress tracking

### Export System
**Component:** `src/components/export/AdvancedExportSystem.tsx`
**Access:** Inventory → "Export" button
**Features:**
- Export to CSV
- Export to PDF
- Export to Excel
- Custom fields selection
- Photo export

### Photo Export
**Component:** `src/components/inventory/PhotoExportModal.tsx`
**Access:** Inventory → "Export Photos"
**Features:**
- Bulk photo download
- Organized by item
- ZIP file creation

---

## 🔐 AUTHENTICATION & SECURITY

### Login
**Component:** `src/components/auth/LoginPage.tsx`
**Access:** Automatic when not logged in
**Features:**
- Email/password login
- Remember me
- Password reset link

### Signup
**Component:** `src/components/auth/SignupModal.tsx`
**Access:** Login page → "Sign Up"
**Features:**
- Create new account
- Email verification
- Terms acceptance

### User Profile
**Component:** `src/components/auth/UserProfile.tsx`
**Access:** Top right avatar → "Profile"
**Features:**
- Update personal info
- Change password
- Profile photo
- Account settings

### Biometric Login
**Component:** `src/components/auth/BiometricLogin.tsx`
**Access:** Settings → "Security" → "Biometric"
**Features:**
- Face ID (iOS)
- Touch ID (iOS)
- Fingerprint (Android)

### Two-Factor Auth
**Component:** `src/components/security/TwoFactorSetup.tsx`
**Access:** Settings → "Security" → "2FA"
**Features:**
- Enable 2FA
- QR code setup
- Backup codes

---

## 📍 LOCATION MANAGEMENT

### Location Manager
**Component:** `src/components/locations/LocationManager.tsx`
**Access:** Settings → "Locations"
**Features:**
- Add storage locations
- Edit locations
- Delete locations
- Generate QR codes

### Location Check-In/Out
**Component:** `src/components/inventory/LocationCheckInOut.tsx`
**Access:** Item detail → "Change Location"
**Features:**
- Move items between locations
- Scan location QR codes
- Track movement history

### QR Code Generator
**Component:** `src/components/locations/QRCodeGenerator.tsx`
**Access:** Location Manager → "Generate QR"
**Features:**
- Create location QR codes
- Print labels
- Scan to assign location

---

## 🔄 SYNC & OFFLINE

### Offline Sync
**Component:** `src/components/sync/OfflineDataSync.tsx`
**Access:** Automatic (background)
**Features:**
- Work offline
- Auto-sync when online
- Conflict resolution
- Queue management

### Sync Status
**Component:** `src/components/sync/SyncStatusDashboard.tsx`
**Access:** Settings → "Sync Status"
**Features:**
- View sync queue
- Manual sync trigger
- Resolve conflicts
- Clear cache

### Realtime Sync
**Component:** `src/components/sync/RealtimeSync.tsx`
**Access:** Automatic (background)
**Features:**
- Live updates
- Multi-device sync
- Instant changes

---

## 👥 COLLABORATION & SHARING

### Team Management
**Component:** `src/components/collaboration/TeamManagement.tsx`
**Access:** Settings → "Team"
**Features:**
- Invite team members
- Set permissions
- Manage roles
- Remove members

### Shared Inventory
**Component:** `src/components/collaboration/SharedInventory.tsx`
**Access:** Inventory → "Shared Items"
**Features:**
- View shared items
- Collaborate on items
- Comments and notes

### Item Comments
**Component:** `src/components/collaboration/ItemComments.tsx`
**Access:** Item detail → "Comments" tab
**Features:**
- Add comments
- Reply to comments
- @mention team members
- Comment history

---

## 🔧 ADMIN & REFERENCE DATA

### Admin Dashboard
**Component:** `src/components/admin/AdminDashboard.tsx`
**Access:** Settings → "Admin" (admin users only)
**Features:**
- Manage reference data
- User management
- System settings
- Performance monitoring

### Reference Data Managers:
- **Manufacturers:** `src/components/admin/ManufacturerManager.tsx`
- **Calibers:** `src/components/admin/CaliberManager.tsx`
- **Categories:** `src/components/admin/CategoryManager.tsx`
- **Locations:** `src/components/admin/StorageLocationManager.tsx`
- **Actions:** `src/components/admin/ActionManager.tsx`

**Access:** Settings → "Admin" → Select manager

---

## 📱 MOBILE FEATURES

### Pull to Refresh
**Component:** `src/components/mobile/EnhancedPullToRefresh.tsx`
**Access:** Automatic on mobile
**Features:**
- Pull down to refresh
- Haptic feedback
- Visual indicator

### Swipe Actions
**Component:** `src/components/mobile/SwipeActionCard.tsx`
**Access:** Swipe item cards on mobile
**Features:**
- Swipe left: Delete
- Swipe right: Edit
- Custom actions

### Bottom Sheet
**Component:** `src/components/mobile/BottomSheet.tsx`
**Access:** Automatic on mobile modals
**Features:**
- Mobile-optimized modals
- Swipe to dismiss
- Smooth animations

---

## 🔔 NOTIFICATIONS & ALERTS

### Notification Center
**Component:** `src/components/notifications/NotificationCenter.tsx`
**Access:** Bell icon (top right)
**Features:**
- View all notifications
- Mark as read
- Clear notifications

### Email Notifications
**Component:** `src/components/notifications/EmailNotifications.tsx`
**Access:** Settings → "Notifications"
**Features:**
- Configure email alerts
- Stock alerts
- Price change alerts
- Team activity alerts

### Stock Alerts
**Component:** `src/components/alerts/StockAlertDashboard.tsx`
**Access:** Settings → "Alerts"
**Features:**
- Low stock warnings
- Expiration alerts
- Custom thresholds

---

## 💾 BACKUP & RECOVERY

### Backup System
**Component:** `src/components/backup/EnhancedBackupSystem.tsx`
**Access:** Settings → "Backup"
**Features:**
- Manual backup
- Automatic backups
- Schedule backups
- Backup history

### Restore
**Component:** `src/components/backup/BackupRestore.tsx`
**Access:** Settings → "Backup" → "Restore"
**Features:**
- Restore from backup
- Preview backup contents
- Selective restore

---

## 🔍 SEARCH & ADVANCED SEARCH

### Basic Search
**Component:** Search bar in FilterPanel
**Access:** Inventory page, left sidebar
**Features:**
- Search by name
- Search by serial
- Real-time results

### Advanced Search
**Component:** `src/components/search/EnhancedAdvancedSearch.tsx`
**Access:** Inventory → "Advanced Search"
**Features:**
- Boolean operators
- Multiple field search
- Saved searches
- Search history

---

## 📋 QUICK REFERENCE TABLE

| Feature | Component File | Access Path |
|---------|---------------|-------------|
| Add Item | AddItemModal.tsx | Inventory → Add Item |
| Edit Item | EditItemModal.tsx | Item card → Edit |
| Search | FilterPanel.tsx | Inventory → Left sidebar |
| Barcode Scan | BarcodeScanner.tsx | Add Item → Scan |
| Reports | ReportGenerator.tsx | Reports page |
| AI Valuation | AIValuationModal.tsx | Item detail → Valuation |
| Import CSV | CSVImportModal.tsx | Inventory → Import |
| Export | AdvancedExportSystem.tsx | Inventory → Export |
| Team | TeamManagement.tsx | Settings → Team |
| Backup | EnhancedBackupSystem.tsx | Settings → Backup |
| Locations | LocationManager.tsx | Settings → Locations |
| Admin | AdminDashboard.tsx | Settings → Admin |

---

## 🆘 CAN'T FIND A FEATURE?

1. Check main navigation tabs
2. Look in Settings menu
3. Check item detail modal (click any item)
4. Look for buttons on inventory page
5. Check this guide's table of contents
6. Search this document for keywords

---

## 📚 RELATED GUIDES

- **Testing:** See `TESTING_GUIDE.md`
- **Terminal Commands:** See `TERMINAL_COMMANDS_GUIDE.md`
- **Mobile Deployment:** See `MOBILE_DEPLOYMENT_GUIDE.md`
- **Quick Start:** See `QUICK_START_GUIDE.md`
