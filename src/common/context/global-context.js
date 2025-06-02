'use client';

import { createContext, useContext, useState } from 'react';
// import makeRequest from '../api/axios.config';
// import { API_ENDPOINTS } from '../api/endpoints';
// import { HTTP } from '../constants/http-methods.constant';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        loading,
        setLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
