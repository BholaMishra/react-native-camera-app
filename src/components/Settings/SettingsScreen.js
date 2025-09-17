import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import Header from '../Common/Header';
import Button from '../Common/Button';
import ThemeSettings from './ThemeSettings';
import VideoSettings from './VideoSettings';
import TimestampSettings from './TimestampSettings';
import LocationSettings from './LocationSettings';
import {getSettings, saveSettings, resetSettings} from '../../utils/storage';
import {THEMES, DEFAULT_SETTINGS} from '../../utils/constants';
import {cleanupOldVideos, getVideoFolderSize, formatFileSize} from '../../utils/fileManager';

const SettingsScreen = ({onBack, theme}) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [folderSize, setFolderSize] = useState(0);

  useEffect(() => {
    loadSettings();
    loadFolderSize();
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return {
          background: '#FFFFFF',
          text: '#000000',
          accent: '#007AFF',
          border: '#E0E0E0',
          card: '#F8F8F8',
        };
      case THEMES.DARK:
        return {
          background: '#000000',
          text: '#FFFFFF',
          accent: '#0A84FF',
          border: '#333333',
          card: '#1C1C1E',
        };
      default:
        return {
          background: '#000000',
          text: '#FFFFFF',
          accent: '#0A84FF',
          border: '#333333',
          card: '#1C1C1E',
        };
    }
  };

  const themeColors = getThemeColors();

  const loadSettings = async () => {
    const appSettings = await getSettings();
    setSettings(appSettings);
  };

  const loadFolderSize = async () => {
    const size = await getVideoFolderSize();
    setFolderSize(size);
  };

  const updateSetting = async (key, value) => {
    const newSettings = {...settings, [key]: value};
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            setSettings(DEFAULT_SETTINGS);
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const handleCleanupVideos = () => {
    Alert.alert(
      'Cleanup Old Videos',
      `Delete videos older than ${settings.autoDeleteDays} days?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const deletedCount = await cleanupOldVideos(settings.autoDeleteDays);
            await loadFolderSize();
            Alert.alert('Cleanup Complete', `Deleted ${deletedCount} old videos`);
          },
        },
      ]
    );
  };

  const SettingSection = ({title, children}) => (
    <View style={[styles.section, {backgroundColor: themeColors.card}]}>
      <Text style={[styles.sectionTitle, {color: themeColors.text}]}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      <Header
        title="Settings"
        showBackButton={true}
        onBackPress={onBack}
        themeColors={themeColors}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingSection title="Theme">
          <ThemeSettings
            currentTheme={settings.theme}
            onThemeChange={(value) => updateSetting('theme', value)}
            themeColors={themeColors}
          />
        </SettingSection>

        <SettingSection title="Video Quality">
          <VideoSettings
            currentQuality={settings.videoQuality}
            onQualityChange={(value) => updateSetting('videoQuality', value)}
            themeColors={themeColors}
          />
        </SettingSection>

        <SettingSection title="Timestamp">
          <TimestampSettings
            settings={settings}
            onUpdateSetting={updateSetting}
            themeColors={themeColors}
          />
        </SettingSection>

        <SettingSection title="Location">
          <LocationSettings
            settings={settings}
            onUpdateSetting={updateSetting}
            themeColors={themeColors}
          />
        </SettingSection>

        <SettingSection title="Storage">
          <View style={styles.storageInfo}>
            <Text style={[styles.storageText, {color: themeColors.text}]}>
              Folder Size: {formatFileSize(folderSize)}
            </Text>
            
            <View style={styles.autoDeleteContainer}>
              <Text style={[styles.label, {color: themeColors.text}]}>
                Auto-delete after (days):
              </Text>
              <View style={styles.autoDeleteOptions}>
                {[7, 30, 90, 365].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dayOption,
                      {
                        backgroundColor: settings.autoDeleteDays === days 
                          ? themeColors.accent 
                          : 'transparent',
                        borderColor: themeColors.border,
                      }
                    ]}
                    onPress={() => updateSetting('autoDeleteDays', days)}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        {
                          color: settings.autoDeleteDays === days 
                            ? '#FFFFFF' 
                            : themeColors.text,
                        }
                      ]}
                    >
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="Cleanup Old Videos"
              onPress={handleCleanupVideos}
              variant="secondary"
              themeColors={themeColors}
              style={styles.cleanupButton}
            />
          </View>
        </SettingSection>

        <SettingSection title="App">
          <Button
            title="Reset to Default"
            onPress={handleResetSettings}
            variant="danger"
            themeColors={themeColors}
          />
        </SettingSection>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  storageInfo: {
    gap: 15,
  },
  storageText: {
    fontSize: 16,
    marginBottom: 10,
  },
  autoDeleteContainer: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  autoDeleteOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  dayOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  dayOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cleanupButton: {
    marginTop: 10,
  },
});

export default SettingsScreen;