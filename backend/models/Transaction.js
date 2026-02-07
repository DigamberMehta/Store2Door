import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userType: {
      type: String,
      enum: ["driver", "store", "platform", "customer"],
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      index: true,
    },
    type: {
      type: String,
      enum: [
        "earning",
        "withdrawal",
        "bonus",
        "fee",
        "refund",
        "adjustment",
        "tip",
        "order_revenue",
        "commission",
        "platform_fee",
        "credit",
        "debit",
      ],
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
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ storeId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userType: 1, type: 1 });
transactionSchema.index({ status: 1 });

// Static method to create earning transaction (for drivers)
transactionSchema.statics.createEarning = async function (
  userId,
  orderId,
  amount,
  description,
  metadata = {},
) {
  const currentBalance = await this.getBalance(userId, "driver");
  const newBalance = currentBalance + amount;

  return await this.create({
    userId,
    userType: "driver",
    type: "earning",
    amount,
    balanceAfter: newBalance,
    description,
    orderId,
    status: "completed",
    metadata,
  });
};

// Static method to create store revenue transaction
transactionSchema.statics.createStoreRevenue = async function (
  storeId,
  orderId,
  amount,
  description,
  metadata = {},
) {
  const currentBalance = await this.getBalance(storeId, "store");
  const newBalance = currentBalance + amount;

  return await this.create({
    storeId,
    userType: "store",
    type: "order_revenue",
    amount,
    balanceAfter: newBalance,
    description,
    orderId,
    status: "completed",
    metadata,
  });
};

// Static method to create platform commission transaction
transactionSchema.statics.createPlatformCommission = async function (
  orderId,
  amount,
  description,
  metadata = {},
) {
  const currentBalance = await this.getBalance(null, "platform");
  const newBalance = currentBalance + amount;

  return await this.create({
    userType: "platform",
    type: "commission",
    amount,
    balanceAfter: newBalance,
    description,
    orderId,
    status: "completed",
    metadata,
  });
};

// Static method to create withdrawal transaction
transactionSchema.statics.createWithdrawal = async function (
  userId,
  userType,
  amount,
  description,
  metadata = {},
) {
  const currentBalance = await this.getBalance(
    userType === "store" ? null : userId,
    userType,
    userType === "store" ? userId : null,
  );

  if (currentBalance < amount) {
    throw new Error("Insufficient balance");
  }

  const newBalance = currentBalance - amount;

  const txData = {
    userType,
    type: "withdrawal",
    amount: -amount, // Negative for deductions
    balanceAfter: newBalance,
    description,
    status: "pending",
    metadata,
  };

  if (userType === "store") {
    txData.storeId = userId; // For stores, userId is actually storeId
  } else {
    txData.userId = userId;
  }

  return await this.create(txData);
};

// Static method to get current balance
transactionSchema.statics.getBalance = async function (
  userId,
  userType,
  storeId = null,
) {
  const query = { userType };

  if (userType === "store") {
    query.storeId = storeId || userId;
  } else if (userType === "platform") {
    // Platform transactions have no userId or storeId
  } else {
    query.userId = userId;
  }

  const lastTransaction = await this.findOne(query)
    .sort({ createdAt: -1 })
    .select("balanceAfter");

  return lastTransaction ? lastTransaction.balanceAfter : 0;
};

// Static method to get earnings summary
transactionSchema.statics.getEarningsSummary = async function (
  userId,
  userType,
  startDate,
  endDate,
) {
  const query = {
    userType,
    type: { $in: ["earning", "tip", "order_revenue", "commission"] },
    status: "completed",
  };

  if (userType === "store") {
    query.storeId = userId;
  } else if (userType !== "platform") {
    query.userId = userId;
  }

  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const earnings = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return earnings[0] || { totalAmount: 0, count: 0 };
};

// Static method to credit customer wallet (refund, promotional credit, etc.)
transactionSchema.statics.creditCustomer = async function (
  customerId,
  amount,
  type,
  description,
  orderId = null,
  metadata = {},
) {
  const currentBalance = await this.getBalance(customerId, "customer");
  const newBalance = currentBalance + amount;

  return await this.create({
    userId: customerId,
    userType: "customer",
    type,
    amount,
    balanceAfter: newBalance,
    description,
    orderId,
    status: "completed",
    metadata,
  });
};

// Static method to debit customer wallet (use wallet balance for order)
transactionSchema.statics.debitCustomer = async function (
  customerId,
  amount,
  description,
  orderId = null,
  metadata = {},
) {
  const currentBalance = await this.getBalance(customerId, "customer");

  if (currentBalance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  const newBalance = currentBalance - amount;

  return await this.create({
    userId: customerId,
    userType: "customer",
    type: "debit",
    amount: -amount, // Negative for deductions
    balanceAfter: newBalance,
    description,
    orderId,
    status: "completed",
    metadata,
  });
};

// Static method to get customer transactions
transactionSchema.statics.getCustomerTransactions = async function (
  customerId,
  limit = 50,
  skip = 0,
) {
  return await this.find({
    userId: customerId,
    userType: "customer",
    status: { $in: ["completed", "pending"] },
  })
    .populate("orderId", "orderNumber items total")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
