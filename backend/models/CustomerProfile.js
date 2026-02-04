import mongoose from "mongoose";

// Address sub-schema for delivery addresses
const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Address label is required"],
      trim: true,
      maxlength: 50,
    },
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
      required: [true, "Latitude is required for delivery"],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required for delivery"],
      min: -180,
      max: 180,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    instructions: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Customer preferences sub-schema
const preferencesSchema = new mongoose.Schema({
  // Generic product preferences
  preferredCategories: [
    {
      type: String,
      trim: true,
    },
  ],

  // Food-specific preferences (optional for restaurants)
  dietaryRestrictions: [
    {
      type: String,
      enum: [
        "vegetarian",
        "vegan",
        "gluten_free",
        "dairy_free",
        "nut_free",
        "halal",
        "kosher",
      ],
    },
  ],
  spiceLevel: {
    type: String,
    enum: ["mild", "medium", "hot", "extra_hot"],
  },

  // Generic preferences
  deliveryInstructions: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  communicationPreferences: {
    sms: {
      type: Boolean,
      default: true,
    },
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
  },
});

// Main customer profile schema
const customerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },

    // Personal Information
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },

    // Delivery Information
    addresses: [addressSchema],
    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // Customer Preferences
    preferences: preferencesSchema,

    // Order Statistics
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Account Status
    isBlacklisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    blacklistReason: {
      type: String,
      maxlength: 500,
    },

    // Last Known Location for delivery optimization
    lastKnownLocation: {
      latitude: Number,
      longitude: Number,
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance
customerProfileSchema.index({ userId: 1, isBlacklisted: 1 });
customerProfileSchema.index({
  "addresses.latitude": 1,
  "addresses.longitude": 1,
});
customerProfileSchema.index({ createdAt: -1 });
customerProfileSchema.index({ "lastKnownLocation.timestamp": -1 });

// Geospatial index for location-based queries
customerProfileSchema.index({ "addresses.location": "2dsphere" });
customerProfileSchema.index({ lastKnownLocation: "2dsphere" });

// Pre-save middleware to ensure only one default address
customerProfileSchema.pre("save", function (next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address
      this.addresses.forEach((addr, index) => {
        if (index > 0 && addr.isDefault) {
          addr.isDefault = false;
        }
      });
    }
    // Set defaultAddress to the default address ID
    const defaultAddr = this.addresses.find((addr) => addr.isDefault);
    if (defaultAddr) {
      this.defaultAddress = defaultAddr._id;
    }
  }

  next();
});

// Instance methods
customerProfileSchema.methods.addAddress = function (addressData) {
  // If this is the first address, make it default
  if (this.addresses.length === 0) {
    addressData.isDefault = true;
  }
  this.addresses.push(addressData);
  return this.save();
};

customerProfileSchema.methods.updateOrderStats = function (
  orderAmount,
  rating,
) {
  this.totalOrders += 1;
  this.totalSpent += orderAmount;

  // Update average rating
  if (this.averageRating) {
    this.averageRating =
      (this.averageRating * (this.totalOrders - 1) + rating) / this.totalOrders;
  } else {
    this.averageRating = rating;
  }

  return this.save();
};

// Static methods
customerProfileSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId }).populate("userId", "name email phone avatar");
};

customerProfileSchema.statics.findNearbyCustomers = function (
  latitude,
  longitude,
  maxDistance = 10000,
) {
  return this.find({
    lastKnownLocation: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance,
      },
    },
  });
};

customerProfileSchema.statics.getTopCustomers = function (limit = 10) {
  return this.find({ isBlacklisted: false })
    .sort({ totalSpent: -1, totalOrders: -1 })
    .limit(limit)
    .populate("userId", "name email");
};

// Convert to JSON
customerProfileSchema.methods.toJSON = function () {
  const profile = this.toObject();
  return profile;
};

const CustomerProfile = mongoose.model(
  "CustomerProfile",
  customerProfileSchema,
);

export default CustomerProfile;
