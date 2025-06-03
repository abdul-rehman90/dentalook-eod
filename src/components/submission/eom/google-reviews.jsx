import React, { useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function GoogleReviews({ onNext }) {
  const [tableData, setTableData] = useState([
    {
      key: '1',
      current: '',
      reviews: ''
    }
  ]);

  const columns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="px-2 text-[15px] text-gray-900 font-bold">
          This Month
        </div>
      )
    },
    {
      key: 'current',
      editable: true,
      inputType: 'number',
      dataIndex: 'current',
      title: 'Current Google Score (Out of 5)'
    },
    {
      key: 'reviews',
      editable: true,
      inputType: 'number',
      dataIndex: 'reviews',
      title: 'Google Reviews (#)'
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
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
