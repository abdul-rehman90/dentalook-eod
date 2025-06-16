import apiClient from '../api/axios-config';

export const AuthService = {
  async login(payload) {
    const response = await apiClient.post('/login/', payload);
    return response;
  }
};
