import Geolocation from '@react-native-community/geolocation';
import {requestLocationPermission, checkLocationPermission} from './permissions';

export const getCurrentLocation = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          reject(new Error('Location permission denied'));
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const formatCoordinates = (latitude, longitude) => {
  const latDeg = Math.abs(latitude);
  const lonDeg = Math.abs(longitude);
  
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';
  
  return `${latDeg.toFixed(4)}°${latDirection}, ${lonDeg.toFixed(4)}°${lonDirection}`;
};

export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    // This would typically use a reverse geocoding API
    // For now, returning coordinates as fallback
    return formatCoordinates(latitude, longitude);
  } catch (error) {
    console.log('Error getting city:', error);
    return formatCoordinates(latitude, longitude);
  }
};

export const formatLocationForDisplay = (location, format) => {
  if (!location) return '';
  
  switch (format) {
    case 'city':
      return location.city || formatCoordinates(location.latitude, location.longitude);
    case 'coordinates':
    default:
      return formatCoordinates(location.latitude, location.longitude);
  }
};