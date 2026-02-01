import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { MdStar, MdVerified } from "react-icons/md";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import reviewAPI from "../../services/api/review.api";
import { formatDateOnly } from "../../utils/date";

const AllReviewsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, stats } = location.state || {};

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    if (product?._id) {
      fetchReviews(1);
    }
  }, [product?._id]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, page]);

  const fetchReviews = async (pageNum) => {
    if (!product?._id) return;

    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await reviewAPI.getProductReviews(
        product._id,
        pageNum,
        10,
      );

      if (response.success && response.data) {
        const newReviews = Array.isArray(response.data)
          ? response.data
          : response.data?.reviews || [];

        if (pageNum === 1) {
          setReviews(newReviews);
        } else {
          setReviews((prev) => [...prev, ...newReviews]);
        }

        // Check if there are more reviews
        setHasMore(newReviews.length === 10);
      }
    } catch (err) {
      console.error("❌ Error fetching reviews:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleVote = async (reviewId, type) => {
    try {
      await reviewAPI.vote(reviewId, type);
      // Update the specific review in the list
      setReviews((prevReviews) =>
        prevReviews.map((review) => {
          if (review._id === reviewId) {
            return {
              ...review,
              helpfulVotes:
                type === "up"
                  ? (review.helpfulVotes || 0) + 1
                  : review.helpfulVotes,
            };
          }
          return review;
        }),
      );
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/40 text-sm">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">All Reviews</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Overall Rating Summary */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <div className="text-3xl font-black text-white mb-1">
              {stats?.averageRating || 0}
            </div>
            <div className="flex items-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <MdStar
                  key={star}
                  className={`text-xs ${
                    star <= Math.round(stats?.averageRating || 0)
                      ? "text-[rgb(49,134,22)]"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-white/40 text-[10px]">
              {(stats?.totalReviews || 0).toLocaleString()} ratings
            </p>
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
              const count = stats?.[starKey] || 0;
              const total = stats?.totalReviews || 0;
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
      </div>

      {/* Reviews List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[rgb(49,134,22)] border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-white/40 text-xs">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
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
                        {formatDateOnly(review.createdAt)}
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
            ))}

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="text-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-[rgb(49,134,22)] border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-white/40 text-[10px]">Loading more...</p>
              </div>
            )}

            {/* Intersection observer target */}
            {hasMore && !loadingMore && (
              <div ref={observerTarget} className="h-4"></div>
            )}

            {/* End of reviews message */}
            {!hasMore && reviews.length > 0 && (
              <p className="text-center text-white/30 text-xs py-4">
                No more reviews
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-medium">No reviews yet</p>
            <p className="text-white/20 text-xs">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReviewsPage;
