import { apiClient } from "./client";

export const authAPI = {
  register: async (userData) => {
    return apiClient.post("/auth/register", userData);
  },

  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  logout: async () => {
    return apiClient.post("/auth/logout");
  },

  refreshToken: async (refreshToken) => {
    return apiClient.post("/users/refresh", { refreshToken });
  },

  getProfile: async () => {
    return apiClient.get("/users/profile");
  },

  updateProfile: async (profileData) => {
    return apiClient.put("/users/profile", profileData);
  },

  changePassword: async (passwordData) => {
    return apiClient.put("/users/change-password", passwordData);
  },

  forgotPassword: async (email) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (resetData) => {
    return apiClient.put("/auth/reset-password", resetData);
  },
};

// Store auth data in localStorage
export const storeAuthData = (data) => {
  if (data.token) {
    localStorage.setItem("storeAuthToken", data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem("storeRefreshToken", data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem("storeUser", JSON.stringify(data.user));
  }
};

// Get auth data from localStorage
export const getAuthData = () => {
  const token = localStorage.getItem("storeAuthToken");
  const refreshToken = localStorage.getItem("storeRefreshToken");
  const userStr = localStorage.getItem("storeUser");
  const user = userStr ? JSON.parse(userStr) : null;

  return { token, refreshToken, user };
};

// Clear auth data
export const clearAuthData = () => {
  localStorage.removeItem("storeAuthToken");
  localStorage.removeItem("storeRefreshToken");
  localStorage.removeItem("storeUser");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("storeAuthToken");
};
