import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Col, Input, Row } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ScheduleOpening({ onNext }) {
  const [unitTime, setUnitTime] = useState(10);
  const { steps, reportData, currentStep, updateStepData, getCurrentStepData } =
    useGlobalContext();
  const [unitsData, setUnitsData] = useState([
    { key: '1', type: 'Unfilled Spots', dds: '', rdh: '' },
    { key: '2', type: 'No Shows', dds: '', rdh: '' },
    { key: '3', type: 'Short Notice Cancellations', dds: '', rdh: '' }
  ]);
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const isClinicClosed = reportData?.eod?.basic?.status === 'closed';

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
      title: 'DDS (in units)',
      disabled: isClinicClosed
    },
    {
      key: 'rdh',
      width: 150,
      editable: true,
      dataIndex: 'rdh',
      inputType: 'number',
      title: 'RDH (in units)',
      disabled: isClinicClosed
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
    </div>
  );

  const createScheduleOpening = async () => {
    try {
      const payload = {
        eodsubmission: 1,
        unfilled_spots_dds:
          unitsData.find((item) => item.type === 'Unfilled Spots')?.dds || 0,
        unfilled_spots_rdh:
          unitsData.find((item) => item.type === 'Unfilled Spots')?.rdh || 0,
        no_shows_dds:
          unitsData.find((item) => item.type === 'No Shows')?.dds || 0,
        no_shows_rdh:
          unitsData.find((item) => item.type === 'No Shows')?.rdh || 0,
        short_notice_cancellations_dds:
          unitsData.find((item) => item.type === 'Short Notice Cancellations')
            ?.dds || 0,
        short_notice_cancellations_rdh:
          unitsData.find((item) => item.type === 'Short Notice Cancellations')
            ?.rdh || 0
      };

      const response = await EODReportService.addScheduleOpening(payload);
      if (response.status === 201) {
        updateStepData(currentStepId, unitsData);
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {}
  };

  const handleCellChange = (record, dataIndex, value) => {
    const newValue = value === '' ? 0 : parseInt(value) || 0;
    setUnitsData(
      unitsData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: newValue } : item
      )
    );
  };

  useEffect(() => {
    if (currentStepData.length > 0) setUnitsData(currentStepData);
  }, []);

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
      <StepNavigation onNext={createScheduleOpening} />
    </React.Fragment>
  );
}
