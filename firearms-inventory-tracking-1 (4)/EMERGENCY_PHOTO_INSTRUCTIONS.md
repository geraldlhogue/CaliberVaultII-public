# 📱 iPhone App Update Instructions - CaliberVault

## 🚨 CRITICAL: How to Get Updated Code on Your iPhone

When you publish code changes to CaliberVault, your iPhone's PWA (Progressive Web App) may continue using the old cached version. Follow these steps to force an update:

---

## Method 1: Clear Safari Cache (RECOMMENDED)

### Step 1: Clear Safari Website Data
1. Open **Settings** app on iPhone
2. Scroll down and tap **Safari**
3. Scroll down and tap **Clear History and Website Data**
4. Tap **Clear History and Data** to confirm
5. ⚠️ This will sign you out of all websites

### Step 2: Delete Old App Icon
1. Find the **CaliberVault** icon on your home screen
2. Long-press the icon until it jiggles
3. Tap the **X** or **Remove App**
4. Confirm deletion

### Step 3: Reinstall the App
1. Open **Safari** browser
2. Go to: `https://insightful-apps.com`
3. Tap the **Share** button (square with arrow pointing up)
4. Scroll down and tap **Add to Home Screen**
5. Tap **Add** in the top right
6. The new icon will appear on your home screen

### Step 4: Launch and Test
1. Tap the new CaliberVault icon
2. Sign in with your credentials
3. Test the "Add Item" button - it should now work!

---

## Method 2: Force Refresh in Safari

### If you don't want to delete the app:
1. Open **Safari** on iPhone
2. Go to: `https://insightful-apps.com`
3. Pull down on the page to refresh
4. Tap and hold the **refresh button** (circular arrow)
5. Tap **Request Desktop Website**
6. Wait for page to load
7. Tap and hold refresh again
8. Tap **Request Mobile Website**
9. Now try using the app - cache should be cleared

---

## Method 3: Hard Refresh (Advanced)

### For stubborn cache issues:
1. Open **Settings** → **Safari**
2. Tap **Advanced**
3. Tap **Website Data**
4. Search for "insightful-apps"
5. Swipe left on the entry
6. Tap **Delete**
7. Go back and reopen Safari
8. Visit `https://insightful-apps.com`

---

## 🔍 How to Verify You Have the Latest Version

### Check Service Worker Version
1. Open CaliberVault in Safari
2. Open browser console (if using desktop Safari with iPhone simulator)
3. Look for cache version in console logs
4. Should see: `v2.1.0-CALIBERVAULT-OCT25` or newer

### Test Core Functionality
1. **Add Item Test**:
   - Tap "Add Item" button
   - Fill in Manufacturer and Model
   - Tap "Add Item" at bottom
   - ✅ Should save successfully and close modal
   - ❌ If nothing happens, cache is still old

2. **Edit Item Test**:
   - Tap any inventory item
   - Tap "Edit" button
   - Change any field
   - Tap "Update Item"
   - ✅ Should save successfully
   - ❌ If nothing happens, cache is still old

### Check Branding
- App name should be **CaliberVault** (not ArsenalVault)
- Title bar should say "CaliberVault"
- Icon should show "CV" or CaliberVault branding

---

## ⚠️ Common Issues and Solutions

### Issue: "Something went wrong" error
**Cause**: Service worker cache corruption
**Solution**: Follow Method 1 (Clear Safari Cache) completely

### Issue: App still shows old name "ArsenalVault"
**Cause**: Manifest cache not updated
**Solution**: 
1. Delete app icon from home screen
2. Clear Safari cache
3. Reinstall from Safari

### Issue: Add Item button does nothing
**Cause**: Old JavaScript cached
**Solution**:
1. Force quit Safari (swipe up from app switcher)
2. Clear Safari cache
3. Reopen and reinstall app

### Issue: Changes not appearing after publish
**Cause**: Service worker serving stale cache
**Solution**:
1. Wait 5 minutes after publishing
2. Clear Safari cache
3. Hard refresh the page
4. Reinstall app icon

---

## 📝 Developer Notes

### Cache Strategy
CaliberVault uses a service worker with cache-first strategy for performance. This means:
- Assets are cached aggressively for offline use
- Updates require cache invalidation
- Service worker version must be incremented for updates

### Current Cache Version
- **Version**: v2.1.0-CALIBERVAULT-OCT25
- **Updated**: October 25, 2025
- **Changes**: Fixed critical add/edit bugs, updated branding

### When to Clear Cache
Clear cache after:
- Publishing code changes
- Updating service worker
- Changing manifest.json
- Fixing critical bugs
- Updating app name/branding

---

## 🎯 Quick Reference

**After every code publish:**
1. ✅ Clear Safari cache
2. ✅ Delete app icon
3. ✅ Reinstall from Safari
4. ✅ Test add/edit functionality

**Expected behavior:**
- ✅ App name: CaliberVault
- ✅ Add Item: Works immediately
- ✅ Edit Item: Saves changes
- ✅ No "Something went wrong" errors

---

## 📞 Still Having Issues?

If you've followed all steps and still experiencing problems:

1. **Check publish status**: Verify code is actually deployed to insightful-apps.com
2. **Check browser console**: Look for JavaScript errors
3. **Try different browser**: Test in Chrome or Firefox on desktop
4. **Check network**: Ensure stable internet connection
5. **Wait and retry**: Sometimes CDN takes 5-10 minutes to propagate

---

## ✅ Success Checklist

- [ ] Published latest code to insightful-apps.com
- [ ] Cleared Safari cache on iPhone
- [ ] Deleted old CaliberVault app icon
- [ ] Reinstalled app from Safari
- [ ] App shows "CaliberVault" name
- [ ] Add Item button works
- [ ] Edit Item button works
- [ ] No "Something went wrong" errors

If all boxes are checked, you're running the latest version! 🎉
