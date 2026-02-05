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

/**
 * Initialize Paystack payment
 */
export const initializePaystackPayment = (paymentData) => {
  return apiClient.post("/payments/paystack/initialize", paymentData);
};

/**
 * Verify Paystack payment
 */
export const verifyPaystackPayment = (reference, paymentId) => {
  const params = paymentId ? { paymentId } : {};
  return apiClient.get(`/payments/paystack/verify/${reference}`, { params });
};

const paymentAPI = {
  createCheckout,
  createPayment,
  getPayment,
  getPayments,
  refundPayment,
  initializePaystackPayment,
  verifyPaystackPayment,
};

export default paymentAPI;
