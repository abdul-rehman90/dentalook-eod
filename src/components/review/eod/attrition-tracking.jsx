import React, { useState, useEffect } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';

const reasonOptions = [
  { value: 'Another Dentist', label: 'Another Dentist' },
  { value: 'Another City', label: 'Another City' },
  { value: 'Quality Of Care', label: 'Quality Of Care' },
  { value: 'Negative Experience', label: 'Negative Experience' },
  { value: 'Deceased', label: 'Deceased' },
  { value: 'Other', label: 'Other' }
];

export default function AttritionTracking({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 150,
      editable: true,
      disabled: true,
      inputType: 'text',
      key: 'patient_name',
      title: 'Patient Name',
      dataIndex: 'patient_name'
    },
    {
      width: 150,
      key: 'reason',
      editable: true,
      disabled: true,
      title: 'Reason',
      dataIndex: 'reason',
      inputType: 'select',
      selectOptions: reasonOptions
    },
    {
      width: 250,
      disabled: true,
      editable: true,
      inputType: 'text',
      key: 'other_reason',
      title: 'Other Reason',
      dataIndex: 'other_reason'
    },
    {
      width: 250,
      editable: true,
      disabled: true,
      key: 'comments',
      title: 'Comments',
      inputType: 'text',
      dataIndex: 'comments'
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        reason: item.reason,
        key: item.id.toString(),
        comments: item.comments,
        patient_name: item.patient_name,
        other_reason: item.other_reason
      }));
      setTableData(transformedData);
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
