import apiClient from '../api/axios-config';

export const EOMReportService = {
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
    const response = await apiClient.post(`/eom-submission/${id}`, payload);
    return response;
  },

  async addHiringNeed(payload) {
    const response = await apiClient.post('/eom-hiring-need/', payload);
    return response;
  },

  async addTrainingNeed(payload) {
    const response = await apiClient.post('/eom-traning-need/', payload);
    return response;
  },

  async submissionEODReport(payload) {
    const response = await apiClient.post('/submit-eod/', payload);
    return response;
  }
};
