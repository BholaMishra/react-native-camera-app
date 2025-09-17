import {StyleSheet} from 'react-native';

export const commonStyles = StyleSheet.create({
  // Layout
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },

  // Positioning
  absolute: {
    position: 'absolute',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Spacing
  padding16: {
    padding: 16,
  },
  paddingVertical16: {
    paddingVertical: 16,
  },
  paddingHorizontal16: {
    paddingHorizontal: 16,
  },
  margin16: {
    margin: 16,
  },
  marginVertical16: {
    marginVertical: 16,
  },
  marginHorizontal16: {
    marginHorizontal: 16,
  },

  // Typography
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textSemiBold: {
    fontWeight: '600',
  },
  textMedium: {
    fontWeight: '500',
  },
  textLarge: {
    fontSize: 18,
  },
  textMediumSize: {
    fontSize: 16,
  },
  textSmall: {
    fontSize: 14,
  },
  textTiny: {
    fontSize: 12,
  },

  // Borders
  borderRadius8: {
    borderRadius: 8,
  },
  borderRadius12: {
    borderRadius: 12,
  },
  borderRadius20: {
    borderRadius: 20,
  },

  // Shadows (iOS)
  shadowSmall: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },

  // Common UI patterns
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 44,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});