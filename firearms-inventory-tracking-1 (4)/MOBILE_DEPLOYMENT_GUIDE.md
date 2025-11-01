# CaliberVault Mobile App Deployment Guide

## Overview

CaliberVault uses **Capacitor** to wrap the React web app as native iOS and Android applications. This provides access to native device features while maintaining a single codebase.

## Architecture

```
React Web App (Vite + TypeScript)
    ↓
Capacitor Bridge
    ↓
Native iOS/Android Apps
```

## Quick Start

### 1. Install Dependencies

```bash
# Install Capacitor CLI
npm install -D @capacitor/cli

# Install Capacitor core and platforms
npm install @capacitor/core @capacitor/ios @capacitor/android

# Install native plugins
npm install @capacitor/camera @capacitor/filesystem @capacitor/haptics \
  @capacitor/push-notifications @capacitor/local-notifications \
  @capacitor/network @capacitor/status-bar @capacitor/keyboard \
  @capacitor/app @capacitor/splash-screen
```

### 2. Initialize Capacitor

```bash
npx cap init "CaliberVault" "com.calibervault.app"
```

### 3. Build Web Assets

```bash
npm run build
```

### 4. Add Platforms

```bash
# Add iOS (requires macOS)
npx cap add ios

# Add Android
npx cap add android

# Sync web assets to native projects
npx cap sync
```

## Platform-Specific Guides

- **iOS**: See [IOS_DEPLOYMENT_GUIDE.md](./IOS_DEPLOYMENT_GUIDE.md)
- **Android**: See [ANDROID_DEPLOYMENT_GUIDE.md](./ANDROID_DEPLOYMENT_GUIDE.md)

## Native Features Implemented

### 1. Camera Integration
- Native camera access for photo capture
- Gallery/photo library access
- Image optimization and upload

### 2. Biometric Authentication
- Face ID (iOS)
- Touch ID (iOS)
- Fingerprint (Android)
- Secure credential storage

### 3. Push Notifications
- Remote push notifications
- Local notifications
- Badge management
- Notification actions

### 4. Offline-First Architecture
- Background sync
- Local database (IndexedDB)
- Automatic retry on reconnection
- Conflict resolution

### 5. Native File System
- Document storage
- Photo storage
- Export capabilities
- File sharing

### 6. Haptic Feedback
- Touch feedback
- Success/error vibrations
- Enhanced UX

## Development Workflow

### Live Reload (iOS)

```bash
# Start dev server
npm run dev

# In another terminal
npx cap run ios --livereload --external
```

### Live Reload (Android)

```bash
# Start dev server
npm run dev

# In another terminal
npx cap run android --livereload --external
```

### Production Build

```bash
# Build web assets
npm run build

# Sync to native projects
npx cap sync

# Open in IDE for final build
npx cap open ios
npx cap open android
```

## Testing

### Simulator/Emulator Testing
```bash
# iOS Simulator
npx cap run ios

# Android Emulator
npx cap run android
```

### Physical Device Testing
- Connect device via USB
- Enable developer mode
- Run from Xcode (iOS) or Android Studio (Android)

## App Store Submission Checklist

### iOS App Store
- [ ] Apple Developer account ($99/year)
- [ ] App icons (all sizes)
- [ ] Launch screens
- [ ] Privacy policy URL
- [ ] App description and keywords
- [ ] Screenshots (all device sizes)
- [ ] App Store Connect record created
- [ ] Build archived and uploaded
- [ ] TestFlight beta testing (optional)

### Google Play Store
- [ ] Google Play Developer account ($25 one-time)
- [ ] App icons (all sizes)
- [ ] Feature graphic (1024x500)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Screenshots (phone, tablet, 7", 10")
- [ ] Content rating completed
- [ ] Release AAB uploaded
- [ ] Internal testing track (optional)

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Build Mobile Apps

on:
  push:
    branches: [main]

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx cap sync ios
      - run: xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - run: cd android && ./gradlew assembleRelease
```

## Troubleshooting

### Common Issues

1. **Build Fails After Sync**
   ```bash
   npx cap sync
   ```

2. **Plugins Not Working**
   ```bash
   npm install
   npx cap sync
   ```

3. **iOS Pods Issues**
   ```bash
   cd ios/App
   pod deintegrate
   pod install
   ```

4. **Android Gradle Issues**
   ```bash
   cd android
   ./gradlew clean
   ```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
