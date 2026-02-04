import { apiClient } from "./client";

export const ordersAPI = {
  // Get available orders for pickup
  getAvailableOrders: async () => {
    return apiClient.get("/driver-profile/available-orders");
  },

  // Get driver's assigned/active orders
  getMyOrders: async (status) => {
    const params = status ? { status } : {};
    return apiClient.get("/driver-profile/my-orders", { params });
  },

  // Get driver's earnings
  getEarnings: async () => {
    return apiClient.get("/driver-profile/earnings");
  },

  // Get driver's recent transactions
  getTransactions: async (limit = 10) => {
    return apiClient.get("/driver-profile/transactions", {
      params: { limit },
    });
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    return apiClient.get(`/driver-profile/orders/${orderId}`);
  },

  // Accept an order
  acceptOrder: async (orderId) => {
    return apiClient.post(`/orders/${orderId}/accept`);
  },

  // Update order status
  updateOrderStatus: async (orderId, status, notes) => {
    return apiClient.patch(`/orders/${orderId}/status`, { status, notes });
  },
};

export default ordersAPI;
