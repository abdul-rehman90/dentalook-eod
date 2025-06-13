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

  async sumbmissionOfBasicDetails(payload) {
    const response = await apiClient.post('/eod-submission/', payload);
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

  async addNewProvider(payload) {
    const response = await apiClient.post('/add-provider/', payload);
    return response;
  },

  async getProvidersByTypeAndClinic(type, id) {
    const response = await apiClient.get(
      `/providers-by-type-and-clinic/?provider_type=${type}&clinic_id=${id}`
    );
    return response;
  },

  async getProvidersByClinic(id) {
    const response = await apiClient.get(
      `/providers-by-clinic/?clinic_id=${id}`
    );
    return response;
  },

  async getProduction() {
    const response = await apiClient.get('/eod-production/');
    return response;
  },

  async addProduction(payload) {
    const response = await apiClient.post('/eod-production/', payload);
    return response;
  },

  async addPayment(payload) {
    const response = await apiClient.post('/eod-payments/', payload);
    return response;
  },

  async addTeamAbsence(payload) {
    const response = await apiClient.post('/eod-absence/', payload);
    return response;
  },

  async addScheduleOpening(payload) {
    const response = await apiClient.post('/eod-schedule/', payload);
    return response;
  },

  async addPatientTracking(payload) {
    const response = await apiClient.post('/eod-patient-tracking/', payload);
    return response;
  },

  async addAttritionTracking(payload) {
    const response = await apiClient.post('/eod-attrition/', payload);
    return response;
  },

  async addRefferal(payload) {
    const response = await apiClient.post('/eod-referral/', payload);
    return response;
  }
};
