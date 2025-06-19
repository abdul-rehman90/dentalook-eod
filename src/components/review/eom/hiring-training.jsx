import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const categoryOptions = [
  { value: 'Growth', label: 'Growth' },
  { value: 'Replacement', label: 'Replacement' }
];

const positionOptions = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' },
  { value: 'PCC', label: 'PCC' },
  { value: 'CDA', label: 'CDA' },
  { value: 'PM', label: 'PM' },
  { value: 'Dental Aide', label: 'Dental Aide' }
];

export default function HiringTraining({ onNext }) {
  const [hiringData, setHiringData] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const hiringColumns = [
    {
      width: 100,
      editable: true,
      disabled: true,
      key: 'position',
      title: 'Position',
      inputType: 'select',
      dataIndex: 'position',
      selectOptions: positionOptions
    },
    {
      width: 100,
      editable: true,
      disabled: true,
      key: 'category',
      title: 'Category',
      inputType: 'select',
      dataIndex: 'category',
      selectOptions: categoryOptions
    },
    {
      width: 300,
      key: 'reason',
      disabled: true,
      editable: true,
      title: 'Reason?',
      inputType: 'text',
      dataIndex: 'reason'
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

  const trainingColumns = [
    {
      width: 100,
      disabled: true,
      editable: true,
      key: 'position',
      title: 'Position',
      inputType: 'select',
      dataIndex: 'position',
      selectOptions: positionOptions
    },
    {
      width: 100,
      key: 'name',
      title: 'Name',
      disabled: true,
      editable: true,
      inputType: 'text',
      dataIndex: 'name'
    },
    {
      width: 300,
      key: 'reason',
      disabled: true,
      editable: true,
      title: 'Reason?',
      inputType: 'text',
      dataIndex: 'reason'
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

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 px-6">
        <div>
          <h1 className="text-base font-medium text-black mb-4">Hiring</h1>
          <GenericTable columns={hiringColumns} dataSource={hiringData} />
        </div>
        <div>
          <h1 className="text-base font-medium text-black mb-4">Training</h1>
          <GenericTable columns={trainingColumns} dataSource={trainingData} />
        </div>
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
