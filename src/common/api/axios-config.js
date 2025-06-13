import axios from 'axios';

// const { REACT_APP_BASE_URL } = process.env;

const REACT_APP_BASE_URL = 'https://a2cc-39-53-101-205.ngrok-free.app/api/v1';

const apiClient = axios.create({
  baseURL: REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'ngrok-skip-browser-warning'
  }
});

apiClient.interceptors.request.use(
  async (config) => {
    // const { authToken } = await getAuthAndUser();
    if (true) {
      // config.headers.Authorization = `Bearer ${authToken}`;
      // config.headers.Authorization = ``;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
    }
    return Promise.reject(error);
  }
);

export default apiClient;
