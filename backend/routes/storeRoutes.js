import express from "express";
import {
  getStores,
  getStoreById,
  getStoresByCategory,
  getFeaturedStores,
  searchStores,
  getNearbyStores,
  getStoreTransactions,
  getStoreEarnings,
  createStoreWithdrawal,
  getStoreBalance,
} from "../controllers/storeController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/search", searchStores);
router.get("/featured", getFeaturedStores);
router.get("/nearby", getNearbyStores);
router.get("/category/:category", getStoresByCategory);

// Store financial routes (protected)
router.get("/:id/transactions", authenticate, getStoreTransactions);
router.get("/:id/earnings", authenticate, getStoreEarnings);
router.get("/:id/balance", authenticate, getStoreBalance);
router.post("/:id/withdrawals", authenticate, createStoreWithdrawal);

router.get("/:identifier", getStoreById);
router.get("/", getStores);

export default router;
