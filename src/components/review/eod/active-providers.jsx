import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Checkbox, Input, TimePicker } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ActiveProviders({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 200,
      key: 'type',
      title: 'Type',
      dataIndex: 'type'
    },
    {
      width: 200,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name'
    },
    {
      width: 100,
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
      width: 150,
      editable: true,
      inputType: 'number',
      title: 'Patients Seen',
      key: 'number_of_patients_seen',
      dataIndex: 'number_of_patients_seen',
      render: (_, record) => (
        <Input
          disabled
          type="number"
          value={record.number_of_patients_seen || ''}
        />
      )
    },
    {
      width: 150,
      key: 'start_time',
      title: 'Start Time',
      dataIndex: 'start_time',
      render: (_, record) => (
        <TimePicker
          disabled
          format="HH:mm"
          showNow={false}
          minuteStep={30}
          hideDisabledOptions
          inputReadOnly={true}
          value={record.start_time}
        />
      )
    },
    {
      width: 150,
      key: 'end_time',
      title: 'End Time',
      dataIndex: 'end_time',
      render: (_, record) => (
        <TimePicker
          disabled
          format="HH:mm"
          showNow={false}
          minuteStep={30}
          hideDisabledOptions
          inputReadOnly={true}
          value={record.end_time}
        />
      )
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        name: item.user?.name,
        key: item.id.toString(),
        is_active: item.is_active,
        type: item.user?.user_type,
        end_time: item.end_time ? dayjs(item.end_time) : null,
        number_of_patients_seen: item.number_of_patients_seen,
        start_time: item.start_time ? dayjs(item.start_time) : null
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="mb-4">
          <h1 className="text-base font-medium text-black">Active Providers</h1>
        </div>
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
