import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const categoryOptions = [
  { value: 'Growth', label: 'Growth' },
  { value: 'Replacement', label: 'Replacement' }
];

const positionOptions = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' }
];

export default function HiringTraining({ onNext }) {
  const [hiringData, setHiringData] = useState([]);
  const [trainingData, setTrainingData] = useState([]);

  const hiringColumns = [
    {
      width: 100,
      editable: true,
      key: 'position',
      title: 'Position',
      inputType: 'select',
      dataIndex: 'position',
      selectOptions: positionOptions
    },
    {
      width: 100,
      editable: true,
      key: 'category',
      title: 'Category',
      inputType: 'select',
      dataIndex: 'category',
      selectOptions: categoryOptions
    },
    {
      width: 150,
      key: 'reason',
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
        <Button
          size="icon"
          className="ml-3"
          variant="destructive"
          onClick={() => handleHiringDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const trainingColumns = [
    {
      width: 100,
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
      editable: true,
      inputType: 'text',
      dataIndex: 'name'
    },
    {
      width: 150,
      key: 'reason',
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
        <Button
          size="icon"
          className="ml-3"
          variant="destructive"
          onClick={() => handleTrainingDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const handleHiringCellChange = (record, dataIndex, value) => {
    setHiringData(
      hiringData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleTrainingCellChange = (record, dataIndex, value) => {
    setTrainingData(
      trainingData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleHiringDelete = (key) => {
    setHiringData(hiringData.filter((item) => item.key !== key));
  };

  const handleTrainingDelete = (key) => {
    setTrainingData(trainingData.filter((item) => item.key !== key));
  };

  const handleAddNewHiring = () => {
    const newKey =
      hiringData.length > 0
        ? Math.max(...hiringData.map((item) => item.key)) + 1
        : 1;
    const newItem = {
      key: newKey,
      reason: '',
      position: '',
      category: ''
    };
    setHiringData([...hiringData, newItem]);
  };

  const handleAddNewTraining = () => {
    const newKey =
      trainingData.length > 0
        ? Math.max(...trainingData.map((item) => item.key)) + 1
        : 1;
    const newItem = {
      key: newKey,
      name: '',
      reason: '',
      position: ''
    };
    setTrainingData([...trainingData, newItem]);
  };

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 px-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-medium text-black">Hiring</h1>
            <Button
              size="lg"
              onClick={handleAddNewHiring}
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Add New Hiring
            </Button>
          </div>
          <GenericTable
            columns={hiringColumns}
            dataSource={hiringData}
            onCellChange={handleHiringCellChange}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-medium text-black">Training</h1>
            <Button
              size="lg"
              onClick={handleAddNewTraining}
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Add New Training
            </Button>
          </div>
          <GenericTable
            columns={trainingColumns}
            dataSource={trainingData}
            onCellChange={handleTrainingCellChange}
          />
        </div>
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
