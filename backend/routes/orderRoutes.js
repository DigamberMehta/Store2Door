import express from "express";
import * as orderController from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new order
router.post("/", orderController.createOrder);

// Get all orders for user
router.get("/", orderController.getOrders);

// Get single order
router.get("/:orderId", orderController.getOrder);

// Cancel order
router.post("/:orderId/cancel", orderController.cancelOrder);

// Track order
router.get("/:orderId/track", orderController.trackOrder);

// Update order status (Admin/Rider only - add role check middleware if needed)
router.patch("/:orderId/status", orderController.updateOrderStatus);

export default router;
