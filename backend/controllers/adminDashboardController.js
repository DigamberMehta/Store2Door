import Order from "../models/Order.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import Review from "../models/Review.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get date for trends (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get total revenue - platform earnings only (current period)
    const currentRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paymentSplit.platformAmount" },
        },
      },
    ]);

    // Get previous period revenue - platform earnings only
    const previousRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paymentSplit.platformAmount" },
        },
      },
    ]);

    const totalRevenue = currentRevenue[0]?.total || 0;
    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueTrend =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Get total orders
    const currentOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const previousOrders = await Order.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    const ordersTrend =
      previousOrders > 0
        ? ((currentOrders - previousOrders) / previousOrders) * 100
        : 0;

    // Get active stores
    const currentStores = await Store.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const previousStores = await Store.countDocuments({
      isActive: true,
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    const activeStores = await Store.countDocuments({ isActive: true });

    const storesTrend =
      previousStores > 0
        ? ((currentStores - previousStores) / previousStores) * 100
        : 0;

    // Get total users
    const currentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const previousUsers = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    const totalUsers = await User.countDocuments();

    const usersTrend =
      previousUsers > 0
        ? ((currentUsers - previousUsers) / previousUsers) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: await Order.countDocuments(),
        activeStores,
        totalUsers,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
        ordersTrend: Math.round(ordersTrend * 10) / 10,
        storesTrend: Math.round(storesTrend * 10) / 10,
        usersTrend: Math.round(usersTrend * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

// Get recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("storeId", "name")
      .select("orderNumber storeId total status createdAt");

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      storeName: order.storeId?.name || "Unknown Store",
      totalAmount: order.total,
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
    });
  }
};

// Get top performing stores
export const getTopStores = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get stores with their revenue and order count
    const topStores = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: "$storeId",
          totalRevenue: { $sum: "$paymentSplit.storeAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "storeDetails",
        },
      },
      {
        $unwind: "$storeDetails",
      },
      {
        $project: {
          _id: "$storeDetails._id",
          name: "$storeDetails.name",
          address: "$storeDetails.address",
          location: "$storeDetails.location",
          isVerified: "$storeDetails.isVerified",
          totalRevenue: 1,
          totalOrders: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topStores,
    });
  } catch (error) {
    console.error("Error fetching top stores:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top stores",
    });
  }
};

// Get platform earnings
export const getPlatformEarnings = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get current period earnings - platform metrics
    const currentEarnings = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paymentSplit.platformAmount" },
          platformFee: { $sum: "$paymentSplit.platformBreakdown.totalMarkup" },
          deliveryFees: { $sum: "$deliveryFee" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Get previous period for trend - platform earnings
    const previousEarnings = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paymentSplit.platformAmount" },
        },
      },
    ]);

    const current = currentEarnings[0] || {
      totalRevenue: 0,
      platformFee: 0,
      deliveryFees: 0,
      totalOrders: 0,
    };
    const previous = previousEarnings[0]?.totalRevenue || 0;

    const trend =
      previous > 0 ? ((current.totalRevenue - previous) / previous) * 100 : 0;

    const averageOrderValue =
      current.totalOrders > 0 ? current.totalRevenue / current.totalOrders : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: current.totalRevenue,
        platformFee: current.platformFee,
        deliveryFees: current.deliveryFees,
        totalOrders: current.totalOrders,
        averageOrderValue,
        trend: Math.round(trend * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching platform earnings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch platform earnings",
    });
  }
};

// Get activity chart data
export const getActivityData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activityData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["delivered", "completed"]] },
                "$paymentSplit.platformAmount",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%b %d",
              date: { $dateFromString: { dateString: "$_id" } },
            },
          },
          orders: 1,
          revenue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: activityData,
    });
  } catch (error) {
    console.error("Error fetching activity data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity data",
    });
  }
};

// Get recent reviews
export const getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("reviewerId", "name")
      .populate("storeId", "name")
      .populate("productId", "name")
      .select("rating comment reviewType createdAt");

    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      reviewType: review.reviewType,
      reviewer: { name: review.reviewerId?.name || "Anonymous" },
      storeName: review.storeId?.name || review.productId?.name || "N/A",
      createdAt: review.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedReviews,
    });
  } catch (error) {
    console.error("Error fetching recent reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent reviews",
    });
  }
};
