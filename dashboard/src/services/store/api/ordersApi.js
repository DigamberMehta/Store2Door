import { apiClient } from "./client";

// Get all orders with filters
export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await apiClient.get(`/orders?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Get order details
export const getOrderDetails = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, notes = "") => {
  try {
    const response = await apiClient.patch(`/orders/${orderId}/status`, {
      status,
      notes,
    });
    return response;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const response = await apiClient.get("/orders/stats");
    return response;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
};
