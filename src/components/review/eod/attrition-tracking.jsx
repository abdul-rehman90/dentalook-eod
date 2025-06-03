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

export default function AttritionTracking({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const [noOfPatients, setNoOfPatients] = useState(0);

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

  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
    setNoOfPatients((prev) => Math.max(0, prev - 1));
  };

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
          <h1 className="text-base font-medium text-black mb-4">
            Attrition Reason
          </h1>
          <GenericTable
            dataSource={tableData}
            columns={patientReasonColumns}
            onCellChange={handleCellChange}
          />
        </div>
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
