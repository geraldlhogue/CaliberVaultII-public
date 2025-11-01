# iOS Debugging & Troubleshooting Guide

## Recent Fixes Applied

### 1. Service Worker postMessage Error ✅ FIXED
**Issue**: `Failed to execute 'postMessage' on 'Window': ServiceWorkerRegistration object could not be cloned`

**Root Cause**: Attempting to log the entire ServiceWorkerRegistration object which is not serializable.

**Fix**: Modified `src/main.tsx` to only log serializable properties:
```typescript
console.log('SW registered successfully', {
  scope: registration.scope,
  active: !!registration.active,
  installing: !!registration.installing,
  waiting: !!registration.waiting
});
```

### 2. iOS App Crash on Launch ✅ FIXED
**Issue**: App fails to initialize on iPhone PWA

**Fixes Applied**:
1. **SafeAppProvider** (`src/contexts/AppContextSafe.tsx`): Wraps AppContext with error boundary
2. **Non-blocking initialization**: Made fetchReferenceData and fetchCloudInventory failures non-fatal
3. **Comprehensive error handling**: Try-catch blocks around all async operations in AppContext

### 3. Migration Duplicate Key Error ✅ FIXED
**Issue**: `duplicate key value violates unique constraint "schema_migrations_pkey"`

**Fix**: Modified `src/components/database/MigrationExecutor.tsx` to use UPSERT instead of INSERT:
```typescript
await supabase
  .from('schema_migrations')
  .upsert(
    { id: migration.id, name: migration.name },
    { onConflict: 'id', ignoreDuplicates: true }
  );
```

### 4. Setup Prompt Appearing with Existing Data ✅ FIXED
**Issue**: Database setup wizard shows even when data exists

**Fix**: Modified `src/components/database/DatabaseStatusIndicator.tsx` to only check for actual missing tables (error code 42P01), not empty tables.

## iOS Debugging Steps

### 1. Enable Web Inspector
1. On iPhone: Settings > Safari > Advanced > Enable "Web Inspector"
2. On Mac: Safari > Preferences > Advanced > Show Develop menu
3. Connect iPhone to Mac via USB
4. Open app on iPhone
5. Mac Safari > Develop > [Your iPhone] > [Your App]

### 2. View Console Logs
All errors are logged with context:
- User agent
- Timestamp
- Stack trace
- Device information

### 3. Check Service Worker Status
In Web Inspector Console:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW Status:', {
    active: reg.active?.state,
    installing: reg.installing?.state,
    waiting: reg.waiting?.state
  });
});
```

### 4. Test Offline Functionality
1. Enable Airplane Mode
2. Try to use app
3. Check IndexedDB for cached data
4. Verify offline queue is working

### 5. Monitor Performance
```javascript
// Check memory usage
performance.memory

// Check long tasks
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Long task:', entry.duration);
  }
}).observe({entryTypes: ['longtask']});
```

## Common iOS Issues

### App Won't Install
- **Solution**: Must use Safari (not Chrome/Firefox)
- Check manifest.json is valid
- Ensure HTTPS (or localhost)
- Verify icons are correct size

### White Screen on Launch
- **Check**: Console for JavaScript errors
- **Verify**: All dependencies are loaded
- **Test**: Clear cache and reload
- **Fix**: Check SafeAppProvider error boundary

### Slow Performance
- **Reduce**: Number of re-renders
- **Optimize**: Large lists with virtualization
- **Check**: Network waterfall in Web Inspector
- **Monitor**: Memory leaks

### Touch Events Not Working
- **Ensure**: No `pointer-events: none` CSS
- **Check**: z-index stacking
- **Verify**: Touch target size (min 44x44px)
- **Test**: Event listeners are attached

### Camera/Scanner Issues
- **Permissions**: Check Settings > Safari > Camera
- **HTTPS**: Required for camera access
- **Test**: On physical device (not simulator)

## Files Modified for iOS Fixes

1. **src/main.tsx**
   - Fixed SW registration logging
   - Added Sentry initialization
   - Enhanced error handlers

2. **src/contexts/AppContextSafe.tsx**
   - Error boundary wrapper
   - Graceful failure handling

3. **src/contexts/AppContext.tsx**
   - Non-blocking initialization
   - Try-catch around async operations

4. **src/components/database/MigrationExecutor.tsx**
   - UPSERT for migrations
   - Duplicate key handling

5. **src/components/database/DatabaseStatusIndicator.tsx**
   - Fixed table existence check
   - Only show setup for missing tables

## Monitoring and Debugging

### Sentry Integration
Set up Sentry for production error tracking:

1. Create account at https://sentry.io
2. Create new React project
3. Copy DSN
4. Add to `.env`:
   ```
   VITE_SENTRY_DSN=your_dsn_here
   ```

Sentry will automatically capture:
- JavaScript errors
- Unhandled promise rejections
- Performance metrics
- User session replays

### Manual Error Reporting
```typescript
import { reportError, addBreadcrumb } from '@/lib/sentry';

// Add context before error
addBreadcrumb('User action', 'navigation');

try {
  // risky operation
} catch (error) {
  reportError(error, { userId, action: 'export' });
}
```

## Testing Checklist

Before deploying to production:

- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPhone 14 Pro (notch)
- [ ] Test on iPad
- [ ] Test in Safari, Chrome, Firefox
- [ ] Test offline mode
- [ ] Test pull-to-refresh
- [ ] Test haptic feedback
- [ ] Test camera/barcode scanner
- [ ] Test share sheet
- [ ] Test safe area on notched device
- [ ] Verify no console errors
- [ ] Check memory usage
- [ ] Test with slow 3G network
- [ ] Verify PWA install works

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB (gzipped)

## Support Resources

- [iOS Safari Web Inspector](https://webkit.org/web-inspector/)
- [PWA on iOS Guide](https://web.dev/progressive-web-apps/)
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
