import { apiClient } from "../client";

export const trackingAPI = {
  /**
   * Get all active riders with their current locations
   */
  getActiveRiders: async (includeOffline = false) => {
    const response = await apiClient.get("/admin/riders/active", {
      params: { includeOffline },
    });
    return response;
  },

  /**
   * Get rider statistics
   */
  getRiderStats: async () => {
    const response = await apiClient.get("/admin/riders/stats/summary");
    return response;
  },

  /**
   * Get all riders with pagination
   */
  getAllRiders: async (params = {}) => {
    const response = await apiClient.get("/admin/riders", { params });
    return response;
  },

  /**
   * Assign order to a rider
   */
  assignOrder: async (orderId, riderId) => {
    const response = await apiClient.post(
      `/admin/riders/orders/${orderId}/assign`,
      { riderId },
    );
    return response;
  },

  /**
   * Unassign order from rider
   */
  unassignOrder: async (orderId) => {
    const response = await apiClient.post(
      `/admin/riders/orders/${orderId}/unassign`,
    );
    return response;
  },
};

export default trackingAPI;
