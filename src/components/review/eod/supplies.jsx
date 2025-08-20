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
      actual: '',
      reason: ''
    }
  ]);
  const clinicId = reportData?.eod?.basic?.clinicDetails?.clinic;
  const submission_month = dayjs(
    reportData?.eod?.basic?.clinicDetails?.submission_date
  ).format('YYYY-MM');

  const columns = [
    {
      title: '',
      width: 100,
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="text-[15px] text-gray-900 font-bold">
          Total Supplies
        </div>
      )
    },
    {
      width: 50,
      key: 'actual',
      disabled: true,
      editable: true,
      title: 'Actual',
      inputType: 'number',
      dataIndex: 'actual'
    },
    {
      width: 300,
      key: 'reason',
      disabled: true,
      editable: true,
      title: 'Remarks',
      inputType: 'text',
      dataIndex: 'reason'
    }
  ];

  const totalSuppliesColumns = [
    {
      width: 50,
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date'
    },
    {
      width: 50,
      title: 'Actual',
      key: 'supplies_actual',
      dataIndex: 'supplies_actual',
      render: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : '$0.00')
    },
    {
      width: 150,
      title: 'Remarks',
      key: 'overage_reason',
      dataIndex: 'overage_reason'
    },
    {
      key: '',
      width: 50,
      dataIndex: '',
      title: 'Monthly Budget'
    },
    {
      key: '',
      width: 50,
      dataIndex: '',
      title: 'Variance'
    }
  ];

  const footer = () => {
    const totalActual = totalSupplies.reduce(
      (sum, item) => sum + (Number(item.supplies_actual) || 0),
      0
    );
    return (
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] p-2">
        <div className="font-semibold">Total</div>
        <div className="max-[1500px]:ml-[20px] min-[1501px]:max-[1650px]:ml-[24px] min-[1651px]:max-[1900px]:ml-[28px] min-[1901px]:max-[2150px]:ml-[32px] min-[2151px]:ml-[40px]">
          ${totalActual.toFixed(2)}
        </div>
        <div></div>
        <div className="text-center">0</div>
        <div
          className="max-[1500px]:ml-[44px] min-[1501px]:max-[1750px]:ml-[52px] min-[1751px]:max-[1950px]:ml-[58px] min-[1951px]:max-[2200px]:ml-[66px] min-[2201px]:ml-[78px]"
          style={{
            color: totalActual - 0 >= 0 ? 'green' : 'red'
          }}
        >
          ${(totalActual - 0).toFixed(2)}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (Object.entries(currentStepData).length > 0) {
      const transformedData = [
        {
          key: '1',
          reason: currentStepData.overage_reason || '',
          actual: currentStepData.supplies_actual || ''
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

  useEffect(() => {
    window.addEventListener('stepNavigationNext', onNext);
    return () => {
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [onNext]);

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
      <StepNavigation
        onNext={onNext}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
