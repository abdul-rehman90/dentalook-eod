import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function DailyProduction({ onNext }) {
  const [goal, setGoal] = useState(0);
  const [tableData, setTableData] = useState([]);
  const {
    id,
    steps,
    reportData,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const clinicId = reportData?.eod?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;
  const isClinicClosed = reportData?.eod?.basic?.status === 'closed';

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
        '+/-': `${difference.toLocaleString()}`,
        totalProduction: `${totalProduction.toLocaleString()}`
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

  const providersColumns = [
    {
      width: 100,
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
      render: (type) => type || 'N/A'
    },
    {
      width: 100,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name',
      render: (name) => name || 'N/A'
    },
    {
      width: 100,
      editable: true,
      inputType: 'number',
      title: 'Production',
      disabled: isClinicClosed,
      key: 'production_amount',
      dataIndex: 'production_amount'
    },
    ...(tableData.length > 1
      ? [
          {
            width: 50,
            key: 'action',
            title: 'Action',
            render: (_, record) => (
              <Button
                size="icon"
                className="ml-3"
                variant="destructive"
                onClick={() =>
                  setTableData(
                    tableData.filter((item) => item.id !== record.id)
                  )
                }
              >
                <Image src={Icons.cross} alt="cross" />
              </Button>
            )
          }
        ]
      : [])
  ];

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

  const handleSubmit = async () => {
    try {
      const payload = tableData
        .filter(
          (item) => item.production_amount && Number(item.production_amount > 0)
        )
        .map((item) => ({
          ...item,
          user: item.id,
          eodsubmission: Number(id),
          production_amount: Number(item.production_amount)
        }));
      if (payload.length > 0) {
        setLoading(true);
        const response = await EODReportService.addProduction(payload);
        if (response.status === 201) {
          updateStepData(currentStepId, tableData);
          toast.success('Record is successfully saved');
          onNext();
        }
        return;
      }

      updateStepData(currentStepId, tableData);
      onNext();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetGoal = async () => {
    try {
      const response = await EODReportService.getTargetGoalByClinicId(clinicId);
      if (response.data.submission_month_target !== goal) {
        setGoal(response.data.submission_month_target);
      }
    } catch (error) {}
  };

  const fetchActiveProviders = async () => {
    try {
      const { data } = await EODReportService.getActiveProviders(id);
      const baseProviders = data.providers.map((provider) => ({
        id: provider.id,
        key: provider.id,
        name: provider.name,
        type: provider.user_type
      }));

      if (currentStepData.length > 0) {
        const mergedData = baseProviders.map((provider) => {
          const existingData = currentStepData.find(
            (item) => item.user?.id === provider.id || item.id === provider.id
          );
          if (existingData) {
            return {
              ...provider,
              production_amount: existingData.production_amount,
              name: existingData.user?.name || existingData.name,
              type: existingData.user?.user_type || existingData.type
            };
          }
          return provider;
        });
        setTableData(mergedData);
      } else {
        setTableData(baseProviders);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (clinicId) {
      fetchTargetGoal();
      fetchActiveProviders();
    }
  }, [clinicId]);

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
            columns={providersColumns}
            onCellChange={handleCellChange}
          />
        </div>
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
