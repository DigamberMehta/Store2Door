import mongoose from "mongoose";

// Wallet transaction sub-schema
const walletTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["credit", "debit", "refund", "adjustment"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  refundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Refund",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main customer wallet schema
const customerWalletSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
      unique: true,
      index: true,
    },

    // Current wallet balance (in ZAR cents for precision)
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },

    // Currency
    currency: {
      type: String,
      default: "ZAR",
      uppercase: true,
      enum: ["ZAR"],
    },

    // Transaction history
    transactions: [walletTransactionSchema],

    // Fraud prevention tracking
    fraudMetrics: {
      totalRefundsReceived: {
        type: Number,
        default: 0,
      },
      totalRefundAmount: {
        type: Number,
        default: 0,
      },
      lastRefundDate: {
        type: Date,
      },
      refundsThisMonth: {
        type: Number,
        default: 0,
      },
      refundsLastMonth: {
        type: Number,
        default: 0,
      },
      suspiciousActivityFlags: {
        type: Number,
        default: 0,
      },
      isFlagged: {
        type: Boolean,
        default: false,
      },
      flagReason: {
        type: String,
        trim: true,
      },
    },

    // Wallet status
    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },

    // Last activity
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
customerWalletSchema.index({ customerId: 1 });
customerWalletSchema.index({ status: 1 });
customerWalletSchema.index({ "fraudMetrics.isFlagged": 1 });

// Instance methods

// Credit wallet (add funds)
customerWalletSchema.methods.credit = async function (
  amount,
  description,
  metadata = {},
) {
  if (amount <= 0) {
    throw new Error("Credit amount must be positive");
  }

  const newBalance = this.balance + amount;

  this.transactions.push({
    type: "credit",
    amount,
    balanceAfter: newBalance,
    description,
    metadata,
    createdAt: new Date(),
  });

  this.balance = newBalance;
  this.lastActivityAt = new Date();

  return await this.save();
};

// Debit wallet (remove funds)
customerWalletSchema.methods.debit = async function (
  amount,
  description,
  metadata = {},
) {
  if (amount <= 0) {
    throw new Error("Debit amount must be positive");
  }

  if (this.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  const newBalance = this.balance - amount;

  this.transactions.push({
    type: "debit",
    amount: -amount,
    balanceAfter: newBalance,
    description,
    metadata,
    createdAt: new Date(),
  });

  this.balance = newBalance;
  this.lastActivityAt = new Date();

  return await this.save();
};

// Credit refund (specific type for refunds)
customerWalletSchema.methods.creditRefund = async function (
  amount,
  orderId,
  refundId,
  description,
  metadata = {},
) {
  if (amount <= 0) {
    throw new Error("Refund amount must be positive");
  }

  const newBalance = this.balance + amount;

  this.transactions.push({
    type: "refund",
    amount,
    balanceAfter: newBalance,
    description,
    orderId,
    refundId,
    metadata,
    createdAt: new Date(),
  });

  this.balance = newBalance;
  this.lastActivityAt = new Date();

  // Update fraud metrics
  this.fraudMetrics.totalRefundsReceived += 1;
  this.fraudMetrics.totalRefundAmount += amount;
  this.fraudMetrics.lastRefundDate = new Date();

  // Update monthly refund count
  const now = new Date();
  const lastRefundMonth = this.fraudMetrics.lastRefundDate
    ? this.fraudMetrics.lastRefundDate.getMonth()
    : null;
  const currentMonth = now.getMonth();

  if (lastRefundMonth !== currentMonth) {
    // New month, reset counter
    this.fraudMetrics.refundsLastMonth = this.fraudMetrics.refundsThisMonth;
    this.fraudMetrics.refundsThisMonth = 1;
  } else {
    this.fraudMetrics.refundsThisMonth += 1;
  }

  // Auto-flag suspicious activity
  await this.checkFraudPatterns();

  return await this.save();
};

// Check for fraud patterns
customerWalletSchema.methods.checkFraudPatterns = async function () {
  // Flag if more than 3 refunds this month
  if (this.fraudMetrics.refundsThisMonth > 3) {
    this.fraudMetrics.isFlagged = true;
    this.fraudMetrics.suspiciousActivityFlags += 1;
    this.fraudMetrics.flagReason = "Excessive refunds this month (>3 refunds)";
  }

  // Get customer's order count for refund ratio calculation
  const Order = mongoose.model("Order");
  const totalOrders = await Order.countDocuments({
    customerId: this.customerId,
    status: "delivered",
  });

  // Flag if refund ratio > 20%
  if (totalOrders > 0) {
    const refundRatio = this.fraudMetrics.totalRefundsReceived / totalOrders;
    if (refundRatio > 0.2) {
      this.fraudMetrics.isFlagged = true;
      this.fraudMetrics.suspiciousActivityFlags += 1;
      this.fraudMetrics.flagReason = `High refund ratio (${(refundRatio * 100).toFixed(1)}%)`;
    }
  }
};

// Get current balance
customerWalletSchema.methods.getBalance = function () {
  return this.balance;
};

// Check if wallet has sufficient balance
customerWalletSchema.methods.canAfford = function (amount) {
  return this.balance >= amount;
};

// Get transaction history
customerWalletSchema.methods.getTransactions = function (limit = 10) {
  return this.transactions
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

// Static methods

// Get or create wallet for customer
customerWalletSchema.statics.getOrCreate = async function (customerId) {
  let wallet = await this.findOne({ customerId });
  if (!wallet) {
    wallet = await this.create({ customerId });
  }
  return wallet;
};

// Get wallet by customer ID
customerWalletSchema.statics.findByCustomer = async function (customerId) {
  return await this.findOne({ customerId });
};

// Get flagged wallets for admin review
customerWalletSchema.statics.getFlaggedWallets = async function (limit = 50) {
  return await this.find({ "fraudMetrics.isFlagged": true })
    .sort({ "fraudMetrics.suspiciousActivityFlags": -1 })
    .limit(limit)
    .populate("customerId", "name email phone");
};

// Get wallet statistics
customerWalletSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalWallets: { $sum: 1 },
        totalBalance: { $sum: "$balance" },
        activeWallets: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        flaggedWallets: {
          $sum: { $cond: ["$fraudMetrics.isFlagged", 1, 0] },
        },
        totalRefunds: { $sum: "$fraudMetrics.totalRefundsReceived" },
        totalRefundAmount: { $sum: "$fraudMetrics.totalRefundAmount" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalWallets: 0,
      totalBalance: 0,
      activeWallets: 0,
      flaggedWallets: 0,
      totalRefunds: 0,
      totalRefundAmount: 0,
    }
  );
};

const CustomerWallet = mongoose.model("CustomerWallet", customerWalletSchema);

export default CustomerWallet;
