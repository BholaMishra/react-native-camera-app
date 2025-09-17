export const THEMES = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
};

export const VIDEO_QUALITIES = {
  '720p': {
    width: 1280,
    height: 720,
    label: '720p',
  },
  '1080p': {
    width: 1920,
    height: 1080,
    label: '1080p',
  },
  '4K': {
    width: 3840,
    height: 2160,
    label: '4K',
  },
  AUTO: {
    width: 'auto',
    height: 'auto',
    label: 'Auto',
  },
};

export const DATE_FORMATS = {
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
  'DD-MM-YYYY': 'DD-MM-YYYY',
};

export const TIME_FORMATS = {
  '12_HOUR': '12 Hour',
  '24_HOUR': '24 Hour',
};

export const LOCATION_FORMATS = {
  COORDINATES: 'coordinates',
  CITY: 'city',
};

export const DEFAULT_SETTINGS = {
  theme: THEMES.SYSTEM,
  videoQuality: '1080p',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12_HOUR',
  timezone: 'device',
  locationEnabled: true,
  locationFormat: LOCATION_FORMATS.COORDINATES,
  autoDeleteDays: 30,
};

export const STORAGE_KEYS = {
  SETTINGS: 'camera_app_settings',
  VIDEO_FOLDER: 'CameraApp_Videos',
};

export const PERMISSIONS = {
  CAMERA: 'android.permission.CAMERA',
  RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
  LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
};