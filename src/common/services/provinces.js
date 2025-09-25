import apiClient from '../api/axios-config';

export const ProvinceService = {
  async getAllProvinces(filters = {}) {
    const params = new URLSearchParams();

    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.clinic_id) params.append('clinic_id', filters.clinic_id);
    const response = await apiClient.get(
      `/admin/dashboard-rm/?${params.toString()}`
    );
    return response;
  },

  async getProvinceById(id) {
    const response = await apiClient.get(`/eom-submission/${id}/`);
    return response;
  },

  async createProvince(payload) {
    const response = await apiClient.post('/eom-account-receivable/', payload);
    return response;
  },

  async updateProvince(id, payload) {
    const response = await apiClient.patch(`/eom-submission/${id}/`, payload);
    return response;
  },

  async deleteProvince(id) {
    const response = await apiClient.delete(`/eom-submission/${id}/`);
    return response;
  }
};
