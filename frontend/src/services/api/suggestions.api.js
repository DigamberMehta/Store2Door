import { apiClient } from './client';

const suggestionsAPI = {
  /**
   * Get search suggestions
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise} Suggestions response
   */
  getSuggestions: async (query, options = {}) => {
    try {
      const { type, limit = 10, userLat, userLon } = options;
      
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      if (type) {
        params.append('type', type);
      }

      if (userLat && userLon) {
        params.append('userLat', userLat.toString());
        params.append('userLon', userLon.toString());
      }

      const response = await apiClient.get(`/suggestions?${params}`);
      return response;
    } catch (error) {
      console.error('Get suggestions error:', error);
      throw error;
    }
  },

  /**
   * Get popular searches
   * @param {number} limit - Number of results
   * @returns {Promise} Popular searches
   */
  getPopularSearches: async (limit = 10) => {
    try {
      const response = await apiClient.get('/suggestions/popular', {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Get popular searches error:', error);
      throw error;
    }
  },

  /**
   * Get trending searches
   * @param {number} limit - Number of results
   * @returns {Promise} Trending searches
   */
  getTrendingSearches: async (limit = 10) => {
    try {
      const response = await apiClient.get('/suggestions/trending', {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Get trending searches error:', error);
      throw error;
    }
  },

  /**
   * Get recent searches (requires authentication)
   * @param {number} limit - Number of results
   * @returns {Promise} Recent searches
   */
  getRecentSearches: async (limit = 10) => {
    try {
      const response = await apiClient.get('/suggestions/recent', {
        params: { limit },
        withCredentials: true
      });
      return response;
    } catch (error) {
      console.error('Get recent searches error:', error);
      throw error;
    }
  }
};

export default suggestionsAPI;
