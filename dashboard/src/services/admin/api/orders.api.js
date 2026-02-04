import { apiClient } from "./client";

export const ordersAPI = {
  /**
   * Get all orders with filters
   */
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get("/admin/orders", { params });
    return response;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/admin/orders/${orderId}`);
    return response;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.patch(`/admin/orders/${orderId}/status`, {
      status,
    });
    return response;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.post(`/admin/orders/${orderId}/cancel`, {
      reason,
    });
    return response;
  },

  /**
   * Track order
   */
  trackOrder: async (orderId) => {
    const response = await apiClient.get(`/admin/orders/${orderId}/track`);
    return response;
  },

  /**
   * Get order statistics
   */
  getOrderStats: async () => {
    const response = await apiClient.get("/admin/orders/stats/summary");
    return response;
  },
};

export default ordersAPI;
