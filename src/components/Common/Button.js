import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
  themeColors,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, style];
    
    if (disabled) {
      return [...baseStyle, styles.disabled];
    }
    
    switch (variant) {
      case 'secondary':
        return [
          ...baseStyle,
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: themeColors?.accent || '#007AFF',
          },
        ];
      case 'danger':
        return [
          ...baseStyle,
          {backgroundColor: '#FF3B30'},
        ];
      default:
        return [
          ...baseStyle,
          {backgroundColor: themeColors?.accent || '#007AFF'},
        ];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, textStyle];
    
    if (disabled) {
      return [...baseTextStyle, {opacity: 0.5}];
    }
    
    switch (variant) {
      case 'secondary':
        return [
          ...baseTextStyle,
          {color: themeColors?.accent || '#007AFF'},
        ];
      default:
        return [...baseTextStyle, {color: '#FFFFFF'}];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;