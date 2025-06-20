import React, { useState, useMemo, useEffect } from 'react';
import { Col } from 'antd';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const sourceOptions = [
  { value: 'Word Of Mouth', label: 'Word Of Mouth' },
  { value: 'Walk In', label: 'Walk In' },
  { value: 'Signage', label: 'Signage' },
  { value: 'Flyers', label: 'Flyers' },
  { value: 'Events', label: 'Events' },
  { value: 'Online Google Ads', label: 'Online Google Ads' },
  { value: 'Online Meta Ads', label: 'Online Meta Ads' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Radio', label: 'Radio' },
  { value: 'Others', label: 'Others' }
];

const defaultRow = {
  key: 1,
  source: '',
  comments: '',
  patient_name: ''
};

export default function PatientTracking({ onNext }) {
  const [target, setTarget] = useState(3);
  const [actual, setActual] = useState(0);
  const [tableData, setTableData] = useState([defaultRow]);
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

  // Calculate summary data
  const summaryData = useMemo(() => {
    const difference = actual - target;
    return [
      {
        key: 'summary',
        actual: `${actual}`,
        target: `${target}`,
        '+/-': `${difference}`
      }
    ];
  }, [actual, target]);

  const newPatientColumns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => 'This Week'
    },
    {
      key: 'actual',
      title: 'Actual',
      dataIndex: 'actual'
    },
    {
      key: 'target',
      title: 'Target',
      dataIndex: 'target'
    },
    {
      key: '+/-',
      title: '+/-',
      dataIndex: '+/-'
    }
  ];

  const patientSourceColumns = [
    {
      width: 150,
      editable: true,
      inputType: 'text',
      key: 'patient_name',
      title: 'Patient Name',
      dataIndex: 'patient_name'
    },
    {
      width: 150,
      key: 'source',
      editable: true,
      title: 'Source',
      dataIndex: 'source',
      inputType: 'select',
      selectOptions: sourceOptions
    },
    {
      width: 250,
      editable: true,
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
        <Button
          size="icon"
          className="ml-3"
          variant="destructive"
          onClick={() => handleDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleAddNew = () => {
    const newKey =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.key)) + 1
        : 1;
    setTableData([
      ...tableData,
      {
        key: newKey,
        source: '',
        comments: '',
        patient_name: ''
      }
    ]);
    setActual((prev) => prev + 1);
  };

  const handleDelete = (key) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((item) => item.key !== key));
      setActual((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = tableData
        .filter((item) => item.patient_name && item.source)
        .map((item) => ({
          ...item,
          eodsubmission: submissionId
        }));

      if (payload.length > 0) {
        setLoading(true);
        const response = await EODReportService.addPatientTracking(payload);
        if (response.status === 201) {
          updateStepData(currentStepId, tableData);
          toast.success('Record is successfully saved');
          onNext();
        }
        return;
      }
      updateStepData(currentStepId, tableData);
      onNext();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStepData.length > 0) {
      setTableData(currentStepData);
      setActual(currentStepData.length);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 px-6">
        <Col span={10}>
          <h2 className="text-base font-medium text-black mb-4">
            New Patients
          </h2>
          <GenericTable dataSource={summaryData} columns={newPatientColumns} />
        </Col>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-medium text-black">Patient Source</h1>
            <Button
              size="lg"
              onClick={handleAddNew}
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Add New Patient
            </Button>
          </div>
          <GenericTable
            dataSource={tableData}
            columns={patientSourceColumns}
            onCellChange={handleCellChange}
          />
        </div>
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
