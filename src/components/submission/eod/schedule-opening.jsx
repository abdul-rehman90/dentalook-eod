import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Col, Input, Row } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ScheduleOpening({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const {
    steps,
    setLoading,
    reportData,
    currentStep,
    submissionId,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const unitTime = reportData?.eod?.basic?.unit_length;
  const isClinicClosed = reportData?.eod?.basic?.status === 'closed';

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
      inputType: 'number',
      key: 'unfilled_spots',
      title: 'Unfilled Spots',
      disabled: isClinicClosed,
      dataIndex: 'unfilled_spots'
    },
    {
      width: 200,
      editable: true,
      key: 'no_shows',
      title: 'No Shows',
      inputType: 'number',
      dataIndex: 'no_shows',
      disabled: isClinicClosed
    },
    {
      width: 200,
      editable: true,
      inputType: 'number',
      disabled: isClinicClosed,
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

  const handleCellChange = (record, dataIndex, value) => {
    const newValue = value === '' ? 0 : parseInt(value) || 0;
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: newValue } : item
      )
    );
  };

  const handleSubmit = async () => {
    const hasData = tableData.some(
      (provider) =>
        provider.unfilled_spots > 0 ||
        provider.no_shows > 0 ||
        provider.short_notice_cancellations > 0
    );

    if (!hasData) {
      updateStepData(currentStepId, tableData);
      onNext();
      return;
    }

    try {
      setLoading(true);
      const payload = tableData.map((item) => ({
        ...item,
        user: item.id,
        eodsubmission: submissionId
      }));
      const response = await EODReportService.addScheduleOpening(payload);
      if (response.status === 201) {
        updateStepData(currentStepId, tableData);
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProviders = async () => {
    try {
      const { data } = await EODReportService.getActiveProviders(submissionId);
      setTableData(
        data.providers.map((provider) => ({
          id: provider.id,
          key: provider.id,
          name: provider.name,
          unfilled_spots: null,
          no_shows: null,
          short_notice_cancellations: null
        }))
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (currentStepData.length > 0) {
      return setTableData(currentStepData);
    }
    fetchActiveProviders();
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
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
