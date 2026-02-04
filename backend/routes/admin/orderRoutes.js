import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import Order from "../../models/Order.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Get all orders
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name email phone")
        .populate("storeId", "name address phone")
        .populate("riderId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  // TODO: Implement get order by ID
  res.json({ success: true, message: "Get order by ID endpoint" });
});

// Track order
router.get("/:id/track", async (req, res) => {
  // TODO: Implement track order
  res.json({ success: true, message: "Track order endpoint" });
});

// Update order status
router.patch("/:id/status", async (req, res) => {
  // TODO: Implement update order status
  res.json({ success: true, message: "Update order status endpoint" });
});

// Cancel order
router.post("/:id/cancel", async (req, res) => {
  // TODO: Implement cancel order
  res.json({ success: true, message: "Cancel order endpoint" });
});

// Get order statistics
router.get("/stats/summary", async (req, res) => {
  // TODO: Implement get order stats
  res.json({ success: true, message: "Get order stats endpoint" });
});

export default router;
