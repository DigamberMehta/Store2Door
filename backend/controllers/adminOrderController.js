import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Payment from "../models/Payment.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/**
 * Get all orders with advanced filtering, sorting, and pagination
 */
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      storeId,
      customerId,
      riderId,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
      minAmount,
      maxAmount,
      paymentMethod,
      deliveryType,
    } = req.query;

    // Build query
    const query = {};

    // Status filter (can be array)
    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = Array.isArray(paymentStatus)
        ? { $in: paymentStatus }
        : paymentStatus;
    }

    // Store filter
    if (storeId) {
      query.storeId = storeId;
    }

    // Customer filter
    if (customerId) {
      query.customerId = customerId;
    }

    // Rider filter
    if (riderId) {
      query.riderId = riderId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.total = {};
      if (minAmount) {
        query.total.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        query.total.$lte = parseFloat(maxAmount);
      }
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Delivery type filter
    if (deliveryType) {
      query.deliveryType = deliveryType;
    }

    // Search filter (order number, customer name, store name)
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ orderNumber: searchRegex }];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name email phone profilePhoto")
        .populate("storeId", "name address phone logo")
        .populate("riderId", "name email phone profilePhoto")
        .populate("paymentId")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    // Calculate summary stats for current filter
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$total" },
          totalDeliveryFees: { $sum: "$deliveryFee" },
          totalTips: { $sum: "$tip" },
          totalDiscounts: { $sum: "$discount" },
        },
      },
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
        stats: stats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalDeliveryFees: 0,
          totalTips: 0,
          totalDiscounts: 0,
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
};

/**
 * Get order by ID with full details
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("customerId", "name email phone profilePhoto addresses")
      .populate("storeId", "name address phone logo email operatingHours")
      .populate("riderId", "name email phone profilePhoto vehicle")
      .populate("paymentId")
      .populate("cancelledBy", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get related transactions
    const transactions = await Transaction.find({ orderId: id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        order,
        transactions,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, notifyCustomer = true } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "placed",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "assigned",
      "picked_up",
      "on_the_way",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id)
      .populate("customerId", "name email phone")
      .populate("storeId", "name")
      .populate("riderId", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if status transition is valid
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot update status. Order is already ${order.status}`,
      });
    }

    // Update status using the model method
    await order.updateStatus(
      status,
      notes || `Status updated by admin to ${status}`,
    );
    await order.save();

    // TODO: Send notification to customer if notifyCustomer is true
    // This would integrate with your notification system

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

/**
 * Assign rider to order
 */
export const assignRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId, notifyRider = true } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify rider exists and is active
    const rider = await User.findOne({ _id: riderId, role: "rider" });
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (!rider.isActive) {
      return res.status(400).json({
        success: false,
        message: "Rider is not active",
      });
    }

    // Assign rider
    order.riderId = riderId;
    if (order.status === "ready_for_pickup") {
      order.status = "assigned";
      order.trackingHistory.push({
        status: "assigned",
        updatedAt: new Date(),
        notes: `Rider ${rider.name} assigned by admin`,
      });
    }

    await order.save();

    // TODO: Notify rider if notifyRider is true

    res.json({
      success: true,
      message: "Rider assigned successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error assigning rider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign rider",
      error: error.message,
    });
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAmount, notifyCustomer = true } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findById(id)
      .populate("customerId", "name email phone")
      .populate("paymentId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel delivered order",
      });
    }

    // Mark as cancelled
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id; // Admin who cancelled
    order.cancellationReason = reason;

    order.trackingHistory.push({
      status: "cancelled",
      updatedAt: new Date(),
      notes: `Order cancelled by admin. Reason: ${reason}`,
    });

    await order.save();

    // Process refund if specified
    if (refundAmount && order.paymentId) {
      const payment = await Payment.findById(order.paymentId);
      if (payment && payment.status === "succeeded") {
        // TODO: Integrate with payment gateway refund API
        payment.status =
          refundAmount >= order.total ? "refunded" : "partially_refunded";
        payment.refundAmount = refundAmount;
        payment.refundedAt = new Date();
        await payment.save();

        order.paymentStatus = payment.status;
        await order.save();
      }
    }

    // TODO: Notify customer if notifyCustomer is true

    res.json({
      success: true,
      message: "Order cancelled successfully",
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

/**
 * Reject order (admin/store cannot fulfill)
 */
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notifyCustomer = true } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const order = await Order.findById(id)
      .populate("customerId", "name email phone")
      .populate("paymentId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["rejected", "cancelled", "delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject order with status: ${order.status}`,
      });
    }

    // Use the model's rejectOrder method for proper tracking
    await order.rejectOrder(req.user._id, reason);

    // Create refund request for admin approval if payment was made
    if (order.paymentId) {
      const payment = await Payment.findById(order.paymentId);
      if (payment && payment.status === "succeeded") {
        const Refund = (await import("../models/Refund.js")).default;

        await Refund.create({
          orderId: order._id,
          customerId: order.customerId,
          storeId: order.storeId,
          riderId: order.riderId,
          requestedAmount: order.total,
          refundReason: "order_rejected",
          customerNote: `Order rejected by admin. Reason: ${reason}`,
          status: "pending_review",
          orderSnapshot: {
            orderNumber: order.orderNumber,
            orderTotal: order.total,
            orderStatus: order.status,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            tip: order.tip,
            discount: order.discount,
            paymentSplit: order.paymentSplit,
          },
        });
      }
    }

    // TODO: Notify customer if notifyCustomer is true

    res.json({
      success: true,
      message:
        "Order rejected successfully. Refund request created for admin review.",
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

/**
 * Update order details (internal notes, special instructions)
 */
export const updateOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { internalNotes, specialInstructions, preparationTime } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update fields
    if (internalNotes !== undefined) {
      order.internalNotes = internalNotes;
    }
    if (specialInstructions !== undefined) {
      order.specialInstructions = specialInstructions;
    }
    if (preparationTime !== undefined) {
      order.preparationTime = preparationTime;
    }

    await order.save();

    res.json({
      success: true,
      message: "Order details updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order details",
      error: error.message,
    });
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (req, res) => {
  try {
    const { dateFrom, dateTo, groupBy = "day" } = req.query;

    // Build date filter
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) {
        dateFilter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        dateFilter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Overall stats
    const [overallStats] = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          totalDeliveryFees: { $sum: "$deliveryFee" },
          totalTips: { $sum: "$tip" },
          totalDiscounts: { $sum: "$discount" },
          averageOrderValue: { $avg: "$total" },
          averageDeliveryFee: { $avg: "$deliveryFee" },
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Orders by payment status
    const ordersByPaymentStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Orders by payment method
    const ordersByPaymentMethod = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top stores by orders
    const topStores = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$storeId",
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: "$store" },
      {
        $project: {
          _id: 1,
          orderCount: 1,
          totalRevenue: 1,
          storeName: "$store.name",
          storeLogo: "$store.logo",
        },
      },
    ]);

    // Top customers by orders
    const topCustomers = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$customerId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $project: {
          _id: 1,
          orderCount: 1,
          totalSpent: 1,
          customerName: "$customer.name",
          customerEmail: "$customer.email",
        },
      },
    ]);

    // Trend data (orders over time)
    let groupByFormat;
    switch (groupBy) {
      case "hour":
        groupByFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" },
        };
        break;
      case "day":
        groupByFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "week":
        groupByFormat = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "month":
        groupByFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      default:
        groupByFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    const trendData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupByFormat,
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overall: overallStats || {
          totalOrders: 0,
          totalRevenue: 0,
          totalDeliveryFees: 0,
          totalTips: 0,
          totalDiscounts: 0,
          averageOrderValue: 0,
          averageDeliveryFee: 0,
        },
        byStatus: ordersByStatus,
        byPaymentStatus: ordersByPaymentStatus,
        byPaymentMethod: ordersByPaymentMethod,
        topStores,
        topCustomers,
        trend: trendData,
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

/**
 * Bulk update order status
 */
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { orderIds, status, notes } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order IDs array is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Update all orders
    const updatePromises = orderIds.map(async (orderId) => {
      const order = await Order.findById(orderId);
      if (
        order &&
        order.status !== "delivered" &&
        order.status !== "cancelled"
      ) {
        await order.updateStatus(
          status,
          notes || `Bulk status update to ${status}`,
        );
        await order.save();
        return { success: true, orderId };
      }
      return {
        success: false,
        orderId,
        reason: "Order not found or already completed",
      };
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter((r) => r.success).length;

    res.json({
      success: true,
      message: `Successfully updated ${successCount} out of ${orderIds.length} orders`,
      data: results,
    });
  } catch (error) {
    console.error("Error bulk updating orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk update orders",
      error: error.message,
    });
  }
};

/**
 * Export orders to CSV
 */
export const exportOrders = async (req, res) => {
  try {
    const { status, dateFrom, dateTo, format = "json" } = req.query;

    // Build query (similar to getAllOrders)
    const query = {};
    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(query)
      .populate("customerId", "name email phone")
      .populate("storeId", "name")
      .populate("riderId", "name")
      .sort({ createdAt: -1 })
      .lean();

    if (format === "csv") {
      // Convert to CSV format
      const csvHeaders = [
        "Order Number",
        "Date",
        "Customer",
        "Store",
        "Status",
        "Payment Status",
        "Items",
        "Subtotal",
        "Delivery Fee",
        "Tip",
        "Discount",
        "Total",
      ];

      const csvRows = orders.map((order) => [
        order.orderNumber,
        new Date(order.createdAt).toISOString(),
        order.customerId?.name || "N/A",
        order.storeId?.name || "N/A",
        order.status,
        order.paymentStatus,
        order.items.length,
        order.subtotal,
        order.deliveryFee,
        order.tip,
        order.discount,
        order.total,
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=orders-${Date.now()}.csv`,
      );
      res.send(csvContent);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: orders,
      });
    }
  } catch (error) {
    console.error("Error exporting orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export orders",
      error: error.message,
    });
  }
};

/**
 * Get orders requiring attention
 */
export const getOrdersRequiringAttention = async (req, res) => {
  try {
    // Orders that might need admin intervention
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Pending orders older than 30 minutes
    const stuckPending = await Order.find({
      status: "pending",
      createdAt: { $lt: thirtyMinutesAgo },
    })
      .populate("customerId", "name email phone")
      .populate("storeId", "name")
      .limit(20)
      .sort({ createdAt: 1 });

    // Confirmed orders not preparing after 30 minutes
    const stuckConfirmed = await Order.find({
      status: "confirmed",
      createdAt: { $lt: thirtyMinutesAgo },
    })
      .populate("customerId", "name email phone")
      .populate("storeId", "name")
      .limit(20)
      .sort({ createdAt: 1 });

    // Ready for pickup but no rider assigned
    const needsRider = await Order.find({
      status: "ready_for_pickup",
      riderId: { $exists: false },
    })
      .populate("customerId", "name email phone")
      .populate("storeId", "name")
      .limit(20)
      .sort({ createdAt: 1 });

    // Failed payments
    const failedPayments = await Order.find({
      paymentStatus: "failed",
      status: { $nin: ["cancelled"] },
    })
      .populate("customerId", "name email phone")
      .populate("storeId", "name")
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        stuckPending,
        stuckConfirmed,
        needsRider,
        failedPayments,
        totalRequiringAttention:
          stuckPending.length +
          stuckConfirmed.length +
          needsRider.length +
          failedPayments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching orders requiring attention:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders requiring attention",
      error: error.message,
    });
  }
};
