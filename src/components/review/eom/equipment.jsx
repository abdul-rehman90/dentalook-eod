import React, { useState } from 'react';
import Image from 'next/image';
import { DatePicker } from 'antd';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const typeOptions = [
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Repair', label: 'Repair' }
];

export default function EquipmentRepairs({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 100,
      key: 'item',
      title: 'Item',
      editable: true,
      disabled: true,
      dataIndex: 'item',
      inputType: 'text'
    },
    {
      width: 150,
      key: 'type',
      disabled: true,
      editable: true,
      dataIndex: 'type',
      inputType: 'select',
      selectOptions: typeOptions,
      title: 'Purchase or Repair?'
    },
    {
      width: 150,
      key: 'maintenance',
      dataIndex: 'maintenance',
      title: 'Last Maintenance Date?',
      render: (_, record) => (
        <div className="h-full">
          <DatePicker
            disabled
            format="ddd, MMM D, YYYY"
            placeholder="Select Date"
            value={record.maintenance}
          />
        </div>
      )
    },
    {
      width: 50,
      key: 'cost',
      title: 'Cost',
      disabled: true,
      editable: true,
      dataIndex: 'cost',
      inputType: 'number'
    },
    {
      width: 150,
      disabled: true,
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
        <Button disabled size="icon" className="ml-3" variant="destructive">
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  return (
    <React.Fragment>
      <div className="px-6">
        <h1 className="text-base font-medium text-black mb-4">
          Equipment/Repairs
        </h1>
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
