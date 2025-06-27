import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { PlusOutlined } from '@ant-design/icons';
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
    id,
    steps,
    reportData,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const clinicId = reportData?.eom?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;

  const hiringColumns = [
    {
      width: 100,
      title: 'Title',
      editable: true,
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
      title: 'Reason',
      inputType: 'text',
      key: 'hiring_reason',
      dataIndex: 'hiring_reason'
    },
    ...(hiringData.length > 1
      ? [
          {
            width: 50,
            key: 'action',
            title: 'Action',
            render: (_, record) => (
              <Button
                size="icon"
                className="ml-3"
                variant="destructive"
                onClick={() =>
                  setHiringData(
                    hiringData.filter((item) => item.key !== record.key)
                  )
                }
              >
                <Image src={Icons.cross} alt="cross" />
              </Button>
            )
          }
        ]
      : [])
  ];

  const trainingColumns = [
    {
      width: 100,
      title: 'Title',
      editable: true,
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
      title: 'Reason',
      inputType: 'text',
      key: 'training_reason',
      dataIndex: 'training_reason'
    },
    ...(trainingData.length > 1
      ? [
          {
            width: 50,
            key: 'action',
            title: 'Action',
            render: (_, record) => (
              <Button
                size="icon"
                className="ml-3"
                variant="destructive"
                onClick={() =>
                  setTrainingData(
                    trainingData.filter((item) => item.key !== record.key)
                  )
                }
              >
                <Image src={Icons.cross} alt="cross" />
              </Button>
            )
          }
        ]
      : [])
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
          submission: id
        }));

      const trainingPayload = trainingData
        .filter((item) => item.training_name && item.training_position)
        .map((item) => ({
          ...item,
          submission: id
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
    if (clinicId && currentStepData?.hiring?.length > 0) {
      const transformedData = currentStepData.hiring.map((item) => ({
        category: item.category,
        hiring_reason: item.hiring_reason,
        hiring_position: item.hiring_position,
        key: item.id?.toString() || item.key?.toString()
      }));
      setHiringData(transformedData);
    }
    if (clinicId && currentStepData?.training?.length > 0) {
      const transformedData = currentStepData.training.map((item) => ({
        training_name: item.training_name,
        training_reason: item.training_reason,
        training_position: item.training_position,
        key: item.id?.toString() || item.key?.toString()
      }));
      setTrainingData(transformedData);
    }
  }, [clinicId]);

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 px-6">
        <div>
          <div className="flex items-center justify-end mb-4">
            <Button
              size="lg"
              variant="destructive"
              onClick={handleAddNewHiring}
              className="!px-0 text-primary-300"
            >
              <PlusOutlined />
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
          <div className="flex items-center justify-end mb-4">
            <Button
              size="lg"
              variant="destructive"
              onClick={handleAddNewTraining}
              className="!px-0 text-primary-300"
            >
              <PlusOutlined />
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

//  <h1 className="text-base font-medium text-black">Hiring</h1>
