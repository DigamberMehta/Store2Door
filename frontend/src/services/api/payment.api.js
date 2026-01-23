import { apiClient } from "./client.js";

/**
 * Create checkout session
 */
export const createCheckout = (checkoutData) => {
  return apiClient.post("/payments/checkout", checkoutData);
};

/**
 * Create payment with token
 */
export const createPayment = (paymentData) => {
  return apiClient.post("/payments/create", paymentData);
};

/**
 * Confirm payment status
 */
export const confirmPayment = (paymentId) => {
  return apiClient.get(`/payments/${paymentId}/confirm`);
};

/**
 * Get payment details
 */
export const getPayment = (paymentId) => {
  return apiClient.get(`/payments/${paymentId}`);
};

/**
 * Get payment history
 */
export const getPayments = (params) => {
  return apiClient.get("/payments", { params });
};

/**
 * Request refund
 */
export const refundPayment = (paymentId, refundData) => {
  return apiClient.post(`/payments/${paymentId}/refund`, refundData);
};

const paymentAPI = {
  createCheckout,
  createPayment,
  confirmPayment,
  getPayment,
  getPayments,
  refundPayment,
};

export default paymentAPI;
