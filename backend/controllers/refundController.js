import Refund from "../models/Refund.js";
import Order from "../models/Order.js";
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
  const { orderId, refundReason, customerNote, evidenceFiles } = req.body;

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

  // 🔒 SECURITY: Check 2-day refund window limit
  const REFUND_WINDOW_DAYS = 2;
  const daysSinceOrder =
    (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > REFUND_WINDOW_DAYS) {
    return next(
      new AppError(
        `Refund requests must be made within ${REFUND_WINDOW_DAYS} days of order placement`,
        400,
      ),
    );
  }

  // 🔒 SECURITY: Check if order has already been fully refunded
  if (order.paymentStatus === "refunded") {
    return next(
      new AppError("This order has already been fully refunded", 400),
    );
  }

  // 🔒 SECURITY: Prevent multiple active refund requests for same order
  const existingRefund = await Refund.findOne({
    orderId,
    status: {
      $in: [
        "pending_review",
        "under_review",
        "approved",
        "processing",
        "completed",
      ],
    },
  });
  if (existingRefund) {
    return next(
      new AppError(
        `An active refund request already exists for this order (Status: ${existingRefund.status})`,
        400,
      ),
    );
  }

  // 🔒 SECURITY: Verify order payment status is valid for refund
  const validPaymentStatuses = ["paid", "succeeded", "partially_refunded"];
  if (!validPaymentStatuses.includes(order.paymentStatus)) {
    return next(
      new AppError(
        `Cannot refund orders with payment status: ${order.paymentStatus}`,
        400,
      ),
    );
  }

  // Admin decides the final refund amount - customer just raises a request

  // Create refund request
  const refund = await Refund.create({
    orderId,
    customerId,
    storeId: order.storeId,
    riderId: order.riderId,
    refundReason,
    customerNote,
    evidenceFiles: evidenceFiles || [],
    orderSnapshot: {
      orderNumber: order.orderNumber,
      orderTotal: order.total,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      paymentSplit: order.paymentSplit || {},
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      tip: order.tip,
      discount: order.discount,
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
  const orderId = req.query.orderId; // Filter by orderId if provided

  let filter = { customerId };
  if (orderId) {
    filter.orderId = orderId;
  }

  const refunds = await Refund.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("orderId", "orderNumber total status paymentStatus");

  // Get total count
  const total = await Refund.countDocuments(filter);

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
    // Customer details
    .populate("customerId", "name email phone profilePhoto role createdAt")

    // Order details with nested payment and items
    .populate({
      path: "orderId",
      select:
        "orderNumber total status paymentStatus items paymentSplit subtotal deliveryFee tip discount deliveryAddress trackingHistory createdAt placedAt confirmedAt rejectedBy rejectedAt rejectionReason cancelledBy cancelledAt cancellationReason paymentMethod",
      populate: [
        {
          path: "items.productId",
          select: "name images price category",
        },
        {
          path: "paymentId",
          select:
            "paymentNumber method status amount currency amountRefunded paystackReference paystackPaymentId transactionId cardDetails initiatedAt completedAt failedAt failureMessage attempts webhookEvents refunds receiptUrl",
        },
        {
          path: "rejectedBy",
          select: "name email role",
        },
        {
          path: "cancelledBy",
          select: "name email role",
        },
      ],
    })

    // Store details
    .populate(
      "storeId",
      "name logo phone email address operatingHours isOpen averageRating reviewCount createdAt",
    )

    // Rider details (if assigned)
    .populate("riderId", "name phone email profilePhoto vehicleInfo createdAt")

    // Admin who reviewed
    .populate("reviewedBy", "name email role");

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
  const { costDistribution, adminNote } = req.body;

  // Validate cost distribution
  if (!costDistribution) {
    return next(new AppError("Cost distribution is required", 400));
  }

  const { fromStore, fromDriver, fromPlatform, rationale } = costDistribution;

  // 🔒 SECURITY: Validate no negative amounts
  if (fromStore < 0 || fromDriver < 0 || fromPlatform < 0) {
    return next(new AppError("Refund amounts cannot be negative", 400));
  }

  // 🔒 SECURITY: Round to 2 decimal places to prevent floating point issues
  const roundedFromStore = Math.round(fromStore * 100) / 100;
  const roundedFromDriver = Math.round(fromDriver * 100) / 100;
  const roundedFromPlatform = Math.round(fromPlatform * 100) / 100;

  // Calculate approved amount from distribution with proper rounding
  const approvedAmount =
    Math.round(
      (roundedFromStore + roundedFromDriver + roundedFromPlatform) * 100,
    ) / 100;

  // Validate approved amount
  if (approvedAmount <= 0) {
    return next(
      new AppError("Total refund amount must be greater than 0", 400),
    );
  }

  // 🔒 SECURITY: Find refund with order details
  const refund = await Refund.findById(id).populate({
    path: "orderId",
    select: "paymentSplit deliveryFee tip total storeId riderId status",
  });
  if (!refund) {
    return next(new AppError("Refund request not found", 404));
  }

  // 🔒 SECURITY: Prevent multiple approvals (race condition protection)
  if (refund.status !== "pending_review" && refund.status !== "under_review") {
    return next(
      new AppError(
        `Cannot approve refund with current status: ${refund.status}`,
        400,
      ),
    );
  }

  // 🔒 SECURITY: Verify store ID matches (prevent admin refunding wrong store)
  if (refund.storeId.toString() !== refund.orderId.storeId.toString()) {
    return next(new AppError("Store ID mismatch - data integrity error", 400));
  }

  // 🔒 SECURITY: Validate approved amount doesn't exceed order total
  if (refund.orderId && approvedAmount > refund.orderId.total) {
    return next(
      new AppError(
        `Total refund amount (R ${approvedAmount.toFixed(2)}) cannot exceed order total (R ${refund.orderId.total.toFixed(2)})`,
        400,
      ),
    );
  }

  // 🔒 SECURITY: Validate contribution limits based on earned amounts
  if (refund.orderId && refund.orderId.paymentSplit) {
    const maxFromStore =
      Math.round((refund.orderId.paymentSplit.storeAmount || 0) * 100) / 100;
    const deliveryFee =
      Math.round((refund.orderId.deliveryFee || 0) * 100) / 100;
    const tip = Math.round((refund.orderId.tip || 0) * 100) / 100;
    const maxFromDriver = deliveryFee + tip;

    // 🔒 SECURITY: Store refund validation
    if (roundedFromStore > maxFromStore + 0.01) {
      // 1 cent tolerance for rounding
      return next(
        new AppError(
          `Store contribution (R ${roundedFromStore.toFixed(2)}) cannot exceed their earned amount (R ${maxFromStore.toFixed(2)})`,
          400,
        ),
      );
    }

    // 🔒 SECURITY: Driver refund validation - only if driver was assigned
    if (roundedFromDriver > 0) {
      if (!refund.riderId) {
        return next(
          new AppError(
            "Cannot deduct from driver - no driver was assigned to this order",
            400,
          ),
        );
      }

      // Verify driver actually received the order
      const driverReceivedStatuses = ["picked_up", "on_the_way", "delivered"];
      if (!driverReceivedStatuses.includes(refund.orderId.status)) {
        return next(
          new AppError(
            `Cannot deduct from driver - order status is ${refund.orderId.status}. Driver must have picked up the order.`,
            400,
          ),
        );
      }

      if (roundedFromDriver > maxFromDriver + 0.01) {
        // 1 cent tolerance
        return next(
          new AppError(
            `Driver contribution (R ${roundedFromDriver.toFixed(2)}) cannot exceed delivery fee + tip (R ${maxFromDriver.toFixed(2)})`,
            400,
          ),
        );
      }
    }
  }

  // 🔒 AUDIT LOG: Record refund approval
  console.log(
    `[REFUND AUDIT] ${new Date().toISOString()} - Admin ${adminId} approving refund ${refund.refundNumber}`,
  );
  console.log(`  Order: ${refund.orderSnapshot.orderNumber}`);
  console.log(`  Amount: R${approvedAmount.toFixed(2)}`);
  console.log(
    `  Distribution: Store R${roundedFromStore}, Driver R${roundedFromDriver}, Platform R${roundedFromPlatform}`,
  );
  console.log(`  Rationale: ${rationale || "N/A"}`);

  // Approve refund with rounded amounts
  await refund.approve(
    adminId,
    approvedAmount,
    {
      fromStore: roundedFromStore,
      fromDriver: roundedFromDriver,
      fromPlatform: roundedFromPlatform,
      rationale,
    },
    adminNote,
  );

  // 🔒 SECURITY: Process refund with database transaction for consistency
  try {
    await processRefundToWallet(refund);

    // 🔒 AUDIT LOG: Success
    console.log(
      `[REFUND AUDIT] ${new Date().toISOString()} - Refund ${refund.refundNumber} processed successfully`,
    );
  } catch (error) {
    console.error(
      `[REFUND AUDIT] ${new Date().toISOString()} - Error processing refund ${refund.refundNumber}:`,
      error,
    );
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
    // 🔒 SECURITY: Mark as processing (status lock against race conditions)
    await refund.markProcessing();

    // 🔒 SECURITY: Round amount to prevent floating point issues
    const creditAmount = Math.round(refund.approvedAmount * 100) / 100;

    // 🔒 AUDIT LOG: Credit transaction
    console.log(
      `[REFUND AUDIT] ${new Date().toISOString()} - Crediting R${creditAmount} to customer ${refund.customerId}`,
    );

    // Credit refund to customer using Transaction model
    await Transaction.creditCustomer(
      refund.customerId,
      creditAmount, // Already in Rands, properly rounded
      "refund",
      `Refund for order ${refund.orderSnapshot.orderNumber}`,
      refund.orderId,
      {
        refundId: refund._id,
        refundNumber: refund.refundNumber,
        refundReason: refund.refundReason,
      },
    );

    // Get the transaction we just created
    const customerTransaction = await Transaction.findOne({
      userId: refund.customerId,
      userType: "customer",
      orderId: refund.orderId,
      "metadata.refundId": refund._id,
    }).sort({ createdAt: -1 });

    // Mark refund as completed
    await refund.markCompleted(customerTransaction._id);

    // Update order payment status and order status if full refund
    const order = await Order.findById(refund.orderId);
    if (order && refund.approvedAmount >= order.total) {
      order.paymentStatus = "refunded";
      // Update order status to refunded if it was delivered
      if (order.status === "delivered") {
        order.status = "refunded";
        // Add tracking history entry
        order.trackingHistory.push({
          status: "refunded",
          updatedAt: new Date(),
          notes: `Order refunded - ${refund.refundReason}`,
        });
      }
      await order.save();
    } else if (order && refund.approvedAmount < order.total) {
      order.paymentStatus = "partially_refunded";
      await order.save();
    }

    // 🔒 SECURITY: Create deduction transactions for store, driver, platform (rounded amounts)
    if (refund.costDistribution.fromStore > 0) {
      const storeDeduction =
        Math.round(refund.costDistribution.fromStore * 100) / 100;
      console.log(
        `[REFUND AUDIT] ${new Date().toISOString()} - Deducting R${storeDeduction} from store ${refund.storeId}`,
      );

      const currentStoreBalance = await Transaction.getBalance(
        refund.storeId,
        "store",
      );

      await Transaction.create({
        storeId: refund.storeId,
        userType: "store",
        type: "refund",
        amount: -storeDeduction,
        balanceAfter: currentStoreBalance - storeDeduction,
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
      const driverDeduction =
        Math.round(refund.costDistribution.fromDriver * 100) / 100;
      console.log(
        `[REFUND AUDIT] ${new Date().toISOString()} - Deducting R${driverDeduction} from driver ${refund.riderId}`,
      );

      const currentDriverBalance = await Transaction.getBalance(
        refund.riderId,
        "driver",
      );

      await Transaction.create({
        userId: refund.riderId,
        userType: "driver",
        type: "refund",
        amount: -driverDeduction,
        balanceAfter: currentDriverBalance - driverDeduction,
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
      const platformAbsorption =
        Math.round(refund.costDistribution.fromPlatform * 100) / 100;
      console.log(
        `[REFUND AUDIT] ${new Date().toISOString()} - Platform absorbing R${platformAbsorption}`,
      );

      const currentPlatformBalance = await Transaction.getBalance(
        null,
        "platform",
      );

      await Transaction.create({
        userType: "platform",
        type: "refund",
        amount: -platformAbsorption,
        balanceAfter: currentPlatformBalance - platformAbsorption,
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

  // Get balance from Transaction model (in Rands)
  const balanceInRands = await Transaction.getBalance(customerId, "customer");

  // Convert to cents for frontend compatibility
  const balanceInCents = balanceInRands * 100;

  res.status(200).json({
    success: true,
    data: {
      wallet: {
        balance: balanceInCents,
        currency: "ZAR",
        status: "active",
      },
    },
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

  // Get transactions from Transaction model
  const transactions = await Transaction.getCustomerTransactions(
    customerId,
    limit,
  );

  // Format for frontend (convert to cents for compatibility)
  const formattedTransactions = transactions.map((tx) => ({
    _id: tx._id,
    type: tx.type === "refund" || tx.type === "credit" ? "credit" : "debit",
    amount: Math.abs(tx.amount) * 100, // Convert to cents
    balanceAfter: tx.balanceAfter * 100, // Convert to cents
    description: tx.description,
    orderId: tx.orderId?._id,
    refundId: tx.metadata?.refundId,
    date: tx.createdAt,
    createdAt: tx.createdAt,
    metadata: tx.metadata,
  }));

  res.status(200).json({
    success: true,
    data: { transactions: formattedTransactions },
  });
});

// Note: Admin wallet endpoints removed
// Fraud detection and wallet statistics can be implemented
// using Transaction model aggregations if needed
