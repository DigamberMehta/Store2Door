import { cacheHelpers } from "../config/redis.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import Category from "../models/Category.js";
import DeliverySettings from "../models/DeliverySettings.js";
import fuzzysort from "fuzzysort";
import { expandQueryWithSynonyms, getSynonyms } from "../config/synonyms.js";

// Global dictionary cache (refreshes every hour)
let SPELLING_DICTIONARY = null;
let DICTIONARY_CACHE_TIME = 0;
const DICTIONARY_TTL = 3600000; // 1 hour in milliseconds

/**
 * Suggestions Service
 * Handles search suggestions with fuzzy matching, synonyms, and autocomplete
 */
class SuggestionsService {
  // Cache TTL configuration (in seconds)
  static CACHE_TTL = {
    SUGGESTIONS: 300, // 5 minutes
    POPULAR: 3600, // 1 hour
    TRENDING: 1800, // 30 minutes
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
        useCache = true,
        includeCorrections = true,
        userLat = null,
        userLon = null,
      } = options;

      // Generate cache key
      const cacheKey = `suggestions:${query}:${type || "all"}:${limit}:${userLat}:${userLon}`;

      // Try to get from cache
      if (useCache) {
        const cached = await cacheHelpers.get(cacheKey);
        if (cached) {
          return { ...cached, fromCache: true };
        }
      }

      // Use MongoDB Atlas Search
      const suggestions = await this.atlasSearch(query, {
        type,
        limit,
        userLat,
        userLon,
      });

      // Only show corrections if there are NO results (not just low results)
      const hasNoResults = suggestions.length === 0;

      let corrections = [];
      if (includeCorrections && hasNoResults) {
        corrections = await this.getSpellingCorrections(
          query,
          3,
          userLat,
          userLon,
        );
      }

      // Group suggestions by type
      const grouped = this.groupSuggestionsByType(suggestions);

      // Add corrections if any
      if (corrections.length > 0) {
        grouped.corrections = corrections;
      }

      // Cache the results
      if (useCache && suggestions.length > 0) {
        await cacheHelpers.set(cacheKey, grouped, this.CACHE_TTL.SUGGESTIONS);
      }

      return grouped;
    } catch (error) {
      console.error("Error getting suggestions:", error);
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
    const { type, limit = 10, userLat = null, userLon = null } = options;
    let results = [];

    try {
      // First attempt: Autocomplete-style search with synonyms
      const autocompleteResults = await this.autocompleteSearch(query, {
        type,
        limit,
        userLat,
        userLon,
      });

      // If autocomplete returns too few results (< 3), fall back to aggressive fuzzy search
      const AUTOCOMPLETE_THRESHOLD = 3;

      if (autocompleteResults.length < AUTOCOMPLETE_THRESHOLD) {
        // Run aggressive fuzzy search
        const fuzzyResults = await this.aggressiveFuzzySearch(query, {
          type,
          limit,
          userLat,
          userLon,
        });

        // Merge results (prioritize autocomplete, then fuzzy)
        const mergedResults = this.mergeAndDeduplicateResults(
          autocompleteResults,
          fuzzyResults,
          limit,
        );

        return mergedResults;
      }

      return autocompleteResults;
    } catch (error) {
      console.error("Atlas search error:", error);
      return [];
    }
  }

  /**
   * Autocomplete-style search with synonym expansion
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  static async autocompleteSearch(query, options = {}) {
    const { type, limit = 10, userLat = null, userLon = null } = options;
    const results = [];

    try {
      // Expand query with synonyms
      const queryVariations = expandQueryWithSynonyms(query);

      // Create OR conditions for all query variations
      const queryConditions = queryVariations.map((variation) => ({
        $or: [
          { name: { $regex: variation, $options: "i" } },
          { description: { $regex: variation, $options: "i" } },
          { tags: { $regex: variation, $options: "i" } },
        ],
      }));

      // Search products using Atlas Search
      if (!type || type === "product") {
        const products = await Product.aggregate([
          {
            $search: {
              index: "products_search",
              compound: {
                should: [
                  {
                    autocomplete: {
                      query: query,
                      path: "name",
                      fuzzy: {
                        maxEdits: 2,
                        prefixLength: 1,
                      },
                      score: { boost: { value: 3 } },
                    },
                  },
                  {
                    text: {
                      query: queryVariations.join(" "),
                      path: ["description", "tags"],
                      fuzzy: { maxEdits: 1 },
                      score: { boost: { value: 1 } },
                    },
                  },
                ],
                must: [{ equals: { path: "isActive", value: true } }],
              },
            },
          },
          {
            $addFields: {
              searchScore: { $meta: "searchScore" },
            },
          },
          {
            $sort: { searchScore: -1, popularity: -1, rating: -1 },
          },
          {
            $limit: limit * 2,
          },
          {
            $lookup: {
              from: "stores",
              localField: "storeId",
              foreignField: "_id",
              as: "storeData",
            },
          },
          {
            $unwind: {
              path: "$storeData",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              name: 1,
              description: 1,
              price: 1,
              images: 1,
              category: 1,
              popularity: 1,
              rating: 1,
              tags: 1,
              searchScore: 1,
              storeId: "$storeData._id",
              storeName: "$storeData.name",
              storeAddress: "$storeData.address",
            },
          },
        ]);

        // Get max delivery distance from settings (default 7km)
        const deliverySettings = await DeliverySettings.findOne();
        const maxDistance = deliverySettings?.maxDeliveryDistance || 7;

        // Calculate distances for products based on their store location and filter by max distance
        const productsWithDistance = products.map((p) => {
          const productData = {
            type: "product",
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.images?.[0]?.url || p.images?.[0] || "",
            category: p.category,
            popularity: p.popularity || 0,
            rating: p.rating || 0,
            storeName: p.storeName || "Unknown Store",
            storeId: p.storeId,
            id: `product_${p._id}`,
            score: p.searchScore,
          };

          // Calculate distance if coordinates available
          if (
            userLat &&
            userLon &&
            p.storeAddress?.latitude &&
            p.storeAddress?.longitude
          ) {
            const R = 6371; // Earth radius in km
            const dLat = ((p.storeAddress.latitude - userLat) * Math.PI) / 180;
            const dLon = ((p.storeAddress.longitude - userLon) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userLat * Math.PI) / 180) *
                Math.cos((p.storeAddress.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            productData.distance = Math.round(c * R * 10) / 10; // Round to 1 decimal
          }

          return productData;
        });

        // Filter products by max delivery distance if user location provided
        const filteredProducts =
          userLat && userLon
            ? productsWithDistance.filter((p) => {
                const included = !p.distance || p.distance <= maxDistance;
                return included;
              })
            : productsWithDistance;

        // Sort by distance if available, otherwise keep search score order
        const sortedProducts =
          userLat && userLon
            ? filteredProducts
                .sort(
                  (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
                )
                .slice(0, limit)
            : filteredProducts.slice(0, limit);

        results.push(...sortedProducts);
      }

      // Search stores using Atlas Search
      if (!type || type === "store") {
        const stores = await Store.aggregate([
          {
            $search: {
              index: "stores_search",
              compound: {
                should: [
                  {
                    autocomplete: {
                      query: query,
                      path: "name",
                      fuzzy: {
                        maxEdits: 2,
                        prefixLength: 1,
                      },
                      score: { boost: { value: 3 } },
                    },
                  },
                  {
                    text: {
                      query: queryVariations.join(" "),
                      path: ["description", "category"],
                      fuzzy: { maxEdits: 1 },
                    },
                  },
                ],
                must: [{ equals: { path: "isActive", value: true } }],
              },
            },
          },
          {
            $addFields: {
              searchScore: { $meta: "searchScore" },
            },
          },
          {
            $sort: { searchScore: -1, rating: -1 },
          },
          {
            $limit: limit * 2,
          },
          {
            $project: {
              name: 1,
              description: 1,
              image: 1,
              rating: 1,
              category: 1,
              searchScore: 1,
              address: 1,
            },
          },
        ]);

        // Get max delivery distance from settings (default 7km)
        const deliverySettings = await DeliverySettings.findOne();
        const maxDistance = deliverySettings?.maxDeliveryDistance || 7;

        // Calculate distances if user location provided
        const storesWithDistance = stores.map((s) => {
          const storeData = {
            type: "store",
            name: s.name,
            description: s.description,
            image: s.image || "",
            rating: s.rating,
            category: s.category,
            id: `store_${s._id}`,
            score: s.searchScore,
            address: s.address,
          };

          // Calculate distance if coordinates available
          if (
            userLat &&
            userLon &&
            s.address?.latitude &&
            s.address?.longitude
          ) {
            const R = 6371; // Earth radius in km
            const dLat = ((s.address.latitude - userLat) * Math.PI) / 180;
            const dLon = ((s.address.longitude - userLon) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userLat * Math.PI) / 180) *
                Math.cos((s.address.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            storeData.distance = Math.round(c * R * 10) / 10; // Round to 1 decimal
          }

          return storeData;
        });

        // Filter stores by max delivery distance if user location provided
        const filteredStores =
          userLat && userLon
            ? storesWithDistance.filter((s) => {
                const included = !s.distance || s.distance <= maxDistance;
                return included;
              })
            : storesWithDistance;

        // Sort by distance if available, otherwise keep search score order
        const sortedStores =
          userLat && userLon
            ? filteredStores
                .sort(
                  (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
                )
                .slice(0, limit)
            : filteredStores.slice(0, limit);

        results.push(...sortedStores);
      }

      // Search categories using Atlas Search
      if (!type || type === "category") {
        const categories = await Category.aggregate([
          {
            $search: {
              index: "categories_search",
              compound: {
                should: [
                  {
                    autocomplete: {
                      query: query,
                      path: "name",
                      fuzzy: {
                        maxEdits: 2,
                        prefixLength: 1,
                      },
                      score: { boost: { value: 2 } },
                    },
                  },
                  {
                    text: {
                      query: queryVariations.join(" "),
                      path: "description",
                      fuzzy: { maxEdits: 1 },
                    },
                  },
                ],
                must: [{ equals: { path: "isActive", value: true } }],
              },
            },
          },
          {
            $addFields: {
              searchScore: { $meta: "searchScore" },
            },
          },
          {
            $limit: limit,
          },
          {
            $project: {
              name: 1,
              description: 1,
              icon: 1,
              searchScore: 1,
            },
          },
        ]);

        // Atlas Search already sorted, just map
        results.push(
          ...categories.map((c) => ({
            type: "category",
            name: c.name,
            description: c.description,
            image: c.icon || "",
            id: `category_${c._id}`,
            score: c.searchScore,
          })),
        );
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error("Autocomplete search error:", error);
      return [];
    }
  }

  /**
   * Aggressive fuzzy search for handling typos and misspellings
   * @param {string} query - Search query (potentially with typos)
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  static async aggressiveFuzzySearch(query, options = {}) {
    const { type, limit = 10, userLat = null, userLon = null } = options;
    const results = [];

    try {
      // Fetch broader set of data for client-side fuzzy matching
      const fetchLimit = Math.min(limit * 10, 100); // Fetch more items for fuzzy filtering

      // Search products
      if (!type || type === "product") {
        const products = await Product.find({ isActive: true })
          .sort({ popularity: -1, rating: -1 })
          .limit(Math.min(fetchLimit, 200))
          .select(
            "name description price images category popularity rating storeId tags",
          )
          .populate("storeId", "name address")
          .lean();

        // Prepare data for fuzzy search
        const productsWithPreparedData = products.map((p) => ({
          ...p,
          _preparedName: fuzzysort.prepare(p.name),
          _preparedTags: p.tags ? p.tags.map((t) => fuzzysort.prepare(t)) : [],
        }));

        // Fuzzy search on names
        const nameMatches = fuzzysort.go(query, productsWithPreparedData, {
          keys: ["name"],
          threshold: -5000, // More lenient threshold for typos
          limit: limit,
        });

        // Fuzzy search on tags
        const tagMatches = products
          .map((p) => {
            if (!p.tags || p.tags.length === 0) return null;
            const matches = fuzzysort.go(query, p.tags, { threshold: -5000 });
            if (matches.length > 0) {
              return {
                obj: p,
                score: matches[0].score,
              };
            }
            return null;
          })
          .filter(Boolean);

        // Combine and deduplicate
        const allMatches = new Map();

        nameMatches.forEach((match) => {
          allMatches.set(match.obj._id.toString(), {
            product: match.obj,
            score: match.score,
          });
        });

        tagMatches.forEach((match) => {
          const id = match.obj._id.toString();
          if (!allMatches.has(id) || allMatches.get(id).score < match.score) {
            allMatches.set(id, {
              product: match.obj,
              score: match.score,
            });
          }
        });

        // Convert to array and sort by score
        const sortedProducts = Array.from(allMatches.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((item) => item.product);

        // Get max delivery distance from settings (default 7km)
        const deliverySettings = await DeliverySettings.findOne();
        const maxDistance = deliverySettings?.maxDeliveryDistance || 7;

        // Calculate distances and filter by max distance
        const productsWithDistance = sortedProducts.map((p) => {
          const productData = {
            type: "product",
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.images?.[0]?.url || p.images?.[0] || "",
            category: p.category,
            popularity: p.popularity || 0,
            rating: p.rating || 0,
            storeName: p.storeId?.name || "Unknown Store",
            storeId: p.storeId?._id || p.storeId,
            id: `product_${p._id}`,
            isFuzzyMatch: true,
          };

          // Calculate distance if coordinates available
          if (
            userLat &&
            userLon &&
            p.storeId?.address?.latitude &&
            p.storeId?.address?.longitude
          ) {
            const R = 6371; // Earth radius in km
            const dLat =
              ((p.storeId.address.latitude - userLat) * Math.PI) / 180;
            const dLon =
              ((p.storeId.address.longitude - userLon) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userLat * Math.PI) / 180) *
                Math.cos((p.storeId.address.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            productData.distance = Math.round(c * R * 10) / 10; // Round to 1 decimal
          }

          return productData;
        });

        // Filter by max delivery distance if user location provided
        const filteredProducts =
          userLat && userLon
            ? productsWithDistance.filter((p) => {
                const pass = !p.distance || p.distance <= maxDistance;
                return pass;
              })
            : productsWithDistance;

        results.push(...filteredProducts);
      }

      // Search stores
      if (!type || type === "store") {
        // For stores, search products first to find stores carrying similar items
        const products = await Product.find({ isActive: true })
          .limit(Math.min(fetchLimit, 200))
          .select("name tags storeId")
          .lean();

        // Fuzzy match products to find relevant store IDs
        const productMatches = fuzzysort.go(query, products, {
          keys: ["name"],
          threshold: -5000,
          limit: fetchLimit,
        });

        const relevantStoreIds = [
          ...new Set(
            productMatches
              .map((match) => match.obj.storeId?.toString())
              .filter(Boolean),
          ),
        ];

        // Fetch all active stores at once (FIXED N+1: was 2 separate Store.find() calls)
        const allStores = await Store.find({ isActive: true })
          .limit(fetchLimit)
          .select("name description image rating category address")
          .lean();

        // Identify stores carrying matching products (higher priority)
        const productCarryingStoreIds = new Set(
          relevantStoreIds.map((id) => id.toString()),
        );

        // Fuzzy match on store names
        const storeNameMatches = fuzzysort.go(query, allStores, {
          keys: ["name"],
          threshold: -5000,
          limit: limit,
        });

        // Filter stores carrying products with matching names
        const stores = allStores.filter((s) =>
          productCarryingStoreIds.has(s._id.toString()),
        );

        // Merge and deduplicate stores
        const storeMap = new Map();

        // Add stores carrying matching products (higher priority)
        stores.forEach((store) => {
          storeMap.set(store._id.toString(), {
            store,
            priority: 2,
            score: 0,
          });
        });

        // Add stores with matching names
        storeNameMatches.forEach((match) => {
          const id = match.obj._id.toString();
          if (!storeMap.has(id)) {
            storeMap.set(id, {
              store: match.obj,
              priority: 1,
              score: match.score,
            });
          }
        });

        // Sort by priority and score
        const sortedStores = Array.from(storeMap.values())
          .sort((a, b) => {
            if (a.priority !== b.priority) return b.priority - a.priority;
            return b.score - a.score;
          })
          .slice(0, limit)
          .map((item) => item.store);

        // Get max delivery distance from settings (default 7km)
        const deliverySettings = await DeliverySettings.findOne();
        const maxDistance = deliverySettings?.maxDeliveryDistance || 7;

        // Calculate distances and filter by max distance
        const storesWithDistance = sortedStores.map((s) => {
          const storeData = {
            type: "store",
            name: s.name,
            description: s.description,
            image: s.image || "",
            rating: s.rating,
            category: s.category,
            id: `store_${s._id}`,
            isFuzzyMatch: true,
            matchType: "fuzzy",
            address: s.address,
          };

          // Calculate distance if coordinates available
          if (
            userLat &&
            userLon &&
            s.address?.latitude &&
            s.address?.longitude
          ) {
            const R = 6371; // Earth radius in km
            const dLat = ((s.address.latitude - userLat) * Math.PI) / 180;
            const dLon = ((s.address.longitude - userLon) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userLat * Math.PI) / 180) *
                Math.cos((s.address.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            storeData.distance = Math.round(c * R * 10) / 10; // Round to 1 decimal
          }

          return storeData;
        });

        // Filter by max delivery distance if user location provided
        const filteredStores =
          userLat && userLon
            ? storesWithDistance.filter((s) => {
                const pass = !s.distance || s.distance <= maxDistance;
                return pass;
              })
            : storesWithDistance;

        results.push(...filteredStores);
      }

      // Search categories
      if (!type || type === "category") {
        const categories = await Category.find({ isActive: true })
          .limit(50)
          .select("name description icon")
          .lean();

        const matches = fuzzysort.go(query, categories, {
          keys: ["name"],
          threshold: -5000,
          limit: limit,
        });

        results.push(
          ...matches.map((match) => ({
            type: "category",
            name: match.obj.name,
            description: match.obj.description,
            image: match.obj.icon || "",
            id: `category_${match.obj._id}`,
            isFuzzyMatch: true,
          })),
        );
      }

      return results;
    } catch (error) {
      console.error("Aggressive fuzzy search error:", error);
      return [];
    }
  }

  /**
   * Merge and deduplicate autocomplete and fuzzy results
   * @param {Array} autocompleteResults - Results from autocomplete search
   * @param {Array} fuzzyResults - Results from fuzzy search
   * @param {number} limit - Maximum number of results
   * @returns {Array} Merged and deduplicated results
   */
  static mergeAndDeduplicateResults(autocompleteResults, fuzzyResults, limit) {
    const resultMap = new Map();

    // Add autocomplete results first (higher priority)
    autocompleteResults.forEach((result) => {
      resultMap.set(result.id, { ...result, matchType: "autocomplete" });
    });

    // Add fuzzy results that don't exist
    fuzzyResults.forEach((result) => {
      if (!resultMap.has(result.id)) {
        resultMap.set(result.id, { ...result, matchType: "fuzzy" });
      }
    });

    // Convert to array and limit
    return Array.from(resultMap.values()).slice(0, limit);
  }

  /**
   * Get spelling correction suggestions ("Did you mean?")
   * @param {string} query - Search query (potentially with typos)
   * @param {number} limit - Number of suggestions
   * @returns {Promise<Array>} Spelling correction suggestions
   */
  /**
   * Build and cache the spelling dictionary
   */
  static async buildSpellingDictionary() {
    const [products, categories] = await Promise.all([
      Product.find({ isActive: true })
        .sort({ popularity: -1 })
        .limit(200)
        .select("name tags")
        .lean(),
      Category.find({ isActive: true }).select("name").lean(),
    ]);

    const dictionary = new Set();

    products.forEach((p) => {
      dictionary.add(p.name.toLowerCase());
      if (p.tags) {
        p.tags.forEach((tag) => dictionary.add(tag.toLowerCase()));
      }
    });

    categories.forEach((c) => {
      dictionary.add(c.name.toLowerCase());
    });

    const terms = Array.from(dictionary);

    return terms;
  }

  static async getSpellingCorrections(
    query,
    limit = 3,
    userLat = null,
    userLon = null,
  ) {
    try {
      // Check if dictionary needs refresh (every hour)
      const now = Date.now();
      if (
        !SPELLING_DICTIONARY ||
        now - DICTIONARY_CACHE_TIME > DICTIONARY_TTL
      ) {
        SPELLING_DICTIONARY = await this.buildSpellingDictionary();
        DICTIONARY_CACHE_TIME = now;
      }

      // Use cached dictionary
      const terms = SPELLING_DICTIONARY;

      // Find closest matches using fuzzy search with stricter threshold
      const matches = fuzzysort.go(query, terms, {
        threshold: -1000, // Much stricter - only show close matches
        limit: limit * 3, // Get more candidates to filter
      });

      // Filter out suggestions that are too different from query
      const relevantMatches = matches.filter((match) => {
        const suggestion = match.target.toLowerCase();
        const queryLower = query.toLowerCase();

        // Only keep if they share at least 50% of characters or start with same letter(s)
        const startsWithSame = suggestion.startsWith(queryLower[0]);
        const lengthDiff = Math.abs(suggestion.length - queryLower.length);
        const isSimilarLength = lengthDiff <= queryLower.length * 0.5;

        return startsWithSame && isSimilarLength;
      });

      // If user location provided, filter corrections by distance
      if (userLat && userLon) {
        const deliverySettings = await DeliverySettings.findOne();
        const maxDistance = deliverySettings?.maxDeliveryDistance || 7;

        const validCorrections = [];

        for (const match of relevantMatches) {
          // Check if this suggestion has products/stores within range
          const hasNearbyResults = await this.checkIfTermHasNearbyResults(
            match.target,
            userLat,
            userLon,
            maxDistance,
          );

          if (hasNearbyResults) {
            validCorrections.push({
              suggestion: match.target,
              score: match.score,
            });
          }

          // Stop when we have enough valid corrections
          if (validCorrections.length >= limit) {
            break;
          }
        }

        return validCorrections;
      }

      return relevantMatches.slice(0, limit).map((match) => ({
        suggestion: match.target,
        score: match.score,
      }));
    } catch (error) {
      console.error("Error getting spelling corrections:", error);
      return [];
    }
  }

  /**
   * Check if a search term has any products or stores within delivery range
   * @param {string} term - Search term
   * @param {number} userLat - User latitude
   * @param {number} userLon - User longitude
   * @param {number} maxDistance - Maximum delivery distance in km
   * @returns {Promise<boolean>} True if term has nearby results
   */
  static async checkIfTermHasNearbyResults(
    term,
    userLat,
    userLon,
    maxDistance,
  ) {
    try {
      // Search for products matching this term
      const products = await Product.find({
        isActive: true,
        $or: [
          { name: { $regex: term, $options: "i" } },
          { tags: { $regex: term, $options: "i" } },
        ],
      })
        .limit(10)
        .select("storeId")
        .populate("storeId", "address")
        .lean();

      // Check if any product's store is within range
      for (const product of products) {
        if (
          product.storeId?.address?.latitude &&
          product.storeId?.address?.longitude
        ) {
          const R = 6371; // Earth radius in km
          const dLat =
            ((product.storeId.address.latitude - userLat) * Math.PI) / 180;
          const dLon =
            ((product.storeId.address.longitude - userLon) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((product.storeId.address.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          if (distance <= maxDistance) {
            return true; // Found at least one product within range
          }
        }
      }

      // Search for stores matching this term
      const stores = await Store.find({
        isActive: true,
        name: { $regex: term, $options: "i" },
      })
        .limit(5)
        .select("address")
        .lean();

      // Check if any store is within range
      for (const store of stores) {
        if (store.address?.latitude && store.address?.longitude) {
          const R = 6371;
          const dLat = ((store.address.latitude - userLat) * Math.PI) / 180;
          const dLon = ((store.address.longitude - userLon) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((store.address.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          if (distance <= maxDistance) {
            return true; // Found at least one store within range
          }
        }
      }

      return false; // No products or stores within range
    } catch (error) {
      console.error(`Error checking nearby results for "${term}":`, error);
      return false;
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
      all: suggestions,
    };

    suggestions.forEach((suggestion) => {
      switch (suggestion.type) {
        case "product":
          grouped.products.push(suggestion);
          break;
        case "store":
          grouped.stores.push(suggestion);
          break;
        case "category":
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
      const cacheKey = "suggestions:popular";

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
          .select("name category")
          .lean(),
        Store.find({ isActive: true })
          .sort({ rating: -1 })
          .limit(5)
          .select("name category")
          .lean(),
      ]);

      const popular = [
        ...products.map((p) => ({
          term: p.name,
          type: "product",
          category: p.category,
        })),
        ...stores.map((s) => ({
          term: s.name,
          type: "store",
          category: s.category,
        })),
      ].slice(0, limit);

      // Cache for 1 hour
      await cacheHelpers.set(cacheKey, popular, this.CACHE_TTL.POPULAR);

      return popular;
    } catch (error) {
      console.error("Error getting popular searches:", error);
      return [];
    }
  }

  /**
   * Get trending searches based on recent activity
   * @returns {Promise<Array>} Trending search terms
   */
  static async getTrendingSearches(limit = 10) {
    try {
      const cacheKey = "suggestions:trending";

      // Try cache first
      const cached = await cacheHelpers.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get recently added/updated products
      const trending = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("name category images")
        .lean();

      const results = trending.map((p) => ({
        term: p.name,
        type: "product",
        category: p.category,
        image: p.images?.[0] || "",
      }));

      // Cache for 30 minutes
      await cacheHelpers.set(cacheKey, results, this.CACHE_TTL.TRENDING);

      return results;
    } catch (error) {
      console.error("Error getting trending searches:", error);
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
        const searches = (await cacheHelpers.get(userKey)) || [];
        searches.unshift({ query, timestamp: new Date() });

        // Keep only last 50 searches
        await cacheHelpers.set(
          userKey,
          searches.slice(0, 50),
          7 * 24 * 60 * 60,
        );
      }
    } catch (error) {
      console.error("Error tracking search:", error);
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
      const searches = (await cacheHelpers.get(userKey)) || [];
      return searches.slice(0, limit);
    } catch (error) {
      console.error("Error getting recent searches:", error);
      return [];
    }
  }

  /**
   * Clear suggestions cache
   * @param {string} pattern - Cache key pattern (optional)
   */
  static async clearCache(pattern = "suggestions:*") {
    try {
      await cacheHelpers.delPattern(pattern);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
}

export default SuggestionsService;
