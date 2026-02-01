import mongoose from "mongoose";

// Cart item sub-schema
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [99, "Quantity cannot exceed 99"],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    currency: {
      type: String,
      default: "ZAR",
      uppercase: true,
      enum: ["ZAR"],
      maxlength: 3,
    },
    // Product variants/options (e.g., size, color, flavor)
    selectedVariant: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      value: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      priceModifier: {
        type: Number,
        default: 0,
      },
    },
    // Customizations (e.g., extra toppings, special requests)
    customizations: [
      {
        name: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        value: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        additionalCost: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    // Product availability validation
    isAvailable: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      min: 0,
    },
    // Platform markup percentage snapshot (for audit trail)
    markupPercentage: {
      type: Number,
      default: 20,
      min: 0,
    },
    // Track when item was added for staleness detection
    addedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    timestamps: false,
  },
);

// Main cart schema
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    items: [cartItemSchema],
    // Summary fields
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Coupon/discount information
    appliedCoupon: {
      code: {
        type: String,
        trim: true,
        uppercase: true,
      },
      discountType: {
        type: String,
        enum: ["percentage", "fixed", "free_delivery"],
      },
      discountValue: {
        type: Number,
        min: 0,
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      expiresAt: {
        type: Date,
      },
    },
    // Cart status
    status: {
      type: String,
      enum: ["active", "abandoned", "converted", "merged"],
      default: "active",
    },
    // Session tracking
    sessionId: {
      type: String,
      trim: true,
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "unknown"],
      },
      browser: String,
      os: String,
    },
    // Track cart abandonment
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    abandonedAt: {
      type: Date,
    },
    convertedToOrderAt: {
      type: Date,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    // Single store constraint - all items must be from same store
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    storeName: {
      type: String,
      trim: true,
    },
    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ["web", "mobile_app", "api"],
        default: "web",
      },
      referrer: String,
      campaignId: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
cartSchema.index({ userId: 1, status: 1 });
cartSchema.index({ userId: 1, storeId: 1 });
cartSchema.index({ lastActivityAt: -1 });
cartSchema.index({ createdAt: -1 });
cartSchema.index({ "items.productId": 1 });
cartSchema.index({ "items.storeId": 1 });
cartSchema.index({ abandonedAt: 1 }, { sparse: true });

// Virtual for cart age
cartSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for checking if cart is stale
cartSchema.virtual("isStale").get(function () {
  const hoursSinceLastActivity =
    (Date.now() - this.lastActivityAt) / (1000 * 60 * 60);
  return hoursSinceLastActivity > 24; // Stale after 24 hours
});

// Virtual for checking if cart is abandoned
cartSchema.virtual("isAbandoned").get(function () {
  const hoursSinceLastActivity =
    (Date.now() - this.lastActivityAt) / (1000 * 60 * 60);
  return hoursSinceLastActivity > 1 && this.items.length > 0; // Abandoned after 1 hour
});

// Pre-save middleware to calculate totals
cartSchema.pre("save", function (next) {
  // Calculate subtotal and totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.totalItems = this.items.length;
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);

  // Set storeId from first item
  if (this.items.length > 0) {
    this.storeId = this.items[0].storeId;
  } else {
    this.storeId = undefined;
    this.storeName = undefined;
  }

  // Validate all items are from the same store
  if (this.items.length > 0) {
    const storeIds = [
      ...new Set(this.items.map((item) => item.storeId.toString())),
    ];
    if (storeIds.length > 1) {
      const error = new Error("All items must be from the same store");
      return next(error);
    }
  }

  // Update last activity
  this.lastActivityAt = Date.now();

  // Mark as abandoned if inactive for more than 1 hour
  const hoursSinceLastActivity =
    (Date.now() - this.lastActivityAt) / (1000 * 60 * 60);
  if (
    hoursSinceLastActivity > 1 &&
    this.items.length > 0 &&
    this.status === "active"
  ) {
    this.status = "abandoned";
    this.abandonedAt = Date.now();
  }

  next();
});

// Instance method: Add item to cart
cartSchema.methods.addItem = function (itemData) {
  const {
    productId,
    storeId,
    name,
    description,
    image,
    quantity,
    unitPrice,
    discountedPrice,
    selectedVariant,
    customizations,
    specialInstructions,
    isAvailable,
    stockQuantity,
  } = itemData;

  // Check if cart has items from a different store
  if (
    this.items.length > 0 &&
    this.storeId &&
    this.storeId.toString() !== storeId.toString()
  ) {
    throw new Error(
      "Cannot add items from different stores. Please clear your cart or complete your current order first.",
    );
  }

  // Check if item already exists (same product, variant, and customizations)
  const existingItemIndex = this.items.findIndex(
    (item) =>
      item.productId.toString() === productId.toString() &&
      item.selectedVariant?.value === selectedVariant?.value &&
      JSON.stringify(item.customizations) === JSON.stringify(customizations),
  );

  const price = discountedPrice || unitPrice;
  const totalPrice = price * quantity;

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].totalPrice =
      this.items[existingItemIndex].quantity * price;
    this.items[existingItemIndex].lastUpdated = Date.now();
  } else {
    // Add new item
    this.items.push({
      productId,
      storeId,
      name,
      description,
      image,
      quantity,
      unitPrice,
      discountedPrice,
      totalPrice,
      selectedVariant,
      customizations,
      specialInstructions,
      isAvailable,
      stockQuantity,
      addedAt: Date.now(),
      lastUpdated: Date.now(),
    });
  }

  this.lastActivityAt = Date.now();
  return this.save();
};

// Instance method: Update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error("Item not found in cart");
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
    const price = item.discountedPrice || item.unitPrice;
    item.totalPrice = price * quantity;
    item.lastUpdated = Date.now();
  }

  this.lastActivityAt = Date.now();
  return this.save();
};

// Instance method: Remove item from cart
cartSchema.methods.removeItem = function (itemId) {
  this.items.pull(itemId);
  this.lastActivityAt = Date.now();
  return this.save();
};

// Instance method: Clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.appliedCoupon = undefined;
  this.lastActivityAt = Date.now();
  return this.save();
};

// Instance method: Apply coupon
cartSchema.methods.applyCoupon = function (couponData) {
  this.appliedCoupon = couponData;
  this.lastActivityAt = Date.now();
  return this.save();
};

// Instance method: Remove coupon
cartSchema.methods.removeCoupon = function () {
  this.appliedCoupon = undefined;
  this.lastActivityAt = Date.now();
  return this.save();
};

// Instance method: Convert to order
cartSchema.methods.convertToOrder = function (orderId) {
  this.status = "converted";
  this.convertedToOrderAt = Date.now();
  this.orderId = orderId;
  return this.save();
};

// Static method: Find active cart by user ID
cartSchema.statics.findActiveCartByUserId = function (userId) {
  return this.findOne({ userId, status: "active" }).populate([
    {
      path: "items.productId",
      select: "name price images isActive stockQuantity",
    },
    {
      path: "items.storeId",
      select: "name slug logo isActive",
    },
  ]);
};

// Static method: Find abandoned carts
cartSchema.statics.findAbandonedCarts = function (hoursAgo = 1) {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return this.find({
    status: "active",
    lastActivityAt: { $lt: cutoffTime },
    "items.0": { $exists: true }, // Has at least one item
  });
};

// Static method: Clean up old abandoned carts
cartSchema.statics.cleanupOldCarts = function (daysAgo = 30) {
  const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    status: { $in: ["abandoned", "converted"] },
    updatedAt: { $lt: cutoffDate },
  });
};

// Static method: Get cart statistics
cartSchema.statics.getCartStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgItems: { $avg: "$totalItems" },
        avgSubtotal: { $avg: "$subtotal" },
      },
    },
  ]);
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
