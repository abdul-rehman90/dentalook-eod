import apiClient from '../api/axios-config';

export const EODReportService = {
  async getAllProvinces() {
    const response = await apiClient.get('/upload-provinces');
    return response;
  },

  async getAllRegionalManagers() {
    const response = await apiClient.get('/get-regional-managers/');
    return response;
  },

  async getAllReports(filters = {}) {
    const params = new URLSearchParams();

    if (filters.clinic_id) params.append('clinic_id', filters.clinic_id);
    if (filters.submission_date)
      params.append('submission_date', filters.submission_date);

    const response = await apiClient.get(
      `/eod-subission-report/?${params.toString()}`
    );
    return response;
  },

  async getDataOfProvinceById(id) {
    const response = await apiClient.get(`/province-data/${id}`);
    return response;
  },

  async getProviders(id) {
    const response = await apiClient.get(`/provider-by-clinic/${id}`);
    return response;
  },

  async addNewProvider(payload) {
    const response = await apiClient.post('/add-provider/', payload);
    return response;
  },

  async getTargetGoalByClinicId(id) {
    const response = await apiClient.get(`/clinic-by-id/${id}`);
    return response;
  },

  async getActiveProviders(id) {
    const response = await apiClient.get(`/active-providers-eod/${id}`);
    return response;
  },

  async getAllPaymentsOrderByClinic(id) {
    const response = await apiClient.get(
      `/payment-type-order/?clinic_id=${id}`
    );
    return response;
  },

  async getAllSupplies(id, date) {
    const response = await apiClient.get(
      `/eod-submission-supplies/?clinic_id=${id}&month=${date}`
    );
    return response;
  },

  async handlePaymentTypeOrder(payload) {
    const response = await apiClient.post('/payment-type-order/', payload);
    return response;
  },

  async addBasicDetails(payload) {
    const response = await apiClient.post('/eod-submission/', payload);
    return response;
  },

  async addActiveProviders(payload) {
    const response = await apiClient.post('/active-provider/', payload);
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

  async addPatientTracking(payload) {
    const response = await apiClient.post('/eod-patient-tracking/', payload);
    return response;
  },

  async addAttritionTracking(payload) {
    const response = await apiClient.post('/eod-attrition/', payload);
    return response;
  },

  async addSupplies(id, payload) {
    const response = await apiClient.patch(`/eod-submission/${id}/`, payload);
    return response;
  },

  async addRefferal(payload) {
    const response = await apiClient.post('/eod-referral/', payload);
    return response;
  },

  async submissionEODReport(payload) {
    const response = await apiClient.post('/submit-eod/', payload);
    return response;
  },

  async getAllEODData(id) {
    const response = await apiClient.get(`/eod-data/${id}/`);
    return response;
  },

  async getAllSubmissionList(filters = {}) {
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
