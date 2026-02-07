import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/validation.js";
import fuzzysort from "fuzzysort";
import { expandQueryWithSynonyms } from "../config/synonyms.js";
import DeliverySettings from "../models/DeliverySettings.js";
import { cacheHelpers } from "../config/redis.js";
import {
  calculateDistance,
  calculateDeliveryCharge,
} from "../utils/distanceCalculator.js";

// Cache TTL in seconds
const CACHE_TTL = {
  STORES: 1800, // 30 minutes
  STORE_DETAIL: 900, // 15 minutes
  DELIVERY_SETTINGS: 3600, // 1 hour
};

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
    userLat,
    userLon,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Generate cache key based on filters
  const cacheKey = `stores:${category || "all"}:${isOpen}:${featured}:${page}:${limit}`;

  // Try cache first (only if no user location provided)
  let cachedResult = null;
  if (!userLat || !userLon) {
    cachedResult = await cacheHelpers.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }
  }

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

  // Get delivery settings (with caching)
  const deliverySettingsCacheKey = "delivery:settings";
  let deliverySettings = await cacheHelpers.get(deliverySettingsCacheKey);

  if (!deliverySettings) {
    deliverySettings = await DeliverySettings.findOne({
      isActive: true,
    }).lean();
    await cacheHelpers.set(
      deliverySettingsCacheKey,
      deliverySettings,
      CACHE_TTL.DELIVERY_SETTINGS,
    );
  }

  const maxDistance = deliverySettings?.maxDeliveryDistance || 7;

  // Fetch all stores matching the query
  let stores = await Store.find(query).select("-__v").lean();

  // Calculate distance and filter by max delivery distance if user location provided
  if (userLat && userLon) {
    const userLatNum = parseFloat(userLat);
    const userLonNum = parseFloat(userLon);

    if (!isNaN(userLatNum) && !isNaN(userLonNum)) {
      stores = stores
        .map((store) => {
          const storeLat = store.address?.latitude;
          const storeLon = store.address?.longitude;

          if (!storeLat || !storeLon) {
            return null;
          }

          const distance = calculateDistance(
            userLatNum,
            userLonNum,
            storeLat,
            storeLon,
          );

          // Filter out stores beyond max delivery distance
          if (distance > maxDistance) {
            return null;
          }

          // Calculate delivery charge
          const deliveryCharge = deliverySettings
            ? calculateDeliveryCharge(distance, deliverySettings.distanceTiers)
            : 0;

          return {
            ...store,
            distance,
            deliveryCharge,
            currency: deliverySettings?.currency || "R",
          };
        })
        .filter((store) => store !== null);

      // Sort by distance if user location is provided
      if (sortBy === "distance" || (userLat && userLon)) {
        stores.sort((a, b) => a.distance - b.distance);
      }
    }
  }

  // Apply sorting if not sorted by distance
  if (sortBy !== "distance" && !(userLat && userLon)) {
    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;
    stores.sort((a, b) => {
      if (order === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      }
      return a[sortBy] < b[sortBy] ? 1 : -1;
    });
  }

  // Apply pagination
  const total = stores.length;
  const paginatedStores = stores.slice(skip, skip + parseInt(limit));

  const result = {
    success: true,
    data: paginatedStores,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
    deliverySettings: deliverySettings
      ? {
          maxDeliveryDistance: deliverySettings.maxDeliveryDistance,
          currency: deliverySettings.currency,
          distanceTiers: deliverySettings.distanceTiers,
        }
      : null,
  };

  // Cache result if no user location provided
  if (!userLat || !userLon) {
    await cacheHelpers.set(cacheKey, result, CACHE_TTL.STORES);
  }

  res.status(200).json(result);
});

/**
 * @desc Get store by ID or slug
 * @route GET /api/stores/:identifier
 * @access Public
 */
export const getStoreById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const { userLat, userLon } = req.query;

  // Generate cache key
  const cacheKey = `stores:${identifier}`;

  // Try cache first (only if no user location provided)
  let store = null;
  if (!userLat || !userLon) {
    const cached = await cacheHelpers.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  // Check if identifier is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    store = await Store.findById(identifier).lean();
  }

  // If not found by ID or not a valid ObjectId, try slug
  if (!store) {
    store = await Store.findOne({ slug: identifier, isActive: true }).lean();
  }

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found",
    });
  }

  // Calculate distance if user location provided
  if (
    userLat &&
    userLon &&
    store.address?.latitude &&
    store.address?.longitude
  ) {
    const userLatNum = parseFloat(userLat);
    const userLonNum = parseFloat(userLon);

    if (!isNaN(userLatNum) && !isNaN(userLonNum)) {
      const distance = calculateDistance(
        userLatNum,
        userLonNum,
        store.address.latitude,
        store.address.longitude,
      );

      // Get delivery settings for charge calculation (with caching)
      const deliverySettingsCacheKey = "delivery:settings";
      let deliverySettings = await cacheHelpers.get(deliverySettingsCacheKey);

      if (!deliverySettings) {
        deliverySettings = await DeliverySettings.findOne({
          isActive: true,
        }).lean();
        await cacheHelpers.set(
          deliverySettingsCacheKey,
          deliverySettings,
          CACHE_TTL.DELIVERY_SETTINGS,
        );
      }

      const deliveryCharge = deliverySettings
        ? calculateDeliveryCharge(distance, deliverySettings.distanceTiers)
        : 0;

      store.distance = distance;
      store.deliveryCharge = deliveryCharge;
      store.currency = deliverySettings?.currency || "R";
    }
  }

  const result = {
    success: true,
    data: store,
  };

  // Cache result if no user location provided
  if (!userLat || !userLon) {
    await cacheHelpers.set(cacheKey, result, CACHE_TTL.STORE_DETAIL);
  }

  res.status(200).json(result);
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

/**
 * @desc    Get own store information (full)
 * @route   GET /api/managers/stores/my
 * @access  Private (Store Manager)
 */
export const getMyStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found for this manager",
    });
  }

  res.json({
    success: true,
    data: store,
  });
});

/**
 * @desc    Get own store profile (basic info)
 * @route   GET /api/managers/stores/my/profile
 * @access  Private (Store Manager)
 */
export const getMyStoreProfile = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id }).select(
    "name description logo coverImage businessLicense taxId businessType",
  );

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found for this manager",
    });
  }

  res.json({
    success: true,
    data: store,
  });
});

/**
 * @desc    Get own store location & contact info
 * @route   GET /api/managers/stores/my/location
 * @access  Private (Store Manager)
 */
export const getMyStoreLocation = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id }).select(
    "address contactInfo",
  );

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found for this manager",
    });
  }

  res.json({
    success: true,
    data: store,
  });
});

/**
 * @desc    Get own store features
 * @route   GET /api/managers/stores/my/features
 * @access  Private (Store Manager)
 */
export const getMyStoreFeatures = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id }).select(
    "features",
  );

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found for this manager",
    });
  }

  res.json({
    success: true,
    data: store,
  });
});

/**
 * @desc    Get own store bank account details
 * @route   GET /api/managers/stores/my/bank-account
 * @access  Private (Store Manager)
 */
export const getMyStoreBankAccount = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id }).select(
    "accountHolderName bankName accountNumber accountType branchCode",
  );

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found for this manager",
    });
  }

  res.json({
    success: true,
    data: store,
  });
});

/**
 * @desc    Get own store operating hours
 * @route   GET /api/managers/stores/my/operating-hours
 * @access  Private (Store Manager)
 */
export const getMyStoreOperatingHours = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id }).select(
    "operatingHours",
  );

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found for this manager",
    });
  }

  res.json({
    success: true,
    data: store,
  });
});

/**
 * @desc    Update store operating hours
 * @route   PUT /api/managers/stores/my/operating-hours
 * @access  Private (Store Manager)
 */
export const updateOperatingHours = asyncHandler(async (req, res) => {
  const { operatingHours } = req.body;

  if (!operatingHours || !Array.isArray(operatingHours)) {
    return res.status(400).json({
      success: false,
      message: "Operating hours must be an array",
    });
  }

  const store = await Store.findOne({ managerId: req.user._id });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found",
    });
  }

  store.operatingHours = operatingHours;
  await store.save();

  res.json({
    success: true,
    message: "Operating hours updated successfully",
    data: { operatingHours: store.operatingHours },
  });
});

/**
 * @desc    Update store delivery settings
 * @route   PUT /api/managers/stores/my/delivery-settings
 * @access  Private (Store Manager)
 */
export const updateDeliverySettings = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found",
    });
  }

  const {
    deliveryRadius,
    minimumOrder,
    deliveryFee,
    freeDeliveryAbove,
    averagePreparationTime,
    maxOrdersPerHour,
  } = req.body;

  // Update delivery settings
  if (deliveryRadius !== undefined) {
    store.deliverySettings.deliveryRadius = deliveryRadius;
  }
  if (minimumOrder !== undefined) {
    store.deliverySettings.minimumOrder = minimumOrder;
  }
  if (deliveryFee !== undefined) {
    store.deliverySettings.deliveryFee = deliveryFee;
  }
  if (freeDeliveryAbove !== undefined) {
    store.deliverySettings.freeDeliveryAbove = freeDeliveryAbove;
  }
  if (averagePreparationTime !== undefined) {
    store.deliverySettings.averagePreparationTime = averagePreparationTime;
  }
  if (maxOrdersPerHour !== undefined) {
    store.deliverySettings.maxOrdersPerHour = maxOrdersPerHour;
  }

  await store.save();

  res.json({
    success: true,
    message: "Delivery settings updated successfully",
    data: { deliverySettings: store.deliverySettings },
  });
});

/**
 * @desc    Get store's transactions (earnings, withdrawals)
 * @route   GET /api/stores/:id/transactions
 * @access  Private (Store Owner)
 */
export const getStoreTransactions = asyncHandler(async (req, res) => {
  const { id: storeId } = req.params;
  const { limit = 50 } = req.query;

  const transactions = await Transaction.find({
    storeId,
    userType: "store",
    status: { $in: ["completed", "pending"] },
  })
    .populate("orderId", "orderNumber items subtotal")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: transactions,
  });
});

/**
 * @desc    Get store's earnings summary
 * @route   GET /api/stores/:id/earnings
 * @access  Private (Store Owner)
 */
export const getStoreEarnings = asyncHandler(async (req, res) => {
  const { id: storeId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeekStart = new Date();
  thisWeekStart.setDate(today.getDate() - today.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  // Get today's earnings (including refund deductions)
  const todayTransactions = await Transaction.find({
    storeId,
    userType: "store",
    type: { $in: ["order_revenue", "refund"] }, // Include refund deductions
    status: "completed",
    createdAt: { $gte: today },
  });

  const todayEarnings = todayTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0,
  );

  // Get this week's earnings (including refund deductions)
  const weekTransactions = await Transaction.find({
    storeId,
    userType: "store",
    type: { $in: ["order_revenue", "refund"] }, // Include refund deductions
    status: "completed",
    createdAt: { $gte: thisWeekStart },
  });

  const weekEarnings = weekTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Get this month's earnings (including refund deductions)
  const monthTransactions = await Transaction.find({
    storeId,
    userType: "store",
    type: { $in: ["order_revenue", "refund"] }, // Include refund deductions
    status: "completed",
    createdAt: { $gte: thisMonthStart },
  });

  const monthEarnings = monthTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0,
  );

  // Get current balance
  const currentBalance = await Transaction.getBalance(storeId, "store");

  // Get total withdrawn
  const withdrawals = await Transaction.find({
    storeId,
    userType: "store",
    type: "withdrawal",
    status: "completed",
  });

  const totalWithdrawn = withdrawals.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0,
  );

  res.json({
    success: true,
    data: {
      currentBalance,
      totalEarnings: currentBalance + totalWithdrawn,
      totalWithdrawn,
      todayEarnings,
      weeklyEarnings: weekEarnings,
      monthlyEarnings: monthEarnings,
      today: {
        earnings: todayEarnings,
        orders: todayTransactions.length,
      },
      week: {
        earnings: weekEarnings,
        orders: weekTransactions.length,
      },
      month: {
        earnings: monthEarnings,
        orders: monthTransactions.length,
      },
    },
  });
});

/**
 * @desc    Create store withdrawal request
 * @route   POST /api/stores/:id/withdrawals
 * @access  Private (Store Owner)
 */
export const createStoreWithdrawal = asyncHandler(async (req, res) => {
  const { id: storeId } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid withdrawal amount",
    });
  }

  const MIN_WITHDRAWAL = 100; // R100 minimum for stores
  if (amount < MIN_WITHDRAWAL) {
    return res.status(400).json({
      success: false,
      message: `Minimum withdrawal amount is R${MIN_WITHDRAWAL}`,
    });
  }

  const currentBalance = await Transaction.getBalance(storeId, "store");

  if (currentBalance < amount) {
    return res.status(400).json({
      success: false,
      message: "Insufficient balance",
      currentBalance,
    });
  }

  const store = await Store.findById(storeId);
  if (!store || !store.bankAccount?.accountNumber) {
    return res.status(400).json({
      success: false,
      message: "Please add bank account details first",
    });
  }

  try {
    const withdrawal = await Transaction.createWithdrawal(
      storeId,
      "store",
      amount,
      `Withdrawal to ${store.bankAccount.bank || "bank"}`,
      {
        storeName: store.name,
        bankAccount: {
          accountNumber: store.bankAccount.accountNumber,
          accountType: store.bankAccount.accountType,
          bank: store.bankAccount.bank,
        },
        requestedAt: new Date(),
      },
    );

    res.status(201).json({
      success: true,
      message: "Withdrawal request created successfully",
      data: withdrawal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create withdrawal",
    });
  }
});

/**
 * @desc    Get store balance
 * @route   GET /api/stores/:id/balance
 * @access  Private (Store Owner)
 */
export const getStoreBalance = asyncHandler(async (req, res) => {
  const { id: storeId } = req.params;

  const balance = await Transaction.getBalance(storeId, "store");

  res.json({
    success: true,
    data: {
      balance,
    },
  });
});
