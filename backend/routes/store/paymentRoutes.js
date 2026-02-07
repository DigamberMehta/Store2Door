import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import Payment from "../../models/Payment.js";
import Order from "../../models/Order.js";
import Store from "../../models/Store.js";
import { getManagerStoreOrFail } from "../../utils/storeHelpers.js";
import { getPaginationParams } from "../../utils/pagination.js";

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
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return;
    const storeId = store._id;

    const { status, period = "all", startDate, endDate } = req.query;
    const { page, limit } = getPaginationParams(req.query, 10);

    // Build date filter based on period or custom date range
    let dateFilter = {};
    const now = new Date();

    if (period === "custom" && startDate && endDate) {
      // Custom date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      };
    } else if (period === "week") {
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
          select: "orderNumber total status items paymentSplit",
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

    // Calculate statistics (using storeAmount from paymentSplit, excluding refunded orders)
    const [statsResult] = await Payment.aggregate([
      { $match: { orderId: { $in: orderIds }, ...dateFilter } },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$order.status", "refunded"] },
                  ],
                },
                "$order.paymentSplit.storeAmount",
                0,
              ],
            },
          },
          pendingEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$status", "pending"] },
                "$order.paymentSplit.storeAmount",
                0,
              ],
            },
          },
          successfulCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$order.status", "refunded"] },
                  ],
                },
                1,
                0,
              ],
            },
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
                    { $eq: ["$order.status", "refunded"] },
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
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$order.status", "refunded"] },
                  ],
                },
                "$order.paymentSplit.storeAmount",
                null,
              ],
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
