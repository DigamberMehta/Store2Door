import express from "express";
import {
  createReview,
  getProductReviews,
  getReviewStats,
  voteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/stats/:type/:id", getReviewStats);

// Protected routes
router.post("/", protect, createReview);
router.post("/:id/vote", protect, voteReview);

export default router;