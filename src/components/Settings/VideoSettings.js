import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {VIDEO_QUALITIES} from '../../utils/constants';

const VideoSettings = ({currentQuality, onQualityChange, themeColors}) => {
  const qualities = Object.keys(VIDEO_QUALITIES);

  return (
    <View style={styles.container}>
      <Text style={[styles.description, {color: themeColors.text}]}>
        Choose your preferred video recording quality. Higher quality means larger file sizes.
      </Text>
      
      <View style={styles.optionsContainer}>
        {qualities.map((quality) => (
          <TouchableOpacity
            key={quality}
            style={[
              styles.option,
              {
                backgroundColor: currentQuality === quality 
                  ? themeColors.accent 
                  : 'transparent',
                borderColor: themeColors.border,
              }
            ]}
            onPress={() => onQualityChange(quality)}
          >
            <View style={styles.qualityInfo}>
              <Text
                style={[
                  styles.qualityLabel,
                  {
                    color: currentQuality === quality 
                      ? '#FFFFFF' 
                      : themeColors.text,
                  }
                ]}
              >
                {VIDEO_QUALITIES[quality].label}
              </Text>
              <Text
                style={[
                  styles.qualityDetails,
                  {
                    color: currentQuality === quality 
                      ? 'rgba(255, 255, 255, 0.8)' 
                      : themeColors.text,
                    opacity: currentQuality === quality ? 1 : 0.6,
                  }
                ]}
              >
                {quality === 'AUTO' 
                  ? 'Device optimized'
                  : `${VIDEO_QUALITIES[quality].width} × ${VIDEO_QUALITIES[quality].height}`
                }
              </Text>
            </View>
            {currentQuality === quality && (
              <Text style={styles.checkMark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={[styles.note, {color: themeColors.text}]}>
        AUTO mode will select the best quality supported by your device.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  qualityInfo: {
    flex: 1,
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  qualityDetails: {
    fontSize: 12,
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
});

export default VideoSettings;