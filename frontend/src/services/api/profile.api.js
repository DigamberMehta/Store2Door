import { apiClient } from "./client";

export const customerProfileAPI = {
  // Get customer profile (includes user, profile, and stats)
  getProfile: async () => {
    return apiClient.get("/customer-profile");
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    return apiClient.put("/customer-profile", profileData);
  },

  // Get all addresses
  getAddresses: async () => {
    return apiClient.get("/customer-profile/addresses");
  },

  // Add new address
  addAddress: async (addressData) => {
    return apiClient.post("/customer-profile/addresses", addressData);
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    return apiClient.put(
      `/customer-profile/addresses/${addressId}`,
      addressData
    );
  },

  // Delete address
  deleteAddress: async (addressId) => {
    return apiClient.delete(`/customer-profile/addresses/${addressId}`);
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    return apiClient.put(`/customer-profile/addresses/${addressId}/default`);
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    return apiClient.put("/customer-profile/preferences", preferences);
  },

  // Get customer stats
  getStats: async () => {
    return apiClient.get("/customer-profile/stats");
  },

  // Update location
  updateLocation: async (location) => {
    return apiClient.put("/customer-profile/location", location);
  },
};
