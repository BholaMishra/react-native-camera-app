# React Native Camera App - Complete Project Setup

## Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - Mac only)

## Project Creation Commands

```bash
# Install React Native CLI globally
npm install -g react-native-cli

# Create new React Native project
npx react-native init CameraApp --version 0.72.0

# Navigate to project directory
cd CameraApp

# Install required dependencies
npm install react-native-vision-camera react-native-permissions @react-native-async-storage/async-storage react-native-fs @react-native-community/geolocation react-native-device-info react-native-vector-icons

# For iOS (if developing for iOS)
cd ios && pod install && cd ..
```

## Project Structure

```
CameraApp/
├── android/
├── ios/
├── src/
│   ├── components/
│   │   ├── Camera/
│   │   │   ├── CameraScreen.js
│   │   │   ├── CameraOverlay.js
│   │   │   └── VideoStamp.js
│   │   ├── Settings/
│   │   │   ├── SettingsScreen.js
│   │   │   ├── ThemeSettings.js
│   │   │   ├── VideoSettings.js
│   │   │   ├── TimestampSettings.js
│   │   │   └── LocationSettings.js
│   │   └── Common/
│   │       ├── Header.js
│   │       └── Button.js
│   ├── utils/
│   │   ├── permissions.js
│   │   ├── storage.js
│   │   ├── location.js
│   │   ├── fileManager.js
│   │   └── constants.js
│   ├── styles/
│   │   ├── colors.js
│   │   └── commonStyles.js
│   └── hooks/
│       ├── useLocation.js
│       ├── useSettings.js
│       └── usePermissions.js
├── App.js
├── package.json
└── README.md
```

## File Creation Commands

```bash
# Create main directories
mkdir -p src/components/Camera
mkdir -p src/components/Settings
mkdir -p src/components/Common
mkdir -p src/utils
mkdir -p src/styles
mkdir -p src/hooks

# Create component files
touch src/components/Camera/CameraScreen.js
touch src/components/Camera/CameraOverlay.js
touch src/components/Camera/VideoStamp.js
touch src/components/Settings/SettingsScreen.js
touch src/components/Settings/ThemeSettings.js
touch src/components/Settings/VideoSettings.js
touch src/components/Settings/TimestampSettings.js
touch src/components/Settings/LocationSettings.js
touch src/components/Common/Header.js
touch src/components/Common/Button.js

# Create utility files
touch src/utils/permissions.js
touch src/utils/storage.js
touch src/utils/location.js
touch src/utils/fileManager.js
touch src/utils/constants.js

# Create style files
touch src/styles/colors.js
touch src/styles/commonStyles.js

# Create hook files
touch src/hooks/useLocation.js
touch src/hooks/useSettings.js
touch src/hooks/usePermissions.js
```

## Android Permissions Setup

Add the following permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
<uses-feature android:name="android.hardware.camera.autofocus" />
```

## iOS Info.plist Setup (if targeting iOS)

Add the following to `ios/CameraApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to record videos</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record audio with videos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to add location stamps to videos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to save recorded videos</string>
```

## Build and Run Commands

```bash
# For Android
npx react-native run-android

# For iOS (Mac only)
npx react-native run-ios

# Clean build (if needed)
npx react-native clean

# Reset Metro cache
npx react-native start --reset-cache
```

## Additional Setup Commands

```bash
# Link vector icons for Android
npx react-native link react-native-vector-icons

# For newer versions, add to android/app/build.gradle:
# apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

## File Contents Preview

The project will include:

1. **Main App Component** (`App.js`) - Navigation between Camera and Settings
2. **Camera Components**:
   - `CameraScreen.js` - Main camera interface
   - `CameraOverlay.js` - UI overlay with controls
   - `VideoStamp.js` - Date/time/location stamping
3. **Settings Components**:
   - `SettingsScreen.js` - Main settings interface
   - Various setting-specific components
4. **Utility Functions**:
   - Permission handling
   - Local storage
   - Location services
   - File management
5. **Styling** - Consistent theme support

## Development Workflow

1. Start the project with the commands above
2. Implement components step by step
3. Test on physical device (camera requires real device)
4. Add API integration for video upload
5. Test auto-delete functionality

## Next Steps

After running these setup commands, I'll provide the complete implementation for each file. The app will support:

- Video recording with stamps
- Settings persistence
- Theme switching
- Resolution selection
- Location tagging
- Auto-delete functionality
- Clean, simple UI