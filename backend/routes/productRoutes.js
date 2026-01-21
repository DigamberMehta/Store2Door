import express from "express";
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getProductsOnSale,
  searchProducts,
} from "../controllers/productController.js";

const router = express.Router();

// Public routes
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/on-sale", getProductsOnSale);
router.get("/category/:slug", getProductsByCategory);
router.get("/:identifier", getProductById);
router.get("/", getProducts);

export default router;
