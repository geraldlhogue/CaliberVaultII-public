# iOS Deployment Guide for CaliberVault

## Prerequisites

1. **macOS Computer** (required for iOS development)
2. **Xcode 15+** installed from Mac App Store
3. **Apple Developer Account** ($99/year)
4. **CocoaPods** installed: `sudo gem install cocoapods`
5. **Node.js 18+** and npm installed

## Step 1: Install Mobile Dependencies

```bash
# Install Capacitor dependencies
npm install --save-dev @capacitor/cli
npm install @capacitor/core @capacitor/ios @capacitor/camera @capacitor/filesystem @capacitor/haptics @capacitor/push-notifications @capacitor/local-notifications @capacitor/network @capacitor/status-bar @capacitor/keyboard @capacitor/app @capacitor/splash-screen

# Initialize Capacitor
npx cap init "CaliberVault" "com.calibervault.app"
```

## Step 2: Build Web Assets

```bash
# Build the React app
npm run build

# Add iOS platform
npx cap add ios

# Sync web assets to iOS
npx cap sync ios
```

## Step 3: Configure iOS Project

1. Open Xcode:
```bash
npx cap open ios
```

2. **Configure App Info**:
   - Select project in navigator
   - Update Bundle Identifier: `com.calibervault.app`
   - Set Team (your Apple Developer account)
   - Update Version and Build numbers

3. **Add Required Permissions** (Info.plist):
```xml
<key>NSCameraUsageDescription</key>
<string>CaliberVault needs camera access to photograph inventory items</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>CaliberVault needs photo library access to select images</string>
<key>NSFaceIDUsageDescription</key>
<string>CaliberVault uses Face ID for secure authentication</string>
```

## Step 4: Configure Push Notifications

1. Enable Push Notifications capability in Xcode
2. Create APNs certificate in Apple Developer Portal
3. Upload certificate to Firebase/your push service

## Step 5: Build and Test

### Test on Simulator
```bash
npx cap run ios
```

### Test on Physical Device
1. Connect iPhone via USB
2. Select device in Xcode
3. Click Run (⌘R)

## Step 6: App Store Submission

### 1. Create App Store Connect Record
- Go to appstoreconnect.apple.com
- Create new app
- Fill in metadata, screenshots, description

### 2. Archive Build
1. In Xcode: Product → Archive
2. Wait for archive to complete
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Upload build

### 3. Submit for Review
- Complete all App Store Connect fields
- Add screenshots (required sizes)
- Submit for review

## Troubleshooting

### Build Errors
```bash
# Clean build
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

### Certificate Issues
- Verify Apple Developer account is active
- Check provisioning profiles in Xcode
- Regenerate certificates if needed

## Continuous Updates

After making changes:
```bash
npm run build
npx cap sync ios
```

Then rebuild in Xcode or run `npx cap run ios`
