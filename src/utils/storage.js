import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEFAULT_SETTINGS, STORAGE_KEYS} from './constants';

export const getSettings = async () => {
  try {
    const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsString) {
      const settings = JSON.parse(settingsString);
      return {...DEFAULT_SETTINGS, ...settings};
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.log('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings) => {
  try {
    const settingsString = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, settingsString);
    return true;
  } catch (error) {
    console.log('Error saving settings:', error);
    return false;
  }
};

export const updateSetting = async (key, value) => {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = {
      ...currentSettings,
      [key]: value,
    };
    return await saveSettings(updatedSettings);
  } catch (error) {
    console.log('Error updating setting:', error);
    return false;
  }
};

export const resetSettings = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return true;
  } catch (error) {
    console.log('Error resetting settings:', error);
    return false;
  }
};