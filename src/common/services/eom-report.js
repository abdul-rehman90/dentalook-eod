import apiClient from '../api/axios-config';

export const EOMReportService = {
  async getAllClinics() {
    const response = await apiClient.get('/all-clinics-by-user/');
    return response;
  },

  async sumbmissionOfBasicDetails(payload) {
    const response = await apiClient.post('/eom-submission/', payload);
    return response;
  },

  async addAccountReceivable(payload) {
    const response = await apiClient.post('/eom-account-receivable/', payload);
    return response;
  },

  async addEquipment(payload) {
    const response = await apiClient.post('/eom-equipment/', payload);
    return response;
  },

  async addClinicUpgrade(payload) {
    const response = await apiClient.post('/eom-clinic-upgrade/', payload);
    return response;
  },

  async addIssueIdeas(payload) {
    const response = await apiClient.post('/eom-issues-ideas/', payload);
    return response;
  },

  async addSuppliesAndGoogleReviews(id, payload) {
    const response = await apiClient.patch(`/eom-submission/${id}/`, payload);
    return response;
  },

  async addHiringNeed(payload) {
    const response = await apiClient.post('/eom-hiring-need/', payload);
    return response;
  },

  async addTrainingNeed(payload) {
    const response = await apiClient.post('/eom-training-need/', payload);
    return response;
  },

  async submissionEOMReport(payload) {
    const response = await apiClient.post('/submit-eom/', payload);
    return response;
  },

  async getAllSubmissions(filters = {}) {
    const params = new URLSearchParams();

    if (filters.province) params.append('province', filters.province);
    if (filters.clinic_id) params.append('clinic_id', filters.clinic_id);
    if (filters.regional_manager)
      params.append('regional_manager', filters.regional_manager);
    if (filters.submission_month)
      params.append(
        'submission_month',
        filters.submission_month.format('YYYY-MM-DD')
      );

    const response = await apiClient.get(
      `/review-eom-submissions/?${params.toString()}`
    );
    return response;
  }
};
