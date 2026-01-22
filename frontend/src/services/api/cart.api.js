import { apiClient } from "./client.js";

/**
 * Get user's active cart
 */
export const getCart = () => {
  return apiClient.get("/cart");
};

/**
 * Add item to cart
 */
export const addToCart = (itemData) => {
  return apiClient.post("/cart/items", itemData);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = (itemId, quantity) => {
  return apiClient.put(`/cart/items/${itemId}`, { quantity });
};

/**
 * Remove item from cart
 */
export const removeFromCart = (itemId) => {
  return apiClient.delete(`/cart/items/${itemId}`);
};

/**
 * Clear entire cart
 */
export const clearCart = () => {
  return apiClient.delete("/cart");
};

/**
 * Apply coupon to cart
 */
export const applyCoupon = (couponCode) => {
  return apiClient.post("/cart/coupon", { couponCode });
};

/**
 * Remove coupon from cart
 */
export const removeCoupon = () => {
  return apiClient.delete("/cart/coupon");
};

/**
 * Get tip options based on bill amount
 */
export const getTipOptions = (billAmount) => {
  return apiClient.get("/cart/tip-options", {
    params: { billAmount },
  });
};

const cartAPI = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getTipOptions,
};

export default cartAPI;
