import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
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

const defaultRowOfHiring = {
  key: '1',
  category: '',
  hiring_reason: '',
  hiring_position: ''
};

const defaultRowOfTraning = {
  key: '1',
  training_name: '',
  training_reason: '',
  training_position: ''
};

export default function HiringTraining({ onNext }) {
  const [hiringData, setHiringData] = useState([defaultRowOfHiring]);
  const [trainingData, setTrainingData] = useState([defaultRowOfTraning]);
  const {
    steps,
    setLoading,
    currentStep,
    submissionId,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;

  const hiringColumns = [
    {
      width: 100,
      editable: true,
      title: 'Position',
      inputType: 'select',
      key: 'hiring_position',
      dataIndex: 'hiring_position',
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
      width: 300,
      editable: true,
      title: 'Reason?',
      inputType: 'text',
      key: 'hiring_reason',
      dataIndex: 'hiring_reason'
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
      title: 'Position',
      inputType: 'select',
      key: 'training_position',
      dataIndex: 'training_position',
      selectOptions: positionOptions
    },
    {
      width: 100,
      title: 'Name',
      editable: true,
      inputType: 'text',
      key: 'training_name',
      dataIndex: 'training_name'
    },
    {
      width: 300,
      editable: true,
      title: 'Reason?',
      inputType: 'text',
      key: 'training_reason',
      dataIndex: 'training_reason'
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
    if (hiringData.length > 1) {
      setHiringData(hiringData.filter((item) => item.key !== key));
    }
  };

  const handleTrainingDelete = (key) => {
    if (trainingData.length > 1) {
      setTrainingData(trainingData.filter((item) => item.key !== key));
    }
  };

  const handleAddNewHiring = () => {
    const newKey =
      hiringData.length > 0
        ? Math.max(...hiringData.map((item) => item.key)) + 1
        : 1;
    const newItem = {
      key: newKey,
      category: '',
      hiring_reason: '',
      hiring_position: ''
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
      training_name: '',
      training_reason: '',
      training_position: ''
    };
    setTrainingData([...trainingData, newItem]);
  };

  const handleSubmit = async () => {
    try {
      const apiCalls = [];
      const hiringPayload = hiringData
        .filter((item) => item.hiring_position && item.category)
        .map((item) => ({
          ...item,
          submission: submissionId
        }));

      const trainingPayload = trainingData
        .filter((item) => item.training_name && item.training_position)
        .map((item) => ({
          ...item,
          submission: submissionId
        }));

      if (hiringPayload.length > 0) {
        apiCalls.push(EOMReportService.addHiringNeed(hiringPayload));
      }

      if (trainingPayload.length > 0) {
        apiCalls.push(EOMReportService.addTrainingNeed(trainingPayload));
      }

      if (apiCalls.length > 0) {
        setLoading(true);
        const responses = await Promise.all(apiCalls);
        const allSuccess = responses.every(
          (response) => response.status === 201
        );
        if (allSuccess) {
          updateStepData(currentStepId, {
            hiring: hiringData,
            training: trainingData
          });
          toast.success('Records are successfully saved');
          onNext();
        }
        return;
      }

      updateStepData(currentStepId, {
        hiring: hiringData,
        training: trainingData
      });
      onNext();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStepData?.hiring?.length > 0) {
      setHiringData(currentStepData.hiring);
    }
    if (currentStepData?.training?.length > 0) {
      setTrainingData(currentStepData.training);
    }
  }, []);

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
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
