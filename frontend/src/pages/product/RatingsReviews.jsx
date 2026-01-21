import { useState } from "react";
import { MdStar, MdVerified } from "react-icons/md";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const RatingsReviews = ({ product, avgRating, totalReviews }) => {
  const [selectedReviewFilter, setSelectedReviewFilter] = useState("all");

  // Mock reviews for now (will be added later)
  const reviews = [];
  const filteredReviews = reviews;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 mx-3 mb-6">
      <h2 className="text-white font-semibold text-sm mb-3">
        Ratings & Reviews
      </h2>

      {/* Overall Rating */}
      <div className="flex items-start gap-4 mb-4 pb-3 border-b border-white/5">
        <div className="text-center">
          <div className="text-3xl font-black text-white mb-1">{avgRating}</div>
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <MdStar
                key={star}
                className={`text-xs ${
                  star <= Math.round(avgRating)
                    ? "text-[rgb(49,134,22)]"
                    : "text-white/20"
                }`}
              />
            ))}
          </div>
          <p className="text-white/40 text-[10px]">
            {totalReviews.toLocaleString()} ratings
          </p>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = product.ratingBreakdown?.[rating] || 0;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 w-2">{rating}</span>
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

      {/* Filter Reviews */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-3">
        <button
          onClick={() => setSelectedReviewFilter("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedReviewFilter === "all"
              ? "bg-[rgb(49,134,22)]/20 text-white border border-[rgb(49,134,22)]/30"
              : "bg-white/5 text-white/50 border border-white/10"
          }`}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setSelectedReviewFilter(rating.toString())}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              selectedReviewFilter === rating.toString()
                ? "bg-[rgb(49,134,22)]/20 text-white border border-[rgb(49,134,22)]/30"
                : "bg-white/5 text-white/50 border border-white/10"
            }`}
          >
            {rating} <MdStar className="text-[10px]" />
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="bg-white/5 rounded-lg p-3 border border-white/5"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-white font-medium text-xs">
                    {review.name}
                  </span>
                  {review.verified && (
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
                    {review.date}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-white/70 text-xs leading-relaxed mb-2">
              {review.comment}
            </p>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-white/40 hover:text-white transition-colors">
                <ThumbsUp className="w-3 h-3" />
                <span className="text-[10px]">{review.helpful}</span>
              </button>
              <button className="flex items-center gap-1 text-white/40 hover:text-white transition-colors">
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {filteredReviews.length > 3 && (
          <button className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/70 active:bg-white/10 transition-all">
            View all {filteredReviews.length} reviews
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingsReviews;
