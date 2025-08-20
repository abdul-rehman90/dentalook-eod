import React, { useEffect, useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';

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
      inputType: 'text',
      dataIndex: 'age_0_30'
    },
    {
      width: 100,
      disabled: true,
      editable: true,
      title: '30-60',
      key: 'age_30_60',
      inputType: 'text',
      dataIndex: 'age_30_60'
    },
    {
      width: 100,
      disabled: true,
      editable: true,
      title: '60-90',
      key: 'age_60_90',
      inputType: 'text',
      dataIndex: 'age_60_90'
    },
    {
      width: 100,
      title: '90+',
      disabled: true,
      editable: true,
      inputType: 'text',
      key: 'age_90_plus',
      dataIndex: 'age_90_plus'
    },
    {
      width: 150,
      disabled: true,
      editable: true,
      inputType: 'text',
      key: 'payment_plan',
      title: 'Payment Plans',
      dataIndex: 'payment_plan'
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
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
  }, [currentStepData]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', onNext);
    return () => {
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [onNext]);

  return (
    <div className="px-6">
      <GenericTable columns={columns} dataSource={tableData} />
    </div>
  );
}
