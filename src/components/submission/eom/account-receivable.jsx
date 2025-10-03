import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function AccountReceivable({ onNext }) {
  const {
    id,
    steps,
    setDirty,
    setLoading,
    reportData,
    currentStep,
    updateStepData,
    getCurrentStepData,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eom?.basic?.clinic;
  const [tableData, setTableData] = useState([
    {
      key: '1',
      age_0_30: '',
      age_30_60: '',
      age_60_90: '',
      age_90_plus: '',
      payment_plan: '',
      patient_type: 'Patient'
    },
    {
      key: '2',
      age_0_30: '',
      age_30_60: '',
      age_60_90: '',
      age_90_plus: '',
      payment_plan: '',
      patient_type: 'Insurance'
    }
  ]);

  const columns = [
    {
      title: '',
      width: 150,
      key: 'patient_type',
      dataIndex: 'patient_type'
    },
    {
      width: 100,
      title: '0-30',
      editable: true,
      key: 'age_0_30',
      inputType: 'text',
      dataIndex: 'age_0_30'
    },
    {
      width: 100,
      editable: true,
      title: '30-60',
      key: 'age_30_60',
      inputType: 'text',
      dataIndex: 'age_30_60'
    },
    {
      width: 100,
      editable: true,
      title: '60-90',
      key: 'age_60_90',
      inputType: 'text',
      dataIndex: 'age_60_90'
    },
    {
      width: 100,
      title: '90+',
      editable: true,
      inputType: 'text',
      key: 'age_90_plus',
      dataIndex: 'age_90_plus'
    },
    {
      width: 150,
      editable: true,
      inputType: 'text',
      key: 'payment_plan',
      title: 'Payment Plans',
      dataIndex: 'payment_plan'
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setDirty(true);
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const saveData = useCallback(
    async (navigate = false) => {
      const hasData = tableData.some(
        (item) =>
          item.age_0_30 > 0 ||
          item.age_30_60 > 0 ||
          item.age_60_90 > 0 ||
          item.age_90_plus > 0 ||
          item.payment_plan > 0
      );

      if (!hasData) {
        updateStepData(currentStepId, tableData);
        return;
      }

      try {
        setLoading(true);
        const patientData = tableData.find(
          (item) => item.patient_type === 'Patient'
        );
        const insuranceData = tableData.find(
          (item) => item.patient_type === 'Insurance'
        );

        const payload = {
          submission: Number(id),
          patient0_30: parseFloat(patientData?.age_0_30) || 0,
          patient30_60: parseFloat(patientData?.age_30_60) || 0,
          patient60_90: parseFloat(patientData?.age_60_90) || 0,
          patient90_plus: parseFloat(patientData?.age_90_plus) || 0,
          patient_payment_plan: parseFloat(patientData?.payment_plan) || 0,
          insurance0_30: parseFloat(insuranceData?.age_0_30) || 0,
          insurance30_60: parseFloat(insuranceData?.age_30_60) || 0,
          insurance60_90: parseFloat(insuranceData?.age_60_90) || 0,
          insurance90_plus: parseFloat(insuranceData?.age_90_plus) || 0,
          insurance_payment_plan: parseFloat(insuranceData?.payment_plan) || 0
        };

        const response = await EOMReportService.addAccountReceivable([payload]);
        if (response.status === 201) {
          setDirty(false);
          updateStepData(currentStepId, [payload]);
          toast.success('Record is successfully saved');
          if (navigate) onNext();
          return true;
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, id, currentStepId, setLoading, updateStepData, onNext, setDirty]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  useEffect(() => {
    if (clinicId && currentStepData.length > 0) {
      const data = currentStepData[0];
      setTableData([
        {
          key: '1',
          patient_type: 'Patient',
          age_0_30: data.patient0_30,
          age_30_60: data.patient30_60,
          age_60_90: data.patient60_90,
          age_90_plus: data.patient90_plus,
          payment_plan: data.patient_payment_plan
        },
        {
          key: '2',
          patient_type: 'Insurance',
          age_0_30: data.insurance0_30,
          age_30_60: data.insurance30_60,
          age_60_90: data.insurance60_90,
          age_90_plus: data.insurance90_plus,
          payment_plan: data.insurance_payment_plan
        }
      ]);
    }
  }, [clinicId]);

  useEffect(() => {
    window.addEventListener('stepNavigationSave', handleSave);
    window.addEventListener('stepNavigationNext', handleSubmit);

    return () => {
      window.removeEventListener('stepNavigationSave', handleSave);
      window.removeEventListener('stepNavigationNext', handleSubmit);
    };
  }, [handleSubmit, handleSave]);

  useEffect(() => {
    registerStepSaveHandler(currentStep, async (navigate = false) => {
      return saveData(navigate);
    });
    return () => {
      unregisterStepSaveHandler(currentStep);
    };
  }, [
    saveData,
    currentStep,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  ]);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
