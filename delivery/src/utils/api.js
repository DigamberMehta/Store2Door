// Legacy file - Re-exports from new modular API structure
// All API logic is now organized in /services/api/
export {
  apiClient,
  driverAuthAPI,
  storeAuthData,
  getAuthData,
  clearAuthData,
  isAuthenticated,
  driverProfileAPI,
} from "../services/api";
