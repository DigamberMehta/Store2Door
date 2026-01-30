import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import Payment from "../../models/Payment.js";
import Order from "../../models/Order.js";
import Store from "../../models/Store.js";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

/**
 * Get store's payment transactions
 * GET /api/store/payments
 */
router.get("/", async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const { page = 1, limit = 10, status, period = "all" } = req.query;

    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();
    
    if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (period === "year") {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: yearAgo } };
    }

    // Find all orders for this store
    const storeOrders = await Order.find({ storeId }).select("_id");
    const orderIds = storeOrders.map((order) => order._id);

    // Build query for payments
    const query = {
      orderId: { $in: orderIds },
      ...dateFilter,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate({
          path: "orderId",
          select: "orderNumber total status items",
          populate: {
            path: "items.productId",
            select: "name",
          },
        })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);

    // Calculate statistics
    const [statsResult] = await Payment.aggregate([
      { $match: { orderId: { $in: orderIds }, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $cond: [{ $eq: ["$status", "succeeded"] }, "$amount", 0],
            },
          },
          pendingEarnings: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
            },
          },
          successfulCount: {
            $sum: { $cond: [{ $eq: ["$status", "succeeded"] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          refundedCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "refunded"] },
                    { $eq: ["$status", "partially_refunded"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalCount: { $sum: 1 },
          averageOrderValue: {
            $avg: {
              $cond: [{ $eq: ["$status", "succeeded"] }, "$amount", null],
            },
          },
        },
      },
    ]);

    const stats = statsResult || {
      totalEarnings: 0,
      pendingEarnings: 0,
      successfulCount: 0,
      failedCount: 0,
      refundedCount: 0,
      totalCount: 0,
      averageOrderValue: 0,
    };

    res.json({
      success: true,
      data: payments,
      stats: {
        totalEarnings: stats.totalEarnings || 0,
        pendingEarnings: stats.pendingEarnings || 0,
        paidEarnings: stats.totalEarnings - stats.pendingEarnings || 0,
        totalOrders: stats.totalCount || 0,
        successfulPayments: stats.successfulCount || 0,
        failedPayments: stats.failedCount || 0,
        refundedPayments: stats.refundedCount || 0,
        averageOrderValue: stats.averageOrderValue || 0,
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching store payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
});

export default router;
