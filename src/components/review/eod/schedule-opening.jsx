import React, { useState } from 'react';
import { Col, Input, Row } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ScheduleOpening({ onNext }) {
  const [unitTime, setUnitTime] = useState(10);
  const [unitsData, setUnitsData] = useState([
    { key: '1', type: 'Unfilled Spots', dds: '', rdh: '', rdt: '' },
    { key: '2', type: 'No Shows', dds: '', rdh: '', rdt: '' },
    { key: '3', type: 'Short Notice Cancellations', dds: '', rdh: '', rdt: '' }
  ]);

  const columns = [
    {
      title: '',
      width: 200,
      key: 'type',
      dataIndex: 'type'
    },
    {
      key: 'dds',
      width: 150,
      editable: true,
      dataIndex: 'dds',
      inputType: 'number',
      title: 'DDS (in units)'
    },
    {
      key: 'rdh',
      width: 150,
      editable: true,
      dataIndex: 'rdh',
      inputType: 'number',
      title: 'RDH (in units)'
    },
    {
      key: 'rdt',
      width: 150,
      editable: true,
      dataIndex: 'rdt',
      inputType: 'number',
      title: 'RDT (in units)'
    }
  ];

  const footer = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1 p-2">Total Amount</div>
      <div className="flex-1 p-2">
        {unitsData.reduce((sum, item) => sum + item.dds, 0)}
      </div>
      <div className="flex-1 p-2">
        {unitsData.reduce((sum, item) => sum + item.rdh, 0)}
      </div>
      <div className="flex-1 p-2">
        {unitsData.reduce((sum, item) => sum + item.rdt, 0)}
      </div>
    </div>
  );

  const handleCellChange = (record, dataIndex, value) => {
    const newValue = value === '' ? 0 : parseInt(value) || 0;
    setUnitsData(
      unitsData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: newValue } : item
      )
    );
  };

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
          dataSource={unitsData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
