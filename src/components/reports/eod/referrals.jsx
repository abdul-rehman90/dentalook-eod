import React, { useState } from 'react';
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

export default function Referrals({ onNext }) {
  const [tableData, setTableData] = useState([]);

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
      editable: true,
      inputType: 'select',
      key: 'provider_name',
      title: 'Provider Name',
      dataIndex: 'provider_name',
      selectOptions: sourceOptions
    },
    {
      width: 150,
      editable: true,
      key: 'speciality',
      title: 'Speciality',
      inputType: 'select',
      dataIndex: 'speciality',
      selectOptions: sourceOptions
    },
    {
      width: 250,
      key: 'reason',
      editable: true,
      inputType: 'text',
      dataIndex: 'Reason',
      title: 'Reason (Clinic/Provider referred to)'
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

  const handleAddRefferals = () => {
    const newKey =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.key)) + 1
        : 1;
    setTableData([
      ...tableData,
      {
        key: newKey,
        reason: '',
        speciality: '',
        patient_name: '',
        provider_name: ''
      }
    ]);
  };

  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-medium text-black">
            Outgoing Patient Referral
          </h1>
          <Button
            size="lg"
            onClick={handleAddRefferals}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Refferals
          </Button>
        </div>
        <GenericTable
          dataSource={tableData}
          columns={patientReasonColumns}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
