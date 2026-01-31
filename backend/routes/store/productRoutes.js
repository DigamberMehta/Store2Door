import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import { uploadMultiple } from "../../middleware/upload.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getStoreProducts,
  toggleProductActive,
  updateProductStock,
  getStoreProductById,
} from "../../controllers/productController.js";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

// Get own store products
router.get("/", getStoreProducts);

// Get product by ID
router.get("/:id", getStoreProductById);

// Create new product (with image upload support)
router.post("/", uploadMultiple("images", 10), createProduct);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

// Toggle product active status
router.patch("/:id/toggle-active", toggleProductActive);

// Update product stock
router.patch("/:id/stock", updateProductStock);

export default router;
