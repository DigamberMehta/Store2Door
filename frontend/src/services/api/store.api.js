import { apiClient } from './client.js';

/**
 * Store API Service
 * Handles all store-related API requests
 */
export const storeAPI = {
  /**
   * Get all stores with filters
   * @param {Object} params - Query parameters
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/stores', { params });
    return response.data;
  },

  /**
   * Get store by ID or slug
   * @param {string} identifier - Store ID or slug
   */
  getById: async (identifier) => {
    const response = await apiClient.get(`/stores/${identifier}`);
    return response.data;
  },

  /**
   * Get stores by category
   * @param {string} category - Category name
   * @param {Object} params - Query parameters (page, limit)
   */
  getByCategory: async (category, params = {}) => {
    const response = await apiClient.get(`/stores/category/${category}`, {
      params,
    });
    return response.data;
  },

  /**
   * Get featured stores
   * @param {number} limit - Number of stores to fetch
   */
  getFeatured: async (limit = 10) => {
    const response = await apiClient.get('/stores/featured', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Search stores
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters (page, limit)
   */
  search: async (query, params = {}) => {
    const response = await apiClient.get('/stores/search', {
      params: { ...params, q: query },
    });
    return response.data;
  },

  /**
   * Get nearby stores based on location
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {number} maxDistance - Maximum distance in meters (default: 5000)
   */
  getNearby: async (latitude, longitude, maxDistance = 5000) => {
    const response = await apiClient.get('/stores/nearby', {
      params: { latitude, longitude, maxDistance },
    });
    return response.data;
  },

  /**
   * Get stores with advanced filters
   * @param {Object} filters - Filter options
   */
  getWithFilters: async (filters = {}) => {
    const {
      category,
      isOpen,
      featured,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    const response = await apiClient.get('/stores', {
      params: {
        category,
        isOpen,
        featured,
        sortBy,
        order,
        page,
        limit,
      },
    });
    return response.data;
  },
};
