import Refund from "../models/Refund.js";
import Order from "../models/Order.js";
import CustomerWallet from "../models/CustomerWallet.js";
import Transaction from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ============================================
// CUSTOMER ENDPOINTS
// ============================================

/**
 * @desc    Submit a refund request
 * @route   POST /api/customer/refunds
 * @access  Private (Customer)
 */
export const submitRefund = asyncHandler(async (req, res, next) => {
  const customerId = req.user._id;
  const {
    orderId,
    requestedAmount,
    refundReason,
    customerNote,
    evidenceFiles,
  } = req.body;

  // Validate order exists and belongs to customer
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.customerId.toString() !== customerId.toString()) {
    return next(
      new AppError(
        "You are not authorized to request refund for this order",
        403,
      ),
    );
  }

  // Check if order is eligible for refund
  if (order.status === "cancelled") {
    return next(
      new AppError("Cannot request refund for cancelled orders", 400),
    );
  }

  // Check if refund already requested for this order
  const existingRefund = await Refund.orderHasRefund(orderId);
  if (existingRefund) {
    return next(
      new AppError("A refund request already exists for this order", 400),
    );
  }

  // Validate requested amount
  if (requestedAmount > order.total) {
    return next(new AppError("Refund amount cannot exceed order total", 400));
  }

  if (requestedAmount <= 0) {
    return next(new AppError("Refund amount must be greater than zero", 400));
  }

  // Create refund request
  const refund = await Refund.create({
    orderId,
    customerId,
    storeId: order.storeId,
    riderId: order.riderId,
    requestedAmount,
    refundReason,
    customerNote,
    evidenceFiles: evidenceFiles || [],
    orderSnapshot: {
      orderNumber: order.orderNumber,
      orderTotal: order.total,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
    },
  });

  // Populate references
  await refund.populate([
    { path: "orderId", select: "orderNumber total status paymentStatus" },
    { path: "storeId", select: "name logo" },
  ]);

  res.status(201).json({
    success: true,
    message: "Refund request submitted successfully",
    data: { refund },
  });
});

/**
 * @desc    Get customer's refund requests
 * @route   GET /api/customer/refunds
 * @access  Private (Customer)
 */
export const getMyRefunds = asyncHandler(async (req, res, next) => {
  const customerId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const refunds = await Refund.findByCustomer(customerId, page, limit);

  // Get total count
  const total = await Refund.countDocuments({ customerId });

  res.status(200).json({
    success: true,
    data: {
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * @desc    Get single refund request by ID
 * @route   GET /api/customer/refunds/:id
 * @access  Private (Customer)
 */
export const getRefundById = asyncHandler(async (req, res, next) => {
  const customerId = req.user._id;
  const { id } = req.params;

  const refund = await Refund.findById(id)
    .populate("orderId", "orderNumber total status paymentStatus items")
    .populate("storeId", "name logo phone address")
    .populate("reviewedBy", "name email");

  if (!refund) {
    return next(new AppError("Refund request not found", 404));
  }

  // Verify ownership
  if (refund.customerId.toString() !== customerId.toString()) {
    return next(
      new AppError("You are not authorized to view this refund request", 403),
    );
  }

  res.status(200).json({
    success: true,
    data: { refund },
  });
});

/**
 * @desc    Cancel refund request
 * @route   DELETE /api/customer/refunds/:id
 * @access  Private (Customer)
 */
export const cancelRefund = asyncHandler(async (req, res, next) => {
  const customerId = req.user._id;
  const { id } = req.params;

  const refund = await Refund.findById(id);

  if (!refund) {
    return next(new AppError("Refund request not found", 404));
  }

  // Verify ownership
  if (refund.customerId.toString() !== customerId.toString()) {
    return next(
      new AppError("You are not authorized to cancel this refund request", 403),
    );
  }

  // Check if refund can be cancelled
  if (!refund.canCustomerCancel()) {
    return next(
      new AppError(
        "Refund request cannot be cancelled in its current status",
        400,
      ),
    );
  }

  // Delete the refund request
  await refund.deleteOne();

  res.status(200).json({
    success: true,
    message: "Refund request cancelled successfully",
  });
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @desc    Get all refund requests (admin)
 * @route   GET /api/admin/refunds
 * @access  Private (Admin)
 */
export const adminGetAllRefunds = asyncHandler(async (req, res, next) => {
  const filters = {
    status: req.query.status,
    customerId: req.query.customerId,
    orderId: req.query.orderId,
    refundReason: req.query.refundReason,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    search: req.query.search,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  };

  const result = await Refund.getAllRefunds(filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get pending refunds for review
 * @route   GET /api/admin/refunds/pending
 * @access  Private (Admin)
 */
export const adminGetPendingRefunds = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const refunds = await Refund.getPendingRefunds(page, limit);

  // Get total count
  const total = await Refund.countDocuments({
    status: { $in: ["pending_review", "under_review"] },
  });

  res.status(200).json({
    success: true,
    data: {
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * @desc    Get single refund details (admin)
 * @route   GET /api/admin/refunds/:id
 * @access  Private (Admin)
 */
export const adminGetRefundById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const refund = await Refund.findById(id)
    .populate("customerId", "name email phone profilePhoto")
    .populate(
      "orderId",
      "orderNumber total status paymentStatus items paymentSplit",
    )
    .populate("storeId", "name logo phone address")
    .populate("riderId", "name phone profilePhoto")
    .populate("reviewedBy", "name email");

  if (!refund) {
    return next(new AppError("Refund request not found", 404));
  }

  res.status(200).json({
    success: true,
    data: { refund },
  });
});

/**
 * @desc    Approve refund request
 * @route   POST /api/admin/refunds/:id/approve
 * @access  Private (Admin)
 */
export const adminApproveRefund = asyncHandler(async (req, res, next) => {
  const adminId = req.user._id;
  const { id } = req.params;
  const { approvedAmount, costDistribution, adminNote } = req.body;

  // Validate cost distribution
  if (!costDistribution) {
    return next(new AppError("Cost distribution is required", 400));
  }

  const { fromStore, fromDriver, fromPlatform, rationale } = costDistribution;

  // Validate amounts sum up to approved amount
  const totalDistribution = fromStore + fromDriver + fromPlatform;
  if (Math.abs(totalDistribution - approvedAmount) > 0.01) {
    // Allow 1 cent tolerance for rounding
    return next(
      new AppError("Cost distribution must sum up to approved amount", 400),
    );
  }

  // Find refund
  const refund = await Refund.findById(id);
  if (!refund) {
    return next(new AppError("Refund request not found", 404));
  }

  // Approve refund
  await refund.approve(
    adminId,
    approvedAmount,
    {
      fromStore,
      fromDriver,
      fromPlatform,
      rationale,
    },
    adminNote,
  );

  // Process refund (credit to wallet)
  try {
    await processRefundToWallet(refund);
  } catch (error) {
    console.error("Error processing refund:", error);
    await refund.markFailed(error.message);
    return next(
      new AppError("Refund approval succeeded but wallet credit failed", 500),
    );
  }

  // Populate references
  await refund.populate([
    { path: "customerId", select: "name email phone" },
    { path: "orderId", select: "orderNumber total status" },
    { path: "reviewedBy", select: "name email" },
  ]);

  res.status(200).json({
    success: true,
    message: "Refund approved and credited to customer wallet",
    data: { refund },
  });
});

/**
 * @desc    Reject refund request
 * @route   POST /api/admin/refunds/:id/reject
 * @access  Private (Admin)
 */
export const adminRejectRefund = asyncHandler(async (req, res, next) => {
  const adminId = req.user._id;
  const { id } = req.params;
  const { rejectionReason, adminNote } = req.body;

  if (!rejectionReason) {
    return next(new AppError("Rejection reason is required", 400));
  }

  // Find refund
  const refund = await Refund.findById(id);
  if (!refund) {
    return next(new AppError("Refund request not found", 404));
  }

  // Reject refund
  await refund.reject(adminId, rejectionReason, adminNote);

  // Populate references
  await refund.populate([
    { path: "customerId", select: "name email phone" },
    { path: "orderId", select: "orderNumber total status" },
    { path: "reviewedBy", select: "name email" },
  ]);

  res.status(200).json({
    success: true,
    message: "Refund request rejected",
    data: { refund },
  });
});

/**
 * @desc    Mark refund as under review
 * @route   POST /api/admin/refunds/:id/review
 * @access  Private (Admin)
 */
export const adminMarkUnderReview = asyncHandler(async (req, res, next) => {
  const adminId = req.user._id;
  const { id } = req.params;

  const refund = await Refund.findById(id);
  if (!refund) {
    return next(new AppError("Refund request not found", 404));
  }

  await refund.markUnderReview(adminId);

  res.status(200).json({
    success: true,
    message: "Refund marked as under review",
    data: { refund },
  });
});

/**
 * @desc    Get refund statistics
 * @route   GET /api/admin/refunds/stats
 * @access  Private (Admin)
 */
export const adminGetRefundStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const stats = await Refund.getStatistics(startDate, endDate);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Process refund to customer wallet
 * @param {Object} refund - Refund document
 */
async function processRefundToWallet(refund) {
  try {
    // Mark as processing
    await refund.markProcessing();

    // Get or create customer wallet
    const wallet = await CustomerWallet.getOrCreate(refund.customerId);

    // Credit refund to wallet
    await wallet.creditRefund(
      refund.approvedAmount,
      refund.orderId,
      refund._id,
      `Refund for order ${refund.orderSnapshot.orderNumber}`,
      {
        refundNumber: refund.refundNumber,
        refundReason: refund.refundReason,
      },
    );

    // Get the last transaction ID (just added)
    const lastTransaction = wallet.transactions[wallet.transactions.length - 1];

    // Mark refund as completed
    await refund.markCompleted(lastTransaction._id);

    // Update order payment status if full refund
    const order = await Order.findById(refund.orderId);
    if (order && refund.approvedAmount >= order.total) {
      order.paymentStatus = "refunded";
      await order.save();
    } else if (order && refund.approvedAmount < order.total) {
      order.paymentStatus = "partially_refunded";
      await order.save();
    }

    // Create deduction transactions for store, driver, platform
    if (refund.costDistribution.fromStore > 0) {
      await Transaction.create({
        storeId: refund.storeId,
        userType: "store",
        type: "refund",
        amount: -refund.costDistribution.fromStore,
        balanceAfter: await Transaction.getBalance(refund.storeId, "store"),
        description: `Refund deduction for order ${refund.orderSnapshot.orderNumber}`,
        orderId: refund.orderId,
        status: "completed",
        metadata: {
          refundId: refund._id,
          refundNumber: refund.refundNumber,
        },
      });
    }

    if (refund.costDistribution.fromDriver > 0 && refund.riderId) {
      await Transaction.create({
        userId: refund.riderId,
        userType: "driver",
        type: "refund",
        amount: -refund.costDistribution.fromDriver,
        balanceAfter: await Transaction.getBalance(refund.riderId, "driver"),
        description: `Refund deduction for order ${refund.orderSnapshot.orderNumber}`,
        orderId: refund.orderId,
        status: "completed",
        metadata: {
          refundId: refund._id,
          refundNumber: refund.refundNumber,
        },
      });
    }

    if (refund.costDistribution.fromPlatform > 0) {
      await Transaction.create({
        userType: "platform",
        type: "refund",
        amount: -refund.costDistribution.fromPlatform,
        balanceAfter: await Transaction.getBalance(null, "platform"),
        description: `Refund absorbed for order ${refund.orderSnapshot.orderNumber}`,
        orderId: refund.orderId,
        status: "completed",
        metadata: {
          refundId: refund._id,
          refundNumber: refund.refundNumber,
        },
      });
    }

    return refund;
  } catch (error) {
    console.error("Error in processRefundToWallet:", error);
    throw error;
  }
}

// ============================================
// WALLET ENDPOINTS
// ============================================

/**
 * @desc    Get customer wallet
 * @route   GET /api/customer/wallet
 * @access  Private (Customer)
 */
export const getCustomerWallet = asyncHandler(async (req, res, next) => {
  const customerId = req.user._id;

  const wallet = await CustomerWallet.getOrCreate(customerId);

  res.status(200).json({
    success: true,
    data: { wallet },
  });
});

/**
 * @desc    Get wallet transactions
 * @route   GET /api/customer/wallet/transactions
 * @access  Private (Customer)
 */
export const getWalletTransactions = asyncHandler(async (req, res, next) => {
  const customerId = req.user._id;
  const limit = parseInt(req.query.limit) || 50;

  const wallet = await CustomerWallet.findByCustomer(customerId);
  if (!wallet) {
    return next(new AppError("Wallet not found", 404));
  }

  const transactions = wallet.getTransactions(limit);

  res.status(200).json({
    success: true,
    data: { transactions },
  });
});

/**
 * @desc    Get flagged wallets (admin)
 * @route   GET /api/admin/wallets/flagged
 * @access  Private (Admin)
 */
export const adminGetFlaggedWallets = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 50;

  const wallets = await CustomerWallet.getFlaggedWallets(limit);

  res.status(200).json({
    success: true,
    data: { wallets },
  });
});

/**
 * @desc    Get wallet statistics (admin)
 * @route   GET /api/admin/wallets/stats
 * @access  Private (Admin)
 */
export const adminGetWalletStats = asyncHandler(async (req, res, next) => {
  const stats = await CustomerWallet.getStatistics();

  res.status(200).json({
    success: true,
    data: { stats },
  });
});
