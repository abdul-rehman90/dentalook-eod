import axios from 'axios';
import { getUserAndToken } from '../utils/auth-user';

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BASE_URL = 'https://a870-203-99-174-147.ngrok-free.app/api/v1';

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
    }
    return Promise.reject(error);
  }
);

export default apiClient;
