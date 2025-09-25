import apiClient from '../api/axios-config';

export const ClinicService = {
  async getAllClinics(filters = {}) {
    const params = new URLSearchParams();

    if (filters.name) params.append('name', filters.name);
    const response = await apiClient.get(
      `/admin/clinics/?${params.toString()}`
    );
    return response;
  },

  async getClinicById(id) {
    const response = await apiClient.get(`/admin/clinics/${id}/`);
    return response;
  },

  async createClinic(payload) {
    const response = await apiClient.post('/admin/clinics', payload);
    return response;
  },

  async updateClinic(id, payload) {
    const response = await apiClient.patch(`/admin/clinics${id}/`, payload);
    return response;
  },

  async deleteClinic(id) {
    const response = await apiClient.delete(`/admin/clinics/${id}/`);
    return response;
  }
};
