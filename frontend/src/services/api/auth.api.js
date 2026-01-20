import { apiClient } from "./client";

export const authAPI = {
  register: async (userData) => {
    return apiClient.post("/users/register", userData);
  },

  login: async (credentials) => {
    return apiClient.post("/users/login", credentials);
  },

  logout: async () => {
    return apiClient.post("/users/logout");
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
    return apiClient.post("/users/forgot-password", { email });
  },

  resetPassword: async (resetData) => {
    return apiClient.put("/users/reset-password", resetData);
  },
};

// Store user data in localStorage
export const storeAuthData = (data) => {
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
};

// Get user data from localStorage
export const getAuthData = () => {
  const token = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return { token, refreshToken, user };
};

// Clear auth data
export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};
