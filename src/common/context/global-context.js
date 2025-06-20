'use client';

import { useParams, usePathname } from 'next/navigation';
import { EODReportService } from '../services/eod-report';
import { EOMReportService } from '../services/eom-report';
import {
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext
} from 'react';

const stepConfig = {
  eod: [
    { id: 'basic', name: 'Basic Details' },
    { id: 'active', name: 'Active Providers' },
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
  const pathname = usePathname();
  const { type, step, id } = useParams();
  const currentStep = parseInt(step);
  const steps = stepConfig[type] || [];
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [reportData, setReportData] = useState({
    eod: {},
    eom: {}
  });
  const totalSteps = steps.length;
  const isSubmissionRoute = pathname.includes('/submission/');

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

  const fetchAllReportData = useCallback(async () => {
    if (!id) return;
    try {
      const service = type === 'eod' ? EODReportService : EOMReportService;
      const response =
        type === 'eod'
          ? await service.getAllEODData(id)
          : await service.getAllEOMData(id);

      if (response.status === 200) {
        if (type === 'eod') {
          const stepDataMapping = {
            payment: response.data.payments || [],
            basic: response.data.basic_detail || {},
            team: response.data.team_absences || [],
            referrals: response.data.referrals || [],
            daily: response.data.daily_production || [],
            active: response.data.active_providers || [],
            auto: response.data.attrition_tracking || [],
            patient: response.data.patient_tracking || [],
            schedule: response.data.schedule_openings || []
          };
          setReportData((prev) => ({
            ...prev,
            eod: {
              ...prev.eod,
              ...stepDataMapping
            }
          }));
        } else if (type === 'eom') {
          const stepDataMapping = {
            supplies: response.data.supplies || {},
            basic: response.data.basic_detail || {},
            issue: response.data.issues_ideas || [],
            equipment: response.data.equipment || [],
            google: response.data.google_review || {},
            clinical: response.data.clinic_upgrade || [],
            account: response.data.account_receivable || [],
            hiring: {
              hiring: response.data.hiring_need || null,
              training: response.data.training_need || null
            }
          };
          setReportData((prev) => ({
            ...prev,
            eom: {
              ...prev.eom,
              ...stepDataMapping
            }
          }));
        }
      }
    } catch (error) {}
  }, [id, type]);

  useEffect(() => {
    fetchAllReportData();
  }, [fetchAllReportData]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await EODReportService.getAllProvinces();
        const provinceOptions = data.map((province) => ({
          value: province.id,
          label: province.name
        }));
        setProvinces(provinceOptions);
      } catch (error) {}
    };

    if (
      (type === 'eod' || type === 'eom') &&
      isSubmissionRoute &&
      currentStep === 1 &&
      !provinces.length
    ) {
      fetchProvinces();
    }
  }, [type, currentStep]);

  useEffect(() => {
    setProvinces([]);
    setReportData({ eod: {}, eom: {} });
  }, [isSubmissionRoute, type]);

  return (
    <AppContext.Provider
      value={{
        id,
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
