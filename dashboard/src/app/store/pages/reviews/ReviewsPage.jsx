import { useState, useEffect } from "react";
import { reviewAPI } from "../../../../services/store/api/review.api";
import {
  Star,
  TrendingUp,
  Package,
  Store,
  Filter,
  Search,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const ReviewsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    reviewType: "store",
    rating: "",
    page: 1,
    limit: 21,
    sortBy: "createdAt",
    order: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const data = await reviewAPI.getStats();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getMyReviews(filters);
      setReviews(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && !reviews.length) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <h1 className="text-lg font-bold text-gray-900">Reviews & Ratings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage and respond to customer reviews
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Statistics Cards */}
        {stats?.data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Store Reviews Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Store Reviews</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.data.storeReviews?.averageRating?.toFixed(1) ||
                        "0.0"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(
                        Math.round(stats.data.storeReviews?.averageRating || 0),
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-700">
                      {stats.data.storeReviews?.totalReviews || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Reviews</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">5 Stars</span>
                      <span className="font-medium">
                        {stats.data.storeReviews?.fiveStars || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">4 Stars</span>
                      <span className="font-medium">
                        {stats.data.storeReviews?.fourStars || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">3 Stars</span>
                      <span className="font-medium">
                        {stats.data.storeReviews?.threeStars || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Reviews Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Product Reviews
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.data.productReviews?.averageRating?.toFixed(1) ||
                        "0.0"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(
                        Math.round(
                          stats.data.productReviews?.averageRating || 0,
                        ),
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-700">
                      {stats.data.productReviews?.totalReviews || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.data.recentReviewsCount || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Reviews in last 7 days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            {/* Review Type Filter */}
            <select
              value={filters.reviewType}
              onChange={(e) => handleFilterChange("reviewType", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="store">Store Reviews</option>
              <option value="product">Product Reviews</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Sort Filter */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="createdAt">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="helpfulVotes">Most Helpful</option>
            </select>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search or filters"
                  : "Reviews will appear here once customers start rating your store"}
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image Header (for product reviews) */}
                {review.productId && review.productId.images?.[0]?.url && (
                  <div className="relative h-32 bg-gray-100">
                    <img
                      src={review.productId.images[0].url}
                      alt={review.productId.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white font-semibold text-xs truncate">
                        {review.productId.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Review Content */}
                <div className="p-3">
                  {/* Rating and Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {renderStars(review.rating)}
                      <span className="text-xs font-bold text-gray-900">
                        {review.rating}.0
                      </span>
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Review Type Badge */}
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        review.reviewType === "store"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {review.reviewType === "store" ? (
                        <>
                          <Store className="w-3 h-3" /> Store Review
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3" /> Product Review
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title */}
                  {review.title && (
                    <h3 className="font-semibold text-sm text-gray-900 mb-1.5 line-clamp-2">
                      {review.title}
                    </h3>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                      {review.comment}
                    </p>
                  )}

                  {/* Product Name (if no image) */}
                  {review.productId && !review.productId.images?.[0]?.url && (
                    <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded mb-2">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">
                        {review.productId.name}
                      </span>
                    </div>
                  )}

                  {/* Criteria Pills */}
                  {review.criteria &&
                    Object.keys(review.criteria).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {review.criteria.quality && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            Quality: {review.criteria.quality}/5
                          </span>
                        )}
                        {review.criteria.value && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            Value: {review.criteria.value}/5
                          </span>
                        )}
                        {review.criteria.foodQuality && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            Food: {review.criteria.foodQuality}/5
                          </span>
                        )}
                        {review.criteria.service && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            Service: {review.criteria.service}/5
                          </span>
                        )}
                        {review.criteria.packaging && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            Packaging: {review.criteria.packaging}/5
                          </span>
                        )}
                      </div>
                    )}

                  {/* Reviewer Info */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-xs">
                        {review.reviewerId?.name?.[0] || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {review.reviewerId?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination?.total > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                {Math.min(filters.page * filters.limit, pagination.total)} of{" "}
                {pagination.total} reviews
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {filters.page} of {pagination.pages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
