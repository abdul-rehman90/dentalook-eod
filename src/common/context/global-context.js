'use client';

import { createContext, useContext, useState } from 'react';
// import makeRequest from '../api/axios.config';
// import { API_ENDPOINTS } from '../api/endpoints';
// import { HTTP } from '../constants/http-methods.constant';

const stepConfig = {
  eod: [
    'Basic Details',
    'Daily Production',
    'Payment',
    'Team Absences',
    'Schedule Openings',
    'Patient Tracking',
    'Attrition Tracking',
    'Referrals'
  ],
  eom: [
    'Basic Details',
    'Account Receivable',
    'Equipment',
    'Clinic Upgrades',
    'Hiring and Training',
    'Supplies',
    'Google Reviews',
    'Issues/Ideas'
  ]
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        loading,
        setLoading,
        stepConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
