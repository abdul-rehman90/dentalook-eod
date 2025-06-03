import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function DailyProduction({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const [goal, setGoal] = useState(6367);

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalDDS = tableData
      .filter((item) => item.type === 'DDS')
      .reduce((sum, item) => sum + (Number(item.production) || 0), 0);

    const totalRDH = tableData
      .filter((item) => item.type === 'RDH')
      .reduce((sum, item) => sum + (Number(item.production) || 0), 0);

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
      key: 'providerName',
      title: 'Provider Name',
      dataIndex: 'providerName'
    },
    {
      width: 150,
      editable: true,
      key: 'production',
      inputType: 'number',
      title: 'Production',
      dataIndex: 'production'
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

  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key
          ? {
              ...item,
              [dataIndex]: dataIndex === 'production' ? Number(value) : value
            }
          : item
      )
    );
  };

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
            onCellChange={handleCellChange}
            columns={dailyProductionColumns}
          />
        </div>
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
