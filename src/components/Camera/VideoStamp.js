import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {formatLocationForDisplay} from '../../utils/location';
import {DATE_FORMATS, TIME_FORMATS} from '../../utils/constants';

const {width} = Dimensions.get('window');

const VideoStamp = ({settings, location, isRecording}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (settings.dateFormat) {
      case DATE_FORMATS['MM/DD/YYYY']:
        return `${month}/${day}/${year}`;
      case DATE_FORMATS['YYYY-MM-DD']:
        return `${year}-${month}-${day}`;
      case DATE_FORMATS['DD-MM-YYYY']:
        return `${day}-${month}-${year}`;
      case DATE_FORMATS['DD/MM/YYYY']:
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const formatTime = (date) => {
    if (settings.timeFormat === TIME_FORMATS['24_HOUR']) {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  };

  const getLocationText = () => {
    if (!settings.locationEnabled || !location) {
      return '';
    }
    return formatLocationForDisplay(location, settings.locationFormat);
  };

  // Only show stamp when recording
  if (!isRecording) {
    return null;
  }

  const dateText = formatDate(currentTime);
  const timeText = formatTime(currentTime);
  const locationText = getLocationText();

  return (
    <View style={styles.stampContainer}>
      <View style={styles.stamp}>
        <Text style={styles.dateText}>{dateText}</Text>
        <Text style={styles.timeText}>{timeText}</Text>
        {locationText ? (
          <Text style={styles.locationText}>{locationText}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stampContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    zIndex: 2,
  },
  stamp: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

export default VideoStamp;