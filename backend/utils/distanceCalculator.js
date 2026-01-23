/**
 * Calculate the straight-line distance (bird's eye view) between two coordinates
 * using the Haversine formula
 * 
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} Distance in kilometers (decimal)
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
  
  const distance = R * c; // Distance in kilometers
  
  return parseFloat(distance.toFixed(2)); // Return with 2 decimal places
};

/**
 * Convert degrees to radians
 * @param {Number} degrees 
 * @returns {Number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate delivery charge based on distance and settings
 * @param {Number} distance - Distance in kilometers
 * @param {Array} distanceTiers - Array of {maxDistance, charge} objects
 * @returns {Number} Delivery charge
 */
export const calculateDeliveryCharge = (distance, distanceTiers) => {
  if (!distanceTiers || distanceTiers.length === 0) {
    return 0;
  }
  
  // Sort tiers by maxDistance ascending
  const sortedTiers = [...distanceTiers].sort((a, b) => a.maxDistance - b.maxDistance);
  
  // Find the appropriate tier
  for (const tier of sortedTiers) {
    if (distance <= tier.maxDistance) {
      return tier.charge;
    }
  }
  
  // If distance exceeds all tiers, return the highest tier charge
  return sortedTiers[sortedTiers.length - 1].charge;
};

/**
 * Filter stores by maximum delivery distance
 * @param {Array} stores - Array of store objects with address.latitude/longitude
 * @param {Number} userLat - User's latitude
 * @param {Number} userLon - User's longitude
 * @param {Number} maxDistance - Maximum delivery distance in km
 * @returns {Array} Filtered stores with distance property added
 */
export const filterStoresByDistance = (stores, userLat, userLon, maxDistance) => {
  if (!userLat || !userLon) {
    return stores.map(store => ({
      ...store,
      distance: null,
      deliveryCharge: null
    }));
  }
  
  return stores
    .map(store => {
      const storeLat = store.address?.latitude;
      const storeLon = store.address?.longitude;
      
      if (!storeLat || !storeLon) {
        return null;
      }
      
      const distance = calculateDistance(userLat, userLon, storeLat, storeLon);
      
      return {
        ...store,
        distance
      };
    })
    .filter(store => store !== null && store.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance); // Sort by distance
};

export default {
  calculateDistance,
  calculateDeliveryCharge,
  filterStoresByDistance
};
