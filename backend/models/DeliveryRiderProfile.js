import mongoose from "mongoose";

// Vehicle information sub-schema
const vehicleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "bicycle",
        "motorcycle",
        "scooter",
        "car",
        "van",
        "truck",
        "electric_bike",
        "walking",
      ],
    },
    make: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    model: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    year: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },
    color: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    licensePlate: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
  },
  {
    _id: false,
  },
);

// Documents sub-schema
const documentsSchema = new mongoose.Schema(
  {
    profilePhoto: {
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    vehiclePhoto: {
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    idDocument: {
      number: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    workPermit: {
      number: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      expiryDate: Date,
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    driversLicence: {
      number: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      expiryDate: Date,
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    proofOfBankingDetails: {
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    proofOfAddress: {
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    vehicleLicense: {
      number: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      expiryDate: Date,
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    vehicleAssessment: {
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      assessmentDate: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    carrierAgreement: {
      imageUrl: String,
      cloudinaryPublicId: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      rejectionReason: String,
      uploadedAt: Date,
      signedDate: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    // Legacy fields for backward compatibility
    drivingLicense: {
      number: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      expiryDate: Date,
      isVerified: {
        type: Boolean,
        default: false,
      },
      imageUrl: String,
    },
    nationalId: {
      number: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      imageUrl: String,
    },
    backgroundCheck: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "expired"],
        default: "pending",
      },
      completedAt: Date,
      expiryDate: Date,
    },
  },
  {
    _id: false,
  },
);

// Bank details sub-schema
const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: 50,
      select: false, // Hide by default for security
    },
    routingNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    branchCode: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    accountType: {
      type: String,
      enum: ["cheque", "savings", "transmission"],
      default: "cheque",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

// Emergency contact sub-schema
const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  },
);

// Delivery statistics sub-schema
const deliveryStatsSchema = new mongoose.Schema(
  {
    totalDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancelledDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTips: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
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
    averageDeliveryTime: {
      type: Number, // in minutes
      min: 0,
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  {
    _id: false,
  },
);

// Main delivery rider profile schema
const deliveryRiderProfileSchema = new mongoose.Schema(
  {
    // User Reference
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
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      city: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      state: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: 20,
      },
      country: {
        type: String,
        trim: true,
        default: "US",
      },
    },

    // Vehicle Information
    vehicle: vehicleSchema,

    // Documents and Verification
    documents: documentsSchema,

    // Banking Information
    bankDetails: bankDetailsSchema,

    // Emergency Contact
    emergencyContact: emergencyContactSchema,

    // Current Status
    isAvailable: {
      type: Boolean,
      default: false,
    },

    // Current Location
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90
            ); // latitude
          },
          message: "Invalid coordinates",
        },
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    // Performance and Statistics
    stats: deliveryStatsSchema,

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspensionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Onboarding
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Last Activity
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
deliveryRiderProfileSchema.index({ userId: 1, isActive: 1 });
deliveryRiderProfileSchema.index({ isAvailable: 1 });
deliveryRiderProfileSchema.index({ isVerified: 1, isActive: 1 });
deliveryRiderProfileSchema.index({
  "stats.averageRating": -1,
  "stats.completionRate": -1,
});
deliveryRiderProfileSchema.index({ lastActiveAt: -1 });

// Geospatial index for location-based queries
deliveryRiderProfileSchema.index({ currentLocation: "2dsphere" });

// Pre-save middleware
deliveryRiderProfileSchema.pre("save", function (next) {
  // Update last active time when isAvailable changes to true
  if (this.isModified("isAvailable") && this.isAvailable === true) {
    this.lastActiveAt = new Date();
  }

  // Calculate completion rate
  if (this.stats.totalDeliveries > 0) {
    this.stats.completionRate = Math.round(
      (this.stats.completedDeliveries / this.stats.totalDeliveries) * 100,
    );
  }

  next();
});

// Instance methods
deliveryRiderProfileSchema.methods.updateLocation = function (
  longitude,
  latitude,
) {
  this.currentLocation = {
    type: "Point",
    coordinates: [longitude, latitude],
    lastUpdated: new Date(),
  };
  this.lastActiveAt = new Date();
  return this.save();
};

deliveryRiderProfileSchema.methods.setOnline = function () {
  this.isAvailable = true;
  this.lastActiveAt = new Date();
  return this.save();
};

deliveryRiderProfileSchema.methods.setOffline = function () {
  this.isAvailable = false;
  return this.save();
};

deliveryRiderProfileSchema.methods.updateStats = function (deliveryData) {
  this.stats.totalDeliveries += 1;

  if (deliveryData.completed) {
    this.stats.completedDeliveries += 1;
  } else {
    this.stats.cancelledDeliveries += 1;
  }

  if (deliveryData.earnings) {
    this.stats.totalEarnings += deliveryData.earnings;
  }

  if (deliveryData.tip) {
    this.stats.totalTips += deliveryData.tip;
  }

  if (deliveryData.rating) {
    if (this.stats.averageRating && this.stats.totalRatings > 0) {
      this.stats.averageRating =
        (this.stats.averageRating * this.stats.totalRatings +
          deliveryData.rating) /
        (this.stats.totalRatings + 1);
    } else {
      this.stats.averageRating = deliveryData.rating;
    }
    this.stats.totalRatings += 1;
  }

  if (deliveryData.deliveryTime) {
    if (this.stats.averageDeliveryTime) {
      this.stats.averageDeliveryTime =
        (this.stats.averageDeliveryTime * (this.stats.completedDeliveries - 1) +
          deliveryData.deliveryTime) /
        this.stats.completedDeliveries;
    } else {
      this.stats.averageDeliveryTime = deliveryData.deliveryTime;
    }
  }

  return this.save();
};

deliveryRiderProfileSchema.methods.suspend = function (reason, suspendedBy) {
  this.isSuspended = true;
  this.suspensionReason = reason;
  this.suspendedAt = new Date();
  this.suspendedBy = suspendedBy;
  this.isAvailable = false;
  return this.save();
};

deliveryRiderProfileSchema.methods.approve = function (approvedBy) {
  this.isVerified = true;
  this.approvedAt = new Date();
  this.approvedBy = approvedBy;
  return this.save();
};

// Document verification methods
deliveryRiderProfileSchema.methods.verifyDocument = function (
  documentType,
  verifiedBy,
) {
  const validDocuments = [
    "profilePhoto",
    "vehiclePhoto",
    "idDocument",
    "workPermit",
    "driversLicence",
    "proofOfBankingDetails",
    "proofOfAddress",
    "vehicleLicense",
    "vehicleAssessment",
    "carrierAgreement",
  ];

  if (!validDocuments.includes(documentType)) {
    throw new Error(`Invalid document type: ${documentType}`);
  }

  if (!this.documents[documentType] || !this.documents[documentType].imageUrl) {
    throw new Error(`Document ${documentType} has not been uploaded yet`);
  }

  this.documents[documentType].isVerified = true;
  this.documents[documentType].status = "verified";
  this.documents[documentType].rejectionReason = null;
  this.documents[documentType].verifiedAt = new Date();
  this.documents[documentType].verifiedBy = verifiedBy;

  return this.save();
};

deliveryRiderProfileSchema.methods.rejectDocument = function (
  documentType,
  rejectedBy,
  reason,
) {
  const validDocuments = [
    "profilePhoto",
    "vehiclePhoto",
    "idDocument",
    "workPermit",
    "driversLicence",
    "proofOfBankingDetails",
    "proofOfAddress",
    "vehicleLicense",
    "vehicleAssessment",
    "carrierAgreement",
  ];

  if (!validDocuments.includes(documentType)) {
    throw new Error(`Invalid document type: ${documentType}`);
  }

  if (!this.documents[documentType] || !this.documents[documentType].imageUrl) {
    throw new Error(`Document ${documentType} has not been uploaded yet`);
  }

  if (!reason || reason.trim() === "") {
    throw new Error("Rejection reason is required");
  }

  this.documents[documentType].isVerified = false;
  this.documents[documentType].status = "rejected";
  this.documents[documentType].rejectionReason = reason;
  this.documents[documentType].rejectedAt = new Date();
  this.documents[documentType].rejectedBy = rejectedBy;

  return this.save();
};

// Static methods
deliveryRiderProfileSchema.statics.findAvailableRiders = function (
  latitude,
  longitude,
  maxDistance = 10000,
) {
  return this.find({
    isActive: true,
    isVerified: true,
    isSuspended: false,
    isAvailable: true,
    status: "online",
    currentLocation: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance,
      },
    },
  }).populate("userId", "name phone");
};

deliveryRiderProfileSchema.statics.getTopPerformers = function (limit = 10) {
  return this.find({
    isActive: true,
    isVerified: true,
    isSuspended: false,
    "stats.totalDeliveries": { $gte: 10 },
  })
    .sort({
      "stats.averageRating": -1,
      "stats.completionRate": -1,
      "stats.onTimeDeliveryRate": -1,
    })
    .limit(limit)
    .populate("userId", "name phone");
};

deliveryRiderProfileSchema.statics.getRiderAnalytics = function (
  riderId,
  startDate,
  endDate,
) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(riderId) } },
    {
      $lookup: {
        from: "orders",
        localField: "userId",
        foreignField: "riderId",
        pipeline: [
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: "delivered",
            },
          },
        ],
        as: "deliveredOrders",
      },
    },
    {
      $project: {
        userId: 1,
        stats: 1,
        periodDeliveries: { $size: "$deliveredOrders" },
        periodEarnings: { $sum: "$deliveredOrders.deliveryFee" },
        periodTips: { $sum: "$deliveredOrders.tip" },
      },
    },
  ]);
};

// Remove sensitive banking data when converting to JSON
deliveryRiderProfileSchema.methods.toJSON = function () {
  const rider = this.toObject();
  if (rider.bankDetails) {
    delete rider.bankDetails.accountNumber;
  }
  return rider;
};

const DeliveryRiderProfile = mongoose.model(
  "DeliveryRiderProfile",
  deliveryRiderProfileSchema,
);

export default DeliveryRiderProfile;
