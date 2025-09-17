import {useState, useEffect} from 'react';
import {requestCameraPermission, requestLocationPermission, checkCameraPermission, checkLocationPermission} from '../utils/permissions';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    camera: false,
    location: false,
    loading: true,
  });

  const checkAllPermissions = async () => {
    try {
      const cameraGranted = await checkCameraPermission();
      const locationGranted = await checkLocationPermission();
      
      setPermissions({
        camera: cameraGranted,
        location: locationGranted,
        loading: false,
      });
    } catch (error) {
      console.log('Error checking permissions:', error);
      setPermissions({
        camera: false,
        location: false,
        loading: false,
      });
    }
  };

  const requestCameraAccess = async () => {
    try {
      const granted = await requestCameraPermission();
      setPermissions(prev => ({
        ...prev,
        camera: granted,
      }));
      return granted;
    } catch (error) {
      console.log('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestLocationAccess = async () => {
    try {
      const granted = await requestLocationPermission();
      setPermissions(prev => ({
        ...prev,
        location: granted,
      }));
      return granted;
    } catch (error) {
      console.log('Error requesting location permission:', error);
      return false;
    }
  };

  useEffect(() => {
    checkAllPermissions();
  }, []);

  return {
    permissions,
    requestCameraAccess,
    requestLocationAccess,
    checkAllPermissions,
  };
};