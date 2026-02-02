import { apiClient } from "./client.js";

/**
 * User API Service for Admin
 * Manages all users
 */
export const userAPI = {
  /**
   * Get all users with filters and pagination
   * @param {Object} params - Query parameters
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/users${queryParams ? `?${queryParams}` : ""}`);
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   */
  getById: async (userId) => {
    return apiClient.get(`/admin/users/${userId}`);
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   */
  update: async (userId, userData) => {
    return apiClient.put(`/admin/users/${userId}`, userData);
  },

  /**
   * Delete user (soft delete)
   * @param {string} userId - User ID
   */
  delete: async (userId) => {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  /**
   * Toggle user active status
   * @param {string} userId - User ID
   */
  toggleStatus: async (userId) => {
    return apiClient.patch(`/admin/users/${userId}/toggle-status`);
  },

  /**
   * Get user statistics
   */
  getStats: async () => {
    return apiClient.get("/admin/users/stats/summary");
  },

  /**
   * Bulk update users
   * @param {Array} userIds - Array of user IDs
   * @param {string} action - Action to perform
   */
  bulkUpdate: async (userIds, action) => {
    return apiClient.post("/admin/users/bulk-update", { userIds, action });
  },
};
