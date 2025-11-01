# Comprehensive Inventory Testing Plan

## ✅ Pre-Test Setup
- [ ] Ensure you're logged in to the application
- [ ] Clear browser console to track any errors
- [ ] Have test data ready (manufacturer names, calibers, locations)

---

## 🔫 FIREARMS TESTING

### Add Firearm
- [ ] Click "Add Item" button
- [ ] Select category: "Firearms"
- [ ] Fill required fields:
  - Name: "Test Glock 19"
  - Manufacturer: Select from dropdown
  - Storage Location: Select from dropdown
  - Purchase Price: 599.99
- [ ] Fill optional fields:
  - Caliber: Select from dropdown
  - Action: Select from dropdown
  - Barrel Length: 4.02
  - Serial Number: "TEST123"
  - Model: "Gen 5"
- [ ] Click "Save"
- [ ] Verify success toast appears
- [ ] Verify firearm appears in inventory list

### Edit Firearm
- [ ] Click on the firearm card
- [ ] Click "Edit" button
- [ ] Change name to "Updated Glock 19"
- [ ] Change purchase price to 649.99
- [ ] Click "Save"
- [ ] Verify success toast
- [ ] Verify changes reflected in card

### Delete Firearm
- [ ] Click on firearm card
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Verify success toast
- [ ] Verify firearm removed from list

---

## 🔭 OPTICS TESTING

### Add Optic
- [ ] Click "Add Item"
- [ ] Select category: "Optics"
- [ ] Fill required fields:
  - Name: "Test Vortex Scope"
  - Manufacturer: Select
  - Storage Location: Select
  - Purchase Price: 299.99
- [ ] Fill optic-specific fields:
  - Optic Type: Select
  - Magnification: Select
  - Objective Lens: 44
  - Reticle Type: Select
  - Turret Type: Select
- [ ] Click "Save"
- [ ] Verify success toast
- [ ] Verify optic appears in inventory

### Edit Optic
- [ ] Open optic details
- [ ] Click "Edit"
- [ ] Change magnification
- [ ] Change objective lens to 50
- [ ] Save changes
- [ ] Verify updates appear

### Delete Optic
- [ ] Open optic details
- [ ] Delete item
- [ ] Confirm deletion
- [ ] Verify removal

---

## 🎯 AMMUNITION TESTING

### Add Ammunition
- [ ] Click "Add Item"
- [ ] Select category: "Ammunition"
- [ ] Fill required fields:
  - Name: "Test 9mm Ammo"
  - Manufacturer: Select
  - Storage Location: Select
  - Purchase Price: 19.99
- [ ] Fill ammo-specific fields:
  - Caliber: Select
  - Bullet Type: "FMJ"
  - Grain Weight: 115
  - Round Count: 50
  - Lot Number: "LOT2024"
- [ ] Click "Save"
- [ ] Verify success toast
- [ ] Verify ammo in inventory

### Edit Ammunition
- [ ] Open ammo details
- [ ] Edit round count (subtract 10)
- [ ] Save changes
- [ ] Verify round count updated

### Delete Ammunition
- [ ] Open ammo details
- [ ] Delete item
- [ ] Confirm
- [ ] Verify removal

---

## 🔇 SUPPRESSOR TESTING

### Add Suppressor
- [ ] Click "Add Item"
- [ ] Select category: "Suppressors"
- [ ] Fill required fields:
  - Name: "Test Suppressor"
  - Manufacturer: Select
  - Storage Location: Select
  - Purchase Price: 899.99
- [ ] Fill suppressor fields:
  - Caliber: Select
  - Mounting Type: "Direct Thread"
  - Thread Pitch: "1/2x28"
  - Length: 7.5
  - Weight: 12
  - Material: "Titanium"
- [ ] Toggle "Full Auto Rated"
- [ ] Click "Save"
- [ ] Verify success
- [ ] Verify in inventory

### Edit Suppressor
- [ ] Open suppressor
- [ ] Edit material
- [ ] Toggle modular option
- [ ] Save
- [ ] Verify updates

### Delete Suppressor
- [ ] Delete suppressor
- [ ] Confirm
- [ ] Verify removal

---

## 🔍 FILTERING & SEARCH TESTING

### Category Filter
- [ ] Add items in multiple categories
- [ ] Click "Firearms" filter
- [ ] Verify only firearms shown
- [ ] Click "Optics" filter
- [ ] Verify only optics shown
- [ ] Click "All" to clear filter

### Search Functionality
- [ ] Enter item name in search
- [ ] Verify filtered results
- [ ] Clear search
- [ ] Verify all items return

### Advanced Filters
- [ ] Open filter panel
- [ ] Filter by manufacturer
- [ ] Verify results
- [ ] Filter by caliber
- [ ] Verify results
- [ ] Filter by location
- [ ] Verify results
- [ ] Clear all filters

---

## 📦 BULK OPERATIONS TESTING

### Bulk Selection
- [ ] Select multiple items (checkboxes)
- [ ] Verify selection toolbar appears
- [ ] Verify item count correct

### Bulk Delete
- [ ] Select 3+ items
- [ ] Click "Delete Selected"
- [ ] Confirm deletion
- [ ] Verify all items removed
- [ ] Verify success toast

### Bulk Edit
- [ ] Select multiple items
- [ ] Click "Bulk Edit"
- [ ] Change storage location
- [ ] Apply changes
- [ ] Verify all items updated

### Bulk Export
- [ ] Select items
- [ ] Click "Export"
- [ ] Verify CSV download
- [ ] Open CSV and verify data

---

## 🔄 REAL-TIME SYNC TESTING

### Multi-Tab Sync
- [ ] Open app in two browser tabs
- [ ] Add item in Tab 1
- [ ] Verify item appears in Tab 2
- [ ] Edit item in Tab 2
- [ ] Verify update in Tab 1
- [ ] Delete item in Tab 1
- [ ] Verify removal in Tab 2

---

## 📊 STATISTICS TESTING

### Inventory Stats
- [ ] Add items with different prices
- [ ] Verify total value calculation
- [ ] Verify item count by category
- [ ] Check most valuable items display

---

## 🚨 ERROR HANDLING TESTING

### Duplicate Serial Number
- [ ] Add firearm with serial "DUPLICATE123"
- [ ] Try adding another with same serial
- [ ] Verify error message appears
- [ ] Verify item not added

### Missing Required Fields
- [ ] Try saving item without name
- [ ] Verify validation error
- [ ] Try saving without manufacturer
- [ ] Verify validation error
- [ ] Try saving without location
- [ ] Verify validation error

### Invalid Data
- [ ] Enter negative price
- [ ] Verify validation
- [ ] Enter text in numeric field
- [ ] Verify validation

---

## 📱 OFFLINE MODE TESTING

### Offline Add
- [ ] Disconnect internet
- [ ] Add new item
- [ ] Verify "Saved Offline" toast
- [ ] Reconnect internet
- [ ] Verify item syncs to cloud

### Offline Edit
- [ ] Go offline
- [ ] Edit existing item
- [ ] Verify offline save
- [ ] Go online
- [ ] Verify sync

### Offline Delete
- [ ] Go offline
- [ ] Delete item
- [ ] Go online
- [ ] Verify deletion syncs

---

## 🎯 PERFORMANCE TESTING

### Large Dataset
- [ ] Import 50+ items via CSV
- [ ] Verify load time acceptable
- [ ] Test scrolling performance
- [ ] Test filter performance
- [ ] Test search speed

---

## ✅ TEST RESULTS SUMMARY

### Firearms: ___/3 tests passed
### Optics: ___/3 tests passed
### Ammunition: ___/3 tests passed
### Suppressors: ___/3 tests passed
### Filtering: ___/3 tests passed
### Bulk Operations: ___/4 tests passed
### Real-time Sync: ___/1 test passed
### Error Handling: ___/3 tests passed
### Offline Mode: ___/3 tests passed

**Total: ___/26 test categories passed**

---

## 🐛 BUGS FOUND

| Bug # | Feature | Description | Severity | Status |
|-------|---------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 📝 NOTES

- Record any unexpected behavior
- Note performance issues
- Document UI/UX concerns
- Track browser console errors
