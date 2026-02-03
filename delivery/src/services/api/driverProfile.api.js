import { apiClient } from "./client";

export const driverProfileAPI = {
  // Get driver profile (includes user, profile, and stats)
  getProfile: async () => {
    return apiClient.get("/driver-profile");
  },

  // Update driver profile
  updateProfile: async (profileData) => {
    return apiClient.put("/driver-profile", profileData);
  },

  // Vehicle Management
  updateVehicle: async (vehicleData) => {
    return apiClient.put("/driver-profile/vehicle", vehicleData);
  },

  // Document Management
  getDocumentsStatus: async () => {
    return apiClient.get("/driver-profile/documents/status");
  },

  uploadDocument: async (documentType, file, additionalData = {}) => {
    const formData = new FormData();
    formData.append("file", file);

    // Append additional data (like number, expiryDate, etc.)
    Object.keys(additionalData).forEach((key) => {
      if (additionalData[key] !== undefined && additionalData[key] !== null) {
        formData.append(key, additionalData[key]);
      }
    });

    return apiClient.put(
      `/driver-profile/documents/${documentType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds for document uploads
      },
    );
  },

  // Availability Management
  updateAvailability: async (availabilityData) => {
    return apiClient.put("/driver-profile/availability", availabilityData);
  },

  toggleOnlineStatus: async (isAvailable) => {
    return apiClient.put("/driver-profile/status", { isAvailable });
  },

  // Location Management
  updateLocation: async (location) => {
    return apiClient.put("/driver-profile/location", location);
  },

  // Statistics
  getStats: async () => {
    return apiClient.get("/driver-profile/stats");
  },

  // Bank Account Management
  getBankAccount: async () => {
    return apiClient.get("/driver-profile/bank-account");
  },

  updateBankAccount: async (bankData) => {
    return apiClient.put("/driver-profile/bank-account", bankData);
  },

  // Vehicle Management
  updateVehicle: async (vehicleData) => {
    return apiClient.put("/driver-profile/vehicle", vehicleData);
  },

  // Emergency Contact
  updateEmergencyContact: async (contactData) => {
    return apiClient.put("/driver-profile", { emergencyContact: contactData });
  },
};
