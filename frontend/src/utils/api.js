// Legacy file - Re-exports from new modular API structure
// All API logic is now organized in /services/api/
export {
  apiClient,
  authAPI,
  storeAuthData,
  getAuthData,
  clearAuthData,
  isAuthenticated,
  customerProfileAPI,
} from "../services/api";
