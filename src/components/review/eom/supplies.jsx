import React, { useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function Supplies({ onNext }) {
  const [tableData, setTableData] = useState([
    {
      key: '1',
      actual: '',
      budget: 1435,
      difference: '-',
      reason: ''
    }
  ]);

  const columns = [
    {
      title: '',
      width: 80,
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="px-2 text-[15px] text-gray-900 font-bold">Total</div>
      )
    },
    {
      width: 100,
      key: 'actual',
      editable: true,
      title: 'Actual',
      inputType: 'number',
      dataIndex: 'actual'
    },
    {
      width: 100,
      key: 'budget',
      dataIndex: 'budget',
      title: 'Budget (Goal)',
      render: (_, record) => record.budget
    },
    {
      width: 100,
      title: '+/-',
      key: 'difference',
      render: (_, record) => record.difference
    },
    {
      width: 100,
      key: 'reason',
      editable: true,
      inputType: 'text',
      dataIndex: 'reason',
      title: 'Reason for Overage:'
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    const updatedData = tableData.map((item) => {
      if (item.key === record.key) {
        if (dataIndex === 'actual') {
          const actualValue = value === '' ? null : Number(value);
          const budgetValue = record.budget;
          const difference =
            actualValue !== null ? actualValue - budgetValue : '-';

          return {
            ...item,
            [dataIndex]: value,
            difference: difference
          };
        }
        return { ...item, [dataIndex]: value };
      }
      return item;
    });

    setTableData(updatedData);
  };

  return (
    <React.Fragment>
      <div className="px-6">
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
