import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {THEMES} from '../../utils/constants';

const ThemeSettings = ({currentTheme, onThemeChange, themeColors}) => {
  const themes = [
    {key: THEMES.SYSTEM, label: 'System', icon: '🔄'},
    {key: THEMES.LIGHT, label: 'Light', icon: '☀️'},
    {key: THEMES.DARK, label: 'Dark', icon: '🌙'},
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.description, {color: themeColors.text}]}>
        Choose your preferred theme for the app interface.
      </Text>
      
      <View style={styles.optionsContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.key}
            style={[
              styles.option,
              {
                backgroundColor: currentTheme === theme.key 
                  ? themeColors.accent 
                  : 'transparent',
                borderColor: themeColors.border,
              }
            ]}
            onPress={() => onThemeChange(theme.key)}
          >
            <Text style={styles.optionIcon}>{theme.icon}</Text>
            <Text
              style={[
                styles.optionText,
                {
                  color: currentTheme === theme.key 
                    ? '#FFFFFF' 
                    : themeColors.text,
                }
              ]}
            >
              {theme.label}
            </Text>
            {currentTheme === theme.key && (
              <Text style={styles.checkMark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={[styles.note, {color: themeColors.text}]}>
        System theme will follow your device's dark mode setting.
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
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

export default ThemeSettings;