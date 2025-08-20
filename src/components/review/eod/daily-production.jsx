import React, { useState, useMemo, useEffect } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';

export default function DailyProduction({ onNext }) {
  const [goal, setGoal] = useState(0);
  const [tableData, setTableData] = useState([]);
  const { reportData, getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const clinicId = reportData?.eod?.basic?.clinicDetails?.clinic;
  const hasRDT = reportData?.eod?.basic?.activeProviders?.some(
    (item) => item.user.user_type === 'RDT'
  );

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalDDS = tableData
      .filter((item) => item.type === 'DDS')
      .reduce((sum, item) => sum + (Number(item.production_amount) || 0), 0);

    const totalRDH = tableData
      .filter((item) => item.type === 'RDH')
      .reduce((sum, item) => sum + (Number(item.production_amount) || 0), 0);

    const totalRDT = tableData
      .filter((item) => item.type === 'RDT')
      .reduce((sum, item) => sum + (Number(item.production_amount) || 0), 0);

    const totalProduction = totalDDS + totalRDH + totalRDT;
    const difference = totalProduction - goal;

    return [
      {
        key: 'summary',
        variance: difference,
        target: `${goal.toLocaleString()}`,
        DDS: `${totalDDS.toLocaleString()}`,
        RDT: `${totalRDT.toLocaleString()}`,
        RDH: `${totalRDH.toLocaleString()}`,
        totalProduction: `${totalProduction.toLocaleString()}`
      }
    ];
  }, [tableData, goal]);

  const totalProductionColumns = useMemo(() => {
    const baseColumns = [
      {
        title: '',
        key: 'summary',
        dataIndex: 'summary',
        render: () => 'Production ($):'
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
      }
    ];

    if (hasRDT) {
      baseColumns.push({
        key: 'RDT',
        dataIndex: 'RDT',
        title: 'Total (RDT)'
      });
    }

    baseColumns.push(
      {
        key: 'totalProduction',
        title: 'Total Production',
        dataIndex: 'totalProduction',
        render: (value) => (value ? `$${value}` : '$0')
      },
      {
        key: 'target',
        title: 'Target',
        dataIndex: 'target'
      },
      {
        key: 'variance',
        title: 'Variance',
        dataIndex: 'variance',
        render: (value) => (
          <span style={{ color: value >= 0 ? 'green' : 'red' }}>
            {value.toLocaleString()}
          </span>
        )
      }
    );

    return baseColumns;
  }, [hasRDT]);

  const dailyProductionColumns = [
    {
      width: 150,
      key: 'type',
      title: 'Title',
      dataIndex: 'type',
      render: (type) => type || 'N/A'
    },
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name',
      width: hasRDT ? 350 : 250,
      render: (name) => name || 'N/A'
    },
    {
      width: 50,
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
      dataIndex: '',
      width: hasRDT ? 240 : 250
    }
  ];

  const fetchTargetGoal = async () => {
    try {
      const response = await EODReportService.getTargetGoalByClinicId(clinicId);
      if (response.data.submission_month_target !== goal) {
        setGoal(response.data.submission_month_target);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (clinicId) {
      fetchTargetGoal();
    }
  }, [clinicId]);

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData
        .map((item) => ({
          name: item.user?.name,
          key: item.id.toString(),
          type: item.user?.user_type,
          production_amount: item.production_amount
        }))
        .sort((a, b) => {
          if (a.type === 'DDS') return -1;
          if (b.type === 'DDS') return 1;
          return 0;
        });
      setTableData(transformedData);
    }
  }, [currentStepData]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', onNext);
    return () => {
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [onNext]);

  return (
    <div className="flex flex-col gap-6 px-6">
      <GenericTable dataSource={tableData} columns={dailyProductionColumns} />
      <GenericTable dataSource={summaryData} columns={totalProductionColumns} />
    </div>
  );
}
