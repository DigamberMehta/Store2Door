import Store from "../models/Store.js";
import { asyncHandler } from "../middleware/validation.js";

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
    sortBy = 'rating',
    order = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = { isActive: true };

  // Filters
  if (category) {
    query.categories = { $in: [category] };
  }
  if (isOpen === 'true') {
    query.isOpen = true;
  }
  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const [stores, total] = await Promise.all([
    Store.find(query)
      .select('-__v')
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

  // Try to find by ID first, then by slug
  let store = await Store.findById(identifier);
  if (!store) {
    store = await Store.findOne({ slug: identifier });
  }

  if (!store || !store.isActive) {
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
      .select('-__v')
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
    .select('-__v')
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

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const searchRegex = new RegExp(q, 'i');

  const query = {
    isActive: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { categories: searchRegex },
    ],
  };

  const [stores, total] = await Promise.all([
    Store.find(query)
      .select('-__v')
      .sort({ rating: -1, totalOrders: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Store.countDocuments(query),
  ]);

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
    .select('-__v')
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
