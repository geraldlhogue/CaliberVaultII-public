# Native Mobile App Implementation - Complete Guide

## Overview

CaliberVault now includes full native mobile app support for iOS and Android using **Capacitor 6.0**. This allows the React web application to be packaged as native mobile apps with access to device features like camera, biometrics, push notifications, and offline storage.

## Architecture

```
┌─────────────────────────────────────────┐
│   React Web App (Vite + TypeScript)    │
│   - UI Components                       │
│   - Business Logic                      │
│   - State Management                    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      Capacitor Bridge Layer             │
│   - Native API Abstraction              │
│   - Plugin Management                   │
│   - Platform Detection                  │
└─────────────┬───────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
┌─────▼─────┐    ┌────▼──────┐
│ iOS App   │    │ Android   │
│ (Swift)   │    │ (Kotlin)  │
└───────────┘    └───────────┘
```

## Key Features Implemented

### 1. Native Camera Integration
- **Files**: 
  - `src/services/mobile/NativeCameraService.ts`
  - `src/components/mobile/NativeCameraCapture.tsx`
- **Capabilities**:
  - Take photos with device camera
  - Select from photo gallery
  - Automatic image optimization
  - Direct upload to Supabase storage
  - Works on both iOS and Android

### 2. Biometric Authentication
- **Files**: 
  - `src/services/mobile/BiometricAuthService.ts`
  - `src/components/mobile/MobileAppSettings.tsx`
- **Capabilities**:
  - Face ID (iOS)
  - Touch ID (iOS)
  - Fingerprint (Android)
  - Secure credential storage
  - Fallback to password authentication

### 3. Push Notifications
- **Files**: 
  - `src/services/mobile/PushNotificationService.ts`
- **Capabilities**:
  - Remote push notifications
  - Local notifications
  - Badge management
  - Notification actions
  - Token management and storage

### 4. Offline-First Architecture
- **Database**: `supabase/migrations/040_create_mobile_tables.sql`
- **Tables**:
  - `offline_sync_queue` - Queues operations when offline
  - `mobile_app_sessions` - Tracks app usage
  - `push_notification_tokens` - Stores device tokens
- **Capabilities**:
  - Background sync
  - Automatic retry on reconnection
  - Conflict resolution
  - Queue management

### 5. Native File System Access
- **Files**: `src/lib/capacitorBridge.ts`
- **Capabilities**:
  - Read/write files to device storage
  - Document directory access
  - File sharing
  - Export capabilities

### 6. Haptic Feedback
- **Implementation**: Integrated in `capacitorBridge.ts`
- **Capabilities**:
  - Light, medium, heavy vibrations
  - Touch feedback
  - Success/error haptics
  - Enhanced UX

## Installation & Setup

### Step 1: Install Dependencies

```bash
# Install Capacitor CLI
npm install -D @capacitor/cli

# Install Capacitor core and platforms
npm install @capacitor/core @capacitor/ios @capacitor/android

# Install native plugins
npm install @capacitor/camera @capacitor/filesystem \
  @capacitor/haptics @capacitor/push-notifications \
  @capacitor/local-notifications @capacitor/network \
  @capacitor/status-bar @capacitor/keyboard @capacitor/app \
  @capacitor/splash-screen
```

### Step 2: Initialize Capacitor

```bash
npx cap init "CaliberVault" "com.calibervault.app"
```

### Step 3: Build and Add Platforms

```bash
# Build web assets
npm run build

# Add iOS (macOS only)
npx cap add ios

# Add Android
npx cap add android

# Sync web assets to native projects
npx cap sync
```

## Configuration Files

### 1. capacitor.config.ts
Main Capacitor configuration with app ID, plugins, and platform settings.

### 2. package.mobile.json
Mobile-specific dependencies and build scripts.

### 3. iOS Configuration
- Info.plist permissions
- Signing certificates
- Provisioning profiles

### 4. Android Configuration
- AndroidManifest.xml permissions
- build.gradle settings
- Keystore for signing

## Usage Examples

### Camera Integration

```typescript
import { nativeCameraService } from '@/services/mobile/NativeCameraService';

// Capture photo
const photo = await nativeCameraService.capturePhoto('camera');

// Capture and upload
const url = await nativeCameraService.captureAndUpload(itemId, 'camera');
```

### Biometric Authentication

```typescript
import { biometricAuthService } from '@/services/mobile/BiometricAuthService';

// Check availability
const available = await biometricAuthService.isAvailable();

// Enable biometrics
await biometricAuthService.enable(userId, email);

// Authenticate
const result = await biometricAuthService.authenticate();
if (result.success) {
  // Login successful
}
```

### Push Notifications

```typescript
import { pushNotificationService } from '@/services/mobile/PushNotificationService';

// Initialize
await pushNotificationService.initialize();

// Send local notification
await pushNotificationService.sendLocalNotification({
  title: 'Low Stock Alert',
  body: 'Item XYZ is running low'
});
```

### Capacitor Bridge

```typescript
import { capacitorBridge } from '@/lib/capacitorBridge';

// Check if native
if (capacitorBridge.isNative()) {
  // Native-specific code
}

// Haptic feedback
await capacitorBridge.vibrate('medium');

// File operations
await capacitorBridge.saveFile('data.json', jsonData);
```

## Development Workflow

### iOS Development
```bash
# Build and open in Xcode
npm run build
npx cap sync ios
npx cap open ios

# Run on simulator
npx cap run ios

# Live reload
npm run dev
npx cap run ios --livereload --external
```

### Android Development
```bash
# Build and open in Android Studio
npm run build
npx cap sync android
npx cap open android

# Run on emulator
npx cap run android

# Live reload
npm run dev
npx cap run android --livereload --external
```

## Deployment

### iOS App Store
See [IOS_DEPLOYMENT_GUIDE.md](./IOS_DEPLOYMENT_GUIDE.md) for complete instructions:
- Apple Developer account setup
- Certificate and provisioning profile creation
- App Store Connect configuration
- Archive and upload process
- TestFlight beta testing
- App Store submission

### Google Play Store
See [ANDROID_DEPLOYMENT_GUIDE.md](./ANDROID_DEPLOYMENT_GUIDE.md) for complete instructions:
- Google Play Developer account setup
- Keystore generation and signing
- AAB/APK build process
- Play Console configuration
- Internal testing track
- Production release

## Mobile UI Optimizations

### Responsive Design
- Mobile-first approach
- Touch-optimized components (44x44pt minimum)
- Bottom sheets for mobile
- Native navigation patterns

### Performance
- Lazy loading
- Image optimization
- Virtual scrolling
- Background sync
- Efficient state management

### Platform-Specific Features
- iOS: Face ID, Haptic Engine, iOS navigation
- Android: Fingerprint, Material Design, back button handling

## Testing

### Simulator/Emulator Testing
```bash
npx cap run ios     # iOS Simulator
npx cap run android # Android Emulator
```

### Physical Device Testing
1. Connect device via USB
2. Enable developer mode
3. Run from Xcode (iOS) or Android Studio (Android)

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
npx cap sync
```

### iOS Pods Issues
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

### Android Gradle Issues
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

## Resources

- **Documentation**:
  - [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)
  - [IOS_DEPLOYMENT_GUIDE.md](./IOS_DEPLOYMENT_GUIDE.md)
  - [ANDROID_DEPLOYMENT_GUIDE.md](./ANDROID_DEPLOYMENT_GUIDE.md)
  - [MOBILE_FEATURES_IMPLEMENTATION.md](./MOBILE_FEATURES_IMPLEMENTATION.md)
  - [MOBILE_DEPLOYMENT_GUIDE.md](./MOBILE_DEPLOYMENT_GUIDE.md)

- **External Links**:
  - [Capacitor Documentation](https://capacitorjs.com/)
  - [iOS Human Interface Guidelines](https://developer.apple.com/design/)
  - [Android Design Guidelines](https://developer.android.com/design)

## Summary

CaliberVault now has full native mobile app capabilities:
✅ Native camera integration
✅ Biometric authentication (Face ID/Touch ID/Fingerprint)
✅ Push notifications
✅ Offline-first architecture with background sync
✅ Native file system access
✅ Haptic feedback
✅ Complete iOS and Android build configurations
✅ Comprehensive deployment guides
✅ Mobile-optimized UI components
