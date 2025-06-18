import apiClient from '../api/axios-config';

export const EODReviewService = {
  async getAllClinics() {
    const response = await apiClient.get('/all-clinics-by-user/');
    return response;
  },

  async getAllSubmissions(filters = {}) {
    const params = new URLSearchParams();

    if (filters.province) params.append('province', filters.province);
    if (filters.clinic_id) params.append('clinic_id', filters.clinic_id);
    if (filters.regional_manager)
      params.append('regional_manager', filters.regional_manager);
    if (filters.start_date)
      params.append('start_date', filters.start_date.format('YYYY-MM-DD'));
    if (filters.end_date)
      params.append('end_date', filters.end_date.format('YYYY-MM-DD'));

    const response = await apiClient.get(
      `/review-eod-submission/?${params.toString()}`
    );
    return response;
  }
};
