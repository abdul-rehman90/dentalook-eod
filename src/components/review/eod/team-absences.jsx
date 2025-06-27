import React, { useEffect, useState } from 'react';
import { Input, Select } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const positionOptions = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' },
  { value: 'PCC', label: 'PCC' },
  { value: 'CDA', label: 'CDA' },
  { value: 'PM', label: 'PM' },
  { value: 'Dental Aide', label: 'Dental Aide' }
];

export default function TeamAbsences({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 150,
      title: 'Title',
      disabled: true,
      editable: true,
      key: 'position',
      inputType: 'select',
      dataIndex: 'position',
      selectOptions: positionOptions
    },
    {
      width: 150,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name',
      render: (text, record) => {
        if (['DDS', 'RDH'].includes(record.position)) {
          return (
            <div className="h-full">
              <Select disabled value={text} />
            </div>
          );
        }
        return (
          <div className="h-full">
            <Input disabled value={text} />
          </div>
        );
      }
    },
    {
      width: 150,
      key: 'reason',
      disabled: true,
      editable: true,
      title: 'Reason',
      inputType: 'text',
      dataIndex: 'reason'
    },
    {
      width: 150,
      key: 'status',
      disabled: true,
      editable: true,
      inputType: 'select',
      dataIndex: 'status',
      title: 'Absent/Present',
      selectOptions: [
        { value: 'Full Day', label: 'Full Day' },
        { value: 'Partial Day', label: 'Partial Day' }
      ]
    },
    {
      width: 100,
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
      width: 100,
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
          value={record.start_time}
        />
      )
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        reason: item.reason,
        status: item.absence,
        name: item.user?.name,
        key: item.id.toString(),
        position: item.position
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
