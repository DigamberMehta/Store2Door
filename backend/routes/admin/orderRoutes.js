import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignRider,
  cancelOrder,
  rejectOrder,
  updateOrderDetails,
  getOrderStats,
  bulkUpdateStatus,
  exportOrders,
  getOrdersRequiringAttention,
} from "../../controllers/adminOrderController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Get all orders with filtering, sorting, and pagination
router.get("/", getAllOrders);

// Get order statistics
router.get("/stats/summary", getOrderStats);

// Get orders requiring attention
router.get("/attention", getOrdersRequiringAttention);

// Export orders
router.get("/export", exportOrders);

// Get order by ID with full details
router.get("/:id", getOrderById);

// Update order status
router.patch("/:id/status", updateOrderStatus);

// Assign rider to order
router.patch("/:id/assign-rider", assignRider);

// Reject order (store/admin cannot fulfill)
router.post("/:id/reject", rejectOrder);

// Cancel order
router.post("/:id/cancel", cancelOrder);

// Update order details (notes, instructions)
router.patch("/:id/details", updateOrderDetails);

// Bulk update order status
router.post("/bulk/update-status", bulkUpdateStatus);

export default router;
