import axios from 'axios';
import { getUserAndToken } from '../utils/auth-user';

// const { REACT_APP_BASE_URL } = process.env;

const REACT_APP_BASE_URL = 'https://eb16-39-53-66-239.ngrok-free.app/api/v1';

const apiClient = axios.create({
  baseURL: REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'ngrok-skip-browser-warning'
  }
});

apiClient.interceptors.request.use(
  async (config) => {
    const { token } = await getUserAndToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
