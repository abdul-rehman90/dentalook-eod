import React, { useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function AccountReceivable({ onNext }) {
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const [tableData, setTableData] = useState([
    {
      key: '1',
      age_0_30: '',
      age_30_60: '',
      age_60_90: '',
      age_90_plus: '',
      patient_type: 'Patient'
    },
    {
      key: '2',
      age_0_30: '',
      age_30_60: '',
      age_60_90: '',
      age_90_plus: '',
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
      disabled: true,
      key: 'age_0_30',
      inputType: 'number',
      dataIndex: 'age_0_30'
    },
    {
      width: 100,
      disabled: true,
      editable: true,
      title: '30-60',
      key: 'age_30_60',
      inputType: 'number',
      dataIndex: 'age_30_60'
    },
    {
      width: 100,
      disabled: true,
      editable: true,
      title: '60-90',
      key: 'age_60_90',
      inputType: 'number',
      dataIndex: 'age_60_90'
    },
    {
      width: 100,
      title: '90+',
      disabled: true,
      editable: true,
      key: 'age_90_plus',
      inputType: 'number',
      dataIndex: 'age_90_plus'
    },
    {
      width: 150,
      disabled: true,
      editable: true,
      inputType: 'number',
      key: 'payment_plans',
      title: 'Payment Plans',
      dataIndex: 'payment_plans'
    }
  ];

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
