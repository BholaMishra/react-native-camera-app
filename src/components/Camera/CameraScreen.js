import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import {Camera, useCameraDevice, useCameraFormat} from 'react-native-vision-camera';
import CameraOverlay from './CameraOverlay';
import VideoStamp from './VideoStamp';
import {getSettings} from '../../utils/storage';
import {getCurrentLocation} from '../../utils/location';
import {saveVideoToGallery} from '../../utils/fileManager';
import {THEMES, VIDEO_QUALITIES} from '../../utils/constants';

const {width, height} = Dimensions.get('window');

const CameraScreen = ({onNavigateToSettings, theme}) => {
  const camera = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentResolution, setCurrentResolution] = useState('1080p');
  const [cameraPermission, setCameraPermission] = useState('not-determined');
  
  // Get camera device
  const device = useCameraDevice('back');
  
  // Get camera format based on resolution
  const getTargetResolution = () => {
    const quality = VIDEO_QUALITIES[currentResolution];
    if (quality && quality.width !== 'auto') {
      return {
        width: quality.width,
        height: quality.height,
      };
    }
    return {width: 1920, height: 1080}; // Default 1080p
  };
  
  const targetResolution = getTargetResolution();
  const format = useCameraFormat(device, [
    {videoResolution: targetResolution},
  ]);

  // Check camera permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const permission = await Camera.getCameraPermissionStatus();
      setCameraPermission(permission);
      
      if (permission !== 'granted') {
        const newPermission = await Camera.requestCameraPermission();
        setCameraPermission(newPermission);
      }
    };
    
    checkPermission();
  }, []);

  useEffect(() => {
    loadSettings();
    
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (settings?.locationEnabled) {
      getCurrentLocation()
        .then(setCurrentLocation)
        .catch(error => {
          console.log('Location error:', error);
          setCurrentLocation(null);
        });
    } else {
      setCurrentLocation(null);
    }
  }, [settings?.locationEnabled]);

  const loadSettings = async () => {
    try {
      const appSettings = await getSettings();
      setSettings(appSettings);
      setCurrentResolution(appSettings.videoQuality || '1080p');
    } catch (error) {
      console.log('Error loading settings:', error);
      // Set default settings if loading fails
      setSettings({
        locationEnabled: true,
        videoQuality: '1080p',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12_HOUR',
        theme: 'system',
      });
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return {
          background: '#FFFFFF',
          text: '#000000',
          overlay: 'rgba(255, 255, 255, 0.9)',
        };
      case THEMES.DARK:
        return {
          background: '#000000',
          text: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.9)',
        };
      default:
        return {
          background: '#000000',
          text: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.9)',
        };
    }
  };

  const startRecording = async () => {
    try {
      if (camera.current && cameraPermission === 'granted') {
        setIsRecording(true);
        setRecordingTime(0);
        
        console.log('Starting recording with resolution:', currentResolution);
        
        camera.current.startRecording({
          onRecordingFinished: (video) => {
            console.log('Recording finished:', video);
            handleVideoSaved(video);
          },
          onRecordingError: (error) => {
            console.error('Recording error:', error);
            setIsRecording(false);
            Alert.alert('Recording Error', error.message);
          },
        });
      }
    } catch (error) {
      console.log('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Recording Error', 'Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (camera.current && isRecording) {
        console.log('Stopping recording...');
        await camera.current.stopRecording();
        setIsRecording(false);
      }
    } catch (error) {
      console.log('Error stopping recording:', error);
      setIsRecording(false);
      Alert.alert('Recording Error', 'Failed to stop recording');
    }
  };

  const handleVideoSaved = async (video) => {
    try {
      console.log('Saving video:', video.path);
      
      // Save video with metadata
      await saveVideoToGallery(video.path, {
        location: currentLocation,
        timestamp: new Date(),
        settings: settings,
        resolution: currentResolution,
      });
      
      Alert.alert('Success', 'Video saved to gallery');
      
      // TODO: Push to API if required
      // await pushToAPI(video.path);
      
    } catch (error) {
      console.log('Error saving video:', error);
      Alert.alert('Save Error', 'Failed to save video to gallery');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const changeResolution = (resolution) => {
    if (!isRecording) {
      setCurrentResolution(resolution);
      // Save the new resolution to settings
      if (settings) {
        const newSettings = {...settings, videoQuality: resolution};
        setSettings(newSettings);
        // Update storage
        require('../../utils/storage').saveSettings(newSettings);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const themeColors = getThemeColors();

  // Show permission error
  if (cameraPermission !== 'granted') {
    return (
      <View style={[styles.container, styles.centerContent, {backgroundColor: themeColors.background}]}>
        <Text style={[styles.errorText, {color: themeColors.text}]}>
          Camera permission is required to use this app
        </Text>
      </View>
    );
  }

  // Show device error
  if (!device) {
    return (
      <View style={[styles.container, styles.centerContent, {backgroundColor: themeColors.background}]}>
        <Text style={[styles.errorText, {color: themeColors.text}]}>
          No camera device found
        </Text>
        <Text style={[styles.errorSubText, {color: themeColors.text}]}>
          Please ensure you're running on a physical device with a camera
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={true}
        video={true}
        audio={true}
        enableZoomGesture={false}
      />
      
      {/* Video Stamp Overlay - Only show when recording */}
      {settings && (
        <VideoStamp
          settings={settings}
          location={currentLocation}
          isRecording={isRecording}
        />
      )}
      
      {/* Camera Controls Overlay */}
      <CameraOverlay
        isRecording={isRecording}
        recordingTime={formatTime(recordingTime)}
        onToggleRecording={toggleRecording}
        onNavigateToSettings={onNavigateToSettings}
        currentResolution={currentResolution}
        onChangeResolution={changeResolution}
        locationEnabled={settings?.locationEnabled}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  errorSubText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default CameraScreen;