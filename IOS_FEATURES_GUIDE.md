# iOS PWA Features Guide

## Overview
Arsenal Command now includes comprehensive iOS-specific PWA features for a native app-like experience.

## Features Implemented

### 1. Haptic Feedback
**Location**: `src/hooks/useHapticFeedback.ts`

Provides tactile feedback for user interactions:
- **Light**: Quick tap (10ms)
- **Medium**: Standard button press (20ms)
- **Heavy**: Important action (30ms)
- **Success**: Double pulse pattern
- **Warning**: Alert pattern
- **Error**: Triple pulse pattern

**Usage**:
```typescript
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const { trigger } = useHapticFeedback();

// In your component
<Button onClick={() => {
  trigger('medium');
  handleAction();
}}>
  Click Me
</Button>
```

### 2. Pull to Refresh
**Location**: `src/components/mobile/IOSPullToRefresh.tsx`

iOS-style pull-to-refresh with smooth animations and haptic feedback.

**Usage**:
```typescript
import { IOSPullToRefresh } from '@/components/mobile/IOSPullToRefresh';

<IOSPullToRefresh onRefresh={async () => {
  await refetchData();
}}>
  <YourContent />
</IOSPullToRefresh>
```

### 3. Safe Area Support
**Location**: `src/components/mobile/IOSSafeArea.tsx`

Automatically handles iPhone notches and home indicators.

**Usage**:
```typescript
import { IOSSafeArea } from '@/components/mobile/IOSSafeArea';

<IOSSafeArea>
  <Header />
  <Content />
</IOSSafeArea>
```

### 4. Share Sheet Integration
**Location**: `src/lib/iosShare.ts`

Native iOS share sheet for exporting reports and data.

**Usage**:
```typescript
import { shareInventoryReport, shareContent } from '@/lib/iosShare';

// Share a file
await shareInventoryReport(pdfBlob, 'inventory-report.pdf');

// Share text/URL
await shareContent({
  title: 'Check out Arsenal Command',
  text: 'Manage your firearms inventory',
  url: 'https://yourapp.com'
});
```

## Error Reporting & Monitoring

### Sentry Integration
**Location**: `src/lib/sentry.ts`

Production-ready error tracking with:
- Automatic error capture
- Performance monitoring
- Session replay
- User context tracking

**Setup**:
1. Get Sentry DSN from https://sentry.io
2. Add to `.env`:
   ```
   VITE_SENTRY_DSN=your_dsn_here
   ```

**Manual Error Reporting**:
```typescript
import { reportError, addBreadcrumb } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  reportError(error, { context: 'additional info' });
}

// Add debugging breadcrumbs
addBreadcrumb('User clicked export', 'user-action');
```

### User Feedback Widget
**Location**: `src/components/errors/ErrorReportingWidget.tsx`

Allows users to report bugs directly from the app.

**Usage**:
```typescript
import { ErrorReportingWidget } from '@/components/errors/ErrorReportingWidget';

<ErrorReportingWidget />
```

## Offline Sync Enhancements

### Sync Status Dashboard
**Location**: `src/components/sync/SyncStatusDashboard.tsx`

Shows:
- Online/offline status
- Pending changes count
- Conflict count
- Last sync timestamp
- Manual sync trigger

### Conflict Resolution
**Location**: `src/components/sync/ConflictResolutionModal.tsx`

UI for resolving data conflicts when offline changes conflict with server data.

**Features**:
- Side-by-side comparison
- Choose local or server version
- Automatic merge option

## Testing on iOS

### 1. Add to Home Screen
1. Open Safari on iPhone/iPad
2. Navigate to your app
3. Tap Share button
4. Select "Add to Home Screen"
5. Open from home screen

### 2. Test Features
- **Haptic**: Tap buttons and feel vibration
- **Pull to Refresh**: Pull down on inventory list
- **Safe Area**: Check header/footer spacing on notched devices
- **Share**: Export a report and use share sheet
- **Offline**: Turn off WiFi and test sync

### 3. Debug Console
To see console logs on iOS:
1. Connect iPhone to Mac
2. Open Safari > Develop > [Your iPhone] > [Your App]
3. View console in Web Inspector

## Performance Optimization

All iOS features are optimized for:
- **Battery efficiency**: Minimal background processing
- **Smooth animations**: 60fps with requestAnimationFrame
- **Memory management**: Proper cleanup in useEffect
- **Touch responsiveness**: Passive event listeners where possible

## Browser Compatibility

| Feature | iOS Safari | iOS Chrome | iOS Firefox |
|---------|-----------|-----------|-------------|
| Haptic Feedback | ✅ | ✅ | ✅ |
| Pull to Refresh | ✅ | ✅ | ✅ |
| Safe Area | ✅ | ✅ | ✅ |
| Share Sheet | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ❌ | ❌ |

**Note**: Only Safari supports "Add to Home Screen" on iOS.

## Troubleshooting

### Haptic Not Working
- Check device settings: Settings > Sounds & Haptics
- Ensure device is not in silent mode
- Test on physical device (not simulator)

### Pull to Refresh Not Triggering
- Ensure scroll position is at top
- Check touch events are not being prevented
- Verify threshold is appropriate for device

### Share Sheet Not Appearing
- Check Web Share API support
- Verify file size is reasonable
- Ensure proper MIME types

### Safe Area Not Applied
- Check viewport meta tag includes `viewport-fit=cover`
- Verify CSS environment variables are supported
- Test on device with notch

## Next Steps

Consider adding:
- iOS keyboard toolbar for form navigation
- Camera access for barcode scanning
- Background sync for offline changes
- Push notifications (requires service worker)
- App shortcuts for quick actions
