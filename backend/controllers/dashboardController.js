import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Store from "../models/Store.js";

// Get dashboard statistics for store manager
export const getStoreDashboardStats = async (req, res) => {
  try {
    const storeId = req.user.storeId;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID not found for user",
      });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get yesterday's date range for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get last 7 days for sales chart
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    // Parallel data fetching for performance
    const [
      todayOrders,
      yesterdayOrders,
      recentOrders,
      topProducts,
      store,
      last7DaysSales,
      recentReviews,
      totalProducts,
    ] = await Promise.all([
      // Today's orders (only succeeded payments)
      Order.aggregate([
        {
          $match: {
            storeId: new mongoose.Types.ObjectId(storeId),
            createdAt: { $gte: today, $lt: tomorrow },
            paymentStatus: "succeeded",
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            totalItems: { $sum: { $size: "$items" } },
          },
        },
      ]),

      // Yesterday's orders for comparison (only succeeded payments)
      Order.aggregate([
        {
          $match: {
            storeId: new mongoose.Types.ObjectId(storeId),
            createdAt: { $gte: yesterday, $lt: today },
            paymentStatus: "succeeded",
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            totalItems: { $sum: { $size: "$items" } },
          },
        },
      ]),

      // Recent orders (last 10)
      Order.find({ storeId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("customerId", "name email")
        .select("orderId customerId total items status createdAt"),

      // Top selling products (only succeeded payments)
      Order.aggregate([
        {
          $match: {
            storeId: new mongoose.Types.ObjectId(storeId),
            paymentStatus: "succeeded",
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

      // Store information
      Store.findById(storeId).select("name stats earnings"),

      // Last 7 days sales for chart (only succeeded payments)
      Order.aggregate([
        {
          $match: {
            storeId: new mongoose.Types.ObjectId(storeId),
            createdAt: { $gte: last7Days },
            paymentStatus: "succeeded",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Recent reviews
      Review.find({ storeId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customerId", "name")
        .populate("productId", "name")
        .select("rating comment createdAt"),

      // Total products count
      Product.countDocuments({ storeId, isActive: true }),
    ]);

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
      revenue: store?.stats?.totalRevenue || 0,
      revenueChange: 10.8, // Could calculate month-over-month if needed
    };

    // Format recent orders
    const formattedOrders = recentOrders.map((order) => ({
      id: order.orderId,
      customer: order.customerId?.name || "Unknown Customer",
      amount: order.total,
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

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayData = last7DaysSales.find((d) => d._id === dateStr);

      salesChartData.push({
        label: daysOfWeek[date.getUTCDay()],
        value: dayData?.totalSales || 0,
        orders: dayData?.totalOrders || 0,
      });
    }

    // Format earnings overview
    const earnings = {
      total: store?.earnings?.totalEarnings || 0,
      pending: store?.earnings?.pendingEarnings || 0,
      paid: store?.earnings?.paidEarnings || 0,
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
