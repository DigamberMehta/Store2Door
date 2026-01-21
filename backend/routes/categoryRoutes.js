import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  getSubcategories,
  getFeaturedCategories,
  searchCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/search", searchCategories);
router.get("/featured", getFeaturedCategories);
router.get("/:slug/subcategories", getSubcategories);
router.get("/:slug", getCategoryBySlug);
router.get("/", getCategories);

export default router;
