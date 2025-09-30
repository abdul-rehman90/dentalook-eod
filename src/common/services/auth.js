import apiClient from '../api/axios-config';

export const AuthService = {
  async login(payload) {
    const response = await apiClient.post('/login/', payload);
    return response;
  },

  async forgotPassword(payload) {
    const response = await apiClient.post('/forgot-password/', payload);
    return response;
  },

  async resetPassword(payload) {
    const response = await apiClient.post('/reset-password/', payload);
    return response;
  }
};
