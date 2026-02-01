import mongoose from "mongoose";

// Review media sub-schema
const reviewMediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type is required"],
    },
    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    _id: false,
  },
);

// Review response sub-schema (for store/rider responses)
const responseSchema = new mongoose.Schema(
  {
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Responder ID is required"],
    },
    responseText: {
      type: String,
      required: [true, "Response text is required"],
      trim: true,
      maxlength: 1000,
    },
    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Main review schema
const reviewSchema = new mongoose.Schema(
  {
    // Review identification
    reviewType: {
      type: String,
      enum: ["product", "store", "rider", "order"],
      required: [true, "Review type is required"],
    },

    // References
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer ID is required"],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // Target references (what is being reviewed)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Review content
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    // Review criteria (detailed ratings)
    criteria: {
      // For products
      quality: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },

      // For stores
      foodQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      service: {
        type: Number,
        min: 1,
        max: 5,
      },
      packaging: {
        type: Number,
        min: 1,
        max: 5,
      },

      // For riders
      timeliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // Review media
    media: [reviewMediaSchema],

    // Review metadata
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // Moderation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "approved",
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
    moderationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Engagement metrics
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulnessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Response from business/rider
    response: responseSchema,

    // Flags and reports
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportReasons: [
      {
        reason: {
          type: String,
          enum: [
            "spam",
            "fake",
            "inappropriate",
            "offensive",
            "irrelevant",
            "other",
          ],
        },
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Additional context
    orderValue: {
      type: Number,
      min: 0,
    },
    deliveryTime: {
      type: Number, // in minutes
      min: 0,
    },

    // Review visibility
    isPublic: {
      type: Boolean,
      default: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance
reviewSchema.index({ reviewType: 1, productId: 1, status: 1 });
reviewSchema.index({ reviewType: 1, storeId: 1, status: 1 });
reviewSchema.index({ reviewType: 1, riderId: 1, status: 1 });
reviewSchema.index({ reviewerId: 1, createdAt: -1 });
reviewSchema.index({ rating: -1, helpfulnessScore: -1 });
reviewSchema.index({ isVerifiedPurchase: 1, status: 1 });
reviewSchema.index({ createdAt: -1, status: 1 });
reviewSchema.index({ isReported: 1, status: 1 });

// Unique constraint: one review per user per product/store/rider
reviewSchema.index(
  { reviewType: 1, reviewerId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { productId: { $exists: true } } }
);
reviewSchema.index(
  { reviewType: 1, reviewerId: 1, storeId: 1 },
  { unique: true, partialFilterExpression: { storeId: { $exists: true } } }
);
reviewSchema.index(
  { reviewType: 1, reviewerId: 1, riderId: 1 },
  { unique: true, partialFilterExpression: { riderId: { $exists: true } } }
);

// Text search index
reviewSchema.index({
  title: "text",
  comment: "text",
});

// Validation middleware
reviewSchema.pre("save", function (next) {
  // Ensure appropriate target reference based on review type
  if (this.reviewType === "product" && !this.productId) {
    return next(new Error("Product ID is required for product reviews"));
  }
  if (this.reviewType === "store" && !this.storeId) {
    return next(new Error("Store ID is required for store reviews"));
  }
  if (this.reviewType === "rider" && !this.riderId) {
    return next(new Error("Rider ID is required for rider reviews"));
  }

  // Calculate helpfulness score
  if (this.totalVotes > 0) {
    this.helpfulnessScore = Math.round(
      (this.helpfulVotes / this.totalVotes) * 100,
    );
  }

  // Auto-approve verified purchases with high ratings
  if (
    this.isNew &&
    this.isVerifiedPurchase &&
    this.rating >= 4 &&
    !this.media.length
  ) {
    this.status = "approved";
  }

  next();
});

// Instance methods
reviewSchema.methods.addHelpfulVote = function (userId) {
  // In a real implementation, you'd want to track who voted to prevent duplicate votes
  this.helpfulVotes += 1;
  this.totalVotes += 1;
  this.helpfulnessScore = Math.round(
    (this.helpfulVotes / this.totalVotes) * 100,
  );
  return this.save();
};

reviewSchema.methods.addUnhelpfulVote = function (userId) {
  this.unhelpfulVotes += 1;
  this.totalVotes += 1;
  this.helpfulnessScore = Math.round(
    (this.helpfulVotes / this.totalVotes) * 100,
  );
  return this.save();
};

reviewSchema.methods.approve = function (moderatorId) {
  this.status = "approved";
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  return this.save();
};

reviewSchema.methods.reject = function (moderatorId, reason) {
  this.status = "rejected";
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationReason = reason;
  return this.save();
};

reviewSchema.methods.hide = function (moderatorId, reason) {
  this.status = "hidden";
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationReason = reason;
  return this.save();
};

reviewSchema.methods.addResponse = function (responderId, responseText) {
  this.response = {
    respondedBy: responderId,
    responseText: responseText,
    respondedAt: new Date(),
  };
  return this.save();
};

reviewSchema.methods.reportReview = function (reporterId, reason) {
  this.reportReasons.push({
    reason: reason,
    reportedBy: reporterId,
    reportedAt: new Date(),
  });
  this.reportCount += 1;
  this.isReported = true;

  // Auto-hide if multiple reports
  if (this.reportCount >= 5) {
    this.status = "hidden";
    this.moderationReason = "Auto-hidden due to multiple reports";
  }

  return this.save();
};

// Static methods
reviewSchema.statics.getReviewsByProduct = function (
  productId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
) {
  const skip = (page - 1) * limit;
  const sortOption = {};

  switch (sortBy) {
    case "rating_high":
      sortOption.rating = -1;
      break;
    case "rating_low":
      sortOption.rating = 1;
      break;
    case "helpful":
      sortOption.helpfulnessScore = -1;
      break;
    default:
      sortOption.createdAt = -1;
  }

  console.log("🔍 Query params:", {
    reviewType: "product",
    productId: productId,
    status: "approved",
    isPublic: true,
  });

  return this.find({
    reviewType: "product",
    productId: productId,
    status: "approved",
    isPublic: true,
  })
    .populate("reviewerId", "name avatar")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getReviewsByStore = function (
  storeId,
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;
  return this.find({
    reviewType: "store",
    storeId: storeId,
    status: "approved",
    isPublic: true,
  })
    .populate("reviewerId", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getReviewsByRider = function (
  riderId,
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;
  return this.find({
    reviewType: "rider",
    riderId: riderId,
    status: "approved",
    isPublic: true,
  })
    .populate("reviewerId", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getAverageRating = function (targetType, targetId) {
  const matchQuery = {
    reviewType: targetType,
    status: "approved",
  };
  matchQuery[`${targetType}Id`] = targetId;

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: {
            $switch: {
              branches: [
                { case: { $eq: ["$rating", 5] }, then: "5" },
                { case: { $eq: ["$rating", 4] }, then: "4" },
                { case: { $eq: ["$rating", 3] }, then: "3" },
                { case: { $eq: ["$rating", 2] }, then: "2" },
                { case: { $eq: ["$rating", 1] }, then: "1" },
              ],
            },
          },
        },
      },
    },
  ]);
};

reviewSchema.statics.getReviewStats = function (targetType, targetId) {
  const matchQuery = {
    reviewType: targetType,
    status: "approved",
  };

  // Convert to ObjectId if it's a string
  const objectIdValue =
    typeof targetId === "string"
      ? new mongoose.Types.ObjectId(targetId)
      : targetId;

  matchQuery[`${targetType}Id`] = objectIdValue;

  console.log(
    "📊 getReviewStats matchQuery:",
    JSON.stringify(matchQuery, null, 2),
  );

  return this.aggregate([
    { $match: matchQuery },
    {
      $addFields: {
        // Calculate days since review was created
        daysSinceReview: {
          $divide: [
            { $subtract: ["$$NOW", "$createdAt"] },
            86400000, // milliseconds in a day (1000 * 60 * 60 * 24)
          ],
        },
        // Recency weight: newer reviews get higher weight (exponential decay)
        // Reviews decay to 50% weight after 180 days
        recencyWeight: {
          $exp: {
            $multiply: [
              -0.00385, // decay constant (ln(0.5)/180)
              {
                $divide: [{ $subtract: ["$$NOW", "$createdAt"] }, 86400000],
              },
            ],
          },
        },
        // Verified purchase weight: 1.5x for verified, 1.0x for unverified
        verifiedWeight: {
          $cond: ["$isVerifiedPurchase", 1.5, 1.0],
        },
        // Trustworthiness weight based on engagement
        trustWeight: {
          $add: [
            1.0,
            // Bonus for helpful votes (up to +0.3)
            {
              $min: [
                0.3,
                { $multiply: [{ $divide: ["$helpfulVotes", 10] }, 0.3] },
              ],
            },
            // Penalty for reports (up to -0.5)
            { $multiply: ["$reportCount", -0.1] },
          ],
        },
      },
    },
    {
      $addFields: {
        // Combined weight (recency × verified × trust)
        totalWeight: {
          $max: [
            0.1, // Minimum weight to ensure no review is completely ignored
            {
              $multiply: ["$recencyWeight", "$verifiedWeight", "$trustWeight"],
            },
          ],
        },
        // Weighted rating value
        weightedRating: {
          $multiply: [
            "$rating",
            {
              $max: [
                0.1,
                {
                  $multiply: [
                    "$recencyWeight",
                    "$verifiedWeight",
                    "$trustWeight",
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        // Sum values for weighted average calculation
        totalWeightedRating: { $sum: "$weightedRating" },
        totalWeight: { $sum: "$totalWeight" },
        // Simple average for comparison
        simpleAverage: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        withMedia: {
          $sum: { $cond: [{ $gt: [{ $size: "$media" }, 0] }, 1, 0] },
        },
        verifiedPurchases: { $sum: { $cond: ["$isVerifiedPurchase", 1, 0] } },
        // Additional insights
        avgRecencyWeight: { $avg: "$recencyWeight" },
        avgVerifiedWeight: { $avg: "$verifiedWeight" },
        avgTrustWeight: { $avg: "$trustWeight" },
      },
    },
    {
      $project: {
        _id: 0,
        averageRating: {
          $round: [{ $divide: ["$totalWeightedRating", "$totalWeight"] }, 1],
        },
        simpleAverage: { $round: ["$simpleAverage", 1] },
        totalReviews: 1,
        fiveStars: 1,
        fourStars: 1,
        threeStars: 1,
        twoStars: 1,
        oneStar: 1,
        withMedia: 1,
        verifiedPurchases: 1,
        avgRecencyWeight: { $round: ["$avgRecencyWeight", 2] },
        avgVerifiedWeight: { $round: ["$avgVerifiedWeight", 2] },
        avgTrustWeight: { $round: ["$avgTrustWeight", 2] },
      },
    },
  ]);
};

reviewSchema.statics.searchReviews = function (
  searchTerm,
  filters = {},
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;

  const query = {
    $text: { $search: searchTerm },
    status: "approved",
    isPublic: true,
    ...filters,
  };

  return this.find(query, { score: { $meta: "textScore" } })
    .populate("reviewerId", "name avatar")
    .populate("productId", "name")
    .populate("storeId", "name")
    .sort({ score: { $meta: "textScore" }, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getPendingReviews = function (page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ status: "pending" })
    .populate("reviewerId", "name email")
    .populate("productId", "name")
    .populate("storeId", "name")
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getReportedReviews = function (page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ isReported: true, status: { $ne: "hidden" } })
    .populate("reviewerId", "name email")
    .populate("reportReasons.reportedBy", "name")
    .sort({ reportCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Remove sensitive data when converting to JSON for public API
reviewSchema.methods.toJSON = function () {
  const review = this.toObject();

  // Hide reporter information from public view
  if (review.reportReasons) {
    review.reportReasons = review.reportReasons.map((report) => ({
      reason: report.reason,
      reportedAt: report.reportedAt,
    }));
  }

  // Hide moderation details from public view
  delete review.moderatedBy;
  delete review.moderationReason;

  return review;
};

// Database indexes for query optimization
// Duplicate indexes removed - already defined in schema field indexes
reviewSchema.index({ customerId: 1 }); // For customer review history
reviewSchema.index({ storeId: 1, rating: -1 }); // For store reviews sorted by rating
reviewSchema.index({ productId: 1, rating: -1 }); // For product reviews sorted by rating
reviewSchema.index({ createdAt: -1 }); // For recent reviews

const Review = mongoose.model("Review", reviewSchema);

export default Review;
