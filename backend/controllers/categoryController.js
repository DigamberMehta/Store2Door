import Category from "../models/Category.js";
import { asyncHandler } from "../middleware/validation.js";

/**
 * @desc Get all parent categories
 * @route GET /api/categories
 * @access Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ level: 1, isActive: true, isVisible: true })
    .select('name slug description icon image color isFeatured displayOrder productCount')
    .sort({ displayOrder: 1 });

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

  const category = await Category.findOne({ slug, isActive: true, isVisible: true });

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
      isVisible: true 
    })
      .select('name slug description icon image displayOrder productCount')
      .sort({ displayOrder: 1 });
  }

  res.status(200).json({
    success: true,
    data: {
      category,
      subcategories,
    },
  });
});

/**
 * @desc Get subcategories by parent category slug
 * @route GET /api/categories/:slug/subcategories
 * @access Public
 */
export const getSubcategories = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const parentCategory = await Category.findOne({ slug, level: 1, isActive: true });

  if (!parentCategory) {
    return res.status(404).json({
      success: false,
      message: "Parent category not found",
    });
  }

  const subcategories = await Category.find({ 
    parentId: parentCategory._id, 
    isActive: true,
    isVisible: true
  })
    .select('name slug description icon image displayOrder productCount')
    .sort({ displayOrder: 1 });

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
  const categories = await Category.find({ 
    isFeatured: true, 
    isActive: true,
    isVisible: true
  })
    .select('name slug description icon image color displayOrder productCount level parentId')
    .sort({ displayOrder: 1 })
    .limit(20);

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

  const searchRegex = new RegExp(q, 'i');
  
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
    .select('name slug description icon image level parentId displayOrder productCount')
    .sort({ productCount: -1, displayOrder: 1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: categories,
  });
});
