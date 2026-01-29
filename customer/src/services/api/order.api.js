import { apiClient } from "./client.js";

/**
 * Create a new order
 */
export const createOrder = async (orderData) => {
  const response = await apiClient.post("/orders", orderData);
  return response;
};

/**
 * Get all orders for the authenticated user
 */
export const getOrders = async () => {
  const response = await apiClient.get("/orders");
  return response;
};

/**
 * Get a specific order by ID
 */
export const getOrder = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response;
};

/**
 * Alias for getOrder
 */
export const getOrderById = getOrder;

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await apiClient.post(`/orders/${orderId}/cancel`, {
    reason,
  });
  return response;
};

/**
 * Track order status
 */
export const trackOrder = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}/track`);
  return response;
};

export default {
  createOrder,
  getOrders,
  getOrder,
  getOrderById,
  cancelOrder,
  trackOrder,
};
