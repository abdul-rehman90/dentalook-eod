'use client';

import { useParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

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
  const { type } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(null);
  }, [type]);

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        setData,
        stepConfig,
        setLoading
        // handleClick
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
