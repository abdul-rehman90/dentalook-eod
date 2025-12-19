import apiClient from '../api/axios-config';

export const CollectionTrackerService = {
  async getProductionDetails(filters = {}) {
    const params = new URLSearchParams();

    if (filters.province) params.append('province_id', filters.province);
    if (filters.clinic_id) params.append('clinic_id', filters.clinic_id);
    if (filters.regional_manager)
      params.append('regional_manager_id', filters.regional_manager);
    if (filters.start_date)
      params.append('start_date', filters.start_date.format('YYYY-MM-DD'));
    if (filters.end_date)
      params.append('end_date', filters.end_date.format('YYYY-MM-DD'));

    const response = await apiClient.get(
      `/eod-production/?${params.toString()}`
    );

    return response;
  },

  async getPaymentDetails(filters = {}) {
    const params = new URLSearchParams();

    if (filters.province) params.append('province_id', filters.province);
    if (filters.clinic_id) params.append('clinic_id', filters.clinic_id);
    if (filters.regional_manager)
      params.append('regional_manager_id', filters.regional_manager);
    if (filters.start_date)
      params.append('start_date', filters.start_date.format('YYYY-MM-DD'));
    if (filters.end_date)
      params.append('end_date', filters.end_date.format('YYYY-MM-DD'));

    const response = await apiClient.get(`/eod-payments/?${params.toString()}`);

    return response;
  },

  async getAllPaymentsDocs(filters = {}) {
    const params = new URLSearchParams();

    if (filters.province) params.append('province_id', filters.province);
    if (filters.clinic_id) params.append('clinic_id', filters.clinic_id);
    if (filters.regional_manager)
      params.append('regional_manager_id', filters.regional_manager);
    if (filters.start_date)
      params.append('start_date', filters.start_date.format('YYYY-MM-DD'));
    if (filters.end_date)
      params.append('end_date', filters.end_date.format('YYYY-MM-DD'));

    const response = await apiClient.get(
      `/eod-payment-document/?${params.toString()}`
    );

    return response;
  }
};
