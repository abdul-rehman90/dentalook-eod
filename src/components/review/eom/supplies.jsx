import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Table } from 'antd';
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
  const clinicId = reportData?.eom?.basic?.clinic;
  const submission_month = dayjs(
    reportData?.eom?.basic?.submission_month
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
      title: 'Actual',
      dataIndex: 'actual',
      render: (text) => {
        const total = totalSupplies.reduce(
          (sum, item) => sum + (Number(item.supplies_actual) || 0),
          0
        );

        return `$${Number(total).toFixed(2)}` || text;
      }
    },
    {
      key: '',
      title: '',
      width: 300,
      dataIndex: ''
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
      key: 'overage_reason',
      title: 'Reason for Overage',
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
      <Table.Summary.Row>
        <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
        <Table.Summary.Cell index={1} colSpan={2}>
          ${totalActual.toFixed(2)}
        </Table.Summary.Cell>
        <Table.Summary.Cell index={3}>0</Table.Summary.Cell>
        <Table.Summary.Cell index={4} colSpan={2}>
          <div
            style={{
              color: totalActual - 0 >= 0 ? 'green' : 'red'
            }}
          >
            ${(totalActual - 0).toFixed(2)}
          </div>{' '}
        </Table.Summary.Cell>
      </Table.Summary.Row>
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
