import { useState, useEffect } from "react";
import { MdStar, MdVerified, MdClose } from "react-icons/md";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import reviewAPI from "../../services/api/review.api";

const RatingsReviews = ({ product, avgRating, totalReviews }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [product?._id]);

  const fetchStats = async () => {
    if (!product?._id) return;
    try {
      const response = await reviewAPI.getStats("product", product._id);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
    }
  };

  const fetchReviews = async () => {
    if (!product?._id) {
      return;
    }
    try {
      setLoading(true);
      const response = await reviewAPI.getProductReviews(product._id);
      if (response.success && response.data) {
        const reviewsData = Array.isArray(response.data)
          ? response.data
          : response.data?.reviews || [];
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error("❌ Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.trim().length > 0 && comment.trim().length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const reviewData = {
        reviewType: "product",
        productId: product._id,
        rating: rating,
        storeId: product.storeId?._id || product.storeId,
      };

      // Only add comment if it's not empty
      if (comment.trim().length > 0) {
        reviewData.comment = comment.trim();
      }

      const response = await reviewAPI.create(reviewData);

      // Reset form
      setRating(0);
      setComment("");
      setShowReviewForm(false);

      // Refresh reviews list
      await fetchReviews();
      await fetchStats();
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("❌ Submit error:", err);
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowReviewForm(false);
    setRating(0);
    setComment("");
    setError("");
  };

  const handleVote = async (reviewId, type) => {
    try {
      await reviewAPI.vote(reviewId, type);
      fetchReviews(); // Refresh to get updated vote counts
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 mx-3 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-sm">Ratings & Reviews</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-3 py-1.5 bg-[rgb(49,134,22)]/20 border border-[rgb(49,134,22)]/30 rounded-lg text-xs font-medium text-white active:bg-[rgb(49,134,22)]/30 transition-all"
        >
          {showReviewForm ? "Cancel" : "Write Review"}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-4 bg-white/5 rounded-lg p-3 border border-white/10">
          <h3 className="text-white font-medium text-sm mb-3">
            Write a Review
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-3">
            {/* Star Rating Input */}
            <div>
              <label className="block text-white/70 text-xs mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <MdStar
                      className={`text-2xl ${
                        star <= (hoverRating || rating)
                          ? "text-[rgb(49,134,22)]"
                          : "text-white/20"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-xs text-white/50">
                    {rating} {rating === 1 ? "star" : "stars"}
                  </span>
                )}
              </div>
            </div>

            {/* Comment/Review Text */}
            <div>
              <label className="block text-white/70 text-xs mb-2">
                Your Review (optional, minimum 10 characters)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[rgb(49,134,22)]/50 focus:ring-1 focus:ring-[rgb(49,134,22)]/30 resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-white/40">
                  {comment.length}/2000 characters
                </span>
                {comment.length > 0 && comment.length < 10 && (
                  <span className="text-[10px] text-red-400">
                    {10 - comment.length} more characters needed
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/70 active:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 py-2 bg-[rgb(49,134,22)] border border-[rgb(49,134,22)] rounded-lg text-xs font-medium text-white active:bg-[rgb(49,134,22)]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Overall Rating */}
      <div className="flex items-start gap-4 mb-4 pb-3 border-b border-white/5">
        <div className="text-center">
          <div className="text-3xl font-black text-white mb-1">
            {stats?.averageRating || avgRating || 0}
          </div>
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <MdStar
                key={star}
                className={`text-xs ${
                  star <= Math.round(stats?.averageRating || avgRating || 0)
                    ? "text-[rgb(49,134,22)]"
                    : "text-white/20"
                }`}
              />
            ))}
          </div>
          <p className="text-white/40 text-[10px]">
            {(stats?.totalReviews || totalReviews || 0).toLocaleString()}{" "}
            ratings
          </p>
          {stats?.simpleAverage &&
            stats.simpleAverage !== stats.averageRating && (
              <p className="text-white/30 text-[9px] mt-1">
                (Simple avg: {stats.simpleAverage})
              </p>
            )}
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((ratingItem) => {
            const starKey =
              ratingItem === 5
                ? "fiveStars"
                : ratingItem === 4
                  ? "fourStars"
                  : ratingItem === 3
                    ? "threeStars"
                    : ratingItem === 2
                      ? "twoStars"
                      : "oneStar";
            const count =
              stats?.[starKey] || product?.ratingBreakdown?.[ratingItem] || 0;
            const total = stats?.totalReviews || totalReviews || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={ratingItem} className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 w-2">
                  {ratingItem}
                </span>
                <MdStar className="text-[10px] text-white/40" />
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[rgb(49,134,22)] to-[rgb(49,134,22)]/80 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/50 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-[rgb(49,134,22)] border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-white/40 text-[10px]">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white/5 rounded-lg p-3 border border-white/5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-white font-medium text-xs">
                      {review.reviewerId?.name || "Anonymous User"}
                    </span>
                    {review.isVerifiedPurchase && (
                      <MdVerified className="text-green-400 text-xs" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MdStar
                          key={star}
                          className={`text-[10px] ${
                            star <= review.rating
                              ? "text-[rgb(49,134,22)]"
                              : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white/40 text-[10px]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-white/70 text-xs leading-relaxed mb-2">
                {review.comment || "No comment provided"}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVote(review._id, "up")}
                  className="flex items-center gap-1 text-white/40 hover:text-white transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span className="text-[10px]">
                    {review.helpfulVotes || 0}
                  </span>
                </button>
                <button
                  onClick={() => handleVote(review._id, "down")}
                  className="flex items-center gap-1 text-white/40 hover:text-white transition-colors"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-white/5 rounded-lg border border-dashed border-white/10">
            <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/40 text-xs font-medium">No reviews yet</p>
            <p className="text-white/20 text-[10px]">
              Be the first to share your thoughts!
            </p>
          </div>
        )}

        {reviews.length > 3 && (
          <button className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/70 active:bg-white/10 transition-all">
            View all {reviews.length} reviews
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingsReviews;
