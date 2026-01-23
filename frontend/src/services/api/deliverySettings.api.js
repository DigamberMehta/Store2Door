import { apiClient } from './client';

const deliverySettingsAPI = {
  // Get active delivery settings
  getSettings: async () => {
    const response = await apiClient.get('/delivery-settings');
    return response.data;
  },

  // Calculate delivery charge for a given distance
  calculateCharge: async (distance) => {
    const response = await apiClient.get('/delivery-settings/calculate-charge', {
      params: { distance }
    });
    return response.data;
  },

  // Admin: Create or update settings
  updateSettings: async (settingsData) => {
    const response = await apiClient.post('/delivery-settings', settingsData);
    return response.data;
  }
};

export default deliverySettingsAPI;
