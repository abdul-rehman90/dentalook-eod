import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

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
      editable: true,
      disabled: true,
      key: 'comments',
      title: 'Comments',
      inputType: 'text',
      dataIndex: 'comments'
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
      render: (_, record) => (
        <Button disabled size="icon" className="ml-3" variant="destructive">
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        reason: item.reason,
        key: item.id.toString(),
        comments: item.comments,
        patient_name: item.patient_name
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="mb-4">
          <h1 className="text-base font-medium text-black">Attrition Reason</h1>
        </div>
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
