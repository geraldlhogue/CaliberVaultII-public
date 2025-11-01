# Android Deployment Guide for CaliberVault

## Prerequisites

1. **Android Studio** (latest version)
2. **Java JDK 17+**
3. **Android SDK** (API 33+)
4. **Google Play Developer Account** ($25 one-time fee)
5. **Node.js 18+** and npm installed

## Step 1: Install Mobile Dependencies

```bash
# Install Capacitor dependencies (if not already done)
npm install --save-dev @capacitor/cli
npm install @capacitor/core @capacitor/android @capacitor/camera @capacitor/filesystem @capacitor/haptics @capacitor/push-notifications

# Initialize Capacitor (if not already done)
npx cap init "CaliberVault" "com.calibervault.app"
```

## Step 2: Build Web Assets

```bash
# Build the React app
npm run build

# Add Android platform
npx cap add android

# Sync web assets to Android
npx cap sync android
```

## Step 3: Configure Android Project

1. Open Android Studio:
```bash
npx cap open android
```

2. **Update AndroidManifest.xml** (android/app/src/main/AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.VIBRATE" />

<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

3. **Update build.gradle** (android/app/build.gradle):
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.calibervault.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

## Step 4: Generate Signing Key

```bash
# Generate release keystore
keytool -genkey -v -keystore calibervault-release.keystore -alias calibervault -keyalg RSA -keysize 2048 -validity 10000

# Move to android/app directory
mv calibervault-release.keystore android/app/
```

## Step 5: Configure Signing

Create `android/app/keystore.properties`:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=calibervault
storeFile=calibervault-release.keystore
```

Update `android/app/build.gradle`:
```gradle
def keystorePropertiesFile = rootProject.file("app/keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Step 6: Build Release APK/AAB

```bash
# Build release bundle (for Play Store)
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab

# Or build APK (for direct distribution)
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

## Step 7: Google Play Store Submission

1. **Create Play Console Account**: play.google.com/console
2. **Create New App**
3. **Upload AAB**: android/app/build/outputs/bundle/release/app-release.aab
4. **Fill Required Info**:
   - App description
   - Screenshots (phone, tablet, 7-inch, 10-inch)
   - Feature graphic (1024x500)
   - Privacy policy URL
   - Content rating questionnaire

5. **Submit for Review**

## Troubleshooting

### Build Errors
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Permission Issues
Ensure all permissions in AndroidManifest.xml match required features

## Continuous Updates

After making changes:
```bash
npm run build
npx cap sync android
```

Then rebuild in Android Studio or run:
```bash
cd android && ./gradlew assembleRelease
```
