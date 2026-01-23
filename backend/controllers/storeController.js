import Store from "../models/Store.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/validation.js";
import fuzzysort from "fuzzysort";
import { expandQueryWithSynonyms } from "../config/synonyms.js";

/**
 * @desc Get all stores with filters
 * @route GET /api/stores
 * @access Public
 */
export const getStores = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    isOpen,
    featured,
    sortBy = "rating",
    order = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = { isActive: true };

  // Filters
  if (category) {
    query.categories = { $in: [category] };
  }
  if (isOpen === "true") {
    query.isOpen = true;
  }
  if (featured === "true") {
    query.isFeatured = true;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = order === "asc" ? 1 : -1;

  const [stores, total] = await Promise.all([
    Store.find(query)
      .select("-__v")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Store.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: stores,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc Get store by ID or slug
 * @route GET /api/stores/:identifier
 * @access Public
 */
export const getStoreById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  let store;

  // Check if identifier is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    store = await Store.findById(identifier);
  }

  // If not found by ID or not a valid ObjectId, try slug
  if (!store) {
    store = await Store.findOne({ slug: identifier, isActive: true });
  }

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found",
    });
  }

  res.status(200).json({
    success: true,
    data: store,
  });
});

/**
 * @desc Get stores by category
 * @route GET /api/stores/category/:category
 * @access Public
 */
export const getStoresByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [stores, total] = await Promise.all([
    Store.find({
      categories: { $in: [category] },
      isActive: true,
    })
      .select("-__v")
      .sort({ rating: -1, totalOrders: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Store.countDocuments({
      categories: { $in: [category] },
      isActive: true,
    }),
  ]);

  res.status(200).json({
    success: true,
    data: stores,
    category,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc Get featured stores
 * @route GET /api/stores/featured
 * @access Public
 */
export const getFeaturedStores = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const stores = await Store.find({
    isFeatured: true,
    isActive: true,
  })
    .select("-__v")
    .sort({ rating: -1, totalOrders: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: stores,
  });
});

/**
 * @desc Search stores
 * @route GET /api/stores/search
 * @access Public
 */
export const searchStores = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  console.log(`🔍 Store Search Request: "${q}"`);

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Expand query with synonyms for better results
  const queryVariations = expandQueryWithSynonyms(q);
  const searchTerms = queryVariations.join(" ");

  // 1. Find products matching the query using text search (much faster than regex)
  const matchingProducts = await Product.find({
    isActive: true,
    $text: { $search: searchTerms },
  })
    .select("storeId name")
    .sort({ score: { $meta: "textScore" }, popularity: -1 })
    .limit(1000);

  const productStoreIds = [
    ...new Set(matchingProducts.map((p) => p.storeId.toString())),
  ];

  // 2. Build store query: matching store details OR selling matching products
  const query = {
    isActive: true,
    $or: [{ _id: { $in: productStoreIds } }, ...queryConditions],
  };

  const allStores = await Store.find(query).select("-__v").limit(100).lean();

  // 3. Apply fuzzy matching and ranking
  const storesWithScore = allStores.map((store) => {
    const nameMatch = fuzzysort.single(q, store.name);
    const descMatch = fuzzysort.single(q, store.description || "");
    const categoryMatch = fuzzysort.single(q, store.category || "");

    // Check if store carries a matching product
    const hasMatchingProduct = productStoreIds.includes(store._id.toString());

    return {
      ...store,
      fuzzyScore: Math.max(
        nameMatch?.score || -Infinity,
        descMatch?.score || -Infinity,
        categoryMatch?.score || -Infinity,
      ),
      hasMatchingProduct,
    };
  });

  // 4. Sort by relevance (product match, then prefix, then fuzzy score, then rating)
  const sortedStores = storesWithScore.sort((a, b) => {
    // Prioritize stores with matching products
    if (a.hasMatchingProduct && !b.hasMatchingProduct) return -1;
    if (!a.hasMatchingProduct && b.hasMatchingProduct) return 1;

    // Then prefix matches
    const aPrefix = a.name.toLowerCase().startsWith(q.toLowerCase());
    const bPrefix = b.name.toLowerCase().startsWith(q.toLowerCase());
    if (aPrefix && !bPrefix) return -1;
    if (!aPrefix && bPrefix) return 1;

    // Then fuzzy score
    if (Math.abs(b.fuzzyScore - a.fuzzyScore) > 100) {
      return b.fuzzyScore - a.fuzzyScore;
    }

    // Finally by rating and orders
    return (
      (b.rating || 0) - (a.rating || 0) ||
      (b.totalOrders || 0) - (a.totalOrders || 0)
    );
  });

  // 5. Paginate
  const total = sortedStores.length;
  const stores = sortedStores.slice(skip, skip + parseInt(limit));

  res.status(200).json({
    success: true,
    data: stores,
    searchQuery: q,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc Get nearby stores (requires location)
 * @route GET /api/stores/nearby
 * @access Public
 */
export const getNearbyStores = asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 5000 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  const stores = await Store.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseInt(maxDistance),
      },
    },
  })
    .select("-__v")
    .limit(20);

  res.status(200).json({
    success: true,
    data: stores,
    location: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: parseInt(maxDistance),
    },
  });
});
