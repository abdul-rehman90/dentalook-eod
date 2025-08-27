import React, { useEffect, useState } from 'react';
import { Checkbox, Input, Select } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { formatTimeForUI } from '@/common/utils/time-handling';
import { useGlobalContext } from '@/common/context/global-context';

const generateTimeOptions = (startTime, endTime) => {
  if (!startTime || !endTime) return [];

  const format = 'h:mm a';
  const start = dayjs(startTime, format);
  const end = dayjs(endTime, format);

  let options = [];
  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    options.push({
      label: current.format(format),
      value: current.format(format)
    });
    current = current.add(30, 'minute');
  }

  return options;
};

export default function ActiveProviders({ form }) {
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const clinicOpenTime = form.getFieldValue('clinic_open_time');
  const clinicCloseTime = form.getFieldValue('clinic_close_time');

  const columns = [
    {
      // width: 50,
      title: 'Active',
      key: 'is_active',
      dataIndex: 'is_active',
      render: (_, record) => (
        <Checkbox
          disabled
          checked={record.is_active}
          className="custom-checkbox"
        />
      )
    },
    {
      // width: 50,
      key: 'type',
      title: 'Title',
      dataIndex: 'type'
    },
    {
      width: 140,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name'
    },
    {
      // width: 50,
      key: 'start_time',
      title: 'Start Time',
      dataIndex: 'start_time',
      render: (_, record) => {
        const timeOptions = generateTimeOptions(
          clinicOpenTime,
          clinicCloseTime
        );
        return (
          <Select
            disabled
            options={timeOptions}
            placeholder="Select one"
            value={record.start_time}
            style={{ width: '100%' }}
          />
        );
      }
    },
    {
      // width: 50,
      key: 'end_time',
      title: 'End Time',
      dataIndex: 'end_time',
      render: (_, record) => {
        const timeOptions = generateTimeOptions(
          clinicOpenTime,
          clinicCloseTime
        );
        return (
          <Select
            disabled
            options={timeOptions}
            value={record.end_time}
            placeholder="Select one"
            style={{ width: '100%' }}
          />
        );
      }
    },
    {
      // width: 50,
      editable: true,
      title: 'Pt. Seen',
      inputType: 'number',
      key: 'number_of_patients_seen',
      dataIndex: 'number_of_patients_seen',
      onCell: () => ({ className: 'divider-cell' }),
      render: (_, record) => (
        <Input
          disabled
          type="number"
          value={record.number_of_patients_seen || ''}
        />
      )
    },
    {
      // width: 50,
      title: 'Unfilled',
      key: 'unfilled_spots',
      dataIndex: 'unfilled_spots',
      render: (_, record) => (
        <Input disabled type="number" value={record.unfilled_spots} />
      )
    },
    {
      // width: 50,
      key: 'no_shows',
      title: 'No Shows',
      dataIndex: 'no_shows',
      render: (_, record) => (
        <Input disabled type="number" value={record.no_shows} />
      )
    },
    {
      // width: 50,
      title: 'Short Ntc',
      key: 'short_notice_cancellations',
      dataIndex: 'short_notice_cancellations',
      render: (_, record) => (
        <Input
          disabled
          type="number"
          value={record.short_notice_cancellations}
        />
      )
    },
    {
      // width: 50,
      title: 'Failed',
      key: 'failed_appointments',
      dataIndex: 'failed_appointments',
      render: (_, record) => (
        <Input disabled type="number" value={record.failed_appointments} />
      )
    }
  ];

  useEffect(() => {
    if (currentStepData.activeProviders.length > 0) {
      const transformedData = currentStepData.activeProviders.map((item) => ({
        name: item.user?.name,
        key: item.id.toString(),
        no_shows: item.no_shows,
        is_active: item.is_active,
        type: item.user?.user_type,
        unfilled_spots: item.unfilled_spots,
        end_time: formatTimeForUI(item.end_time),
        start_time: formatTimeForUI(item.start_time),
        failed_appointments: item.failed_appointments,
        number_of_patients_seen: item.number_of_patients_seen,
        short_notice_cancellations: item.short_notice_cancellations
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <div className="pr-6">
      <GenericTable columns={columns} dataSource={tableData} />
    </div>
  );
}
