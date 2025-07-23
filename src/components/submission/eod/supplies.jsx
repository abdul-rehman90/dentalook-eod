import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const defaultRow = {
  key: '1',
  difference: '-',
  overage_reason: '',
  supplies_actual: '',
  budget_daily_supplies: 0
};

export default function Supplies({ onNext }) {
  const [dataLoading, setDataLoading] = useState(false);
  const [totalSupplies, setTotalSupplies] = useState([]);
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    id,
    steps,
    setLoading,
    reportData,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinicDetails?.clinic;
  const submission_month = dayjs(
    reportData?.eod?.basic?.clinicDetails?.submission_date
  ).format('YYYY-MM');

  const columns = [
    {
      title: '',
      width: 80,
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="px-2 text-[15px] text-gray-900 font-bold">
          Total Supplies
        </div>
      )
    },
    {
      width: 100,
      editable: true,
      title: 'Actual',
      inputType: 'number',
      key: 'supplies_actual',
      dataIndex: 'supplies_actual'
    },
    {
      width: 100,
      title: 'Budget (Goal)',
      key: 'budget_daily_supplies',
      dataIndex: 'budget_daily_supplies',
      render: (_, record) => record.budget_daily_supplies
    },
    {
      width: 100,
      title: '+/-',
      key: 'difference',
      render: (_, record) => record.difference
    },
    {
      width: 200,
      editable: true,
      inputType: 'text',
      key: 'overage_reason',
      title: 'Reason for Overage',
      dataIndex: 'overage_reason'
    }
  ];

  const totalSuppliesColumns = [
    {
      width: 100,
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date'
    },
    {
      width: 100,
      title: 'Actual',
      key: 'supplies_actual',
      dataIndex: 'supplies_actual'
    },
    // {
    //   width: 220,
    //   title: 'Budget (Goal)',
    //   key: 'budget_daily_supplies',
    //   dataIndex: 'budget_daily_supplies'
    // },
    {
      // width: 220,
      width: 450,
      key: 'overage_reason',
      title: 'Reason for Overage',
      dataIndex: 'overage_reason'
    }
  ];

  const footer = () => (
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] p-1.5">
      <div className="font-semibold">Total</div>
      <div className="ml-[-8px]">
        {totalSupplies.reduce(
          (sum, item) => sum + (Number(item.supplies_actual) || 0),
          0
        )}
      </div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );

  const handleCellChange = (record, dataIndex, value) => {
    const updatedData = tableData.map((item) => {
      if (item.key === record.key) {
        if (dataIndex === 'supplies_actual') {
          const actualValue = value === '' ? null : Number(value);
          const budgetValue = record.budget_daily_supplies;
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

  const handleSubmit = async () => {
    try {
      const rowData = tableData[0];

      if (rowData.supplies_actual) {
        setLoading(true);
        const payload = {
          ...rowData,
          clinic: clinicId,
          supplies_actual: parseFloat(rowData.supplies_actual)
        };
        const response = await EODReportService.addSupplies(id, payload);
        if (response.status === 200) {
          updateStepData(currentStepId, rowData);
          toast.success('Record is successfully saved');
          onNext();
        }
        return;
      }
      updateStepData(currentStepId, rowData);
      onNext();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId && Object.entries(currentStepData).length > 0) {
      const transformedData = [
        {
          key: '1',
          difference:
            currentStepData.difference ||
            currentStepData.supplies_actual -
              currentStepData.budget_daily_supplies ||
            '-',
          overage_reason: currentStepData.overage_reason || '',
          supplies_actual: currentStepData.supplies_actual || '',
          budget_daily_supplies: currentStepData.budget_daily_supplies || 0
        }
      ];
      setTableData(transformedData);
    }
  }, [clinicId]);

  useEffect(() => {
    const getAllSupplies = async () => {
      try {
        setDataLoading(true);
        const { data } = await EODReportService.getAllSupplies(
          clinicId,
          submission_month
        );
        setTotalSupplies(
          data.map((item) => ({
            ...item,
            key: item.id
          }))
        );
      } catch (error) {
      } finally {
        setDataLoading(false);
      }
    };
    clinicId && getAllSupplies();
  }, [clinicId]);

  return (
    <React.Fragment>
      <div className="px-6 flex flex-col gap-14">
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
        <GenericTable
          footer={footer}
          loading={dataLoading}
          dataSource={totalSupplies}
          columns={totalSuppliesColumns}
        />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
