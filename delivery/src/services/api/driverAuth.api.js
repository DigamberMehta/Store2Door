import { apiClient } from "./client";

export const driverAuthAPI = {
  register: async (userData) => {
    return apiClient.post("/drivers/register", userData);
  },

  login: async (credentials) => {
    return apiClient.post("/drivers/login", credentials);
  },

  logout: async () => {
    return apiClient.post("/drivers/logout");
  },

  refreshToken: async (refreshToken) => {
    return apiClient.post("/drivers/refresh", { refreshToken });
  },

  getProfile: async () => {
    return apiClient.get("/drivers/profile");
  },

  updateProfile: async (profileData) => {
    return apiClient.put("/drivers/profile", profileData);
  },

  changePassword: async (passwordData) => {
    return apiClient.put("/drivers/change-password", passwordData);
  },

  forgotPassword: async (email) => {
    return apiClient.post("/drivers/forgot-password", { email });
  },

  resetPassword: async (resetData) => {
    return apiClient.put("/drivers/reset-password", resetData);
  },
};

// Store driver auth data in localStorage
export const storeAuthData = (data) => {
  if (data.token) {
    localStorage.setItem("driverAuthToken", data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem("driverRefreshToken", data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem("driver", JSON.stringify(data.user));
  }
};

// Get driver auth data from localStorage
export const getAuthData = () => {
  const token = localStorage.getItem("driverAuthToken");
  const refreshToken = localStorage.getItem("driverRefreshToken");
  const driverStr = localStorage.getItem("driver");
  const driver = driverStr ? JSON.parse(driverStr) : null;

  return { token, refreshToken, driver };
};

// Clear auth data
export const clearAuthData = () => {
  localStorage.removeItem("driverAuthToken");
  localStorage.removeItem("driverRefreshToken");
  localStorage.removeItem("driver");
};

// Check if driver is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("driverAuthToken");
};
