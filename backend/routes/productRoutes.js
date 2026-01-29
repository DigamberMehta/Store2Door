import express from "express";
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getProductsOnSale,
  searchProducts,
  getStoreProductsWithContext,
} from "../controllers/productController.js";

const router = express.Router();

// Public routes - retailPrice from DB includes markup for customers
router.get("/search", searchProducts);
router.get("/store/:storeId/context", getStoreProductsWithContext);
router.get("/featured", getFeaturedProducts);
router.get("/on-sale", getProductsOnSale);
router.get("/category/:slug", getProductsByCategory);
router.get("/:id/:slug", getProductById);
router.get("/", getProducts);

export default router;
