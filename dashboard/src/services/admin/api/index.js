// Central export point for Admin API services
export { apiClient } from "./client";
export {
  authAPI,
  storeAuthData,
  getAuthData,
  clearAuthData,
  isAuthenticated,
} from "./auth.api";
export { dashboardAPI } from "./dashboard.api";
export { userAPI } from "./user.api";
export { storeAPI } from "./store.api";
export { productAPI } from "./product.api";
export { orderAPI } from "./order.api";
export { categoryAPI } from "./category.api";
export { couponAPI } from "./coupon.api";
export { reviewAPI } from "./review.api";
export { paymentAPI } from "./payment.api";
export { deliverySettingsAPI } from "./deliverySettings.api";
export { riderAPI } from "./rider.api";
export { analyticsAPI } from "./analytics.api";
