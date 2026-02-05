import mongoose from "mongoose";

// Operating hours sub-schema
const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    required: [true, "Day is required"],
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  openTime: {
    type: String,
    required: function () {
      return this.isOpen;
    },
    validate: {
      validator: function (v) {
        return !this.isOpen || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "Open time must be in HH:MM format",
    },
  },
  closeTime: {
    type: String,
    required: function () {
      return this.isOpen;
    },
    validate: {
      validator: function (v) {
        return !this.isOpen || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "Close time must be in HH:MM format",
    },
  },
});

// Store address sub-schema
const storeAddressSchema = new mongoose.Schema({
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
    required: [true, "Latitude is required"],
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: [true, "Longitude is required"],
    min: -180,
    max: 180,
  },
});

// Contact information sub-schema
const contactInfoSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
  },
  website: {
    type: String,
    trim: true,
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
  },
});

// Delivery settings sub-schema
const deliverySettingsSchema = new mongoose.Schema({
  deliveryRadius: {
    type: Number,
    required: [true, "Delivery radius is required"],
    min: [1, "Delivery radius must be at least 1 km"],
    max: [50, "Delivery radius cannot exceed 50 km"],
  },
  minimumOrder: {
    type: Number,
    required: [true, "Minimum order amount is required"],
    min: [0, "Minimum order cannot be negative"],
  },
  deliveryFee: {
    type: Number,
    required: [true, "Delivery fee is required"],
    min: [0, "Delivery fee cannot be negative"],
  },
  freeDeliveryAbove: {
    type: Number,
    min: [0, "Free delivery threshold cannot be negative"],
  },
  averagePreparationTime: {
    type: Number, // in minutes
    required: [true, "Average preparation time is required"],
    min: [5, "Preparation time must be at least 5 minutes"],
    max: [240, "Preparation time cannot exceed 240 minutes"], // 4 hours for grocery/pharmacy
  },
  maxOrdersPerHour: {
    type: Number,
    min: [1, "Must accept at least 1 order per hour"],
  },
});

// Store statistics sub-schema
const storeStatsSchema = new mongoose.Schema({
  totalOrders: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0,
    // Total value of orders (includes platform markup)
  },
  storeEarnings: {
    type: Number,
    default: 0,
    min: 0,
    // Amount store receives (base product prices without markup)
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  completionRate: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  averagePreparationTime: {
    type: Number, // in minutes
    min: 0,
  },
});

// Main store schema
const storeSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Store description is required"],
      trim: true,
      maxlength: 1000,
    },
    logo: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },

    // Store Manager Reference
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Store manager ID is required"],
      index: true,
    },

    // Location and Contact
    address: storeAddressSchema,
    contactInfo: contactInfoSchema,

    // Business Information
    businessLicense: {
      type: String,
      required: [true, "Business license number is required"],
      trim: true,
    },
    taxId: {
      type: String,
      required: [true, "Tax ID is required"],
      trim: true,
    },

    // Bank Account Information
    accountHolderName: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["savings", "cheque", "business"],
      default: "savings",
    },
    branchCode: {
      type: String,
      trim: true,
      maxlength: 6,
    },

    // Categories and Business Type
    categories: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    businessType: [
      {
        type: String,
        enum: [
          "restaurant",
          "grocery",
          "pharmacy",
          "electronics",
          "fashion",
          "books",
          "beauty",
          "home_garden",
          "sports",
          "toys",
          "automotive",
          "pet_supplies",
          "bakery",
          "meat_seafood",
          "dairy",
          "beverages",
          "snacks",
          "frozen_foods",
          "organic",
          "convenience_store",
          "supermarket",
          "specialty_store",
          "other",
        ],
        index: true,
      },
    ],

    // Operating Schedule
    operatingHours: [operatingHoursSchema],

    // Delivery Settings
    deliverySettings: deliverySettingsSchema,

    // Store Status
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTemporarilyClosed: {
      type: Boolean,
      default: false,
    },
    temporaryCloseReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // Pricing and Fees
    commissionRate: {
      type: Number,
      required: [true, "Commission rate is required"],
      min: [0, "Commission rate cannot be negative"],
      max: [50, "Commission rate cannot exceed 50%"],
    },

    // Store Statistics
    stats: storeStatsSchema,

    // Special Features
    features: [
      {
        type: String,
        enum: [
          // Payment options
          "accepts_cash",
          "accepts_cards",
          "digital_payments",
          // Food-specific features
          "halal",
          "kosher",
          "vegan_options",
          "gluten_free_options",
          "organic",
          // General features
          "eco_friendly",
          "pickup_available",
          "live_tracking",
          "scheduled_orders",
          "same_day_delivery",
          "express_delivery",
          "bulk_orders",
          "gift_wrapping",
          // Store types
          "pharmacy",
          "prescription_delivery",
          "24_7_available",
          "fresh_produce",
          "frozen_items",
          "electronic_items",
          "fragile_items",
          "age_verification_required",
        ],
      },
    ],

    // Approval and Verification
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Suspension Information
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    suspensionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // SEO and Search
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance
storeSchema.index({ "address.latitude": 1, "address.longitude": 1 });
storeSchema.index({ isActive: 1, isApproved: 1, isSuspended: 1 });
storeSchema.index({ categories: 1, isActive: 1 });
storeSchema.index({ businessType: 1, isActive: 1 });

storeSchema.index({ cuisineType: 1, isActive: 1 });
storeSchema.index({ "stats.averageRating": -1, isActive: 1 });
storeSchema.index({ createdAt: -1 });
storeSchema.index({ isFeatured: 1, isActive: 1 });

// Text search index
storeSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  categories: "text",
});

// Compound index for text search with filters
storeSchema.index({ isActive: 1, rating: -1 });

// Geospatial index for location-based queries
storeSchema.index({ "address.location": "2dsphere" });

// Pre-save middleware
storeSchema.pre("save", function (next) {
  // Generate slug from name if not provided
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Ensure at least basic operating hours exist
  if (this.operatingHours.length === 0) {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    this.operatingHours = days.map((day) => ({
      day,
      isOpen: true,
      openTime: "09:00",
      closeTime: "22:00",
    }));
  }

  next();
});

// Instance methods
storeSchema.methods.isOpenNow = function () {
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "lowercase" });
  const currentTime = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = this.operatingHours.find((h) => h.day === currentDay);
  if (!todayHours || !todayHours.isOpen) return false;

  return (
    currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
  );
};

storeSchema.methods.updateStats = function (orderAmount, rating = null) {
  this.stats.totalOrders += 1;
  this.stats.totalRevenue += orderAmount;

  // Update average rating if provided
  if (rating !== null) {
    if (this.stats.averageRating && this.stats.totalReviews > 0) {
      this.stats.averageRating =
        (this.stats.averageRating * this.stats.totalReviews + rating) /
        (this.stats.totalReviews + 1);
    } else {
      this.stats.averageRating = rating;
    }
    this.stats.totalReviews += 1;
  }

  return this.save();
};

storeSchema.methods.activate = function () {
  this.isActive = true;
  this.isSuspended = false;
  this.suspendedAt = null;
  this.suspendedBy = null;
  this.suspensionReason = null;
  return this.save();
};

storeSchema.methods.suspend = function (reason, suspendedBy) {
  this.isSuspended = true;
  this.suspendedAt = new Date();
  this.suspendedBy = suspendedBy;
  this.suspensionReason = reason;
  return this.save();
};

storeSchema.methods.approve = function (approvedBy) {
  this.isApproved = true;
  this.approvedAt = new Date();
  this.approvedBy = approvedBy;
  return this.save();
};

storeSchema.methods.canAcceptOrders = function () {
  return (
    this.isActive &&
    this.isApproved &&
    !this.isSuspended &&
    !this.isTemporarilyClosed &&
    this.isOpenNow()
  );
};

// Static methods
storeSchema.statics.findNearby = function (
  latitude,
  longitude,
  maxDistance = 10000,
) {
  return this.find({
    isActive: true,
    isApproved: true,
    isSuspended: false,
    "address.location": {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance,
      },
    },
  });
};

storeSchema.statics.findByCategory = function (category) {
  return this.find({
    categories: category,
    isActive: true,
    isApproved: true,
    isSuspended: false,
  }).sort({ "stats.averageRating": -1 });
};
storeSchema.statics.findByBusinessType = function (businessType) {
  return this.find({
    businessType: businessType,
    isActive: true,
    isApproved: true,
    isSuspended: false,
  }).sort({ "stats.averageRating": -1 });
};

storeSchema.statics.getFeaturedStores = function (limit = 10) {
  return this.find({
    isFeatured: true,
    isActive: true,
    isApproved: true,
    isSuspended: false,
  })
    .sort({ "stats.averageRating": -1 })
    .limit(limit);
};

storeSchema.statics.searchStores = function (
  query,
  latitude = null,
  longitude = null,
  maxDistance = 10000,
) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true,
    isApproved: true,
    isSuspended: false,
  };

  // Add location filter if coordinates provided
  if (latitude && longitude) {
    searchQuery["address.location"] = {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance,
      },
    };
  }

  return this.find(searchQuery, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
    "stats.averageRating": -1,
  });
};

storeSchema.statics.getTopRatedStores = function (limit = 10) {
  return this.find({
    isActive: true,
    isApproved: true,
    isSuspended: false,
    "stats.totalReviews": { $gte: 5 }, // At least 5 reviews
  })
    .sort({ "stats.averageRating": -1, "stats.totalReviews": -1 })
    .limit(limit);
};

storeSchema.statics.getStoreAnalytics = function (storeId, startDate, endDate) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(storeId) } },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "storeId",
        pipeline: [
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: "delivered",
            },
          },
        ],
        as: "orders",
      },
    },
    {
      $project: {
        name: 1,
        totalOrders: { $size: "$orders" },
        totalRevenue: { $sum: "$orders.total" },
        averageOrderValue: { $avg: "$orders.total" },
        stats: 1,
      },
    },
  ]);
};

const Store = mongoose.model("Store", storeSchema);

export default Store;
