import axios from 'axios';

// Retrieving the base URL from environment variables
const { REACT_APP_BASE_URL } = process.env;

const apiClient = axios.create({
  baseURL: REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'ngrok-skip-browser-warning'
  }
});

apiClient.interceptors.request.use(
  async (config) => {
    const { authToken } = await getAuthAndUser();
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
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
