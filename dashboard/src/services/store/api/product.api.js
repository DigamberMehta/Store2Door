import { apiClient } from "./client.js";

/**
 * Product API Service for Store Managers
 * Manages own store products
 */
export const productAPI = {
  /**
   * Get own store products
   * @param {Object} params - Query parameters
   */
  getMyProducts: async (params = {}) => {
    return apiClient.get("/products", { params });
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   */
  getById: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data
   */
  create: async (productData) => {
    return apiClient.post("/products", productData);
  },

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   */
  update: async (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
  },

  /**
   * Delete product
   * @param {string} id - Product ID
   */
  delete: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },

  /**
   * Toggle product active status
   * @param {string} id - Product ID
   */
  toggleActive: async (id) => {
    return apiClient.patch(`/products/${id}/toggle-active`);
  },

  /**
   * Update product stock
   * @param {string} id - Product ID
   * @param {number} stockQuantity - New stock quantity
   */
  updateStock: async (id, stockQuantity) => {
    return apiClient.patch(`/products/${id}/stock`, { stockQuantity });
  },
};
