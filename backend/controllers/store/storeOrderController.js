import mongoose from "mongoose";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import Store from "../../models/Store.js";
import Refund from "../../models/Refund.js";
import { emitToOrder, broadcastToDrivers } from "../../config/socket.js";
import { sendOrderStatusEmail } from "../../config/mailer.js";
import { getManagerStoreOrFail } from "../../utils/storeHelpers.js";
import { toObjectId } from "../../utils/mongoHelpers.js";
import { getPaginationParams } from "../../utils/pagination.js";

// Get all orders for store manager
export const getStoreOrders = async (req, res) => {
  try {
    // Get store using utility
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return; // Response already sent

    const storeId = store._id;
    const {
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Get pagination params using utility
    const { page, limit, skip } = getPaginationParams(req.query, 20);

    // Build filter
    const filter = { storeId: toObjectId(storeId) };

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
    // Get store using utility
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return; // Response already sent

    const storeId = store._id;
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
        "paymentNumber status method amount createdAt completedAt paystackPaymentId paystackReference",
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

    // Check if there's a refund for this order and get refund deduction info
    let refundInfo = null;
    if (
      order.paymentStatus === "refunded" ||
      order.paymentStatus === "partially_refunded"
    ) {
      const refund = await Refund.findOne({
        orderId: order._id,
        status: { $in: ["approved", "processing", "completed"] },
      }).select(
        "refundNumber approvedAmount costDistribution status completedAt",
      );

      if (refund && refund.costDistribution) {
        refundInfo = {
          refundNumber: refund.refundNumber,
          totalRefundAmount: refund.approvedAmount,
          storeDeduction: refund.costDistribution.fromStore || 0,
          driverDeduction: refund.costDistribution.fromDriver || 0,
          platformAbsorbed: refund.costDistribution.fromPlatform || 0,
          status: refund.status,
          completedAt: refund.completedAt,
        };
      }
    }

    res.json({
      success: true,
      data: order,
      refundInfo,
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
    // Get store using utility
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return; // Response already sent

    const storeId = store._id;
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
      order.cancelledBy = req.user._id;
      order.cancellationReason = notes;
    }

    await order.save();

    // Populate order before returning
    await order.populate([
      { path: "customerId", select: "name email phone" },
      { path: "riderId", select: "name email phone" },
      { path: "items.productId", select: "name images" },
    ]);

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
    // Get store using utility
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return; // Response already sent

    const storeId = store._id;

    const stats = await Order.aggregate([
      { $match: { storeId: toObjectId(storeId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    const paymentStats = await Order.aggregate([
      { $match: { storeId: toObjectId(storeId) } },
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

// Cancel order (store manager)
export const cancelOrder = async (req, res) => {
  try {
    // Get store using utility
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return; // Response already sent

    const storeId = store._id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findOne({ _id: orderId, storeId }).populate(
      "paymentId",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a delivered order",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Use the Order model's helper method
    await order.cancelOrder(req.user._id, reason);

    // Create refund request if payment was completed
    if (order.paymentStatus === "completed" && order.paymentId) {
      try {
        const refund = new Refund({
          orderId: order._id,
          paymentId: order.paymentId._id,
          customerId: order.customerId,
          amount: order.total,
          refundReason: "order_cancelled",
          status: "pending",
          requestedBy: req.user._id,
          requestedAt: new Date(),
        });

        await refund.save();
        console.log(
          `[Store Manager] Refund request created for cancelled order ${order.orderNumber}`,
        );
      } catch (refundError) {
        console.error(
          "[Store Manager] Error creating refund request:",
          refundError,
        );
      }
    }

    // Send cancellation email to customer
    try {
      const user = await User.findById(order.customerId);
      if (user) {
        await sendOrderStatusEmail(order, user.email, user.name, "cancelled");
        console.log(
          `[Store Manager] Cancellation email sent for order ${order.orderNumber}`,
        );
      }
    } catch (emailError) {
      console.error(
        "[Store Manager] Error sending cancellation email:",
        emailError,
      );
    }

    // Populate order before returning
    await order.populate([
      { path: "customerId", select: "name email phone" },
      { path: "riderId", select: "name email phone" },
      { path: "items.productId", select: "name images" },
    ]);

    // Emit socket event for real-time update
    emitToOrder(orderId, "order:cancelled", {
      orderId,
      status: "cancelled",
      reason,
      cancelledBy: "store",
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Order cancelled successfully. Refund request created.",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Reject order (store manager)
export const rejectOrder = async (req, res) => {
  try {
    // Get store using utility
    const store = await getManagerStoreOrFail(req, res);
    if (!store) return; // Response already sent

    const storeId = store._id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const order = await Order.findOne({ _id: orderId, storeId }).populate(
      "paymentId",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be rejected (only early-stage orders)
    const rejectableStatuses = ["pending", "placed", "confirmed", "preparing"];
    if (!rejectableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject order in ${order.status} status`,
      });
    }

    if (order.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Order is already rejected",
      });
    }

    // Use the Order model's helper method
    await order.rejectOrder(req.user._id, reason);

    // Create refund request if payment was completed
    if (order.paymentStatus === "completed" && order.paymentId) {
      try {
        const refund = new Refund({
          orderId: order._id,
          paymentId: order.paymentId._id,
          customerId: order.customerId,
          amount: order.total,
          refundReason: "order_rejected",
          status: "pending",
          requestedBy: req.user._id,
          requestedAt: new Date(),
        });

        await refund.save();
        console.log(
          `[Store Manager] Refund request created for rejected order ${order.orderNumber}`,
        );
      } catch (refundError) {
        console.error(
          "[Store Manager] Error creating refund request:",
          refundError,
        );
      }
    }

    // Send rejection email to customer
    try {
      const user = await User.findById(order.customerId);
      if (user) {
        await sendOrderStatusEmail(order, user.email, user.name, "rejected");
        console.log(
          `[Store Manager] Rejection email sent for order ${order.orderNumber}`,
        );
      }
    } catch (emailError) {
      console.error(
        "[Store Manager] Error sending rejection email:",
        emailError,
      );
    }

    // Populate order before returning
    await order.populate([
      { path: "customerId", select: "name email phone" },
      { path: "riderId", select: "name email phone" },
      { path: "items.productId", select: "name images" },
    ]);

    // Emit socket event for real-time update
    emitToOrder(orderId, "order:rejected", {
      orderId,
      status: "rejected",
      reason,
      rejectedBy: "store",
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Order rejected successfully. Refund request created.",
      data: order,
    });
  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject order",
      error: error.message,
    });
  }
};
