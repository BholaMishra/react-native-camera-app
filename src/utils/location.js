// src/utils/location.js
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
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          
          // Try to get address
          try {
            const address = await getAddressFromCoordinates(
              position.coords.latitude, 
              position.coords.longitude
            );
            locationData.address = address;
          } catch (addressError) {
            console.log('Address fetch failed:', addressError);
            locationData.address = null;
          }
          
          resolve(locationData);
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

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CameraApp/1.0', // Required by Nominatim
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      // Extract meaningful address components
      const address = data.address;
      const components = [];
      
      // Add road/street
      if (address.road) components.push(address.road);
      if (address.neighbourhood) components.push(address.neighbourhood);
      if (address.suburb) components.push(address.suburb);
      if (address.city_district) components.push(address.city_district);
      if (address.city) components.push(address.city);
      if (address.state) components.push(address.state);
      
      const formattedAddress = components.slice(0, 3).join(', '); // Limit to 3 components
      
      return {
        full: data.display_name,
        short: formattedAddress || data.display_name,
        components: address,
      };
    }
    
    return null;
  } catch (error) {
    console.log('Reverse geocoding error:', error);
    
    // Fallback: Try alternative API
    try {
      const fallbackResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        
        const components = [];
        if (fallbackData.locality) components.push(fallbackData.locality);
        if (fallbackData.city) components.push(fallbackData.city);
        if (fallbackData.principalSubdivision) components.push(fallbackData.principalSubdivision);
        
        return {
          full: fallbackData.localityInfo?.administrative?.[0]?.name || fallbackData.locality,
          short: components.slice(0, 2).join(', '),
          components: fallbackData,
        };
      }
    } catch (fallbackError) {
      console.log('Fallback geocoding also failed:', fallbackError);
    }
    
    return null;
  }
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
    const address = await getAddressFromCoordinates(latitude, longitude);
    return address?.short || formatCoordinates(latitude, longitude);
  } catch (error) {
    console.log('Error getting city:', error);
    return formatCoordinates(latitude, longitude);
  }
};

export const formatLocationForDisplay = (location, format) => {
  if (!location) return '';
  
  switch (format) {
    case 'address':
      return location.address?.short || formatCoordinates(location.latitude, location.longitude);
    case 'full_address':
      return location.address?.full || formatCoordinates(location.latitude, location.longitude);
    case 'city':
      return location.address?.short || formatCoordinates(location.latitude, location.longitude);
    case 'coordinates':
    default:
      return formatCoordinates(location.latitude, location.longitude);
  }
};