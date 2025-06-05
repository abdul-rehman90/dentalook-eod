import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ClinicalUpgrade({ onNext }) {
  const [tableData, setTableData] = useState([]);

  const columns = [
    {
      width: 150,
      key: 'item',
      title: 'Item',
      editable: true,
      dataIndex: 'item',
      inputType: 'text'
    },
    {
      width: 150,
      key: 'cost',
      title: 'Cost',
      editable: true,
      dataIndex: 'cost',
      inputType: 'number'
    },
    {
      width: 150,
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

  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  const handleAddNew = () => {
    const newKey =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.key)) + 1
        : 1;
    const newItem = {
      key: newKey,
      item: '',
      cost: '',
      comments: ''
    };
    setTableData([...tableData, newItem]);
  };

  return (
    <React.Fragment>
      <div className="px-6">
        <h1 className="text-base font-medium text-black mb-4">
          Clinic Upgrades
        </h1>
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
