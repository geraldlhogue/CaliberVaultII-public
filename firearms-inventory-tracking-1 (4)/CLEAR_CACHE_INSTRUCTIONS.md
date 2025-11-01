# How to Clear Cache and Force App Update

## 🚨 Quick Fix for "Something Went Wrong" Error

If you're getting errors on your iPhone or the app shows the old "ArsenalVault" name, follow these steps:

---

## 📱 iPhone/iPad Instructions

### Method 1: Delete and Reinstall (RECOMMENDED - 2 minutes)

1. **Delete the app**:
   - Long press the CaliberVault/ArsenalVault icon on your home screen
   - Tap "Remove App"
   - Tap "Delete App"

2. **Clear Safari cache**:
   - Open Settings app
   - Scroll down to "Safari"
   - Tap "Clear History and Website Data"
   - Tap "Clear History and Data" to confirm

3. **Reinstall**:
   - Open Safari (must be Safari, not Chrome)
   - Go to: `https://insightful-apps.com`
   - Tap the Share button (square with up arrow)
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add"

4. **Done!** Open the new app and sign in.

---

### Method 2: Clear Just This Site (Faster but less reliable)

1. **Open Settings** → **Safari** → **Advanced** → **Website Data**
2. **Search** for "insightful-apps" or your domain
3. **Swipe left** on the entry and tap "Delete"
4. **Close** the CaliberVault app completely (swipe up from app switcher)
5. **Reopen** the app

---

## 💻 Desktop/Laptop Instructions

### Chrome
1. Open CaliberVault
2. Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. This does a "hard refresh" bypassing cache

### Safari
1. Open CaliberVault
2. Hold **Shift** and click the refresh button
3. Or: Safari → Preferences → Privacy → Manage Website Data → Remove All

### Firefox
1. Open CaliberVault
2. Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

---

## 🔍 How to Verify It Worked

After clearing cache, check:

✅ **App name** shows "CaliberVault" (not ArsenalVault)
✅ **Title bar** says "CaliberVault - Firearm Inventory Management"
✅ **Login screen** says "Sign In to CaliberVault"
✅ **No errors** when opening the app
✅ **Can sign in** successfully

---

## ❓ Why Do I Need to Do This?

PWAs (Progressive Web Apps) cache aggressively for offline use. When we:
- Fix bugs in the service worker
- Change the app name
- Update features

...the old cached version can persist. Clearing the cache forces your device to download the latest version.

---

## 🆘 Still Having Issues?

### Error: "Something went wrong"
- **Cause**: Old service worker with bugs
- **Fix**: Delete app, clear Safari cache, reinstall (Method 1 above)

### App still shows "ArsenalVault"
- **Cause**: Cached manifest.json
- **Fix**: Delete app, wait 5 minutes, reinstall

### Can't sign in
- **Cause**: Service worker or network issue
- **Fix**: Check internet connection, try Method 1 above

### Changes don't appear after publishing
- **Cause**: Multiple cache layers (browser, CDN, service worker)
- **Fix**: 
  1. Wait 5 minutes for CDN cache to clear
  2. Hard refresh on desktop (Ctrl+Shift+R)
  3. Delete and reinstall on iPhone

---

## 📞 Quick Reference

**Production URL**: `https://insightful-apps.com`

**Current Version**: v2.1.0-CALIBERVAULT-OCT25

**App Name**: CaliberVault

---

**Pro Tip**: Bookmark this page! You may need it after future updates.

---

**Last Updated**: October 25, 2025
