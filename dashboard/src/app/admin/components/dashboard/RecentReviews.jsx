import { Star, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const RecentReviews = ({ reviews = [] }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getReviewTypeColor = (type) => {
    const colors = {
      product: "bg-blue-100 text-blue-800",
      store: "bg-purple-100 text-purple-800",
      rider: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Recent Reviews</h2>
        <Link
          to="/admin/reviews"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <MessageSquare className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">No recent reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {review.reviewer?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {review.reviewer?.name || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(review.rating)}
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getReviewTypeColor(review.reviewType)}`}
                      >
                        {review.reviewType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.comment && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {review.comment}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {review.storeName ||
                    review.store?.name ||
                    review.productName ||
                    "N/A"}
                </span>
                <span>
                  {new Date(review.createdAt).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentReviews;
