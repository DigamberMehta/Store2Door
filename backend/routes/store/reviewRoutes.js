import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import Review from "../../models/Review.js";
import Store from "../../models/Store.js";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

// Get store reviews
router.get("/", async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const {
      page = 1,
      limit = 20,
      reviewType = "store",
      rating,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {
      storeId,
      status: "approved",
    };

    if (reviewType) {
      query.reviewType = reviewType;
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("reviewerId", "name email")
        .populate("productId", "name images")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
});

// Get review statistics
router.get("/stats", async (req, res) => {
  try {
    const storeId = req.user.storeId;

    const [storeStats, productStats, recentReviews] = await Promise.all([
      // Store review stats
      Review.aggregate([
        {
          $match: {
            storeId: storeId,
            reviewType: "store",
            status: "approved",
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            fiveStars: {
              $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
            },
            fourStars: {
              $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
            },
            threeStars: {
              $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
            },
            twoStars: {
              $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
            },
            oneStar: {
              $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
            },
          },
        },
      ]),
      // Product review stats
      Review.aggregate([
        {
          $match: {
            storeId: storeId,
            reviewType: "product",
            status: "approved",
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]),
      // Recent reviews count (last 7 days)
      Review.countDocuments({
        storeId: storeId,
        status: "approved",
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        storeReviews: storeStats[0] || {
          averageRating: 0,
          totalReviews: 0,
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        },
        productReviews: productStats[0] || {
          averageRating: 0,
          totalReviews: 0,
        },
        recentReviewsCount: recentReviews,
      },
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review statistics",
      error: error.message,
    });
  }
});

// Respond to review
router.post("/:id/respond", async (req, res) => {
  try {
    const { id } = req.params;
    const { responseText } = req.body;
    const storeId = req.user.storeId;

    if (!responseText || responseText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Response text is required",
      });
    }

    const review = await Review.findOne({ _id: id, storeId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.response) {
      return res.status(400).json({
        success: false,
        message: "Review already has a response",
      });
    }

    review.response = {
      respondedBy: req.user._id,
      responseText: responseText.trim(),
      respondedAt: new Date(),
    };

    await review.save();

    res.json({
      success: true,
      message: "Response added successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error responding to review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to review",
      error: error.message,
    });
  }
});

export default router;
