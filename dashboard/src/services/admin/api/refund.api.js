import { apiClient } from "./client";

export const refundAPI = {
  /**
   * Get all refunds with filters
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get("/admin/refunds", { params });
    return response;
  },

  /**
   * Get pending refunds for review
   */
  getPending: async (params = {}) => {
    const response = await apiClient.get("/admin/refunds/pending", { params });
    return response;
  },

  /**
   * Get refund by ID
   */
  getById: async (refundId) => {
    const response = await apiClient.get(`/admin/refunds/${refundId}`);
    return response;
  },

  /**
   * Approve refund request
   */
  approve: async (refundId, data) => {
    const response = await apiClient.post(
      `/admin/refunds/${refundId}/approve`,
      data,
    );
    return response;
  },

  /**
   * Reject refund request
   */
  reject: async (refundId, data) => {
    const response = await apiClient.post(
      `/admin/refunds/${refundId}/reject`,
      data,
    );
    return response;
  },

  /**
   * Mark refund as under review
   */
  markUnderReview: async (refundId) => {
    const response = await apiClient.post(`/admin/refunds/${refundId}/review`);
    return response;
  },

  /**
   * Get refund statistics
   */
  getStats: async (params = {}) => {
    const response = await apiClient.get("/admin/refunds/stats", { params });
    return response;
  },

  /**
   * Export refunds data
   */
  export: async (params = {}) => {
    const response = await apiClient.get("/admin/refunds/export", {
      params,
      responseType: "blob",
    });
    return response;
  },
};

export const walletAPI = {
  /**
   * Get flagged wallets
   */
  getFlagged: async (params = {}) => {
    const response = await apiClient.get("/admin/wallets/flagged", { params });
    return response;
  },

  /**
   * Get wallet statistics
   */
  getStats: async () => {
    const response = await apiClient.get("/admin/wallets/stats");
    return response;
  },
};
