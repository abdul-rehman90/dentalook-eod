import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function Supplies({ onNext }) {
  const { reportData, getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const [dataLoading, setDataLoading] = useState(false);
  const [totalSupplies, setTotalSupplies] = useState([]);
  const [tableData, setTableData] = useState([
    {
      key: '1',
      budget: 0,
      actual: '',
      reason: '',
      difference: '-'
    }
  ]);
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
      width: 200,
      key: 'reason',
      disabled: true,
      editable: true,
      inputType: 'text',
      dataIndex: 'reason',
      title: 'Reason for Overage'
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
      width: 110,
      title: 'Actual',
      key: 'supplies_actual',
      dataIndex: 'supplies_actual'
    },
    {
      width: 220,
      title: 'Budget (Goal)',
      key: 'budget_daily_supplies',
      dataIndex: 'budget_daily_supplies'
    },
    {
      width: 220,
      // width: 450,
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
        <GenericTable columns={columns} dataSource={tableData} />
        <GenericTable
          footer={footer}
          loading={dataLoading}
          dataSource={totalSupplies}
          columns={totalSuppliesColumns}
        />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
