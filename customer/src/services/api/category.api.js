import { apiClient } from "./client.js";

/**
 * Category API Service
 * Handles all category-related API requests
 */
export const categoryAPI = {
  /**
   * Get all parent categories
   */
  getAll: async () => {
    const response = await apiClient.get("/categories");
    return response.data; // Interceptor already extracted response.data, so just need .data
  },

  /**
   * Get category by slug with subcategories
   * @param {string} slug - Category slug
   */
  getBySlug: async (slug) => {
    const response = await apiClient.get(`/categories/${slug}`);
    return response.data.data; // Extract data from backend response
  },

  /**
   * Get subcategories for a parent category
   * @param {string} parentSlug - Parent category slug
   */
  getSubcategories: async (parentSlug) => {
    const response = await apiClient.get(
      `/categories/${parentSlug}/subcategories`,
    );
    return response.data; // Axios interceptor already returns { success, data }, so access .data
  },

  /**
   * Get featured categories
   */
  getFeatured: async () => {
    const response = await apiClient.get("/categories/featured");
    return response.data.data; // Extract data from backend response
  },

  /**
   * Search categories
   * @param {string} query - Search query
   */
  search: async (query) => {
    const response = await apiClient.get("/categories/search", {
      params: { q: query },
    });
    return response.data.data; // Extract data from backend response
  },

  /**
   * Get parent categories only (level 1)
   */
  getParents: async () => {
    const response = await apiClient.get("/categories");
    return response.data;
  },

  /**
   * Get all categories including subcategories
   */
  getAllCategories: async () => {
    const response = await apiClient.get("/categories/featured");
    return response.data;
  },
};
