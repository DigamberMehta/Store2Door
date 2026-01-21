import { apiClient } from './client.js';

/**
 * Product API Service
 * Handles all product-related API requests
 */
export const productAPI = {
  /**
   * Get all products with filters
   * @param {Object} params - Query parameters
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Get product by ID or slug
   * @param {string} identifier - Product ID or slug
   */
  getById: async (identifier) => {
    const response = await apiClient.get(`/products/${identifier}`);
    return response.data;
  },

  /**
   * Get products by category
   * @param {string} categorySlug - Category slug
   * @param {Object} params - Query parameters (page, limit, sortBy, order)
   */
  getByCategory: async (categorySlug, params = {}) => {
    const response = await apiClient.get(`/products/category/${categorySlug}`, {
      params,
    });
    return response.data;
  },

  /**
   * Get products by store
   * @param {string} storeId - Store ID
   * @param {Object} params - Query parameters
   */
  getByStore: async (storeId, params = {}) => {
    const response = await apiClient.get('/products', {
      params: { ...params, storeId },
    });
    return response.data;
  },

  /**
   * Get featured products
   * @param {number} limit - Number of products to fetch
   */
  getFeatured: async (limit = 10) => {
    const response = await apiClient.get('/products/featured', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get products on sale
   * @param {Object} params - Query parameters (page, limit)
   */
  getOnSale: async (params = {}) => {
    const response = await apiClient.get('/products/on-sale', { params });
    return response.data;
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters (page, limit)
   */
  search: async (query, params = {}) => {
    const response = await apiClient.get('/products/search', {
      params: { ...params, q: query },
    });
    return response.data;
  },

  /**
   * Get products with advanced filters
   * @param {Object} filters - Filter options
   */
  getWithFilters: async (filters = {}) => {
    const {
      category,
      subcategory,
      storeId,
      featured,
      onSale,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    const response = await apiClient.get('/products', {
      params: {
        category,
        subcategory,
        storeId,
        featured,
        onSale,
        minPrice,
        maxPrice,
        sortBy,
        order,
        page,
        limit,
      },
    });
    return response.data;
  },
};
