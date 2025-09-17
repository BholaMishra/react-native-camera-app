import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {DATE_FORMATS, TIME_FORMATS} from '../../utils/constants';

const TimestampSettings = ({settings, onUpdateSetting, themeColors}) => {
  const dateFormats = Object.keys(DATE_FORMATS);
  const timeFormats = Object.keys(TIME_FORMATS);

  const OptionGroup = ({title, options, currentValue, onSelect, getDisplayValue}) => (
    <View style={styles.optionGroup}>
      <Text style={[styles.groupTitle, {color: themeColors.text}]}>{title}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              {
                backgroundColor: currentValue === option 
                  ? themeColors.accent 
                  : 'transparent',
                borderColor: themeColors.border,
              }
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: currentValue === option 
                    ? '#FFFFFF' 
                    : themeColors.text,
                }
              ]}
            >
              {getDisplayValue ? getDisplayValue(option) : option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getDateFormatDisplay = (format) => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const getTimeFormatDisplay = (format) => {
    const now = new Date();
    if (format === '24_HOUR') {
      return now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } else {
      return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.description, {color: themeColors.text}]}>
        Customize how date and time appear on your video stamps.
      </Text>

      <OptionGroup
        title="Date Format"
        options={dateFormats}
        currentValue={settings.dateFormat}
        onSelect={(format) => onUpdateSetting('dateFormat', format)}
        getDisplayValue={getDateFormatDisplay}
      />

      <OptionGroup
        title="Time Format"
        options={timeFormats}
        currentValue={settings.timeFormat}
        onSelect={(format) => onUpdateSetting('timeFormat', format)}
        getDisplayValue={getTimeFormatDisplay}
      />

      <View style={styles.previewContainer}>
        <Text style={[styles.previewLabel, {color: themeColors.text}]}>Preview:</Text>
        <View style={[styles.preview, {borderColor: themeColors.border}]}>
          <Text style={[styles.previewText, {color: themeColors.text}]}>
            {getDateFormatDisplay(settings.dateFormat)}
          </Text>
          <Text style={[styles.previewText, {color: themeColors.text}]}>
            {getTimeFormatDisplay(settings.timeFormat)}
          </Text>
        </View>
      </View>
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
  },
  optionGroup: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    gap: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  preview: {
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});

export default TimestampSettings;