// Re-export from LocationContext for backward compatibility
import { useContext } from 'react';
import { LocationContext } from '../context/LocationContext';

/**
 * Hook to get user's current geolocation from shared context
 * @returns {Object} { latitude, longitude, address, loading, error }
 */
export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Number} lat1 
 * @param {Number} lon1 
 * @param {Number} lat2 
 * @param {Number} lon2 
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return parseFloat((R * c).toFixed(2));
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

export default useUserLocation;
