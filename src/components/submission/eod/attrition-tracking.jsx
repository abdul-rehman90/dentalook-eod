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
  const [noOfPatients, setNoOfPatients] = useState(0);
  const {
    steps,
    currentStep,
    submissionId,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;

  // Calculate summary data
  const summaryData = useMemo(() => {
    return [
      {
        key: 'summary',
        noOfPatients: `${noOfPatients}`
      }
    ];
  }, [noOfPatients]);

  const newAttritionColumns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => 'This Day'
    },
    {
      key: 'noOfPatients',
      dataIndex: 'noOfPatients',
      title: 'Number of Patients'
    }
  ];

  const patientReasonColumns = [
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
      key: 'reason',
      editable: true,
      title: 'Reason',
      dataIndex: 'reason',
      inputType: 'select',
      selectOptions: reasonOptions
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
          variant="destructive"
          onClick={() => handleDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const createAttritionTracking = async () => {
    try {
      const payload = tableData.map((item) => ({
        ...item,
        eodsubmission: submissionId
      }));
      const response = await EODReportService.addAttritionTracking(payload);
      if (response.status === 201) {
        updateStepData(currentStepId, tableData);
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {}
  };

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleAddAttrition = () => {
    const newKey =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.key)) + 1
        : 1;
    setTableData([
      ...tableData,
      {
        key: newKey,
        reason: '',
        comments: '',
        patient_name: ''
      }
    ]);
    setNoOfPatients((prev) => prev + 1);
  };

  const handleDelete = (key) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((item) => item.key !== key));
      setNoOfPatients((prev) => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    if (currentStepData.length > 0) {
      setTableData(currentStepData);
      setNoOfPatients(currentStepData.length);
    } else {
      handleAddAttrition();
    }
  }, []);

  return (
    <React.Fragment>
      <div className="flex flex-col gap-6 px-6">
        <Col span={10}>
          <h2 className="text-base font-medium text-black mb-4">Attrition</h2>
          <GenericTable
            dataSource={summaryData}
            columns={newAttritionColumns}
          />
        </Col>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-medium text-black">
              Attrition Reason
            </h1>
            <Button
              size="lg"
              onClick={handleAddAttrition}
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Add New Attrition
            </Button>
          </div>
          <GenericTable
            dataSource={tableData}
            columns={patientReasonColumns}
            onCellChange={handleCellChange}
          />
        </div>
      </div>
      <StepNavigation onNext={createAttritionTracking} />
    </React.Fragment>
  );
}
