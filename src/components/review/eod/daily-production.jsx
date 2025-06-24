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
        totalProduction: `${totalProduction.toLocaleString()}`,
        DDS: `${totalDDS.toLocaleString()}`,
        RDH: `${totalRDH.toLocaleString()}`,
        RDT: `---`,
        goal: `${goal.toLocaleString()}`,
        '+/-': `${difference.toLocaleString()}`
      }
    ];
  }, [tableData, goal]);

  const totalProductionColumns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => 'Production ($):'
    },
    {
      key: 'totalProduction',
      title: 'Total Production',
      dataIndex: 'totalProduction'
    },
    {
      key: 'DDS',
      dataIndex: 'DDS',
      title: 'Total (DDS)'
    },
    {
      key: 'RDH',
      dataIndex: 'RDH',
      title: 'Total (RDH)'
    },
    {
      key: 'RDT',
      dataIndex: 'RDT',
      title: 'Total (RDT)'
    },
    {
      key: 'goal',
      dataIndex: 'goal',
      title: 'Target (Goal)'
    },
    {
      key: '+/-',
      title: '+/-',
      dataIndex: '+/-'
    }
  ];

  const dailyProductionColumns = [
    {
      width: 150,
      key: 'type',
      title: 'Type',
      dataIndex: 'type'
    },
    {
      width: 150,
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
        <GenericTable
          dataSource={summaryData}
          columns={totalProductionColumns}
        />
        <div>
          <h1 className="text-base font-medium text-black mb-4">
            Daily Production ($)
          </h1>
          <GenericTable
            dataSource={tableData}
            columns={dailyProductionColumns}
          />
        </div>
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
