import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats,
  getActiveCoupons,
  validateCoupon,
} from "../controllers/couponController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// User routes - require authentication
router.use(authenticate);

// Get active coupons for user
router.get("/active", getActiveCoupons);

// Validate coupon code
router.post("/validate", validateCoupon);

// Admin routes - TODO: Add admin middleware when available
// For now, all authenticated users can access (update this later)

// Get all coupons (with filters)
router.get("/admin/all", getAllCoupons);

// Get single coupon by ID
router.get("/admin/:id", getCouponById);

// Create new coupon
router.post("/admin", createCoupon);

// Update coupon
router.put("/admin/:id", updateCoupon);

// Delete (deactivate) coupon
router.delete("/admin/:id", deleteCoupon);

// Toggle coupon active status
router.patch("/admin/:id/toggle", toggleCouponStatus);

// Get coupon statistics
router.get("/admin/:id/stats", getCouponStats);

export default router;
