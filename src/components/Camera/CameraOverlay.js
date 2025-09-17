import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {VIDEO_QUALITIES, THEMES} from '../../utils/constants';

const {width, height} = Dimensions.get('window');

const CameraOverlay = ({
  isRecording,
  recordingTime,
  onToggleRecording,
  onNavigateToSettings,
  currentResolution,
  onChangeResolution,
  locationEnabled,
  theme,
}) => {
  const getThemeColors = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return {
          text: '#000000',
          overlay: 'rgba(255, 255, 255, 0.9)',
          button: '#007AFF',
          recordButton: '#FF3B30',
        };
      case THEMES.DARK:
        return {
          text: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.7)',
          button: '#0A84FF',
          recordButton: '#FF453A',
        };
      default:
        return {
          text: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.7)',
          button: '#0A84FF',
          recordButton: '#FF453A',
        };
    }
  };

  const themeColors = getThemeColors();

  const cycleResolution = () => {
    const resolutions = Object.keys(VIDEO_QUALITIES);
    const currentIndex = resolutions.indexOf(currentResolution);
    const nextIndex = (currentIndex + 1) % resolutions.length;
    onChangeResolution(resolutions[nextIndex]);
  };

  return (
    <View style={styles.overlay}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={[styles.settingsButton, {backgroundColor: themeColors.overlay}]}
          onPress={onNavigateToSettings}
        >
          <Text style={[styles.settingsText, {color: themeColors.text}]}>⚙️</Text>
        </TouchableOpacity>
        
        <View style={styles.statusContainer}>
          {/* Recording Time */}
          {isRecording && (
            <View style={[styles.recordingIndicator, {backgroundColor: themeColors.recordButton}]}>
              <Text style={styles.recordingText}>● {recordingTime}</Text>
            </View>
          )}
          
          {/* Resolution Display */}
          <View style={[styles.resolutionBadge, {backgroundColor: themeColors.overlay}]}>
            <Text style={[styles.resolutionText, {color: themeColors.text}]}>
              {VIDEO_QUALITIES[currentResolution].label}
            </Text>
          </View>
          
          {/* Location Status */}
          <View style={[styles.locationBadge, {backgroundColor: themeColors.overlay}]}>
            <Text style={[styles.locationText, {color: themeColors.text}]}>
              📍 {locationEnabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
      </View>

      {/* Side Controls */}
      <View style={styles.sideControls}>
        <TouchableOpacity
          style={[styles.resolutionButton, {backgroundColor: themeColors.overlay}]}
          onPress={cycleResolution}
        >
          <Text style={[styles.resolutionButtonText, {color: themeColors.text}]}>
            {currentResolution}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording ? themeColors.recordButton : '#FFFFFF',
              borderColor: themeColors.recordButton,
            },
          ]}
          onPress={onToggleRecording}
        >
          <View
            style={[
              styles.recordButtonInner,
              {
                backgroundColor: isRecording ? '#FFFFFF' : themeColors.recordButton,
                borderRadius: isRecording ? 8 : 30,
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  settingsButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  settingsText: {
    fontSize: 20,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  recordingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resolutionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolutionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sideControls: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 50,
    alignItems: 'center',
  },
  resolutionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resolutionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 50,
    height: 50,
  },
});

export default CameraOverlay;