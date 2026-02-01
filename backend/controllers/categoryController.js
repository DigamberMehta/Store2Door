import Category from "../models/Category.js";
import { asyncHandler } from "../middleware/validation.js";
import { cacheHelpers } from "../config/redis.js";

// Cache TTL in seconds
const CACHE_TTL = {
  CATEGORIES: 3600, // 1 hour
  CATEGORY_DETAIL: 1800, // 30 minutes
};

/**
 * @desc Get all parent categories
 * @route GET /api/categories
 * @access Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const cacheKey = "categories:all";

  // Try cache first
  let categories = await cacheHelpers.get(cacheKey);

  if (!categories) {
    categories = await Category.find({
      level: 1,
      isActive: true,
      isVisible: true,
    })
      .select(
        "name slug description icon image color isFeatured displayOrder productCount",
      )
      .sort({ displayOrder: 1 })
      .lean();

    // Cache the results
    await cacheHelpers.set(cacheKey, categories, CACHE_TTL.CATEGORIES);
  }

  res.status(200).json({
    success: true,
    data: categories,
  });
});

/**
 * @desc Get category by slug with subcategories
 * @route GET /api/categories/:slug
 * @access Public
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `categories:${slug}`;

  // Try cache first
  let cached = await cacheHelpers.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      data: cached,
    });
  }

  const category = await Category.findOne({
    slug,
    isActive: true,
    isVisible: true,
  }).lean();

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Get subcategories if it's a parent category
  let subcategories = [];
  if (category.level === 1) {
    subcategories = await Category.find({
      parentId: category._id,
      isActive: true,
      isVisible: true,
    })
      .select("name slug description icon image displayOrder productCount")
      .sort({ displayOrder: 1 })
      .lean();
  }

  const result = {
    category,
    subcategories,
  };

  // Cache the results
  await cacheHelpers.set(cacheKey, result, CACHE_TTL.CATEGORY_DETAIL);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc Get subcategories by parent category slug
 * @route GET /api/categories/:slug/subcategories
 * @access Public
 */
export const getSubcategories = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `categories:${slug}:subcategories`;

  // Try cache first
  let subcategories = await cacheHelpers.get(cacheKey);

  if (!subcategories) {
    const parentCategory = await Category.findOne({
      slug,
      level: 1,
      isActive: true,
    }).lean();

    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    subcategories = await Category.find({
      parentId: parentCategory._id,
      isActive: true,
      isVisible: true,
    })
      .select("name slug description icon image displayOrder productCount")
      .sort({ displayOrder: 1 })
      .lean();

    // Cache the results
    await cacheHelpers.set(cacheKey, subcategories, CACHE_TTL.CATEGORIES);
  }

  res.status(200).json({
    success: true,
    data: subcategories,
  });
});

/**
 * @desc Get featured categories
 * @route GET /api/categories/featured
 * @access Public
 */
export const getFeaturedCategories = asyncHandler(async (req, res) => {
  const cacheKey = "categories:featured";

  // Try cache first
  let categories = await cacheHelpers.get(cacheKey);

  if (!categories) {
    categories = await Category.find({
      isFeatured: true,
      isActive: true,
      isVisible: true,
    })
      .select(
        "name slug description icon image color displayOrder productCount level parentId",
      )
      .sort({ displayOrder: 1 })
      .limit(20)
      .lean();

    // Cache the results
    await cacheHelpers.set(cacheKey, categories, CACHE_TTL.CATEGORIES);
  }

  res.status(200).json({
    success: true,
    data: categories,
  });
});

/**
 * @desc Search categories
 * @route GET /api/categories/search
 * @access Public
 */
export const searchCategories = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters",
    });
  }

  const searchRegex = new RegExp(q, "i");

  const categories = await Category.find({
    isActive: true,
    isVisible: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { tags: searchRegex },
      { searchKeywords: searchRegex },
    ],
  })
    .select(
      "name slug description icon image level parentId displayOrder productCount",
    )
    .sort({ productCount: -1, displayOrder: 1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: categories,
  });
});
