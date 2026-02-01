import { apiClient } from "./client";

export const reviewAPI = {
  // Get reviews for a product with pagination
  getProductReviews: (productId, page = 1, limit = 10, sortBy = "createdAt") =>
    apiClient.get(`/reviews/product/${productId}`, {
      params: { page, limit, sortBy },
    }),

  // Get reviews for a store
  getStoreReviews: (storeId, params = {}) =>
    apiClient.get(`/reviews/store/${storeId}`, { params }),

  // Create a new review
  create: (reviewData) => apiClient.post("/reviews", reviewData),

  // Get review stats for a target
  getStats: (type, id) => apiClient.get(`/reviews/stats/${type}/${id}`),

  // Vote on a review
  vote: (reviewId, voteType) =>
    apiClient.post(`/reviews/${reviewId}/vote`, { voteType }),

  // Report a review
  report: (reviewId, reason) =>
    apiClient.post(`/reviews/${reviewId}/report`, { reason }),
};

export default reviewAPI;
