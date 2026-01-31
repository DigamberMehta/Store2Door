import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance for store managers
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/managers`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("storeAuthToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Return the data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("storeRefreshToken");

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/users/refresh`, {
            refreshToken,
          });

          if (response.data.success) {
            const newToken = response.data.data.token;
            localStorage.setItem("storeAuthToken", newToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem("storeAuthToken");
        localStorage.removeItem("storeRefreshToken");
        localStorage.removeItem("storeUser");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(errorMessage));
  },
);
