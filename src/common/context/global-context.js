'use client';

import { useParams } from 'next/navigation';
import { EODReportService } from '../services/eod-report';
import { EOMReportService } from '../services/eom-report';
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext
} from 'react';

const stepConfig = {
  eod: [
    { id: 'basic', name: 'Clinic Details' },
    { id: 'daily', name: 'Daily Production' },
    { id: 'payment', name: 'Payments' },
    { id: 'supplies', name: 'Supplies' },
    { id: 'team', name: 'Team Absences' },
    { id: 'patient', name: 'New Patients' },
    { id: 'auto', name: 'Attrition Tracking' },
    { id: 'referrals', name: 'Outgoing Referrals' }
  ],
  eom: [
    { id: 'basic', name: 'Clinic Details' },
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
  const { type, step, id } = useParams();
  const currentStep = parseInt(step);
  const saveHandlersRef = useRef({});
  const [isDirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    eod: {},
    eom: {}
  });
  const steps = useMemo(() => stepConfig[type] || [], [type]);
  const totalSteps = steps.length;

  const registerStepSaveHandler = useCallback((stepNumber, handler) => {
    if (!stepNumber) return;
    saveHandlersRef.current[stepNumber] = handler;
  }, []);

  const unregisterStepSaveHandler = useCallback((stepNumber) => {
    if (saveHandlersRef.current[stepNumber]) {
      delete saveHandlersRef.current[stepNumber];
    }
  }, []);

  const callSaveHandlerForStep = useCallback(
    async (stepNumber, navigate = false) => {
      const handler = saveHandlersRef.current[stepNumber];
      if (!handler) return null;
      return handler(navigate);
    },
    []
  );

  const updateStepData = useCallback(
    (stepId, data) => {
      setReportData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [stepId]: data
        }
      }));
    },
    [type]
  );

  const getCurrentStepData = useCallback(() => {
    if (!type) return null;
    const currentStepId = steps[currentStep - 1]?.id;
    return reportData[type]?.[currentStepId] || {};
  }, [type, steps, currentStep, reportData]);

  const fetchAllReportData = useCallback(async () => {
    const shouldFetch =
      id &&
      Object.keys(reportData.eod).length === 0 &&
      Object.keys(reportData.eom).length === 0;

    if (!shouldFetch) return;
    try {
      setLoading(true);
      const service = type === 'eod' ? EODReportService : EOMReportService;
      const response =
        type === 'eod'
          ? await service.getAllEODData(id)
          : await service.getAllEOMData(id);

      if (response.status === 200) {
        if (type === 'eod') {
          const stepDataMapping = {
            payment: response.data.payments || [],
            supplies: response.data.supplies || {},
            team: response.data.team_absences || [],
            referrals: response.data.referrals || [],
            daily: response.data.daily_production || [],
            auto: response.data.attrition_tracking || [],
            patient: response.data.patient_tracking || [],
            basic:
              {
                clinicDetails: response.data.basic_detail,
                activeProviders: response.data.active_providers
              } || {}
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
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    fetchAllReportData();
  }, [fetchAllReportData]);

  useEffect(() => {
    if (
      Object.keys(reportData.eod).length > 1 ||
      Object.keys(reportData.eom).length > 1
    ) {
      setReportData({ eod: {}, eom: {} });
    }
  }, [type, id]);

  const contextValue = useMemo(
    () => ({
      id,
      type,
      steps,
      loading,
      isDirty,
      setDirty,
      totalSteps,
      reportData,
      setLoading,
      currentStep,
      updateStepData,
      getCurrentStepData,
      callSaveHandlerForStep,
      registerStepSaveHandler,
      unregisterStepSaveHandler
    }),
    [
      id,
      type,
      steps,
      loading,
      isDirty,
      setDirty,
      totalSteps,
      reportData,
      setLoading,
      currentStep,
      updateStepData,
      getCurrentStepData,
      callSaveHandlerForStep,
      registerStepSaveHandler,
      unregisterStepSaveHandler
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
