# CaliberVault Build Instructions

## Web Application (Production)

### Prerequisites
- Node.js 18+
- npm or yarn

### Build Steps

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy (output in dist/ folder)
# Upload dist/ to your hosting provider
```

## Mobile Applications

### Prerequisites
- All web prerequisites
- **iOS**: macOS, Xcode 15+, CocoaPods
- **Android**: Android Studio, JDK 17+

### Initial Setup (One-time)

```bash
# Install Capacitor dependencies
npm install -D @capacitor/cli
npm install @capacitor/core @capacitor/ios @capacitor/android \
  @capacitor/camera @capacitor/filesystem @capacitor/haptics \
  @capacitor/push-notifications @capacitor/local-notifications \
  @capacitor/network @capacitor/status-bar @capacitor/keyboard \
  @capacitor/app @capacitor/splash-screen

# Initialize Capacitor
npx cap init "CaliberVault" "com.calibervault.app"

# Add platforms
npx cap add ios      # macOS only
npx cap add android
```

### iOS Build

```bash
# 1. Build web assets
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
#    - Select your team
#    - Configure signing
#    - Select device/simulator
#    - Click Run (⌘R)

# For App Store:
#    - Product → Archive
#    - Distribute App → App Store Connect
```

### Android Build

```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio:
#    - Build → Generate Signed Bundle/APK
#    - Select Android App Bundle (AAB)
#    - Create/select keystore
#    - Build

# Or via command line:
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Development Builds

### Web Development
```bash
npm run dev
# Opens at http://localhost:5173
```

### iOS Development (with live reload)
```bash
# Terminal 1
npm run dev

# Terminal 2
npx cap run ios --livereload --external
```

### Android Development (with live reload)
```bash
# Terminal 1
npm run dev

# Terminal 2
npx cap run android --livereload --external
```

## Environment Variables

Create `.env.local`:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SENTRY_DSN=your_sentry_dsn
```

## Build Optimization

### Web
- Vite automatically optimizes for production
- Code splitting enabled
- Tree shaking enabled
- Minification enabled

### Mobile
- Images optimized automatically
- Native code compiled with optimizations
- ProGuard enabled for Android (release builds)

## Troubleshooting

### Web Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### iOS Build Issues
```bash
# Clean iOS build
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

### Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npx cap sync android
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Build Apps

on:
  push:
    branches: [main]

jobs:
  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: web-build
          path: dist/

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - run: cd android && ./gradlew assembleRelease
```

## Version Management

Update version in:
1. `package.json` - "version" field
2. `capacitor.config.ts` - update if needed
3. iOS: `ios/App/App/Info.plist` - CFBundleShortVersionString
4. Android: `android/app/build.gradle` - versionCode and versionName

## Distribution

### Web
- Deploy `dist/` folder to:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - Your own server

### iOS
- TestFlight (beta testing)
- App Store (production)

### Android
- Internal Testing (Google Play)
- Open/Closed Testing (Google Play)
- Production (Google Play)
- Direct APK distribution

## Resources

- [Web Deployment](https://vitejs.dev/guide/static-deploy.html)
- [iOS Deployment Guide](./IOS_DEPLOYMENT_GUIDE.md)
- [Android Deployment Guide](./ANDROID_DEPLOYMENT_GUIDE.md)
- [Mobile Features Guide](./MOBILE_FEATURES_IMPLEMENTATION.md)
