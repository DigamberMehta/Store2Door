import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  getStoreOrders,
  getOrderDetails,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
  rejectOrder,
} from "../../controllers/store/storeOrderController.js";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

// Get order statistics
router.get("/stats", getOrderStats);

// Get store orders (with filters)
router.get("/", getStoreOrders);

// Get order by ID
router.get("/:orderId", getOrderDetails);

// Update order status
router.patch("/:orderId/status", updateOrderStatus);

// Cancel order
router.post("/:orderId/cancel", cancelOrder);

// Reject order
router.post("/:orderId/reject", rejectOrder);

export default router;
