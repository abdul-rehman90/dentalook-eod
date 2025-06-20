import React, { useEffect, useState } from 'react';
import { Col, Input, Row } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ScheduleOpening({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const { reportData, getCurrentStepData } = useGlobalContext();
  const unitTime = reportData?.eod?.basic?.unit_length;
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 200,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name'
    },
    {
      width: 200,
      editable: true,
      disabled: true,
      inputType: 'number',
      key: 'unfilled_spots',
      title: 'Unfilled Spots',
      dataIndex: 'unfilled_spots'
    },
    {
      width: 200,
      editable: true,
      disabled: true,
      key: 'no_shows',
      title: 'No Shows',
      inputType: 'number',
      dataIndex: 'no_shows'
    },
    {
      width: 200,
      editable: true,
      disabled: true,
      inputType: 'number',
      key: 'short_notice_cancellations',
      title: 'Short Notice Cancellations',
      dataIndex: 'short_notice_cancellations'
    }
  ];

  const footer = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1 p-2">Total Amount</div>
      <div className="flex-1 p-2">
        {tableData.reduce((sum, item) => sum + item.unfilled_spots, 0)}
      </div>
      <div className="flex-1 p-2">
        {tableData.reduce((sum, item) => sum + item.no_shows, 0)}
      </div>
      <div className="flex-1 p-2">
        {tableData.reduce(
          (sum, item) => sum + item.short_notice_cancellations,
          0
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        name: item.user?.name,
        key: item.id.toString(),
        no_shows: item.no_shows,
        unfilled_spots: item.unfilled_spots,
        short_notice_cancellations: item.short_notice_cancellations
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6 flex flex-col gap-4">
        <Row>
          <Col span={8}>
            <label className="text-[15px] text-gray-900 font-medium flex items-center h-full no-wrap">
              Unit Time Length (in minutes)
            </label>
          </Col>
          <Col span={6}>
            <Input min="1" disabled type="number" value={unitTime} />
          </Col>
        </Row>
        <h2 className="font-medium text-base text-black">
          Enter number of units where a providers had no patients:
        </h2>
        <GenericTable
          footer={footer}
          columns={columns}
          dataSource={tableData}
        />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
