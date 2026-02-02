import { apiClient } from "./client";

export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    return apiClient.get("/admin/dashboard/stats");
  },

  // Get recent orders
  getRecentOrders: async (limit = 10) => {
    return apiClient.get(`/admin/dashboard/recent-orders?limit=${limit}`);
  },

  // Get top performing stores
  getTopStores: async (limit = 5) => {
    return apiClient.get(`/admin/dashboard/top-stores?limit=${limit}`);
  },

  // Get platform earnings
  getEarnings: async () => {
    return apiClient.get("/admin/dashboard/earnings");
  },

  // Get activity data for charts
  getActivityData: async (days = 7) => {
    return apiClient.get(`/admin/dashboard/activity?days=${days}`);
  },

  // Get recent reviews
  getRecentReviews: async (limit = 10) => {
    return apiClient.get(`/admin/dashboard/recent-reviews?limit=${limit}`);
  },
};
