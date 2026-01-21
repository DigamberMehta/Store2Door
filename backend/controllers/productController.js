import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { asyncHandler } from "../middleware/validation.js";

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
    sortBy = 'createdAt',
    order = 'desc',
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
  if (featured === 'true') {
    query.isFeatured = true;
  }
  if (onSale === 'true') {
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
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .select('-__v')
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
 * @desc Get product by ID or slug
 * @route GET /api/products/:identifier
 * @access Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  // Try to find by ID first, then by slug
  let product = await Product.findById(identifier);
  if (!product) {
    product = await Product.findOne({ slug: identifier });
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
  const { page = 1, limit = 20, sortBy = 'averageRating', order = 'desc' } = req.query;

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
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .select('-__v')
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
    .select('-__v')
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
      .select('-__v')
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
  const searchRegex = new RegExp(q, 'i');

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
      .select('-__v')
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
