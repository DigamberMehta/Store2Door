import { cacheHelpers } from "../config/redis.js";

// Redis key prefix for rider locations
const LOCATION_KEY_PREFIX = "rider:location:";
const LOCATION_INDEX_KEY = "rider:locations:active";

/**
 * Location Service - Manages rider locations in Redis
 */
export const locationService = {
  /**
   * Update rider location in Redis
   * @param {string} riderId - The rider's user ID
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<boolean>} Success status
   */
  updateLocation: async (riderId, latitude, longitude) => {
    try {
      const locationData = {
        riderId,
        coordinates: [longitude, latitude], // GeoJSON format [lng, lat]
        latitude,
        longitude,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now(),
      };

      // Store location with 2 minute TTL (auto-expires if not updated)
      const key = `${LOCATION_KEY_PREFIX}${riderId}`;
      await cacheHelpers.set(key, locationData, 120); // 120 seconds = 2 minutes

      // Add to active riders set (for quick lookup)
      await cacheHelpers.set(`${LOCATION_INDEX_KEY}:${riderId}`, "1", 120);

      return true;
    } catch (error) {
      console.error("Error updating location in Redis:", error);
      return false;
    }
  },

  /**
   * Get rider location from Redis
   * @param {string} riderId - The rider's user ID
   * @returns {Promise<object|null>} Location data or null
   */
  getLocation: async (riderId) => {
    try {
      const key = `${LOCATION_KEY_PREFIX}${riderId}`;
      return await cacheHelpers.get(key);
    } catch (error) {
      console.error("Error getting location from Redis:", error);
      return null;
    }
  },

  /**
   * Get multiple rider locations
   * @param {string[]} riderIds - Array of rider IDs
   * @returns {Promise<object[]>} Array of location data
   */
  getLocations: async (riderIds) => {
    try {
      const locations = [];
      for (const riderId of riderIds) {
        const location = await locationService.getLocation(riderId);
        if (location) {
          locations.push(location);
        }
      }
      return locations;
    } catch (error) {
      console.error("Error getting locations from Redis:", error);
      return [];
    }
  },

  /**
   * Remove rider location from Redis
   * @param {string} riderId - The rider's user ID
   * @returns {Promise<boolean>} Success status
   */
  removeLocation: async (riderId) => {
    try {
      const key = `${LOCATION_KEY_PREFIX}${riderId}`;
      await cacheHelpers.del(key);
      await cacheHelpers.del(`${LOCATION_INDEX_KEY}:${riderId}`);
      return true;
    } catch (error) {
      console.error("Error removing location from Redis:", error);
      return false;
    }
  },

  /**
   * Check if location is fresh (updated within last 2 minutes)
   * @param {object} location - Location data object
   * @returns {boolean} True if location is fresh
   */
  isLocationFresh: (location) => {
    if (!location || !location.timestamp) return false;
    const now = Date.now();
    const age = now - location.timestamp;
    return age < 120000; // 2 minutes in milliseconds
  },

  /**
   * Get all active rider locations (with fresh locations)
   * @returns {Promise<object[]>} Array of active locations
   */
  getAllActiveLocations: async () => {
    try {
      // This is a fallback - in production, you'd want to maintain an index
      // For now, we'll return empty and rely on getLocations with specific IDs
      return [];
    } catch (error) {
      console.error("Error getting all active locations:", error);
      return [];
    }
  },
};

export default locationService;
