import apiClient from '../api/axios-config';

export const EODReportService = {
  async getAllProvince() {
    const response = await apiClient.get('/upload-provinces');
    return response;
  },

  async getDataOfProvinceById(id) {
    const response = await apiClient.get(`/province-data/${id}`);
    return response;
  },

  async sumbmissionOfBasicDetails(data) {
    const response = await apiClient.post('/eod-submission/', data);
    return response;
  },

  async getTargetGoalByClinicId(id) {
    const response = await apiClient.get(`/clinic-by-id/${id}`);
    return response;
  },

  async getProviders() {
    const response = await apiClient.get('/add-provider/');
    return response;
  },

  async addNewProvider(data) {
    const response = await apiClient.post('/add-provider/', data);
    return response;
  },

  async getProviderByTypeAndClinic(type, id) {
    const response = await apiClient.get(
      `/providers-by-type-and-clinic/?provider_type=${type}&clinic_id=${id}`
    );
    return response;
  },

  async addTeamAbsence(data) {
    const response = await apiClient.post('/eod-absence/', data);
    return response;
  },

  async addScheduleOpening(data) {
    const response = await apiClient.post('/eod-schedule/', data);
    return response;
  }
};
