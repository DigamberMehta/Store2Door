import mongoose from "mongoose";

// Order item sub-schema
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required"],
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
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  unitPrice: {
    type: Number,
    required: [true, "Unit price is required"],
    min: [0, "Unit price cannot be negative"],
  },
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    min: [0, "Total price cannot be negative"],
  },
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
});

// Delivery address sub-schema
const deliveryAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, "Street address is required"],
    trim: true,
    maxlength: 200,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
    maxlength: 100,
  },
  province: {
    type: String,
    required: [true, "Province is required"],
    trim: true,
    maxlength: 100,
  },
  postalCode: {
    type: String,
    required: [true, "Postal code is required"],
    trim: true,
    maxlength: 20,
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
    default: "US",
  },
  latitude: {
    type: Number,
    default: 0,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    default: 0,
    min: -180,
    max: 180,
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 500,
  },
});

// Tracking information sub-schema
const trackingInfoSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      "placed",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "picked_up",
      "on_the_way",
      "delivered",
      "cancelled",
    ],
    default: "placed",
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 300,
  },
});

// Rating and feedback sub-schema
const ratingSchema = new mongoose.Schema({
  // Customer rating for store
  storeRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  storeReview: {
    type: String,
    trim: true,
    maxlength: 1000,
  },

  // Customer rating for delivery rider
  riderRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  riderReview: {
    type: String,
    trim: true,
    maxlength: 1000,
  },

  // Store rating for customer (optional)
  customerRating: {
    type: Number,
    min: 1,
    max: 5,
  },

  ratedAt: {
    type: Date,
  },
});

// Main order schema
const orderSchema = new mongoose.Schema(
  {
    // Order identification
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
      index: true,
    },

    // References
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
      index: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // Order details
    items: [orderItemSchema],

    // Pricing
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    deliveryFee: {
      type: Number,
      required: [true, "Delivery fee is required"],
      min: [0, "Delivery fee cannot be negative"],
    },
    handlingFee: {
      type: Number,
      default: 0,
      min: [0, "Handling fee cannot be negative"],
    },
    tip: {
      type: Number,
      default: 0,
      min: [0, "Tip cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
    currency: {
      type: String,
      default: "ZAR",
      uppercase: true,
      enum: ["ZAR"],
      maxlength: 3,
    },

    // Coupon information
    appliedCoupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
      code: {
        type: String,
        trim: true,
        uppercase: true,
      },
      discountType: {
        type: String,
        enum: ["percentage", "fixed", "free_delivery"],
      },
      discountValue: Number,
      discountAmount: Number,
    },

    // Delivery information
    deliveryAddress: deliveryAddressSchema,
    estimatedDeliveryTime: {
      type: Date,
      index: true,
    },
    actualDeliveryTime: {
      type: Date,
    },
    preparationTime: {
      type: Number, // in minutes
      min: 0,
    },

    // Order status and tracking
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      default: "placed",
      index: true,
    },
    trackingHistory: [trackingInfoSchema],

    // Payment reference
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["yoco_card", "yoco_eft", "yoco_instant_eft"],
    },

    // Special instructions and notes
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Ratings and feedback
    rating: ratingSchema,

    // Cancellation info
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Delivery type
    deliveryType: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ riderId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ estimatedDeliveryTime: 1, status: 1 });

// Text search index for order number and customer search
orderSchema.index({ orderNumber: "text" });

// Geospatial index for delivery location
orderSchema.index({ "deliveryAddress.location": "2dsphere" });

// Pre-save middleware
orderSchema.pre("save", function (next) {
  // Calculate total from subtotal, delivery fee, handling fee, tip, and discount
  this.total =
    this.subtotal +
    this.deliveryFee +
    this.handlingFee +
    this.tip -
    this.discount;

  // Auto-generate order number if not provided
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }

  // Update tracking history when status changes
  if (this.isModified("status")) {
    this.trackingHistory.push({
      status: this.status,
      updatedAt: new Date(),
      notes: `Order status updated to ${this.status}`,
    });
  }

  next();
});

// Instance methods
orderSchema.methods.updateStatus = function (newStatus, notes, location) {
  this.status = newStatus;
  this.trackingHistory.push({
    status: newStatus,
    updatedAt: new Date(),
    notes: notes || `Status updated to ${newStatus}`,
    location: location,
  });

  // Set specific timestamps
  if (newStatus === "delivered") {
    this.actualDeliveryTime = new Date();
  } else if (newStatus === "cancelled") {
    this.cancelledAt = new Date();
  }

  return this.save();
};

orderSchema.methods.assignRider = function (riderId) {
  this.riderId = riderId;
  return this.updateStatus("picked_up", "Order picked up by delivery rider");
};

orderSchema.methods.calculateDeliveryTime = function () {
  if (this.actualDeliveryTime && this.createdAt) {
    return Math.round((this.actualDeliveryTime - this.createdAt) / (1000 * 60)); // in minutes
  }
  return null;
};

orderSchema.methods.addRating = function (ratingData) {
  this.rating = {
    ...this.rating,
    ...ratingData,
    ratedAt: new Date(),
  };
  return this.save();
};

// Static methods
orderSchema.statics.findByCustomer = function (
  customerId,
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;
  return this.find({ customerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("storeId", "name address")
    .populate("riderId", "name phone");
};

orderSchema.statics.findByStore = function (storeId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ storeId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("customerId", "name phone")
    .populate("riderId", "name phone");
};

orderSchema.statics.findByRider = function (riderId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ riderId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("customerId", "name phone")
    .populate("storeId", "name address");
};

orderSchema.statics.getActiveOrders = function () {
  return this.find({
    status: { $nin: ["delivered", "cancelled"] },
  }).populate("customerId storeId riderId");
};

orderSchema.statics.getOrderStats = function (storeId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        storeId: mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: "delivered",
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
        averageOrderValue: { $avg: "$total" },
        averageDeliveryTime: {
          $avg: {
            $divide: [
              { $subtract: ["$actualDeliveryTime", "$createdAt"] },
              1000 * 60, // Convert to minutes
            ],
          },
        },
      },
    },
  ]);
};

orderSchema.statics.findNearbyOrders = function (
  latitude,
  longitude,
  maxDistance = 5000,
) {
  return this.find({
    status: { $in: ["ready_for_pickup", "picked_up"] },
    "deliveryAddress.location": {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance,
      },
    },
  });
};

// Remove sensitive data when converting to JSON
orderSchema.methods.toJSON = function () {
  const order = this.toObject();
  return order;
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
