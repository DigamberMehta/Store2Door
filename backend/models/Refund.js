import mongoose from "mongoose";

// Evidence/attachment sub-schema
const evidenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "document", "video"],
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  filename: {
    type: String,
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Cost distribution sub-schema
const costDistributionSchema = new mongoose.Schema({
  // Amount deducted from store
  fromStore: {
    type: Number,
    default: 0,
    min: [0, "Store deduction cannot be negative"],
  },
  // Amount deducted from driver
  fromDriver: {
    type: Number,
    default: 0,
    min: [0, "Driver deduction cannot be negative"],
  },
  // Amount absorbed by platform
  fromPlatform: {
    type: Number,
    default: 0,
    min: [0, "Platform absorption cannot be negative"],
  },
  // Rationale for the split
  rationale: {
    type: String,
    trim: true,
    maxlength: 500,
  },
});

// Main refund schema
const refundSchema = new mongoose.Schema(
  {
    // Refund identification
    refundNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },

    // References
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order ID is required"],
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Customer request details
    requestedAmount: {
      type: Number,
      required: [true, "Requested refund amount is required"],
      min: [0, "Requested amount cannot be negative"],
    },
    refundReason: {
      type: String,
      enum: [
        "not_delivered",
        "delivered_wrong_items",
        "delivered_damaged_items",
        "delivered_incomplete_order",
        "quality_issue",
        "late_delivery",
        "delivery_mishap",
        "customer_cancelled",
        "store_cancelled",
        "order_rejected",
        "other",
      ],
      required: [true, "Refund reason is required"],
    },
    customerNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    evidenceFiles: [evidenceSchema],

    // Admin decision
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    approvedAmount: {
      type: Number,
      min: [0, "Approved amount cannot be negative"],
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Cost distribution (how refund cost is split)
    costDistribution: costDistributionSchema,

    // Refund status
    status: {
      type: String,
      enum: [
        "pending_review", // Customer submitted, waiting for admin
        "under_review", // Admin is reviewing
        "approved", // Admin approved, processing payment
        "rejected", // Admin rejected the request
        "processing", // Crediting wallet
        "completed", // Successfully credited to wallet
        "failed", // Failed to credit wallet
      ],
      default: "pending_review",
      index: true,
    },

    // Processing details
    processedAt: {
      type: Date,
    },
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    failureReason: {
      type: String,
      trim: true,
    },

    // Currency
    currency: {
      type: String,
      default: "ZAR",
      uppercase: true,
      enum: ["ZAR"],
    },

    // Order snapshot (for reference)
    orderSnapshot: {
      orderNumber: String,
      orderTotal: Number,
      orderStatus: String,
      paymentStatus: String,
      // Payment split breakdown from order
      paymentSplit: {
        storeAmount: Number,
        driverAmount: Number,
        platformAmount: Number,
        platformBreakdown: {
          totalMarkup: Number,
          discountAbsorbed: Number,
          netEarnings: Number,
        },
      },
      // Individual components for clarity
      subtotal: Number,
      deliveryFee: Number,
      tip: Number,
      discount: Number,
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance
refundSchema.index({ orderId: 1, status: 1 });
refundSchema.index({ customerId: 1, createdAt: -1 });
refundSchema.index({ status: 1, createdAt: -1 });
refundSchema.index({ reviewedBy: 1 });

// Pre-save middleware
refundSchema.pre("save", function (next) {
  // Auto-generate refund number if not provided
  if (!this.refundNumber) {
    this.refundNumber = `REF-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
  }

  // Set reviewed timestamp
  if (this.isModified("status")) {
    if (this.status === "approved" || this.status === "rejected") {
      if (!this.reviewedAt) {
        this.reviewedAt = new Date();
      }
    }

    if (this.status === "completed" || this.status === "failed") {
      if (!this.processedAt) {
        this.processedAt = new Date();
      }
    }
  }

  next();
});

// Instance methods

// Approve refund
refundSchema.methods.approve = async function (
  adminId,
  approvedAmount,
  costDistribution,
  adminNote = "",
) {
  if (this.status !== "pending_review" && this.status !== "under_review") {
    throw new Error("Only pending or under review refunds can be approved");
  }

  this.status = "approved";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.approvedAmount = approvedAmount;
  this.adminNote = adminNote;
  this.costDistribution = costDistribution;

  return await this.save();
};

// Reject refund
refundSchema.methods.reject = async function (
  adminId,
  rejectionReason,
  adminNote = "",
) {
  if (this.status !== "pending_review" && this.status !== "under_review") {
    throw new Error("Only pending or under review refunds can be rejected");
  }

  this.status = "rejected";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.rejectionReason = rejectionReason;
  this.adminNote = adminNote;

  return await this.save();
};

// Mark as under review
refundSchema.methods.markUnderReview = async function (adminId) {
  if (this.status !== "pending_review") {
    throw new Error("Only pending refunds can be marked under review");
  }

  this.status = "under_review";
  this.reviewedBy = adminId;

  return await this.save();
};

// Mark as processing
refundSchema.methods.markProcessing = async function () {
  if (this.status !== "approved") {
    throw new Error("Only approved refunds can be marked as processing");
  }

  this.status = "processing";
  return await this.save();
};

// Mark as completed
refundSchema.methods.markCompleted = async function (walletTransactionId) {
  if (this.status !== "processing") {
    throw new Error("Only processing refunds can be marked as completed");
  }

  this.status = "completed";
  this.processedAt = new Date();
  this.walletTransactionId = walletTransactionId;

  return await this.save();
};

// Mark as failed
refundSchema.methods.markFailed = async function (failureReason) {
  if (this.status !== "processing") {
    throw new Error("Only processing refunds can be marked as failed");
  }

  this.status = "failed";
  this.processedAt = new Date();
  this.failureReason = failureReason;

  return await this.save();
};

// Check if refund is actionable by customer
refundSchema.methods.canCustomerCancel = function () {
  return this.status === "pending_review" || this.status === "under_review";
};

// Check if refund is actionable by admin
refundSchema.methods.canAdminReview = function () {
  return this.status === "pending_review" || this.status === "under_review";
};

// Static methods

// Find refunds by order
refundSchema.statics.findByOrder = async function (orderId) {
  return await this.find({ orderId }).sort({ createdAt: -1 });
};

// Find refunds by customer
refundSchema.statics.findByCustomer = async function (
  customerId,
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;
  return await this.find({ customerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("orderId", "orderNumber total status paymentStatus")
    .populate("storeId", "name logo")
    .populate("reviewedBy", "name email");
};

// Get pending refunds for admin review
refundSchema.statics.getPendingRefunds = async function (page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return await this.find({
    status: { $in: ["pending_review", "under_review"] },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("customerId", "name email phone profilePhoto")
    .populate({
      path: "orderId",
      select: "orderNumber total status paymentStatus paymentMethod createdAt",
      populate: {
        path: "paymentId",
        select:
          "paymentNumber method status amount paystackReference completedAt",
      },
    })
    .populate("storeId", "name logo phone")
    .populate("reviewedBy", "name email");
};

// Get all refunds with filters
refundSchema.statics.getAllRefunds = async function (filters = {}) {
  const query = {};
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.customerId) {
    query.customerId = filters.customerId;
  }
  if (filters.orderId) {
    query.orderId = filters.orderId;
  }
  if (filters.refundReason) {
    query.refundReason = filters.refundReason;
  }
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }
  if (filters.search) {
    query.$or = [
      { refundNumber: { $regex: filters.search, $options: "i" } },
      { customerNote: { $regex: filters.search, $options: "i" } },
    ];
  }

  const refunds = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("customerId", "name email phone profilePhoto")
    .populate({
      path: "orderId",
      select: "orderNumber total status paymentStatus paymentMethod createdAt",
      populate: {
        path: "paymentId",
        select:
          "paymentNumber method status amount paystackReference completedAt",
      },
    })
    .populate("storeId", "name logo phone")
    .populate("reviewedBy", "name email");

  const total = await this.countDocuments(query);

  return {
    refunds,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get refund statistics
refundSchema.statics.getStatistics = async function (startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRequested: { $sum: "$requestedAmount" },
        totalApproved: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, "$approvedAmount", 0],
          },
        },
      },
    },
  ]);

  // Format statistics
  const formatted = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    totalRequestedAmount: 0,
    totalApprovedAmount: 0,
  };

  stats.forEach((stat) => {
    formatted.total += stat.count;
    formatted.totalRequestedAmount += stat.totalRequested;
    formatted.totalApprovedAmount += stat.totalApproved;

    if (stat._id === "pending_review" || stat._id === "under_review") {
      formatted.pending += stat.count;
    } else if (stat._id === "approved" || stat._id === "processing") {
      formatted.approved += stat.count;
    } else if (stat._id === "rejected") {
      formatted.rejected += stat.count;
    } else if (stat._id === "completed") {
      formatted.completed += stat.count;
    }
  });

  return formatted;
};

// Check if order already has refund
refundSchema.statics.orderHasRefund = async function (orderId) {
  const refund = await this.findOne({
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
  return !!refund;
};

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;
