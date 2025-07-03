import axios from 'axios';
import { getUserAndToken, removeUserAndToken } from '../utils/auth-user';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
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
      removeUserAndToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
