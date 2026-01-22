import { cacheHelpers } from '../config/redis.js';
import Product from '../models/Product.js';
import Store from '../models/Store.js';
import Category from '../models/Category.js';
import fuzzysort from 'fuzzysort';
import { expandQueryWithSynonyms, getSynonyms } from '../config/synonyms.js';

/**
 * Suggestions Service
 * Handles search suggestions with fuzzy matching, synonyms, and autocomplete
 */
class SuggestionsService {
  // Cache TTL configuration (in seconds)
  static CACHE_TTL = {
    SUGGESTIONS: 300, // 5 minutes
    POPULAR: 3600,    // 1 hour
    TRENDING: 1800    // 30 minutes
  };

  /**
   * Get suggestions based on query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Suggestions grouped by type
   */
  static async getSuggestions(query, options = {}) {
    try {
      const {
        type = null,
        limit = 10,
        useCache = true
      } = options;

      // Generate cache key
      const cacheKey = `suggestions:${query}:${type || 'all'}:${limit}`;

      // Try to get from cache
      if (useCache) {
        const cached = await cacheHelpers.get(cacheKey);
        if (cached) {
          return { ...cached, fromCache: true };
        }
      }

      // Use MongoDB Atlas Search
      const suggestions = await this.atlasSearch(query, { type, limit });

      // Group suggestions by type
      const grouped = this.groupSuggestionsByType(suggestions);

      // Cache the results
      if (useCache && suggestions.length > 0) {
        await cacheHelpers.set(cacheKey, grouped, this.CACHE_TTL.SUGGESTIONS);
      }

      return grouped;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }

  /**
   * Enhanced search with fuzzy matching, synonyms, and autocomplete
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  static async atlasSearch(query, options = {}) {
    const { type, limit = 10 } = options;
    const results = [];

    try {
      // Expand query with synonyms
      const queryVariations = expandQueryWithSynonyms(query);
      
      // Build regex patterns for autocomplete (prefix matching)
      const prefixRegex = new RegExp(`^${query}`, 'i');
      const containsRegex = new RegExp(query, 'i');
      
      // Create OR conditions for all query variations
      const queryConditions = queryVariations.map(variation => ({
        $or: [
          { name: { $regex: variation, $options: 'i' } },
          { description: { $regex: variation, $options: 'i' } },
          { tags: { $regex: variation, $options: 'i' } }
        ]
      }));

      // Search products
      if (!type || type === 'product') {
        const products = await Product.find({
          $and: [
            { isActive: true },
            { $or: queryConditions }
          ]
        })
          .sort({ popularity: -1, rating: -1 })
          .limit(limit * 2) // Fetch more for fuzzy filtering
          .select('name description price images category popularity rating storeId tags')
          .populate('storeId', 'name')
          .lean();

        // Apply fuzzy matching to filter and rank results
        const productsWithScore = products.map(p => {
          const nameMatch = fuzzysort.single(query, p.name);
          const tagsMatch = p.tags ? fuzzysort.go(query, p.tags, { threshold: -10000 }) : [];
          
          return {
            ...p,
            fuzzyScore: Math.max(
              nameMatch?.score || -Infinity,
              tagsMatch.length > 0 ? tagsMatch[0].score : -Infinity
            )
          };
        });

        // Sort by fuzzy score and take top results
        const sortedProducts = productsWithScore
          .filter(p => p.fuzzyScore > -10000) // Filter out poor matches
          .sort((a, b) => {
            // Prioritize prefix matches
            const aPrefix = a.name.toLowerCase().startsWith(query.toLowerCase());
            const bPrefix = b.name.toLowerCase().startsWith(query.toLowerCase());
            if (aPrefix && !bPrefix) return -1;
            if (!aPrefix && bPrefix) return 1;
            
            // Then sort by fuzzy score
            return b.fuzzyScore - a.fuzzyScore;
          })
          .slice(0, limit);

        results.push(...sortedProducts.map(p => ({
          type: 'product',
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.images?.[0]?.url || p.images?.[0] || '',
          category: p.category,
          popularity: p.popularity || 0,
          rating: p.rating || 0,
          storeName: p.storeId?.name || 'Unknown Store',
          storeId: p.storeId?._id || p.storeId,
          id: `product_${p._id}`,
          score: p.fuzzyScore
        })));
      }

      // Search stores
      if (!type || type === 'store') {
        const searchRegex = new RegExp(query, 'i');
        
        // Find products matching the query to get their store IDs
        const matchingProducts = await Product.find({
          isActive: true,
          $and: [
            { $or: queryConditions }
          ]
        }).select('storeId');

        const productStoreIds = [...new Set(matchingProducts.map((p) => p.storeId.toString()))];

        const stores = await Store.find({
          isActive: true,
          $or: [
            { _id: { $in: productStoreIds } },
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex }
          ]
        })
          .sort({ rating: -1 })
          .limit(limit * 2)
          .select('name description image rating category')
          .lean();

        // Apply fuzzy matching to stores
        const storesWithScore = stores.map(s => {
          const nameMatch = fuzzysort.single(query, s.name);
          const descMatch = fuzzysort.single(query, s.description || '');
          
          return {
            ...s,
            fuzzyScore: Math.max(
              nameMatch?.score || -Infinity,
              descMatch?.score || -Infinity
            )
          };
        });

        const sortedStores = storesWithScore
          .sort((a, b) => {
            // Prioritize stores that carry matching products
            const aHasProduct = productStoreIds.includes(a._id.toString());
            const bHasProduct = productStoreIds.includes(b._id.toString());
            if (aHasProduct && !bHasProduct) return -1;
            if (!aHasProduct && bHasProduct) return 1;
            
            // Then by prefix match
            const aPrefix = a.name.toLowerCase().startsWith(query.toLowerCase());
            const bPrefix = b.name.toLowerCase().startsWith(query.toLowerCase());
            if (aPrefix && !bPrefix) return -1;
            if (!aPrefix && bPrefix) return 1;
            
            // Then by fuzzy score
            return b.fuzzyScore - a.fuzzyScore;
          })
          .slice(0, limit);

        results.push(...sortedStores.map(s => ({
          type: 'store',
          name: s.name,
          description: s.description,
          image: s.image || '',
          rating: s.rating,
          category: s.category,
          id: `store_${s._id}`,
          score: s.fuzzyScore
        })));
      }

      // Search categories
      if (!type || type === 'category') {
        const categories = await Category.find({
          $and: [
            { isActive: true },
            { $or: queryConditions }
          ]
        })
          .limit(limit)
          .select('name description icon')
          .lean();

        // Fuzzy match categories
        const categoriesWithScore = categories.map(c => {
          const nameMatch = fuzzysort.single(query, c.name);
          return {
            ...c,
            fuzzyScore: nameMatch?.score || -Infinity
          };
        });

        const sortedCategories = categoriesWithScore
          .filter(c => c.fuzzyScore > -10000)
          .sort((a, b) => b.fuzzyScore - a.fuzzyScore);

        results.push(...sortedCategories.map(c => ({
          type: 'category',
          name: c.name,
          description: c.description,
          image: c.icon || '',
          id: `category_${c._id}`,
          score: c.fuzzyScore
        })));
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Atlas search error:', error);
      return [];
    }
  }

  /**
   * Group suggestions by type
   * @param {Array} suggestions - Array of suggestions
   * @returns {Object} Grouped suggestions
   */
  static groupSuggestionsByType(suggestions) {
    const grouped = {
      products: [],
      stores: [],
      categories: [],
      all: suggestions
    };

    suggestions.forEach(suggestion => {
      switch (suggestion.type) {
        case 'product':
          grouped.products.push(suggestion);
          break;
        case 'store':
          grouped.stores.push(suggestion);
          break;
        case 'category':
          grouped.categories.push(suggestion);
          break;
      }
    });

    return grouped;
  }

  /**
   * Get popular searches
   * @returns {Promise<Array>} Popular search terms
   */
  static async getPopularSearches(limit = 10) {
    try {
      const cacheKey = 'suggestions:popular';
      
      // Try cache first
      const cached = await cacheHelpers.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get most popular products and stores
      const [products, stores] = await Promise.all([
        Product.find({ isActive: true })
          .sort({ popularity: -1, rating: -1 })
          .limit(limit)
          .select('name category')
          .lean(),
        Store.find({ isActive: true })
          .sort({ rating: -1 })
          .limit(5)
          .select('name category')
          .lean()
      ]);

      const popular = [
        ...products.map(p => ({ term: p.name, type: 'product', category: p.category })),
        ...stores.map(s => ({ term: s.name, type: 'store', category: s.category }))
      ].slice(0, limit);

      // Cache for 1 hour
      await cacheHelpers.set(cacheKey, popular, this.CACHE_TTL.POPULAR);

      return popular;
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  /**
   * Get trending searches based on recent activity
   * @returns {Promise<Array>} Trending search terms
   */
  static async getTrendingSearches(limit = 10) {
    try {
      const cacheKey = 'suggestions:trending';
      
      // Try cache first
      const cached = await cacheHelpers.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get recently added/updated products
      const trending = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name category images')
        .lean();

      const results = trending.map(p => ({
        term: p.name,
        type: 'product',
        category: p.category,
        image: p.images?.[0] || ''
      }));

      // Cache for 30 minutes
      await cacheHelpers.set(cacheKey, results, this.CACHE_TTL.TRENDING);

      return results;
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }

  /**
   * Track search query (for analytics)
   * @param {string} query - Search query
   * @param {string} userId - User ID (optional)
   */
  static async trackSearch(query, userId = null) {
    try {
      const key = `search:count:${query.toLowerCase()}`;
      await cacheHelpers.incr(key);
      
      // Set expiration to 30 days
      await cacheHelpers.expire(key, 30 * 24 * 60 * 60);

      // Track user search if userId provided
      if (userId) {
        const userKey = `user:${userId}:searches`;
        const searches = await cacheHelpers.get(userKey) || [];
        searches.unshift({ query, timestamp: new Date() });
        
        // Keep only last 50 searches
        await cacheHelpers.set(userKey, searches.slice(0, 50), 7 * 24 * 60 * 60);
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  /**
   * Get recent searches for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Recent searches
   */
  static async getRecentSearches(userId, limit = 10) {
    try {
      const userKey = `user:${userId}:searches`;
      const searches = await cacheHelpers.get(userKey) || [];
      return searches.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Clear suggestions cache
   * @param {string} pattern - Cache key pattern (optional)
   */
  static async clearCache(pattern = 'suggestions:*') {
    try {
      await cacheHelpers.delPattern(pattern);
      console.log(`✅ Cleared cache with pattern: ${pattern}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default SuggestionsService;
