export const COLORS = {
  // Light Theme
  LIGHT: {
    background: '#FFFFFF',
    surface: '#F8F8F8',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    accent: '#007AFF',
    accentSecondary: '#34C759',
    border: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(255, 255, 255, 0.9)',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },

  // Dark Theme
  DARK: {
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    accent: '#0A84FF',
    accentSecondary: '#30D158',
    border: '#333333',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  },

  // Common Colors
  COMMON: {
    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#000000',
    record: '#FF3B30',
    recordDark: '#FF453A',
  },
};

export const getThemeColors = (theme) => {
  switch (theme) {
    case 'light':
      return COLORS.LIGHT;
    case 'dark':
      return COLORS.DARK;
    default:
      return COLORS.DARK; // Default to dark theme
  }
};