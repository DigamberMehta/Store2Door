// Central export point for all API services
export { apiClient } from "./client";
export {
  authAPI,
  storeAuthData,
  getAuthData,
  clearAuthData,
  isAuthenticated,
} from "./auth.api";
export { customerProfileAPI } from "./profile.api";
export { categoryAPI } from "./category.api";
export { productAPI } from "./product.api";
export { storeAPI } from "./store.api";
export { default as cartAPI } from "./cart.api";
export { default as suggestionsAPI } from "./suggestions.api";
