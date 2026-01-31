import { apiClient } from "./client";

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("/stores/stats");
    return response;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
