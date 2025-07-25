import React, { useEffect, useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function Supplies({ onNext }) {
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const [tableData, setTableData] = useState([
    {
      key: '1',
      budget: 0,
      actual: '',
      reason: '',
      difference: '-'
    }
  ]);

  const columns = [
    {
      title: '',
      width: 80,
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="text-[15px] text-gray-900 font-bold">Total</div>
      )
    },
    {
      width: 100,
      key: 'actual',
      disabled: true,
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
      disabled: true,
      editable: true,
      inputType: 'text',
      dataIndex: 'reason',
      title: 'Reason for Overage'
    }
  ];

  useEffect(() => {
    if (Object.entries(currentStepData).length > 0) {
      const transformedData = [
        {
          key: '1',
          reason: currentStepData.overage_reason || '',
          actual: currentStepData.supplies_actual || '',
          budget: currentStepData.budget_daily_supplies || 0,
          difference:
            currentStepData.supplies_actual -
              currentStepData.budget_daily_supplies || '-'
        }
      ];
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
