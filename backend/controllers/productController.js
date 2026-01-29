import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { asyncHandler } from "../middleware/validation.js";
import { expandQueryWithSynonyms } from "../config/synonyms.js";
import fuzzysort from "fuzzysort";

/**
 * @desc Get all products with filters
 * @route GET /api/products
 * @access Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    subcategory,
    storeId,
    featured,
    onSale,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = { isActive: true, isAvailable: true };

  // Filters
  if (category) {
    query.category = category;
  }
  if (subcategory) {
    query.subcategory = subcategory;
  }
  if (storeId) {
    query.storeId = storeId;
  }
  if (featured === "true") {
    query.isFeatured = true;
  }
  if (onSale === "true") {
    query.isOnSale = true;
    query.saleEndDate = { $gte: new Date() };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = order === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("-__v")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc Get product by ID and slug
 * @route GET /api/products/:id/:slug
 * @access Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id, slug } = req.params;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Find by ID and optionally verify slug
  let product = await Product.findById(id);
  if (!product) {
    product = await Product.findOne({ slug });
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * @desc Get products by category slug
 * @route GET /api/products/category/:slug
 * @access Public
 */
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = "averageRating",
    order = "desc",
  } = req.query;

  // Find category
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = {
    categoryId: category._id,
    isActive: true,
    isAvailable: true,
  };

  const sortOptions = {};
  sortOptions[sortBy] = order === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("-__v")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    category: {
      name: category.name,
      slug: category.slug,
      description: category.description,
    },
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc Get featured products
 * @route GET /api/products/featured
 * @access Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.find({
    isFeatured: true,
    isActive: true,
    isAvailable: true,
  })
    .select("-__v")
    .sort({ averageRating: -1, totalSold: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: products,
  });
});

/**
 * @desc Get products on sale
 * @route GET /api/products/on-sale
 * @access Public
 */
export const getProductsOnSale = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    isOnSale: true,
    isActive: true,
    isAvailable: true,
    saleEndDate: { $gte: new Date() },
  };

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("-__v")
      .sort({ discount: -1, averageRating: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc Search products
 * @route GET /api/products/search
 * @access Public
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const searchRegex = new RegExp(q, "i");

  const query = {
    isActive: true,
    isAvailable: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { shortDescription: searchRegex },
      { category: searchRegex },
      { subcategory: searchRegex },
      { tags: searchRegex },
    ],
  };

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("-__v")
      .sort({ averageRating: -1, totalSold: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: products,
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
 * @desc Get store products with search context prioritization
 * @route GET /api/products/store/:storeId/context
 * @access Public
 */
export const getStoreProductsWithContext = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { query = "", category = "", limit = 50 } = req.query;

  // Fetch all active products from this store
  const allProducts = await Product.find({
    storeId,
    isActive: true,
    isAvailable: true,
  })
    .select(
      "name description shortDescription category subcategory price images tags averageRating totalSold",
    )
    .lean();

  if (!allProducts.length) {
    return res.status(200).json({
      success: true,
      data: {
        matchingProducts: [],
        categoryProducts: [],
        otherProducts: [],
        searchContext: { query, category },
      },
    });
  }

  let matchingProducts = [];
  let categoryProducts = [];
  let otherProducts = [];

  if (query && query.trim()) {
    // Expand query with synonyms
    const queryVariations = expandQueryWithSynonyms(query.toLowerCase().trim());
    const searchTerms = queryVariations.join(" ");

    // Use fuzzy matching to find products that match the search query
    allProducts.forEach((product) => {
      // Check if product matches the search query
      const nameMatch = fuzzysort.single(query, product.name);
      const descMatch = fuzzysort.single(query, product.description || "");
      const tagsMatch = product.tags
        ? fuzzysort.go(query, product.tags, { threshold: -5000 })
        : [];

      const bestScore = Math.max(
        nameMatch?.score || -Infinity,
        descMatch?.score || -Infinity,
        tagsMatch.length > 0 ? tagsMatch[0].score : -Infinity,
      );

      // If product matches search query (high fuzzy score or contains query terms)
      const containsQuery =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.tags?.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase()),
        );

      if (bestScore > -5000 || containsQuery) {
        matchingProducts.push({ ...product, matchScore: bestScore });
      } else if (category && product.category === category) {
        categoryProducts.push(product);
      } else if (category && product.subcategory === category) {
        categoryProducts.push(product);
      } else {
        otherProducts.push(product);
      }
    });

    // Sort matching products by relevance
    matchingProducts.sort((a, b) => {
      // Prioritize exact prefix matches
      const aPrefix = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bPrefix = b.name.toLowerCase().startsWith(query.toLowerCase());
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;

      // Then by match score
      return b.matchScore - a.matchScore;
    });

    // Remove matchScore before sending to client
    matchingProducts = matchingProducts.map(
      ({ matchScore, ...product }) => product,
    );
  } else if (category) {
    // If only category is provided (no search query)
    allProducts.forEach((product) => {
      if (product.category === category || product.subcategory === category) {
        categoryProducts.push(product);
      } else {
        otherProducts.push(product);
      }
    });
  } else {
    // No search context - return all products as "other"
    otherProducts = allProducts;
  }

  // Limit results
  const limitNum = parseInt(limit);
  const response = {
    matchingProducts: matchingProducts.slice(0, limitNum),
    categoryProducts: categoryProducts.slice(
      0,
      limitNum - matchingProducts.length,
    ),
    otherProducts: otherProducts.slice(
      0,
      limitNum - matchingProducts.length - categoryProducts.length,
    ),
    searchContext: { query, category },
    totalMatching: matchingProducts.length,
    totalCategory: categoryProducts.length,
    totalOther: otherProducts.length,
  };

  res.status(200).json({
    success: true,
    data: response,
  });
});

/**
 * @desc Create new product (Store Manager)
 * @route POST /api/managers/products
 * @access Private (Store Manager)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const storeId = req.user.storeId;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "Store ID not found for this user",
    });
  }

  // Validate category exists
  if (req.body.categoryId) {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }
  }

  // Get platform markup settings
  const PlatformSettings = (await import("../models/PlatformSettings.js"))
    .default;
  const settings = await PlatformSettings.findOne({ isActive: true });
  const markupPercentage = settings?.markupPercentage || 20;

  // Add storeId and prepare pricing
  const productData = {
    ...req.body,
    storeId,
    markupPercentage,
  };

  // Handle both 'price' and 'wholesalePrice' for backward compatibility
  if (req.body.price && !req.body.wholesalePrice) {
    productData.wholesalePrice = req.body.price;
  }

  // Handle originalPrice → originalWholesalePrice for backward compatibility
  if (req.body.originalPrice && !req.body.originalWholesalePrice) {
    productData.originalWholesalePrice = req.body.originalPrice;
  }

  // Calculate retailPrice and originalRetailPrice (also done in pre-save hook)
  const markupMultiplier = 1 + markupPercentage / 100;

  if (productData.wholesalePrice) {
    productData.retailPrice =
      Math.round(productData.wholesalePrice * markupMultiplier * 100) / 100;
  }

  if (productData.originalWholesalePrice) {
    productData.originalRetailPrice =
      Math.round(productData.originalWholesalePrice * markupMultiplier * 100) /
      100;
  }

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

/**
 * @desc Update product (Store Manager)
 * @route PUT /api/managers/products/:id
 * @access Private (Store Manager)
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const storeId = req.user.storeId;

  // Find product and verify ownership
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (product.storeId.toString() !== storeId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this product",
    });
  }

  // Validate category if being updated
  if (req.body.categoryId) {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }
  }

  // Get platform settings for markup calculation
  const PlatformSettings = (await import("../models/PlatformSettings.js"))
    .default;
  const settings = await PlatformSettings.findOne({ isActive: true });
  const markupPercentage = settings?.markupPercentage || 20;
  const markupMultiplier = 1 + markupPercentage / 100;

  // Handle price updates with markup calculation
  const updateData = { ...req.body };

  // If wholesalePrice is being updated, calculate retailPrice
  if (updateData.wholesalePrice) {
    updateData.retailPrice =
      Math.round(updateData.wholesalePrice * markupMultiplier * 100) / 100;
    updateData.markupPercentage = markupPercentage;
  }
  // Handle backward compatibility: if 'price' is sent, treat it as wholesalePrice
  else if (updateData.price) {
    updateData.wholesalePrice = updateData.price;
    updateData.retailPrice =
      Math.round(updateData.price * markupMultiplier * 100) / 100;
    updateData.markupPercentage = markupPercentage;
  }

  // If originalWholesalePrice is being updated, calculate originalRetailPrice
  if (updateData.originalWholesalePrice) {
    updateData.originalRetailPrice =
      Math.round(updateData.originalWholesalePrice * markupMultiplier * 100) /
      100;
  }
  // Handle backward compatibility: if 'originalPrice' is sent, treat it as originalWholesalePrice
  else if (updateData.originalPrice) {
    updateData.originalWholesalePrice = updateData.originalPrice;
    updateData.originalRetailPrice =
      Math.round(updateData.originalPrice * markupMultiplier * 100) / 100;
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});

/**
 * @desc Delete product (Store Manager)
 * @route DELETE /api/managers/products/:id
 * @access Private (Store Manager)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const storeId = req.user.storeId;

  // Find product and verify ownership
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (product.storeId.toString() !== storeId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this product",
    });
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
