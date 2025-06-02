import apiClient from './axios-config';
import { HTTP } from 'constants/http-method';
// import useSnackbarStore from 'store/use-snackbar';
// import { ERROR_MESSAGES } from 'constants/error-messages';

export const makeRequest = async (
  method,
  endpoint,
  payload = null,
  params = null,
  id = null
) => {
  try {
    const url = id ? `${endpoint}/${id}` : endpoint;

    const config = {
      method,
      url,
      params
    };

    if (payload instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
      config.data = payload;
    } else if (payload && !(method === HTTP.DELETE && id)) {
      config.headers = { 'Content-Type': 'application/json' };
      config.data = payload;
    }

    const response = await apiClient(config);
    return response;
  } catch (error) {
    let errorMessage =
      error?.response?.data?.message ?? ERROR_MESSAGES.NETWORK_ERROR;
    useSnackbarStore.getState().setSnackbar(errorMessage, 'error');
  }
};
