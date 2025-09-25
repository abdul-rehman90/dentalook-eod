import apiClient from '../api/axios-config';

export const UserService = {
  async getAllUsers(filters = {}) {
    const params = new URLSearchParams();

    if (filters.name) params.append('name', filters.name);
    const response = await apiClient.get(`/admin/users/?${params.toString()}`);
    return response;
  },

  async getUserById(id) {
    const response = await apiClient.get(`/admin/users/${id}/`);
    return response;
  },

  async createUser(payload) {
    const response = await apiClient.post('/admin/users/', payload);
    return response;
  },

  async updateUser(id, payload) {
    const response = await apiClient.put(`/admin/users/${id}/`, payload);
    return response;
  },

  async deleteUser(id) {
    const response = await apiClient.delete(`/admin/users/${id}/`);
    return response;
  }
};
