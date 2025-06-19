import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
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
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    steps,
    setLoading,
    currentStep,
    submissionId,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;

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
      width: 100,
      editable: true,
      inputType: 'text',
      key: 'overage_reason',
      dataIndex: 'overage_reason',
      title: 'Reason for Overage:'
    }
  ];

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
          supplies_actual: parseFloat(rowData.supplies_actual)
        };
        const response = await EOMReportService.addSuppliesAndGoogleReviews(
          submissionId,
          payload
        );
        if (response.status === 200) {
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

  useEffect(() => {
    if (currentStepData.length > 0) {
      setTableData(currentStepData);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
