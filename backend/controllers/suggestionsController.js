import SuggestionsService from '../services/suggestionsService.js';

/**
 * Get search suggestions
 * GET /api/suggestions
 */
export const getSuggestions = async (req, res) => {
  try {
    const { q, type, limit = 10, userLat, userLon } = req.query;

    console.log('🔍 getSuggestions - Query:', q, 'UserLat:', userLat, 'UserLon:', userLon);

    // Validate query
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters long'
      });
    }

    // Get suggestions (returns { stores: [], products: [], categories: [], corrections: [] })
    const result = await SuggestionsService.getSuggestions(q.trim(), {
      type: type || null,
      limit: parseInt(limit),
      useCache: true,
      userLat: userLat ? parseFloat(userLat) : null,
      userLon: userLon ? parseFloat(userLon) : null
    });

    // Track search query
    const userId = req.user?.id || null;
    SuggestionsService.trackSearch(q.trim(), userId).catch(err => {
      console.error('Failed to track search:', err);
    });

    // Return both suggestions and corrections
    res.json({
      success: true,
      query: q,
      suggestions: {
        stores: result.stores || [],
        products: result.products || [],
        categories: result.categories || [],
        corrections: result.corrections || []
      }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};

/**
 * Get popular searches
 * GET /api/suggestions/popular
 */
export const getPopularSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popular = await SuggestionsService.getPopularSearches(parseInt(limit));

    res.json({
      success: true,
      popular
    });
  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches',
      error: error.message
    });
  }
};

/**
 * Get trending searches
 * GET /api/suggestions/trending
 */
export const getTrendingSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trending = await SuggestionsService.getTrendingSearches(parseInt(limit));

    res.json({
      success: true,
      trending
    });
  } catch (error) {
    console.error('Get trending searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending searches',
      error: error.message
    });
  }
};

/**
 * Get recent searches for authenticated user
 * GET /api/suggestions/recent
 */
export const getRecentSearches = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { limit = 10 } = req.query;

    const recent = await SuggestionsService.getRecentSearches(userId, parseInt(limit));

    res.json({
      success: true,
      recent
    });
  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent searches',
      error: error.message
    });
  }
};

/**
 * Clear suggestions cache (admin only)
 * DELETE /api/suggestions/cache
 */
export const clearSuggestionsCache = async (req, res) => {
  try {
    const { pattern } = req.query;

    await SuggestionsService.clearCache(pattern || 'suggestions:*');

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
};

export default {
  getSuggestions,
  getPopularSearches,
  getTrendingSearches,
  getRecentSearches,
  clearSuggestionsCache
};
