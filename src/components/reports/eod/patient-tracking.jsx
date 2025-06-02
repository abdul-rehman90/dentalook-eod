import React, { useState, useMemo } from 'react';
import { Col } from 'antd';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const sourceOptions = [
  { value: 'Referral', label: 'Referral' },
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Online', label: 'Online' },
  { value: 'Other', label: 'Other' }
];

export default function PatientTracking({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const [target, setTarget] = useState(3);
  const [actual, setActual] = useState(0);

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

  const handleAddPatient = () => {
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
    setTableData(tableData.filter((item) => item.key !== key));
    setActual((prev) => Math.max(0, prev - 1)); // Ensure actual doesn't go below 0
  };

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 px-6">
        <Col span={10}>
          <h2 className="text-base font-medium text-black mb-4">
            New Patients
          </h2>
          <GenericTable dataSource={summaryData} columns={newPatientColumns} />
        </Col>
        <div className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-medium text-black">Patient Source</h1>
            <Button
              size="lg"
              onClick={handleAddPatient}
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
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
