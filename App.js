import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  View,
  Alert,
  StyleSheet,
  Appearance,
  AppState,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import CameraScreen from './src/components/Camera/CameraScreen';
import SettingsScreen from './src/components/Settings/SettingsScreen';
import {useSettings} from './src/hooks/useSettings';
import {THEMES} from './src/utils/constants';
import {cleanupOldVideos} from './src/utils/fileManager';
import {checkAllPermissions, requestCameraPermission} from './src/utils/permissions';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('camera');
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme() || 'dark');
  const [permissions, setPermissions] = useState({
    camera: false,
    location: false,
    loading: true,
  });
  const {settings, loading: settingsLoading} = useSettings();

  // Check permissions on app start
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissionStatus = await checkAllPermissions();
        setPermissions({
          ...permissionStatus,
          loading: false,
        });
        
        console.log('Initial permission check:', permissionStatus);
      } catch (error) {
        console.log('Error checking initial permissions:', error);
        setPermissions({
          camera: false,
          location: false,
          loading: false,
        });
      }
    };

    checkPermissions();
  }, []);

  // Request camera permissions if not granted
  useEffect(() => {
    const requestPermissions = async () => {
      if (!permissions.loading && !permissions.camera) {
        console.log('Requesting camera permissions...');
        const granted = await requestCameraPermission();
        
        if (granted) {
          setPermissions(prev => ({
            ...prev,
            camera: true,
          }));
        } else {
          console.log('Camera permission denied');
        }
      }
    };

    requestPermissions();
  }, [permissions.camera, permissions.loading]);

  useEffect(() => {
    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setSystemTheme(colorScheme || 'dark');
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Auto cleanup old videos on app start
    const handleAutoCleanup = async () => {
      if (settings.autoDeleteDays > 0) {
        try {
          await cleanupOldVideos(settings.autoDeleteDays);
        } catch (error) {
          console.log('Auto cleanup error:', error);
        }
      }
    };

    if (!settingsLoading) {
      handleAutoCleanup();
    }
  }, [settings.autoDeleteDays, settingsLoading]);

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // Re-check permissions when app becomes active
        checkAllPermissions().then(permissionStatus => {
          setPermissions(prev => ({
            ...prev,
            ...permissionStatus,
          }));
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const getCurrentTheme = () => {
    if (settings.theme === THEMES.SYSTEM) {
      return systemTheme === 'dark' ? THEMES.DARK : THEMES.LIGHT;
    }
    return settings.theme;
  };

  const handleNavigateToSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackToCamera = () => {
    setCurrentScreen('camera');
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleRetryPermissions = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      setPermissions(prev => ({
        ...prev,
        camera: true,
      }));
    }
  };

  const currentTheme = getCurrentTheme();

  // Show loading screen
  if (settingsLoading || permissions.loading) {
    return (
      <View style={[styles.container, styles.centerContainer, 
        {backgroundColor: currentTheme === THEMES.DARK ? '#000000' : '#FFFFFF'}]}>
        <StatusBar 
          barStyle={currentTheme === THEMES.DARK ? 'light-content' : 'dark-content'}
          backgroundColor={currentTheme === THEMES.DARK ? '#000000' : '#FFFFFF'}
        />
        <Text style={[styles.loadingText, 
          {color: currentTheme === THEMES.DARK ? '#FFFFFF' : '#000000'}]}>
          Loading...
        </Text>
      </View>
    );
  }

  // Show permission screen if camera permission not granted
  if (!permissions.camera) {
    return (
      <View style={[styles.container, styles.centerContainer,
        {backgroundColor: currentTheme === THEMES.DARK ? '#000000' : '#FFFFFF'}]}>
        <StatusBar 
          barStyle={currentTheme === THEMES.DARK ? 'light-content' : 'dark-content'}
          backgroundColor={currentTheme === THEMES.DARK ? '#000000' : '#FFFFFF'}
        />
        
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionTitle, 
            {color: currentTheme === THEMES.DARK ? '#FFFFFF' : '#000000'}]}>
            📷 Camera Permission Required
          </Text>
          
          <Text style={[styles.permissionMessage,
            {color: currentTheme === THEMES.DARK ? '#CCCCCC' : '#666666'}]}>
            This app needs camera and microphone access to record videos with timestamps and location data.
          </Text>
          
          <TouchableOpacity 
            style={[styles.permissionButton, {backgroundColor: '#007AFF'}]}
            onPress={handleRetryPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.permissionButton, styles.secondaryButton,
              {borderColor: currentTheme === THEMES.DARK ? '#333333' : '#CCCCCC'}]}
            onPress={handleOpenSettings}
          >
            <Text style={[styles.secondaryButtonText,
              {color: currentTheme === THEMES.DARK ? '#FFFFFF' : '#000000'}]}>
              Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={currentTheme === THEMES.DARK ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme === THEMES.DARK ? '#000000' : '#FFFFFF'}
        translucent={currentScreen === 'camera'}
      />
      
      {currentScreen === 'camera' ? (
        <CameraScreen 
          onNavigateToSettings={handleNavigateToSettings}
          theme={currentTheme}
        />
      ) : (
        <SettingsScreen 
          onBack={handleBackToCamera}
          theme={currentTheme}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  permissionContainer: {
    padding: 30,
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;