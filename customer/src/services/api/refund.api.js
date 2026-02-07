import { apiClient } from "./client.js";

/**
 * Submit a refund request
 */
export const submitRefund = async (refundData) => {
  const response = await apiClient.post("/customer/refunds", refundData);
  return response;
};

/**
 * Get all refund requests for the authenticated customer
 */
export const getMyRefunds = async (params = {}) => {
  const response = await apiClient.get("/customer/refunds", { params });
  return response;
};

/**
 * Get a specific refund request by ID
 */
export const getRefundById = async (refundId) => {
  const response = await apiClient.get(`/customer/refunds/${refundId}`);
  return response;
};

/**
 * Cancel a refund request
 */
export const cancelRefund = async (refundId) => {
  const response = await apiClient.delete(`/customer/refunds/${refundId}`);
  return response;
};

/**
 * Get customer wallet balance and info
 */
export const getWallet = async () => {
  const response = await apiClient.get("/customer/wallet");
  return response;
};

/**
 * Get wallet transaction history
 */
export const getWalletTransactions = async (limit = 50) => {
  const response = await apiClient.get("/customer/wallet/transactions", {
    params: { limit },
  });
  return response;
};

/**
 * Check if a refund request exists for a specific order
 */
export const checkRefundExists = async (orderId) => {
  const response = await apiClient.get(`/customer/refunds?orderId=${orderId}`);
  // If any refunds exist for this order, return true
  return response.data?.refunds?.length > 0;
};

export default {
  submitRefund,
  getMyRefunds,
  getRefundById,
  cancelRefund,
  getWallet,
  getWalletTransactions,
  checkRefundExists,
};
