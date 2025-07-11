import React, { useState, useMemo, useEffect } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function DailyProduction({ onNext }) {
  const [goal, setGoal] = useState(6367);
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalDDS = tableData
      .filter((item) => item.type === 'DDS')
      .reduce((sum, item) => sum + (Number(item.production_amount) || 0), 0);

    const totalRDH = tableData
      .filter((item) => item.type === 'RDH')
      .reduce((sum, item) => sum + (Number(item.production_amount) || 0), 0);

    const totalProduction = totalDDS + totalRDH;
    const difference = totalProduction - goal;

    return [
      {
        key: 'summary',
        goal: `${goal.toLocaleString()}`,
        DDS: `${totalDDS.toLocaleString()}`,
        RDH: `${totalRDH.toLocaleString()}`,
        totalProduction: `${totalProduction.toLocaleString()}`
      }
    ];
  }, [tableData, goal]);

  const totalProductionColumns = [
    {
      title: '',
      width: 150,
      key: 'summary',
      dataIndex: 'summary',
      render: () => 'Production ($):'
    },
    {
      width: 150,
      key: 'DDS',
      dataIndex: 'DDS',
      title: 'Total (DDS)'
    },
    {
      width: 150,
      key: 'RDH',
      dataIndex: 'RDH',
      title: 'Total (RDH)'
    },
    {
      width: 150,
      key: 'totalProduction',
      title: 'Total Production',
      dataIndex: 'totalProduction'
    },
    {
      width: 50,
      title: '',
      key: 'target',
      dataIndex: 'target',
      render: (_, record) => (
        <div className="text-xs text-[#333333] flex justify-end">
          Target{' '}
          <span className="ml-1 text-primary-400">
            {record.totalProduction}
          </span>
          <span>/{record.goal}</span>
        </div>
      )
    }
  ];

  const dailyProductionColumns = [
    {
      // width: 300,
      key: 'type',
      title: 'Title',
      dataIndex: 'type'
    },
    {
      // width: 300,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name'
    },
    {
      width: 150,
      editable: true,
      disabled: true,
      inputType: 'number',
      title: 'Production',
      key: 'production_amount',
      dataIndex: 'production_amount'
    },
    {
      key: '',
      title: '',
      width: 200,
      dataIndex: ''
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        name: item.user?.name,
        key: item.id.toString(),
        type: item.user?.user_type,
        production_amount: item.production_amount
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="flex flex-col gap-6 px-6">
        <GenericTable dataSource={tableData} columns={dailyProductionColumns} />
        <GenericTable
          dataSource={summaryData}
          columns={totalProductionColumns}
        />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
