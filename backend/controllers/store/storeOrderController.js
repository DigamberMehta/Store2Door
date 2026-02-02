import mongoose from "mongoose";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import { emitToOrder, broadcastToDrivers } from "../../config/socket.js";
import { sendOrderStatusEmail } from "../../config/mailer.js";

// Get all orders for store manager
export const getStoreOrders = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID not found for user",
      });
    }

    // Build filter
    const filter = { storeId: new mongoose.Types.ObjectId(storeId) };

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.orderNumber = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch orders
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate("customerId", "name email phone")
        .populate("riderId", "name email phone")
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip)
        .select("-internalNotes"),

      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching store orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get single order details
export const getOrderDetails = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      storeId,
    })
      .populate("customerId", "name email phone")
      .populate("riderId", "name email phone")
      .populate("items.productId", "name images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Conditionally populate paymentId only if it exists
    if (order.paymentId) {
      await order.populate(
        "paymentId",
        "paymentNumber status method amount createdAt completedAt yocoPaymentId yocoCheckoutId",
      );
    }

    // Calculate payment split if it's missing or all zeros
    if (
      !order.paymentSplit ||
      (order.paymentSplit.storeAmount === 0 &&
        order.paymentSplit.driverAmount === 0 &&
        order.paymentSplit.platformAmount === 0)
    ) {
      order.paymentSplit = order.calculatePaymentSplit();
      // Optionally save the calculated split back to the database
      await order.save();
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = [
      "placed", // Orders start here after payment
      "confirmed", // Store confirms the order
      "preparing", // Store is preparing the order
      "ready_for_pickup", // Order ready for delivery pickup
      "cancelled", // Order cancelled
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findOne({ _id: orderId, storeId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Store can cancel order until it's picked up by driver
    if (status === "cancelled") {
      // Allow cancellation only if order hasn't been picked up yet
      if (order.status === "picked_up" || order.status === "delivered") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel order after it has been picked up",
        });
      }
    }

    // Update status
    order.status = status;

    // Note: trackingHistory is automatically updated by pre-save middleware in Order model

    // Handle cancellation
    if (status === "cancelled") {
      order.cancelledAt = new Date();
      order.cancelledBy = req.user.id;
      order.cancellationReason = notes;
    }

    await order.save();

    // Send status update email to customer
    try {
      const user = await User.findById(order.customerId);
      if (user) {
        // Only send for important status changes
        const importantStatuses = ["confirmed", "preparing", "ready_for_pickup", "cancelled"];
        if (importantStatuses.includes(status)) {
          await sendOrderStatusEmail(order, user.email, user.name, status);
          console.log(`[Store] Status update email (${status}) sent for order ${order.orderNumber}`);
        }
      }
    } catch (emailError) {
      console.error("[Store] Error sending status update email:", emailError);
    }

    // Emit socket event for real-time update
    console.log(
      `[Store Controller] Emitting status change for order ${orderId}: ${status}`,
    );
    emitToOrder(orderId, "order:status-changed", {
      orderId,
      status,
      trackingHistory: order.trackingHistory,
      timestamp: new Date().toISOString(),
    });

    // If order is now available for drivers (confirmed, preparing, ready_for_pickup), broadcast to all drivers
    if (["confirmed", "preparing", "ready_for_pickup"].includes(status)) {
      console.log(
        `[Store Controller] Broadcasting new available order to all drivers`,
      );
      broadcastToDrivers("order:new-available", {
        orderId,
        status,
        storeId: order.storeId,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[Store Controller] Socket event emitted successfully`);

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const storeId = req.user.storeId;

    const stats = await Order.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    const paymentStats = await Order.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byPaymentStatus: paymentStats,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};
