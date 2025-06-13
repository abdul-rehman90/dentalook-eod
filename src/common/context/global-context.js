'use client';

import { useParams } from 'next/navigation';
import { EODReportService } from '../services/eod-report';
import { createContext, useContext, useEffect, useState } from 'react';

const stepConfig = {
  eod: [
    { id: 'basic', name: 'Basic Details' },
    { id: 'daily', name: 'Daily Production' },
    { id: 'payment', name: 'Payment' },
    { id: 'team', name: 'Team Absences' },
    { id: 'schedule', name: 'Schedule Openings' },
    { id: 'patient', name: 'Patient Tracking' },
    { id: 'auto', name: 'Attrition Tracking' },
    { id: 'referrals', name: 'Referrals' }
  ],
  eom: [
    { id: 'basic', name: 'Basic Details' },
    { id: 'account', name: 'Account Receivable' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'clinical', name: 'Clinic Upgrades' },
    { id: 'hiring', name: 'Hiring and Training' },
    { id: 'supplies', name: 'Supplies' },
    { id: 'google', name: 'Google Reviews' },
    { id: 'issue', name: 'Issues/Ideas' }
  ]
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { type, step } = useParams();
  const currentStep = parseInt(step);
  const steps = stepConfig[type] || [];
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [reportData, setReportData] = useState({
    eod: {},
    eom: {}
  });
  const totalSteps = steps.length;

  const updateStepData = (stepId, data) => {
    setReportData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [stepId]: data
      }
    }));
  };

  const getCurrentStepData = () => {
    if (!type) return null;
    const currentStepId = steps[currentStep - 1]?.id;
    return reportData[type]?.[currentStepId] || {};
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await EODReportService.getAllProvince();
        const provinceOptions = data.map((province) => ({
          value: province.id,
          label: province.name
        }));
        setProvinces(provinceOptions);
      } catch (error) {}
    };

    if (type === 'eod' && currentStep === 1 && !provinces.length)
      fetchProvinces();
  }, [type, currentStep]);

  useEffect(() => {
    // setData(null);
  }, [type]);

  return (
    <AppContext.Provider
      value={{
        type,
        steps,
        loading,
        provinces,
        totalSteps,
        reportData,
        setLoading,
        currentStep,
        updateStepData,
        getCurrentStepData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
