import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/productController.js";
import { uploadMultiple } from "../../middleware/upload.js";
import Product from "../../models/Product.js";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

// Get own store products
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 100, sortBy = "createdAt", order = "desc" } = req.query;
    const storeId = req.user.storeId;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID not found for this user",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find({ storeId })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments({ storeId }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching store products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;

    const product = await Product.findOne({ _id: id, storeId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

// Create new product
router.post("/", uploadMultiple("images", 10), createProduct);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

// Toggle product active status
router.patch("/:id/toggle-active", async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;

    const product = await Product.findOne({ _id: id, storeId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      data: product,
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling product status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
});

// Update product stock
router.patch("/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    const storeId = req.user.storeId;

    if (typeof stockQuantity !== "number" || stockQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock quantity",
      });
    }

    const product = await Product.findOne({ _id: id, storeId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stockQuantity = stockQuantity;
    product.isAvailable = stockQuantity > 0;
    await product.save();

    res.json({
      success: true,
      data: product,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
});

export default router;
