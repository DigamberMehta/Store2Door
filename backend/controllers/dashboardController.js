import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Store from "../models/Store.js";
import Transaction from "../models/Transaction.js";
import { getManagerStoreOrFail } from "../utils/storeHelpers.js";
import { toObjectId } from "../utils/mongoHelpers.js";

// Get dashboard statistics for store manager
export const getStoreDashboardStats = async (req, res) => {
  try {
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return;
    const storeId = store._id;

    // Get today's date range (UTC)
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

    // Get yesterday's date range (UTC)
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

    // Get last 7 days for sales chart (UTC)
    const last7DaysUTC = new Date(todayUTC);
    last7DaysUTC.setUTCDate(last7DaysUTC.getUTCDate() - 7);

    // Parallel data fetching for performance
    const [
      todayOrders,
      yesterdayOrders,
      recentOrders,
      topProducts,
      last7DaysSales,
      recentReviews,
      totalProducts,
      storeTransactions,
    ] = await Promise.all([
      // Today's orders (exclude fully refunded; include paid & partially refunded with net amounts)
      Order.aggregate([
        {
          $match: {
            storeId: toObjectId(storeId),
            createdAt: { $gte: todayUTC, $lt: tomorrowUTC },
            paymentStatus: { $in: ["succeeded", "paid", "partially_refunded"] },
          },
        },
        // Lookup refund details for partially refunded orders
        {
          $lookup: {
            from: "refunds",
            let: { orderId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$orderId", "$$orderId"] },
                  status: "completed", // Only count completed refunds
                },
              },
              {
                $project: {
                  storeRefundAmount: "$costDistribution.fromStore",
                },
              },
              { $limit: 1 },
            ],
            as: "refundData",
          },
        },
        // Calculate net store amount (subtract refund if any)
        {
          $project: {
            storeAmount: {
              $subtract: [
                "$paymentSplit.storeAmount",
                {
                  $ifNull: [
                    { $arrayElemAt: ["$refundData.storeRefundAmount", 0] },
                    0,
                  ],
                },
              ],
            },
            itemCount: { $size: "$items" },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$storeAmount" }, // Net sales after refunds
            totalOrders: { $sum: 1 },
            totalItems: { $sum: "$itemCount" },
          },
        },
      ]),

      // Yesterday's orders for comparison (exclude fully refunded; net amounts)
      Order.aggregate([
        {
          $match: {
            storeId: toObjectId(storeId),
            createdAt: { $gte: yesterdayUTC, $lt: todayUTC },
            paymentStatus: { $in: ["succeeded", "paid", "partially_refunded"] },
          },
        },
        // Lookup refund details for partially refunded orders
        {
          $lookup: {
            from: "refunds",
            let: { orderId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$orderId", "$$orderId"] },
                  status: "completed",
                },
              },
              {
                $project: {
                  storeRefundAmount: "$costDistribution.fromStore",
                },
              },
              { $limit: 1 },
            ],
            as: "refundData",
          },
        },
        // Calculate net store amount
        {
          $project: {
            storeAmount: {
              $subtract: [
                "$paymentSplit.storeAmount",
                {
                  $ifNull: [
                    { $arrayElemAt: ["$refundData.storeRefundAmount", 0] },
                    0,
                  ],
                },
              ],
            },
            itemCount: { $size: "$items" },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$storeAmount" },
            totalOrders: { $sum: 1 },
            totalItems: { $sum: "$itemCount" },
          },
        },
      ]),

      // Recent orders (last 10)
      Order.find({ storeId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("customerId", "name email")
        .select(
          "orderNumber customerId total items status createdAt paymentSplit",
        ),

      // Top selling products (only successful payments: succeeded, paid, partially_refunded)
      Order.aggregate([
        {
          $match: {
            storeId: toObjectId(storeId),
            paymentStatus: { $in: ["succeeded", "paid", "partially_refunded"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.totalPrice" },
            image: { $first: "$items.image" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            totalSold: 1,
            totalRevenue: 1,
            retailPrice: { $arrayElemAt: ["$productDetails.retailPrice", 0] },
            wholesalePrice: {
              $arrayElemAt: ["$productDetails.wholesalePrice", 0],
            },
            image: {
              $ifNull: [
                { $arrayElemAt: ["$productDetails.images.0.url", 0] },
                "$image",
              ],
            },
          },
        },
      ]),

      // Last 7 days sales for chart (exclude fully refunded; net amounts with refunds)
      Order.aggregate([
        {
          $match: {
            storeId: toObjectId(storeId),
            createdAt: { $gte: last7DaysUTC },
            paymentStatus: { $in: ["succeeded", "paid", "partially_refunded"] },
          },
        },
        // Lookup refund details
        {
          $lookup: {
            from: "refunds",
            let: { orderId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$orderId", "$$orderId"] },
                  status: "completed",
                },
              },
              {
                $project: {
                  storeRefundAmount: "$costDistribution.fromStore",
                },
              },
              { $limit: 1 },
            ],
            as: "refundData",
          },
        },
        // Calculate net store amount
        {
          $project: {
            dateStr: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            storeAmount: {
              $subtract: [
                "$paymentSplit.storeAmount",
                {
                  $ifNull: [
                    { $arrayElemAt: ["$refundData.storeRefundAmount", 0] },
                    0,
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$dateStr",
            totalSales: { $sum: "$storeAmount" }, // Net sales after refunds
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Recent reviews
      Review.find({ storeId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("reviewerId", "name")
        .populate("productId", "name")
        .select("rating comment createdAt"),

      // Total products count
      Product.countDocuments({ storeId, isActive: true }),

      // Store transactions for earnings (all-time)
      Transaction.aggregate([
        {
          $match: {
            storeId: toObjectId(storeId),
            userType: "store",
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$amount" },
            currentBalance: { $max: "$balanceAfter" },
          },
        },
      ]),
    ]);

    console.log("[Dashboard] Fetched data:");
    console.log("  Today Orders:", todayOrders);
    console.log("  Yesterday Orders:", yesterdayOrders);
    console.log("  Last 7 Days Sales count:", last7DaysSales.length);
    console.log("  Last 7 Days Sales:", last7DaysSales);

    // Also get all recent orders for this store (for debugging)
    const allRecentOrders = await Order.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("createdAt paymentStatus paymentSplit orderNumber");
    console.log(
      "[Dashboard] All recent orders (last 20):",
      allRecentOrders.map((o) => ({
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        paymentStatus: o.paymentStatus,
        storeAmount: o.paymentSplit?.storeAmount,
      })),
    );

    // Calculate stats with change percentages
    const todayStats = todayOrders[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalItems: 0,
    };
    const yesterdayStats = yesterdayOrders[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalItems: 0,
    };

    const storeTransactionStats = storeTransactions[0] || {
      totalEarnings: 0,
      currentBalance: 0,
    };

    const calculateChange = (today, yesterday) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return (((today - yesterday) / yesterday) * 100).toFixed(1);
    };

    // Format stats
    const stats = {
      todaySales: todayStats.totalSales,
      todaySalesChange: parseFloat(
        calculateChange(todayStats.totalSales, yesterdayStats.totalSales),
      ),
      totalOrders: todayStats.totalOrders,
      ordersChange: parseFloat(
        calculateChange(todayStats.totalOrders, yesterdayStats.totalOrders),
      ),
      productsSold: todayStats.totalItems,
      productsSoldChange: parseFloat(
        calculateChange(todayStats.totalItems, yesterdayStats.totalItems),
      ),
      revenue: storeTransactionStats.totalEarnings, // Use actual transaction total
      revenueChange: 10.8, // Could calculate month-over-month if needed
    };

    // Format recent orders
    const formattedOrders = recentOrders.map((order) => ({
      id: order.orderNumber,
      customer: order.customerId?.name || "Unknown Customer",
      amount: order.paymentSplit?.storeAmount || 0, // Use store's portion only
      items: order.items.length,
      status: order.status,
      time: formatTimeAgo(order.createdAt),
    }));

    // Format top products
    const formattedProducts = topProducts.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.retailPrice || product.wholesalePrice || 0,
      sold: product.totalSold,
      revenue: product.totalRevenue,
      image: product.image || "https://via.placeholder.com/48",
    }));

    // Format sales chart data (last 7 days)
    const salesChartData = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    console.log("[Dashboard] Last 7 days sales data from DB:", last7DaysSales);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayUTC);
      date.setUTCDate(date.getUTCDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayData = last7DaysSales.find((d) => d._id === dateStr);

      console.log(
        `[Dashboard] Date: ${dateStr}, Found: ${!!dayData}, Sales: ${dayData?.totalSales || 0}`,
      );

      salesChartData.push({
        label: daysOfWeek[date.getUTCDay()],
        value: dayData?.totalSales || 0,
        orders: dayData?.totalOrders || 0,
      });
    }

    console.log("[Dashboard] Final salesChartData:", salesChartData);

    // Format earnings overview
    const earnings = {
      total: storeTransactionStats.totalEarnings,
      pending: 0, // TODO: Calculate pending withdrawals
      paid: 0, // TODO: Calculate completed withdrawals
      nextPayout: getNextPayoutDate(),
    };

    // Format reviews
    const formattedReviews = recentReviews.map((review) => ({
      id: review._id,
      customer: review.customerId?.name || "Anonymous",
      rating: review.rating,
      comment: review.comment,
      product: review.productId?.name || "Unknown Product",
      time: formatTimeAgo(review.createdAt),
    }));

    res.json({
      success: true,
      data: {
        stats,
        recentOrders: formattedOrders,
        topProducts: formattedProducts,
        salesData: salesChartData,
        earnings,
        recentReviews: formattedReviews,
        totalProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1)
    return interval + (interval === 1 ? " year ago" : " years ago");

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1)
    return interval + (interval === 1 ? " month ago" : " months ago");

  interval = Math.floor(seconds / 86400);
  if (interval >= 1)
    return interval + (interval === 1 ? " day ago" : " days ago");

  interval = Math.floor(seconds / 3600);
  if (interval >= 1)
    return interval + (interval === 1 ? " hour ago" : " hours ago");

  interval = Math.floor(seconds / 60);
  if (interval >= 1)
    return interval + (interval === 1 ? " min ago" : " mins ago");

  return "just now";
}

// Helper function to get next payout date
function getNextPayoutDate() {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[nextMonth.getMonth()]} ${nextMonth.getDate()}, ${nextMonth.getFullYear()}`;
}
