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
  const [currentResolution, setCurrentResolution] = useState('720p'); // Default to 720p
  const [cameraPermission, setCameraPermission] = useState('not-determined');
  
  // Get camera device
  const device = useCameraDevice('back');
  
  // Get camera format based on resolution - FORCE 720p for file size control
  const getTargetResolution = () => {
    // Force 720p resolution to maintain file size control
    if (currentResolution === '720p') {
      return {
        width: 1280,
        height: 720,
      };
    }
    // For other resolutions, still use controlled settings
    const quality = VIDEO_QUALITIES[currentResolution];
    if (quality && quality.width !== 'auto') {
      return {
        width: quality.width,
        height: quality.height,
      };
    }
    return {width: 1280, height: 720}; // Default to 720p
  };
  
  const targetResolution = getTargetResolution();
  
  // Get format with specific resolution and fps control
  const format = useCameraFormat(device, [
    {videoResolution: targetResolution},
    {fps: 30}, // Limit to 30fps to control bitrate
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
      // Force 720p for file size control
      setCurrentResolution('720p');
    } catch (error) {
      console.log('Error loading settings:', error);
      setSettings({
        locationEnabled: true,
        videoQuality: '720p',
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

  // CORRECTED: Proper video settings for exact file size control
  const getVideoSettings = () => {
    // Target: 40-55 MB for 3 minutes (180 seconds)
    // Conservative bitrate calculation for consistent results
    
    const getBitRate = () => {
      switch (currentResolution) {
        case '720p':
          // Much lower bitrate for 40-55 MB target
          // (50 MB * 8 bits/byte * 1024 * 1024) / 180 seconds ≈ 2.3 Mbps total
          // Video should be ~2 Mbps, Audio ~128 kbps
          return 2000000; // 2 Mbps - This will give ~40-50 MB for 3 minutes
        case '1080p':
          return 3000000; // 3 Mbps for 1080p
        case '4K':
          return 8000000; // 8 Mbps for 4K
        default:
          return 2000000; // Default to conservative 720p bitrate
      }
    };

    const getAudioBitRate = () => {
      return 128000; // 128 kbps - standard audio quality
    };

    console.log('=== VIDEO ENCODING SETTINGS ===');
    console.log('Resolution:', currentResolution);
    console.log('Video Bitrate:', getBitRate(), 'bps');
    console.log('Audio Bitrate:', getAudioBitRate(), 'bps');
    console.log('Expected 3min size: ~45 MB');

    return {
      // Core encoding settings
      videoBitRate: getBitRate(),
      audioBitRate: getAudioBitRate(),
      videoCodec: 'h264',
      fileType: 'mp4',
      
      // Additional compression settings
      fps: 30, // Limit frame rate
      quality: 'medium', // Use medium quality preset
      
      // Platform specific settings
      ...(Platform.OS === 'android' && {
        // Android specific settings
        videoProfile: 'baseline', // More compressed profile
        videoLevel: '3.1',
      }),
      
      ...(Platform.OS === 'ios' && {
        // iOS specific settings
        videoQuality: 'medium',
      }),
    };
  };

  const startRecording = async () => {
    try {
      if (camera.current && cameraPermission === 'granted') {
        setIsRecording(true);
        setRecordingTime(0);
        
        console.log('Starting recording with resolution:', currentResolution);
        console.log('Target resolution:', targetResolution);
        
        const videoSettings = getVideoSettings();
        console.log('Applied video settings:', videoSettings);
        
        // Start recording with conservative settings
        camera.current.startRecording({
          ...videoSettings,
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
      console.log('=== VIDEO RECORDING COMPLETED ===');
      console.log('Video path:', video.path);
      console.log('Recording duration:', recordingTime, 'seconds');
      
      // Calculate expected vs actual
      const expectedSizeMB = (recordingTime * 2.5) / 60; // ~2.5 MB per minute at 2 Mbps
      console.log(`Expected file size: ~${expectedSizeMB.toFixed(1)} MB`);
      
      // Check actual file size if possible
      const RNFS = require('react-native-fs');
      try {
        const fileStats = await RNFS.stat(video.path);
        const actualSizeMB = fileStats.size / (1024 * 1024);
        console.log(`Actual file size: ${actualSizeMB.toFixed(1)} MB`);
        
        if (actualSizeMB > 80) {
          console.warn('⚠️ File size larger than expected! Bitrate settings may not be applied correctly.');
        }
      } catch (statError) {
        console.log('Could not get file stats:', statError);
      }
      
      // Save video with metadata
      const result = await saveVideoToGallery(video.path, {
        location: currentLocation,
        timestamp: new Date(),
        settings: settings,
        resolution: currentResolution,
        duration: recordingTime,
        videoSettings: getVideoSettings(),
        targetSize: `${expectedSizeMB.toFixed(1)} MB`,
      });
      
      console.log('Video save result:', result);
      
      Alert.alert(
        'Success', 
        `Video saved to gallery!\nDuration: ${Math.floor(recordingTime/60)}:${(recordingTime%60).toString().padStart(2,'0')}\nTarget: ~${expectedSizeMB.toFixed(1)} MB\n\nCheck your Photos app in the "CameraApp" album.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert(
        'Save Error', 
        `Failed to save video: ${error.message}`,
        [
          { text: 'OK' },
          { 
            text: 'View Details', 
            onPress: () => console.log('Full error:', error) 
          }
        ]
      );
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
      // Force 720p for file size control
      if (resolution !== '720p') {
        Alert.alert(
          'Resolution Notice',
          'Currently locked to 720p for optimal file size control (40-55 MB for 3 minutes)',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setCurrentResolution(resolution);
      if (settings) {
        const newSettings = {...settings, videoQuality: resolution};
        setSettings(newSettings);
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
        fps={30} // Force 30 FPS for bitrate control
      />
      
      {/* Video Stamp Overlay */}
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
      
      {/* Recording Info with File Size Estimate */}
      {isRecording && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            🔴 {currentResolution} | {formatTime(recordingTime)}
          </Text>
          <Text style={styles.debugText}>
            Target: ~{((recordingTime * 2.5) / 60).toFixed(1)} MB
          </Text>
          <Text style={styles.debugTextSmall}>
            2 Mbps • 30fps • H.264
          </Text>
        </View>
      )}
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
  debugInfo: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  debugTextSmall: {
    color: '#CCCCCC',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

export default CameraScreen;