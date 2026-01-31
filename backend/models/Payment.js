import mongoose from "mongoose";

// Payment attempt sub-schema
const paymentAttemptSchema = new mongoose.Schema({
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "succeeded", "failed"],
    required: true,
  },
  failureReason: {
    type: String,
    trim: true,
  },
  yocoResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
});

// Webhook event sub-schema
const webhookEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    trim: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
  },
  processed: {
    type: Boolean,
    default: false,
  },
});

// Refund sub-schema
const refundSchema = new mongoose.Schema({
  refundId: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "succeeded", "failed"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
  yocoRefundId: {
    type: String,
    trim: true,
  },
});

// Main payment schema
const paymentSchema = new mongoose.Schema(
  {
    // References
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // Payment identification
    paymentNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },

    // Payment method
    method: {
      type: String,
      enum: ["yoco_card", "yoco_eft", "yoco_instant_eft"],
      required: [true, "Payment method is required"],
    },

    // Payment status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "requires_action",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
      index: true,
    },

    // Amount details
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "ZAR",
      uppercase: true,
      enum: ["ZAR"],
    },
    amountRefunded: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Yoco payment fields
    yocoCheckoutId: {
      type: String,
      trim: true,
    },
    yocoPaymentId: {
      type: String,
      trim: true,
    },
    yocoChargeId: {
      type: String,
      trim: true,
    },

    // Card details (for card payments)
    cardDetails: {
      lastFour: {
        type: String,
        trim: true,
        maxlength: 4,
      },
      brand: {
        type: String,
        enum: ["visa", "mastercard", "amex", "diners", "discovery", "unknown"],
      },
      expiryMonth: {
        type: String,
        maxlength: 2,
      },
      expiryYear: {
        type: String,
        maxlength: 4,
      },
      cardholderName: {
        type: String,
        trim: true,
      },
    },

    // Transaction details
    transactionId: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },

    // Payment timeline
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },

    // Failure information
    failureCode: {
      type: String,
      trim: true,
    },
    failureMessage: {
      type: String,
      trim: true,
    },

    // Payment description
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Customer information
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },

    // Payment attempts history
    attempts: [paymentAttemptSchema],

    // Webhook events
    webhookEvents: [webhookEventSchema],

    // Refunds
    refunds: [refundSchema],

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Security
    idempotencyKey: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    // IP and user agent for fraud detection
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ yocoPaymentId: 1 }, { sparse: true });
paymentSchema.index({ yocoCheckoutId: 1 }, { sparse: true });

// Pre-save middleware
paymentSchema.pre("save", function (next) {
  // Auto-generate payment number if not provided
  if (!this.paymentNumber) {
    this.paymentNumber = `PAY-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }

  // Set completed/failed timestamps based on status
  if (this.isModified("status")) {
    if (this.status === "succeeded" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status === "failed" && !this.failedAt) {
      this.failedAt = new Date();
    } else if (this.status === "cancelled" && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }

  next();
});

// Instance methods
paymentSchema.methods.addAttempt = function (
  status,
  failureReason,
  yocoResponse,
) {
  this.attempts.push({
    attemptedAt: new Date(),
    status,
    failureReason,
    yocoResponse,
  });
  return this.save();
};

paymentSchema.methods.addWebhookEvent = function (eventType, payload) {
  this.webhookEvents.push({
    eventType,
    receivedAt: new Date(),
    payload,
    processed: false,
  });
  return this.save();
};

paymentSchema.methods.markWebhookProcessed = function (webhookId) {
  const webhook = this.webhookEvents.id(webhookId);
  if (webhook) {
    webhook.processed = true;
    return this.save();
  }
  return Promise.resolve(this);
};

paymentSchema.methods.markAsSucceeded = function (
  yocoPaymentId,
  transactionId,
  cardDetails,
) {
  this.status = "succeeded";
  this.yocoPaymentId = yocoPaymentId;
  this.transactionId = transactionId;
  this.completedAt = new Date();

  if (cardDetails) {
    this.cardDetails = cardDetails;
  }

  return this.save();
};

paymentSchema.methods.markAsFailed = function (failureCode, failureMessage) {
  this.status = "failed";
  this.failureCode = failureCode;
  this.failureMessage = failureMessage;
  this.failedAt = new Date();
  return this.save();
};

paymentSchema.methods.addRefund = function (refundData) {
  this.refunds.push(refundData);

  // Update refunded amount
  const totalRefunded = this.refunds
    .filter((r) => r.status === "succeeded")
    .reduce((sum, r) => sum + r.amount, 0);

  this.amountRefunded = totalRefunded;

  // Update payment status
  if (this.amountRefunded >= this.amount) {
    this.status = "refunded";
  } else if (this.amountRefunded > 0) {
    this.status = "partially_refunded";
  }

  return this.save();
};

paymentSchema.methods.canBeRefunded = function () {
  return this.status === "succeeded" && this.amountRefunded < this.amount;
};

paymentSchema.methods.getRemainingAmount = function () {
  return this.amount - this.amountRefunded;
};

// Static methods
paymentSchema.statics.findByOrder = function (orderId) {
  return this.find({ orderId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findByUser = function (userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("orderId", "orderNumber total");
};

paymentSchema.statics.findByYocoPaymentId = function (yocoPaymentId) {
  return this.findOne({ yocoPaymentId });
};

paymentSchema.statics.findByYocoCheckoutId = function (yocoCheckoutId) {
  return this.findOne({ yocoCheckoutId });
};

paymentSchema.statics.getSuccessfulPayments = function (startDate, endDate) {
  return this.find({
    status: "succeeded",
    completedAt: { $gte: startDate, $lte: endDate },
  });
};

paymentSchema.statics.getPaymentStats = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
};

paymentSchema.statics.getPendingPayments = function () {
  return this.find({
    status: { $in: ["pending", "processing", "requires_action"] },
  });
};

// Virtual for total refunded
paymentSchema.virtual("totalRefunded").get(function () {
  if (!this.refunds || !Array.isArray(this.refunds)) {
    return 0;
  }
  return this.refunds
    .filter((r) => r.status === "succeeded")
    .reduce((sum, r) => sum + r.amount, 0);
});

// Ensure virtuals are included in JSON
paymentSchema.set("toJSON", { virtuals: true });
paymentSchema.set("toObject", { virtuals: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
