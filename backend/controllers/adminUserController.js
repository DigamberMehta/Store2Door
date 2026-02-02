import mongoose from "mongoose";
import User from "../models/User.js";
import CustomerProfile from "../models/CustomerProfile.js";
import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";
import Store from "../models/Store.js";
import Order from "../models/Order.js";

// Get all users with filtering, sorting, and pagination
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      isActive = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Active status filter
    if (isActive !== "") {
      query.isActive = isActive === "true";
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "-password -refreshToken -passwordResetToken -passwordResetExpires",
        )
        .populate("storeId", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalUsers: total,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get user by ID with comprehensive related data
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select(
        "-password -refreshToken -passwordResetToken -passwordResetExpires",
      )
      .populate("storeId")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get role-specific profile data
    let profileData = null;
    let additionalData = {};

    if (user.role === "customer") {
      profileData = await CustomerProfile.findOne({ userId: id }).lean();

      // Get customer order history
      const orders = await Order.find({ customerId: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("storeId", "name")
        .lean();

      additionalData.recentOrders = orders;
    } else if (user.role === "delivery_rider") {
      profileData = await DeliveryRiderProfile.findOne({ userId: id }).lean();

      // Get rider delivery history
      const deliveries = await Order.find({ riderId: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("storeId", "name")
        .populate("customerId", "name")
        .lean();

      additionalData.recentDeliveries = deliveries;
    } else if (user.role === "store_manager" && user.storeId) {
      // Get store orders
      const storeOrders = await Order.find({ storeId: user.storeId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("customerId", "name email")
        .lean();

      additionalData.recentStoreOrders = storeOrders;
    }

    // Get user statistics
    const stats = await getUserStats(id, user.role);

    res.status(200).json({
      success: true,
      data: {
        user,
        profile: profileData,
        stats,
        ...additionalData,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
};

// Get user statistics helper function
const getUserStats = async (userId, role) => {
  const stats = {
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    lastOrderDate: null,
  };

  try {
    if (role === "customer") {
      const orderStats = await Order.aggregate([
        { $match: { customerId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: {
                $cond: [{ $in: ["$status", ["delivered", "completed"]] }, 1, 0],
              },
            },
            totalSpent: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["delivered", "completed"]] },
                  "$total",
                  0,
                ],
              },
            },
          },
        },
      ]);

      if (orderStats.length > 0) {
        stats.totalOrders = orderStats[0].totalOrders;
        stats.completedOrders = orderStats[0].completedOrders;
        stats.totalSpent = orderStats[0].totalSpent;
      }

      const lastOrder = await Order.findOne({
        customerId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ createdAt: -1 })
        .select("createdAt")
        .lean();

      if (lastOrder) {
        stats.lastOrderDate = lastOrder.createdAt;
      }
    } else if (role === "delivery_rider") {
      const deliveryStats = await Order.aggregate([
        { $match: { riderId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalDeliveries: { $sum: 1 },
            completedDeliveries: {
              $sum: {
                $cond: [{ $eq: ["$status", "delivered"] }, 1, 0],
              },
            },
            totalEarnings: { $sum: "$paymentSplit.driverAmount" },
          },
        },
      ]);

      if (deliveryStats.length > 0) {
        stats.totalOrders = deliveryStats[0].totalDeliveries;
        stats.completedOrders = deliveryStats[0].completedDeliveries;
        stats.totalSpent = deliveryStats[0].totalEarnings;
      }

      // Get last delivery date
      const lastDelivery = await Order.findOne({
        riderId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ createdAt: -1 })
        .select("createdAt")
        .lean();

      if (lastDelivery) {
        stats.lastOrderDate = lastDelivery.createdAt;
      }
    }
  } catch (error) {
    console.error("Error fetching user stats:", error);
  }

  return stats;
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      role,
      isActive,
      isEmailVerified,
      isPhoneVerified,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isEmailVerified !== undefined)
      updateData.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined)
      updateData.isPhoneVerified = isPhoneVerified;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select(
      "-password -refreshToken -passwordResetToken -passwordResetExpires",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle user status",
    });
  }
};

// Get user statistics summary
export const getUserStatsSummary = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      roleBreakdown,
      recentUsers,
      verificationStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt")
        .lean(),
      User.aggregate([
        {
          $group: {
            _id: null,
            emailVerified: {
              $sum: { $cond: ["$isEmailVerified", 1, 0] },
            },
            phoneVerified: {
              $sum: { $cond: ["$isPhoneVerified", 1, 0] },
            },
          },
        },
      ]),
    ]);

    const roleStats = roleBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleBreakdown: roleStats,
        recentUsers,
        verification: verificationStats[0] || {
          emailVerified: 0,
          phoneVerified: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

// Bulk actions
export const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs are required",
      });
    }

    let updateData = {};

    switch (action) {
      case "activate":
        updateData.isActive = true;
        break;
      case "deactivate":
        updateData.isActive = false;
        break;
      case "verify-email":
        updateData.isEmailVerified = true;
        break;
      case "verify-phone":
        updateData.isPhoneVerified = true;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action",
        });
    }

    const result = await User.updateMany({ _id: { $in: userIds } }, updateData);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk update",
    });
  }
};
