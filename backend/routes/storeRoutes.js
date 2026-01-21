import express from "express";
import {
  getStores,
  getStoreById,
  getStoresByCategory,
  getFeaturedStores,
  searchStores,
  getNearbyStores,
} from "../controllers/storeController.js";

const router = express.Router();

// Public routes
router.get("/search", searchStores);
router.get("/featured", getFeaturedStores);
router.get("/nearby", getNearbyStores);
router.get("/category/:category", getStoresByCategory);
router.get("/:identifier", getStoreById);
router.get("/", getStores);

export default router;
