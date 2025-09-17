import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Switch} from 'react-native';
import {LOCATION_FORMATS} from '../../utils/constants';

const LocationSettings = ({settings, onUpdateSetting, themeColors}) => {
  const locationFormats = Object.keys(LOCATION_FORMATS);

  const getFormatDisplay = (format) => {
    switch (format) {
      case 'coordinates':
        return 'Coordinates (Lat/Long)';
      case 'city':
        return 'City Name';
      default:
        return format;
    }
  };

  const getFormatExample = (format) => {
    switch (format) {
      case 'coordinates':
        return '28.7041°N, 77.1025°E';
      case 'city':
        return 'New Delhi, India';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.description, {color: themeColors.text}]}>
        Configure location tagging for your videos. Location data helps organize and identify where videos were recorded.
      </Text>

      {/* Location Enable/Disable */}
      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchLabel, {color: themeColors.text}]}>
            Enable Location Tagging
          </Text>
          <Text style={[styles.switchDescription, {color: themeColors.text}]}>
            Add location information to your videos
          </Text>
        </View>
        <Switch
          value={settings.locationEnabled}
          onValueChange={(value) => onUpdateSetting('locationEnabled', value)}
          trackColor={{
            false: '#767577',
            true: themeColors.accent,
          }}
          thumbColor={settings.locationEnabled ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      {/* Location Format Options */}
      {settings.locationEnabled && (
        <View style={styles.formatContainer}>
          <Text style={[styles.formatTitle, {color: themeColors.text}]}>
            Location Display Format
          </Text>
          
          <View style={styles.formatOptions}>
            {locationFormats.map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.formatOption,
                  {
                    backgroundColor: settings.locationFormat === LOCATION_FORMATS[format]
                      ? themeColors.accent 
                      : 'transparent',
                    borderColor: themeColors.border,
                  }
                ]}
                onPress={() => onUpdateSetting('locationFormat', LOCATION_FORMATS[format])}
              >
                <View style={styles.formatInfo}>
                  <Text
                    style={[
                      styles.formatLabel,
                      {
                        color: settings.locationFormat === LOCATION_FORMATS[format]
                          ? '#FFFFFF' 
                          : themeColors.text,
                      }
                    ]}
                  >
                    {getFormatDisplay(format)}
                  </Text>
                  <Text
                    style={[
                      styles.formatExample,
                      {
                        color: settings.locationFormat === LOCATION_FORMATS[format]
                          ? 'rgba(255, 255, 255, 0.8)' 
                          : themeColors.text,
                        opacity: settings.locationFormat === LOCATION_FORMATS[format] ? 1 : 0.6,
                      }
                    ]}
                  >
                    {getFormatExample(format)}
                  </Text>
                </View>
                {settings.locationFormat === LOCATION_FORMATS[format] && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.note, {color: themeColors.text}]}>
            📍 The app will request location permission when you first enable this feature.
          </Text>
        </View>
      )}

      {!settings.locationEnabled && (
        <View style={[styles.disabledInfo, {borderColor: themeColors.border}]}>
          <Text style={[styles.disabledText, {color: themeColors.text}]}>
            🔒 Location tagging is disabled. No location data will be collected or stored.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  formatContainer: {
    gap: 12,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  formatOptions: {
    gap: 10,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  formatInfo: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  formatExample: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  disabledInfo: {
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default LocationSettings;