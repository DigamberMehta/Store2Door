import { apiClient } from "./client.js";

/**
 * Store API Service for Store Managers
 * Manages own store information
 */
export const storeAPI = {
  /**
   * Get own store information (full - use sparingly)
   */
  getMy: async () => {
    return apiClient.get("/stores/my");
  },

  /**
   * Get own store profile (basic info only)
   */
  getMyProfile: async () => {
    return apiClient.get("/stores/my/profile");
  },

  /**
   * Get own store location & contact info
   */
  getMyLocation: async () => {
    return apiClient.get("/stores/my/location");
  },

  /**
   * Get own store features
   */
  getMyFeatures: async () => {
    return apiClient.get("/stores/my/features");
  },

  /**
   * Get own store bank account details
   */
  getMyBankAccount: async () => {
    return apiClient.get("/stores/my/bank-account");
  },

  /**
   * Get own store operating hours
   */
  getMyOperatingHours: async () => {
    return apiClient.get("/stores/my/operating-hours");
  },

  /**
   * Update own store
   * @param {Object} storeData - Updated store data
   */
  update: async (storeData) => {
    return apiClient.put("/stores/my", storeData);
  },

  /**
   * Update store operating hours
   * @param {Array} operatingHours - Operating hours array
   */
  updateOperatingHours: async (operatingHours) => {
    return apiClient.put("/stores/my/operating-hours", { operatingHours });
  },

  /**
   * Update store delivery settings
   * @param {Object} deliverySettings - Delivery settings
   */
  updateDeliverySettings: async (deliverySettings) => {
    return apiClient.put("/stores/my/delivery-settings", deliverySettings);
  },

  /**
   * Get store operations status
   */
  getMyOperations: async () => {
    return apiClient.get("/stores/my/operations");
  },

  /**
   * Update temporary closure status
   * @param {Object} data - { isTemporarilyClosed: boolean, temporaryCloseReason?: string }
   */
  updateTempClosure: async (data) => {
    return apiClient.put("/stores/my/operations/temp-closure", data);
  },

  /**
   * Get store statistics
   */
  getStats: async () => {
    return apiClient.get("/stores/my/stats");
  },
};
