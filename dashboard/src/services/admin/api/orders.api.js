import { apiClient } from "./client";

export const ordersAPI = {
  /**
   * Get all orders with advanced filters
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get("/admin/orders", { params });
    return response;
  },

  /**
   * Get order by ID with full details
   */
  getById: async (orderId) => {
    const response = await apiClient.get(`/admin/orders/${orderId}`);
    return response;
  },

  /**
   * Update order status
   */
  updateStatus: async (orderId, data) => {
    const response = await apiClient.patch(
      `/admin/orders/${orderId}/status`,
      data,
    );
    return response;
  },

  /**
   * Assign rider to order
   */
  assignRider: async (orderId, data) => {
    const response = await apiClient.patch(
      `/admin/orders/${orderId}/assign-rider`,
      data,
    );
    return response;
  },

  /**
   * Cancel order
   */
  cancel: async (orderId, data) => {
    const response = await apiClient.post(
      `/admin/orders/${orderId}/cancel`,
      data,
    );
    return response;
  },

  /**
   * Update order details (notes, instructions)
   */
  updateDetails: async (orderId, data) => {
    const response = await apiClient.patch(
      `/admin/orders/${orderId}/details`,
      data,
    );
    return response;
  },

  /**
   * Get order statistics
   */
  getStats: async (params = {}) => {
    const response = await apiClient.get("/admin/orders/stats/summary", {
      params,
    });
    return response;
  },

  /**
   * Get orders requiring attention
   */
  getRequiringAttention: async () => {
    const response = await apiClient.get("/admin/orders/attention");
    return response;
  },

  /**
   * Bulk update order status
   */
  bulkUpdateStatus: async (data) => {
    const response = await apiClient.post(
      "/admin/orders/bulk/update-status",
      data,
    );
    return response;
  },

  /**
   * Export orders
   */
  export: async (params = {}) => {
    const response = await apiClient.get("/admin/orders/export", {
      params: { ...params, format: "csv" },
      responseType: "blob",
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response;
  },

  // Legacy methods for backward compatibility
  getAllOrders: async (params = {}) => {
    return ordersAPI.getAll(params);
  },

  getOrderById: async (orderId) => {
    return ordersAPI.getById(orderId);
  },

  updateOrderStatus: async (orderId, status) => {
    return ordersAPI.updateStatus(orderId, { status });
  },

  cancelOrder: async (orderId, reason) => {
    return ordersAPI.cancel(orderId, { reason });
  },

  getOrderStats: async () => {
    return ordersAPI.getStats();
  },
};

export default ordersAPI;
