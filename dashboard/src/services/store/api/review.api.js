import { apiClient } from "./client.js";

/**
 * Review API Service for Store Managers
 * View and respond to store reviews
 */
export const reviewAPI = {
  /**
   * Get store reviews
   * @param {Object} params - Query parameters
   */
  getMyReviews: async (params = {}) => {
    return apiClient.get("/reviews", { params });
  },

  /**
   * Get review statistics
   */
  getStats: async () => {
    return apiClient.get("/reviews/stats");
  },

  /**
   * Respond to review
   * @param {string} reviewId - Review ID
   * @param {Object} responseData - Response data
   */
  respond: async (reviewId, responseData) => {
    return apiClient.post(`/reviews/${reviewId}/respond`, responseData);
  },
};
