import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';

const Header = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  themeColors,
  style,
}) => {
  return (
    <View style={[styles.header, {backgroundColor: themeColors?.background}, style]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={[styles.backText, {color: themeColors?.accent}]}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerContainer}>
        <Text style={[styles.title, {color: themeColors?.text}]}>{title}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    fontWeight: '300',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Header;