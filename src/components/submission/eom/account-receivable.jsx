import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function AccountReceivable({ onNext }) {
  const {
    steps,
    currentStep,
    submissionId,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
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
      inputType: 'number',
      dataIndex: 'age_0_30'
    },
    {
      width: 100,
      editable: true,
      title: '30-60',
      key: 'age_30_60',
      inputType: 'number',
      dataIndex: 'age_30_60'
    },
    {
      width: 100,
      editable: true,
      title: '60-90',
      key: 'age_60_90',
      inputType: 'number',
      dataIndex: 'age_60_90'
    },
    {
      width: 100,
      title: '90+',
      editable: true,
      inputType: 'number',
      key: 'age_90_plus',
      dataIndex: 'age_90_plus'
    },
    {
      width: 150,
      editable: true,
      inputType: 'number',
      title: 'Payment Plans',
      key: 'payment_plan',
      dataIndex: 'payment_plan'
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleSubmit = async () => {
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
      onNext();
      return;
    }

    try {
      const patientData = tableData.find(
        (item) => item.patient_type === 'Patient'
      );
      const insuranceData = tableData.find(
        (item) => item.patient_type === 'Insurance'
      );

      const payload = {
        submission: submissionId,
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
        updateStepData(currentStepId, tableData);
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (currentStepData.length > 0) {
      return setTableData(currentStepData);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
