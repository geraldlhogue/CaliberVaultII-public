# Mobile Features Implementation Guide

## Overview

CaliberVault mobile app is built using **Capacitor**, providing native iOS and Android functionality while maintaining the React web codebase.

## Implemented Features

### 1. Native Camera Integration

**Location**: `src/services/mobile/NativeCameraService.ts`

```typescript
import { nativeCameraService } from '@/services/mobile/NativeCameraService';

// Capture photo from camera
const photo = await nativeCameraService.capturePhoto('camera');

// Capture from gallery
const photo = await nativeCameraService.capturePhoto('gallery');

// Capture and auto-upload
const url = await nativeCameraService.captureAndUpload(itemId, 'camera');
```

**Component**: `src/components/mobile/NativeCameraCapture.tsx`

```tsx
<NativeCameraCapture
  onPhotoCapture={(dataUrl) => console.log(dataUrl)}
  itemId="item-123"
  autoUpload={true}
/>
```

### 2. Biometric Authentication

**Location**: `src/services/mobile/BiometricAuthService.ts`

```typescript
import { biometricAuthService } from '@/services/mobile/BiometricAuthService';

// Check if available
const available = await biometricAuthService.isAvailable();

// Enable biometrics
await biometricAuthService.enable(userId, email);

// Authenticate
const result = await biometricAuthService.authenticate();
if (result.success) {
  // Login user
}

// Disable
await biometricAuthService.disable(userId);
```

**Supports**:
- Face ID (iOS)
- Touch ID (iOS)
- Fingerprint (Android)

### 3. Push Notifications

**Location**: `src/services/mobile/PushNotificationService.ts`

```typescript
import { pushNotificationService } from '@/services/mobile/PushNotificationService';

// Initialize (call on app start)
await pushNotificationService.initialize();

// Send local notification
await pushNotificationService.sendLocalNotification({
  title: 'Low Stock Alert',
  body: 'Item XYZ is running low',
  data: { itemId: '123' }
});

// Get device token
const token = pushNotificationService.getToken();
```

### 4. Capacitor Bridge

**Location**: `src/lib/capacitorBridge.ts`

```typescript
import { capacitorBridge } from '@/lib/capacitorBridge';

// Check if native
if (capacitorBridge.isNative()) {
  // Native-specific code
}

// Get platform
const platform = capacitorBridge.getPlatform(); // 'ios' | 'android' | 'web'

// Haptic feedback
await capacitorBridge.vibrate('medium');

// Hide keyboard
capacitorBridge.hideKeyboard();

// Status bar
await capacitorBridge.setStatusBarStyle(true); // dark mode
```

### 5. Offline-First Architecture

**Database**: `supabase/migrations/040_create_mobile_tables.sql`

**Tables**:
- `offline_sync_queue` - Queues actions when offline
- `mobile_app_sessions` - Tracks app usage
- `push_notification_tokens` - Stores device tokens

**Usage**:
```typescript
// Actions are automatically queued when offline
// and synced when connection is restored
```

### 6. File System Access

```typescript
import { capacitorBridge } from '@/lib/capacitorBridge';

// Save file
const uri = await capacitorBridge.saveFile('inventory.json', jsonData);

// Read file
const data = await capacitorBridge.readFile('inventory.json');
```

## Mobile UI Optimizations

### 1. Touch-Optimized Components
- Larger tap targets (44x44pt minimum)
- Touch feedback with haptics
- Swipe gestures
- Pull-to-refresh

### 2. Responsive Design
- Mobile-first approach
- Adaptive layouts
- Bottom sheets for mobile
- Native navigation patterns

### 3. Performance
- Lazy loading
- Image optimization
- Virtual scrolling
- Background sync

## Platform-Specific Features

### iOS Specific
- Face ID integration
- Haptic Engine
- iOS-style navigation
- Safe area handling
- Share sheet

### Android Specific
- Fingerprint authentication
- Material Design components
- Android back button handling
- Notification channels

## Testing on Devices

### iOS Testing
```bash
# Build and run on simulator
npx cap run ios

# Run on physical device
# 1. Connect iPhone via USB
# 2. Select device in Xcode
# 3. Click Run
```

### Android Testing
```bash
# Build and run on emulator
npx cap run android

# Run on physical device
# 1. Enable USB debugging
# 2. Connect via USB
# 3. Run from Android Studio
```

## Build Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "mobile:init": "npx cap init",
    "mobile:add:ios": "npx cap add ios",
    "mobile:add:android": "npx cap add android",
    "mobile:sync": "npm run build && npx cap sync",
    "mobile:ios": "npm run build && npx cap sync ios && npx cap open ios",
    "mobile:android": "npm run build && npx cap sync android && npx cap open android",
    "mobile:run:ios": "npx cap run ios",
    "mobile:run:android": "npx cap run android"
  }
}
```

## Environment Configuration

Create `.env.mobile`:
```bash
VITE_MOBILE_MODE=true
VITE_API_URL=https://api.calibervault.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Deployment Checklist

### Pre-Deployment
- [ ] Test on physical devices
- [ ] Test offline functionality
- [ ] Test push notifications
- [ ] Test biometric auth
- [ ] Test camera integration
- [ ] Verify all permissions
- [ ] Test background sync
- [ ] Performance testing

### iOS Deployment
- [ ] App icons (all sizes)
- [ ] Launch screens
- [ ] Privacy descriptions
- [ ] Apple Developer account
- [ ] Provisioning profiles
- [ ] Archive and upload
- [ ] TestFlight testing
- [ ] App Store submission

### Android Deployment
- [ ] App icons (all sizes)
- [ ] Feature graphic
- [ ] Permissions configured
- [ ] Signing key generated
- [ ] Build AAB
- [ ] Internal testing
- [ ] Play Store submission

## Troubleshooting

### Camera Not Working
```typescript
// Check permissions in Info.plist (iOS) or AndroidManifest.xml
```

### Biometrics Not Available
```typescript
const available = await biometricAuthService.isAvailable();
if (!available) {
  // Fallback to password
}
```

### Push Notifications Not Received
```typescript
// iOS: Check APNs certificate
// Android: Check Firebase configuration
// Both: Verify token is saved to database
```

### Offline Sync Issues
```typescript
// Check offline_sync_queue table for failed items
// Retry failed syncs manually if needed
```

## Resources

- [Capacitor Docs](https://capacitorjs.com/)
- [iOS Deployment Guide](./IOS_DEPLOYMENT_GUIDE.md)
- [Android Deployment Guide](./ANDROID_DEPLOYMENT_GUIDE.md)
- [Mobile Deployment Guide](./MOBILE_DEPLOYMENT_GUIDE.md)
