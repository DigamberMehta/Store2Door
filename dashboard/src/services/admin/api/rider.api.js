import { apiClient } from "./client.js";

/**
 * Rider API Service for Admin
 * Manages delivery riders
 */
export const riderAPI = {
  /**
   * Get all riders
   * @param {Object} params - Query parameters
   */
  getAll: async (params = {}) => {
    return apiClient.get("/riders", { params });
  },

  /**
   * Get rider by ID
   * @param {string} riderId - Rider ID
   */
  getById: async (riderId) => {
    return apiClient.get(`/riders/${riderId}`);
  },

  /**
   * Verify rider document
   * @param {string} riderId - Rider ID
   * @param {string} documentType - Document type
   */
  verifyDocument: async (riderId, documentType) => {
    return apiClient.put(`/driver-profile/documents/${documentType}/verify`, {
      driverId: riderId,
    });
  },

  /**
   * Reject rider document
   * @param {string} riderId - Rider ID
   * @param {string} documentType - Document type
   * @param {string} reason - Rejection reason
   */
  rejectDocument: async (riderId, documentType, reason) => {
    return apiClient.put(`/driver-profile/documents/${documentType}/reject`, {
      driverId: riderId,
      reason,
    });
  },

  /**
   * Get rider earnings
   * @param {string} riderId - Rider ID
   * @param {Object} params - Query parameters
   */
  getEarnings: async (riderId, params = {}) => {
    return apiClient.get(`/riders/${riderId}/earnings`, { params });
  },

  /**
   * Get rider statistics
   * @param {Object} params - Query parameters
   */
  getStats: async (params = {}) => {
    return apiClient.get("/riders/stats", { params });
  },

  /**
   * Toggle rider active status
   * @param {string} riderId - Rider ID
   */
  toggleActive: async (riderId) => {
    return apiClient.patch(`/riders/${riderId}/toggle-active`);
  },
};
