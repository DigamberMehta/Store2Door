import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/productController.js";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

// Get own store products
router.get("/", async (req, res) => {
  // TODO: Implement get own products
  res.json({ success: true, message: "Get store products endpoint" });
});

// Get product by ID
router.get("/:id", async (req, res) => {
  // TODO: Implement get product by ID
  res.json({ success: true, message: "Get product by ID endpoint" });
});

// Create new product
router.post("/", createProduct);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

// Toggle product active status
router.patch("/:id/toggle-active", async (req, res) => {
  // TODO: Implement toggle active
  res.json({ success: true, message: "Toggle product active endpoint" });
});

// Update product stock
router.patch("/:id/stock", async (req, res) => {
  // TODO: Implement update stock
  res.json({ success: true, message: "Update product stock endpoint" });
});

export default router;
