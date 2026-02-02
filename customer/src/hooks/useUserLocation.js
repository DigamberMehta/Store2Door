import { useState, useEffect } from 'react';

/**
 * Hook to get user's current geolocation
 * @returns {Object} { latitude, longitude, loading, error }
 */
export const useUserLocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    console.log("📍 Initializing geolocation...");
    
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Geolocation success:", latitude, longitude);
        
        // Attempt reverse geocoding
        let addressStr = null;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            // Simplify address: use suburb/city or road
            const addr = data.address;
            addressStr = addr.suburb || addr.city_district || addr.city || addr.town || addr.village || addr.road || "Detected Location";
            console.log("📍 Reverse geocode success:", addressStr);
          }
        } catch (err) {
          console.error("📍 Reverse geocoding failed:", err);
        }

        setLocation({
          latitude,
          longitude,
          address: addressStr,
          loading: false,
          error: null
        });
      },
      (error) => {
        console.error("📍 Geolocation error:", error);
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: 'Location access denied'
        }));
      },
      { enableHighAccuracy: false, timeout: 15000 }
    );
  }, []);

  return location;
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
