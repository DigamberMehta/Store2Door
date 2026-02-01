import Review from "../models/Review.js";
import Order from "../models/Order.js";

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { reviewType, productId, storeId, riderId, rating, comment } =
      req.body;

    // Check if user has already reviewed this product/store/rider
    const existingReview = await Review.findOne({
      reviewType,
      reviewerId: req.user._id,
      ...(productId && { productId }),
      ...(storeId && { storeId }),
      ...(riderId && { riderId }),
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this item. You can only submit one review per item.",
      });
    }

    // For product reviews, check if user has purchased the product (REQUIRED)
    if (reviewType === "product" && productId) {
      const order = await Order.findOne({
        user: req.user._id,
        "items.product": productId,
        status: "delivered",
      });

      if (order) {
        // User has purchased this product - mark as verified
        req.body.orderId = order._id;
        req.body.isVerifiedPurchase = true;
      } else {
        // User hasn't purchased - reject the review
        return res.status(403).json({
          success: false,
          message:
            "You can only review products you have purchased and received.",
        });
      }
    }

    const review = await Review.create({
      ...req.body,
      reviewerId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this item.",
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt" } = req.query;

    const reviews = await Review.getReviewsByProduct(
      productId,
      page,
      limit,
      sortBy,
    );

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("❌ Error in getProductReviews:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get review stats
// @route   GET /api/reviews/stats/:type/:id
// @access  Public
export const getReviewStats = async (req, res) => {
  try {
    const { type, id } = req.params;
    const stats = await Review.getReviewStats(type, id);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Vote on a review
// @route   POST /api/reviews/:id/vote
// @access  Private
export const voteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (voteType === "helpful") {
      await review.addHelpfulVote(req.user._id);
    } else {
      await review.addUnhelpfulVote(req.user._id);
    }

    res.status(200).json({ success: true, message: "Vote recorded" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
