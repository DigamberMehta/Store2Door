import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ status: 1 });

// Static method to create earning transaction
transactionSchema.statics.createEarning = async function (
  userId,
  orderId,
  amount,
  description,
  metadata = {},
) {
  const currentBalance = await this.getBalance(userId);
  const newBalance = currentBalance + amount;

  return await this.create({
    userId,
    type: "earning",
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
  amount,
  description,
  metadata = {},
) {
  const currentBalance = await this.getBalance(userId);

  if (currentBalance < amount) {
    throw new Error("Insufficient balance");
  }

  const newBalance = currentBalance - amount;

  return await this.create({
    userId,
    type: "withdrawal",
    amount: -amount, // Negative for deductions
    balanceAfter: newBalance,
    description,
    status: "pending",
    metadata,
  });
};

// Static method to get current balance
transactionSchema.statics.getBalance = async function (userId) {
  const lastTransaction = await this.findOne({ userId })
    .sort({ createdAt: -1 })
    .select("balanceAfter");

  return lastTransaction ? lastTransaction.balanceAfter : 0;
};

// Static method to get earnings summary
transactionSchema.statics.getEarningsSummary = async function (
  userId,
  startDate,
  endDate,
) {
  const query = {
    userId,
    type: { $in: ["earning", "tip"] },
    status: "completed",
  };

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

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
