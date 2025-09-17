import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';

export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ];

      // Add storage permissions based on Android version
      if (Platform.Version >= 33) {
        // Android 13+
        permissions.push('android.permission.READ_MEDIA_VIDEO');
        permissions.push('android.permission.READ_MEDIA_IMAGES');
      } else if (Platform.Version >= 23) {
        // Android 6 - 12
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }

      console.log('Requesting permissions:', permissions);
      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
      const audioGranted = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
      
      // Check storage permission based on Android version
      let storageGranted = true;
      if (Platform.Version >= 33) {
        storageGranted = granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED;
      } else if (Platform.Version >= 23) {
        storageGranted = granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
      }

      console.log('Permission results:', {
        camera: granted[PermissionsAndroid.PERMISSIONS.CAMERA],
        audio: granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO],
        storage: storageGranted,
      });

      if (!cameraGranted || !audioGranted) {
        Alert.alert(
          'Permissions Required',
          'Camera and Microphone permissions are required for this app to work. Please enable them in Settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => Linking.openSettings()},
          ]
        );
        return false;
      }

      if (!storageGranted && Platform.Version < 30) {
        Alert.alert(
          'Storage Permission',
          'Storage permission is required to save videos to gallery. Videos will be saved to app folder only.',
          [{text: 'OK'}]
        );
      }

      return cameraGranted && audioGranted;
    } catch (err) {
      console.warn('Permission request error:', err);
      Alert.alert(
        'Permission Error',
        'Failed to request permissions. Please enable Camera and Microphone permissions in Settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ]
      );
      return false;
    }
  }
  return true; // iOS permissions handled by Info.plist
};

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs location access to add location stamps to videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      console.log('Location permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }
  return true; // iOS permissions handled by Info.plist
};

export const checkCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const cameraGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const audioGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      
      console.log('Current permissions:', {camera: cameraGranted, audio: audioGranted});
      return cameraGranted && audioGranted;
    } catch (error) {
      console.log('Error checking camera permission:', error);
      return false;
    }
  }
  return true;
};

export const checkLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      console.log('Location permission status:', granted);
      return granted;
    } catch (error) {
      console.log('Error checking location permission:', error);
      return false;
    }
  }
  return true;
};

export const checkStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        // Android 13+
        const granted = await PermissionsAndroid.check('android.permission.READ_MEDIA_VIDEO');
        return granted;
      } else if (Platform.Version >= 30) {
        // Android 10-12 (scoped storage, no explicit permission needed)
        return true;
      } else {
        // Android 9 and below
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        return granted;
      }
    } catch (error) {
      console.log('Error checking storage permission:', error);
      return false;
    }
  }
  return true;
};

export const checkAllPermissions = async () => {
  try {
    const camera = await checkCameraPermission();
    const location = await checkLocationPermission();
    const storage = await checkStoragePermission();
    
    return {
      camera,
      location,
      storage,
    };
  } catch (error) {
    console.log('Error checking all permissions:', error);
    return {
      camera: false,
      location: false,
      storage: false,
    };
  }
};