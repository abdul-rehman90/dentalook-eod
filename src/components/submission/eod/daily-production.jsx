import React, { useState, useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function DailyProduction({ onNext }) {
  const [goal, setGoal] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const {
    id,
    steps,
    setDirty,
    reportData,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinicDetails?.clinic;
  const submission_date =
    reportData?.eod?.basic?.clinicDetails?.submission_date;
  const isClinicClosed =
    reportData?.eod?.basic?.clinicDetails?.status === 'closed';
  const hasRDT = reportData?.eod?.basic?.activeProviders?.some(
    (item) => item.type === 'RDT' || item?.user?.user_type === 'RDT'
  );

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
        DDS: totalDDS,
        RDT: totalRDT,
        RDH: totalRDH,
        variance: difference,
        totalProduction: totalProduction,
        target: `$${goal.toLocaleString()}`
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
        title: 'Total (DDS)',
        render: (value) =>
          `$${Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
      },
      {
        key: 'RDH',
        dataIndex: 'RDH',
        title: 'Total (RDH)',
        render: (value) =>
          `$${Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
      }
    ];

    if (hasRDT) {
      baseColumns.push({
        key: 'RDT',
        dataIndex: 'RDT',
        title: 'Total (RDT)',
        render: (value) =>
          `$${Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
      });
    }

    baseColumns.push(
      {
        key: 'totalProduction',
        title: 'Total Production',
        dataIndex: 'totalProduction',
        render: (value) =>
          `$${Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
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
            $
            {Number(value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        )
      }
    );

    return baseColumns;
  }, [hasRDT]);

  const providersColumns = [
    {
      width: 145,
      key: 'type',
      title: 'Title',
      dataIndex: 'type'
    },
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name',
      width: hasRDT ? 350 : 240
    },
    {
      width: 50,
      prefix: '$',
      editable: true,
      inputType: 'number',
      title: 'Production',
      disabled: isClinicClosed,
      key: 'production_amount',
      dataIndex: 'production_amount'
    },
    {
      key: '',
      title: '',
      width: 250,
      dataIndex: ''
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setDirty(true);
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const payload = tableData
          .filter(
            (item) =>
              item.production_amount && Number(item.production_amount > 0)
          )
          .map((item) => ({
            ...item,
            user: item.id,
            eodsubmission: Number(id),
            production_amount: item.production_amount
          }));

        if (payload.length > 0) {
          setLoading(true);
          const response = await EODReportService.addProduction(payload);
          if (response.status === 201) {
            setDirty(false);
            updateStepData(currentStepId, tableData);
            toast.success('Record is successfully saved');
            if (navigate) onNext();
            return true;
          }
        } else {
          setDirty(false);
          updateStepData(currentStepId, tableData);
          if (navigate) onNext();
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, id, currentStepId, setLoading, updateStepData, onNext, setDirty]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  const fetchTargetGoal = async () => {
    try {
      const response = await EODReportService.getTargetGoalByClinicId(
        clinicId,
        submission_date
      );
      if (response.data.submission_month_target !== goal) {
        setGoal(response.data.submission_month_target);
      }
    } catch (error) {}
  };

  const fetchActiveProviders = async () => {
    try {
      setDataLoading(true);
      const { data } = await EODReportService.getActiveProviders(id);
      const sortedProviders = data.providers.sort((a, b) => {
        if (a.user_type === 'DDS') return -1;
        if (b.user_type === 'DDS') return 1;
        return 0;
      });
      const baseProviders = sortedProviders.map((provider) => ({
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
    } catch (error) {
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      fetchTargetGoal();
      fetchActiveProviders();
    }
  }, [clinicId]);

  useEffect(() => {
    window.addEventListener('stepNavigationSave', handleSave);
    window.addEventListener('stepNavigationNext', handleSubmit);

    return () => {
      window.removeEventListener('stepNavigationSave', handleSave);
      window.removeEventListener('stepNavigationNext', handleSubmit);
    };
  }, [handleSubmit, handleSave]);

  useEffect(() => {
    registerStepSaveHandler(currentStep, async (navigate = false) => {
      return saveData(navigate);
    });
    return () => {
      unregisterStepSaveHandler(currentStep);
    };
  }, [
    saveData,
    currentStep,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  ]);

  return (
    <React.Fragment>
      <div className="flex flex-col gap-6 px-6">
        <GenericTable
          loading={dataLoading}
          dataSource={tableData}
          columns={providersColumns}
          onCellChange={handleCellChange}
        />
        <GenericTable
          dataSource={summaryData}
          columns={totalProductionColumns}
        />
      </div>
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
