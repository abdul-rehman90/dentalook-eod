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

  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  return (
    <React.Fragment>
      <div className="px-6">
        <h1 className="text-base font-medium text-black mb-4">
          Outgoing Patient Referral
        </h1>
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
