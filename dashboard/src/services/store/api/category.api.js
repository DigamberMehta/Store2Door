import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Category API Service
 * Public category endpoints (no auth required for reading)
 */
export const categoryAPI = {
  /**
   * Get all categories
   * @param {Object} params - Query parameters
   */
  getAll: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/categories`, { params });
    return response.data;
  },

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   */
  getBySlug: async (slug) => {
    const response = await axios.get(`${API_BASE_URL}/categories/${slug}`);
    return response.data;
  },

  /**
   * Get subcategories of a category
   * @param {string} slug - Parent category slug
   */
  getSubcategories: async (slug) => {
    const response = await axios.get(
      `${API_BASE_URL}/categories/${slug}/subcategories`,
    );
    return response.data;
  },

  /**
   * Get featured categories
   */
  getFeatured: async () => {
    const response = await axios.get(`${API_BASE_URL}/categories/featured`);
    return response.data;
  },

  /**
   * Search categories
   * @param {string} query - Search query
   */
  search: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/categories/search`, {
      params: { q: query },
    });
    return response.data;
  },
};
