import { Star } from "lucide-react";

const RecentReviews = ({ reviews }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Recent Reviews</h2>
        <button className="text-sm font-medium text-green-600 hover:text-green-700">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No reviews yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Customer reviews will appear here
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {review.customer[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">
                      {review.customer}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{review.product}</span>
                    <span>{review.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentReviews;
