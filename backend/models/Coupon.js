import mongoose from "mongoose";

// Coupon schema for discount management
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
      minlength: [3, "Coupon code must be at least 3 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "fixed", "free_delivery"],
        message: "Discount type must be percentage, fixed, or free_delivery",
      },
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    maxDiscount: {
      type: Number,
      min: [0, "Max discount cannot be negative"],
      validate: {
        validator: function (value) {
          // Only required for percentage type
          if (this.discountType === "percentage" && !value) {
            return false;
          }
          return true;
        },
        message: "Max discount is required for percentage type coupons",
      },
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (value) {
          return value > this.validFrom;
        },
        message: "Expiry date must be after valid from date",
      },
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    userUsageLimit: {
      type: Number,
      default: 1, // How many times one user can use this coupon
      min: [1, "User usage limit must be at least 1"],
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderValue: Number,
        discountApplied: Number,
      },
    ],
    applicableStores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1, validUntil: 1 });
couponSchema.index({ "usedBy.userId": 1 });

// Virtual for checking if coupon is expired
couponSchema.virtual("isExpired").get(function () {
  return new Date() > this.validUntil;
});

// Virtual for checking if coupon is valid now
couponSchema.virtual("isValidNow").get(function () {
  const now = new Date();
  return now >= this.validFrom && now <= this.validUntil;
});

// Virtual for checking if usage limit reached
couponSchema.virtual("isUsageLimitReached").get(function () {
  if (!this.usageLimit) return false;
  return this.usedCount >= this.usageLimit;
});

// Pre-save middleware to validate dates
couponSchema.pre("save", function (next) {
  if (this.validUntil <= this.validFrom) {
    return next(new Error("Expiry date must be after valid from date"));
  }
  next();
});

// Instance method: Check if user can use this coupon
couponSchema.methods.canUserUse = function (userId) {
  if (!this.isActive) return { valid: false, message: "Coupon is inactive" };
  if (this.isExpired) return { valid: false, message: "Coupon has expired" };
  if (!this.isValidNow)
    return { valid: false, message: "Coupon is not yet valid" };
  if (this.isUsageLimitReached)
    return { valid: false, message: "Coupon usage limit reached" };

  // Check user-specific usage
  const userUsages = this.usedBy.filter(
    (usage) => usage.userId.toString() === userId.toString(),
  );
  if (userUsages.length >= this.userUsageLimit) {
    return {
      valid: false,
      message: "You have already used this coupon maximum times",
    };
  }

  return { valid: true, message: "Coupon is valid" };
};

// Instance method: Calculate discount amount
couponSchema.methods.calculateDiscount = function (orderValue) {
  if (this.discountType === "percentage") {
    let discount = Math.round((orderValue * this.discountValue) / 100);
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
    return discount;
  } else if (this.discountType === "fixed") {
    return Math.min(this.discountValue, orderValue);
  }
  return 0; // For free_delivery type
};

// Instance method: Mark as used by user
couponSchema.methods.markAsUsed = function (
  userId,
  orderValue,
  discountApplied,
) {
  this.usedBy.push({
    userId,
    usedAt: new Date(),
    orderValue,
    discountApplied,
  });
  this.usedCount += 1;
  return this.save();
};

// Static method: Find valid coupons for user
couponSchema.statics.findValidForUser = function (userId) {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  });
};

// Static method: Find active coupons
couponSchema.statics.findActive = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  });
};

// Static method: Get coupon statistics
couponSchema.statics.getStats = async function (couponId) {
  const coupon = await this.findById(couponId);
  if (!coupon) return null;

  return {
    code: coupon.code,
    totalUsed: coupon.usedCount,
    uniqueUsers: new Set(coupon.usedBy.map((u) => u.userId.toString())).size,
    totalDiscountGiven: coupon.usedBy.reduce(
      (sum, u) => sum + (u.discountApplied || 0),
      0,
    ),
    averageOrderValue:
      coupon.usedBy.reduce((sum, u) => sum + (u.orderValue || 0), 0) /
        coupon.usedBy.length || 0,
    remainingUsage: coupon.usageLimit
      ? coupon.usageLimit - coupon.usedCount
      : "Unlimited",
  };
};

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
