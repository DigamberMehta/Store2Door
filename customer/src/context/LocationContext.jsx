import { createContext, useContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    // Try to load cached location from localStorage
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        // Cache valid for 1 hour (3600000 ms)
        if (cacheAge < 3600000) {
          console.log("📍 Using cached location");
          return {
            ...parsed,
            loading: false
          };
        }
      } catch (e) {
        console.error("Failed to parse cached location", e);
      }
    }
    return {
      latitude: null,
      longitude: null,
      address: null,
      loading: true,
      error: null
    };
  });

  useEffect(() => {
    // Skip if we have valid cached location
    if (location.latitude && location.longitude && !location.loading) {
      console.log("📍 Using existing location data");
      return;
    }

    console.log("📍 Initializing geolocation...");
    
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Geolocation success:", latitude, longitude);
        
        // Attempt reverse geocoding ONCE
        let addressStr = null;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            addressStr = data.display_name;
            console.log("📍 Reverse geocode success:", addressStr);
          }
        } catch (err) {
          console.error("📍 Reverse geocoding failed:", err);
        }

        const locationData = {
          latitude,
          longitude,
          address: addressStr,
          loading: false,
          error: null,
          timestamp: Date.now()
        };
        
        setLocation(locationData);
        
        // Cache in localStorage
        try {
          localStorage.setItem('userLocation', JSON.stringify(locationData));
        } catch (e) {
          console.error("Failed to cache location", e);
        }
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

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
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
