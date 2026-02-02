import express from "express";
import {
  getDashboardStats,
  getRecentOrders,
  getTopStores,
  getPlatformEarnings,
  getActivityData,
  getRecentReviews,
} from "../../controllers/adminDashboardController.js";

const router = express.Router();

// Note: Authentication and admin authorization are handled by parent router

// Dashboard statistics
router.get("/stats", getDashboardStats);

// Recent orders
router.get("/recent-orders", getRecentOrders);

// Top stores
router.get("/top-stores", getTopStores);

// Platform earnings
router.get("/earnings", getPlatformEarnings);

// Activity data for charts
router.get("/activity", getActivityData);

// Recent reviews
router.get("/recent-reviews", getRecentReviews);

export default router;
