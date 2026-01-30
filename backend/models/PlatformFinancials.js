import mongoose from "mongoose";

const platformFinancialsSchema = new mongoose.Schema(
  {
    // Cumulative Statistics
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancelledOrders: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Revenue Breakdown
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
      // Total money flowing through platform (subtotal of all orders)
    },
    totalCommission: {
      type: Number,
      default: 0,
      min: 0,
      // Platform's earnings (markup on products)
    },
    totalStorePayouts: {
      type: Number,
      default: 0,
      min: 0,
      // Total paid to stores (base product prices)
    },
    totalDeliveryFees: {
      type: Number,
      default: 0,
      min: 0,
      // Total paid to drivers as delivery fees
    },
    totalTips: {
      type: Number,
      default: 0,
      min: 0,
      // Total tips paid to drivers
    },

    // Discounts and Coupons
    totalDiscounts: {
      type: Number,
      default: 0,
      min: 0,
      // Total discounts given via coupons
    },

    // Active status (singleton pattern)
    isActive: {
      type: Boolean,
      default: true,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure only one active financials document exists (singleton pattern)
platformFinancialsSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false },
    );
  }
  this.lastUpdated = new Date();
  next();
});

// Helper method to get or create the active financials document
platformFinancialsSchema.statics.getActive = async function () {
  let financials = await this.findOne({ isActive: true });

  if (!financials) {
    financials = await this.create({ isActive: true });
  }

  return financials;
};

// Helper method to update financials on order completion
platformFinancialsSchema.statics.recordOrderDelivery = async function (
  orderData,
) {
  const financials = await this.getActive();

  financials.completedOrders += 1;
  financials.totalRevenue += orderData.subtotal || 0;
  financials.totalCommission += orderData.platformCommission || 0;
  financials.totalStorePayouts += orderData.storeEarnings || 0;
  financials.totalDeliveryFees += orderData.deliveryFee || 0;
  financials.totalTips += orderData.tip || 0;

  if (orderData.discount) {
    financials.totalDiscounts += orderData.discount;
  }

  await financials.save();

  return financials;
};

// Helper method to record order cancellation
platformFinancialsSchema.statics.recordOrderCancellation = async function () {
  const financials = await this.getActive();
  financials.cancelledOrders += 1;
  await financials.save();
  return financials;
};

// Virtual: Net platform profit
platformFinancialsSchema.virtual("netProfit").get(function () {
  return this.totalCommission - this.totalDiscounts;
});

// Virtual: Average order value
platformFinancialsSchema.virtual("averageOrderValue").get(function () {
  if (this.completedOrders === 0) return 0;
  return this.totalRevenue / this.completedOrders;
});

// Virtual: Completion rate
platformFinancialsSchema.virtual("completionRate").get(function () {
  const total = this.completedOrders + this.cancelledOrders;
  if (total === 0) return 100;
  return (this.completedOrders / total) * 100;
});

// Ensure virtuals are included in JSON
platformFinancialsSchema.set("toJSON", { virtuals: true });
platformFinancialsSchema.set("toObject", { virtuals: true });

const PlatformFinancials = mongoose.model(
  "PlatformFinancials",
  platformFinancialsSchema,
);

export default PlatformFinancials;
