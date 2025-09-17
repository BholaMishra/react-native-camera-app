import {useState, useEffect} from 'react';
import {getSettings, saveSettings, updateSetting} from '../utils/storage';
import {DEFAULT_SETTINGS} from '../utils/constants';

export const useSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const appSettings = await getSettings();
      setSettings(appSettings);
    } catch (error) {
      console.log('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const updateSettingValue = async (key, value) => {
    try {
      const success = await updateSetting(key, value);
      if (success) {
        setSettings(prev => ({
          ...prev,
          [key]: value,
        }));
      }
      return success;
    } catch (error) {
      console.log('Error updating setting:', error);
      return false;
    }
  };

  const saveAllSettings = async (newSettings) => {
    try {
      const success = await saveSettings(newSettings);
      if (success) {
        setSettings(newSettings);
      }
      return success;
    } catch (error) {
      console.log('Error saving settings:', error);
      return false;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting: updateSettingValue,
    saveSettings: saveAllSettings,
    reloadSettings: loadSettings,
  };
};