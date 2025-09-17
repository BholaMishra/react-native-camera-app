import {useState, useEffect} from 'react';
import {getCurrentLocation} from '../utils/location';

export const useLocation = (enabled = true) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    if (!enabled) {
      setLocation(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (err) {
      console.log('Location error:', err);
      setError(err.message);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    if (enabled) {
      fetchLocation();
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [enabled]);

  return {
    location,
    loading,
    error,
    refreshLocation,
  };
};