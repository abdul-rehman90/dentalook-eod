import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Input, Select, TimePicker } from 'antd';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
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

const defaultRow = {
  key: 1,
  name: '',
  reason: '',
  absence: '',
  position: '',
  startTime: null,
  endTime: null
};

export default function TeamAbsences({ onNext }) {
  const [staffData, setStaffData] = useState({});
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    id,
    steps,
    reportData,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinic;

  const columns = [
    {
      width: 150,
      title: 'Title',
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
              <Select
                value={text}
                options={staffData[record.position] || []}
                onChange={(value) => handleCellChange(record, 'name', value)}
              />
            </div>
          );
        }
        return (
          <div className="h-full">
            <Input
              value={text}
              onChange={(e) => handleCellChange(record, 'name', e.target.value)}
            />
          </div>
        );
      }
    },
    {
      width: 150,
      key: 'reason',
      editable: true,
      title: 'Reason',
      inputType: 'text',
      dataIndex: 'reason'
    },
    {
      width: 150,
      key: 'absence',
      dataIndex: 'absence',
      title: 'Absent/Present',
      render: (text, record) => (
        <Select
          value={text}
          options={[
            { value: 'Full Day', label: 'Full Day' },
            { value: 'Partial Day', label: 'Partial Day' }
          ]}
          onChange={(value) => {
            handleCellChange(record, 'absence', value);
          }}
        />
      )
    },
    {
      width: 100,
      key: 'start_time',
      title: 'Start Time',
      dataIndex: 'start_time',
      render: (_, record) => (
        <TimePicker
          format="HH:mm"
          showNow={false}
          minuteStep={30}
          hideDisabledOptions
          inputReadOnly={true}
          value={record.start_time}
          disabled={record.absence !== 'Partial Day'}
          onChange={(time) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key ? { ...p, start_time: time } : p
            );
            setTableData(updatedProviders);
          }}
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
          format="HH:mm"
          showNow={false}
          minuteStep={30}
          hideDisabledOptions
          inputReadOnly={true}
          value={record.end_time}
          disabled={record.absence !== 'Partial Day'}
          onChange={(time) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key ? { ...p, end_time: time } : p
            );
            setTableData(updatedProviders);
          }}
        />
      )
    },
    ...(tableData.length > 1
      ? [
          {
            width: 50,
            key: 'action',
            title: 'Action',
            render: (_, record) => (
              <Button
                size="icon"
                className="ml-3"
                variant="destructive"
                onClick={() =>
                  setTableData(
                    tableData.filter((item) => item.key !== record.key)
                  )
                }
              >
                <Image src={Icons.cross} alt="cross" />
              </Button>
            )
          }
        ]
      : [])
  ];

  const fetchStaffByPosition = async (position) => {
    try {
      const { data } = await EODReportService.getProviders(clinicId);
      setStaffData((prev) => ({
        ...prev,
        [position]: data.providers
          .filter((item) => item.user_type === position)
          .map((item) => ({
            value: item.id,
            label: item.name
          }))
      }));
    } catch (error) {}
  };

  const handleCellChange = (record, dataIndex, value) => {
    const newTeamMembers = tableData.map((item) => {
      if (item.key === record.key) {
        const updatedItem = { ...item, [dataIndex]: value };
        if (dataIndex === 'position') {
          updatedItem.name = '';
          fetchStaffByPosition(value);
        }

        return updatedItem;
      }
      return item;
    });
    setTableData(newTeamMembers);
  };

  const handleAddNew = () => {
    const newAbsence = {
      key: tableData.length ? Math.max(...tableData.map((p) => p.key)) + 1 : 1,
      name: '',
      reason: '',
      absence: '',
      position: '',
      startTime: null,
      endTime: null
    };
    setTableData([...tableData, newAbsence]);
  };

  const handleSubmit = async () => {
    try {
      const payload = tableData
        .filter((item) => item.position && item.name && item.absence)
        .map((item) => ({
          ...item,
          user: item.name,
          eodsubmission: Number(id),
          // Convert time objects to strings if they exist
          startTime:
            item.absence === 'Partial Day' && item.startTime
              ? item.startTime.format('HH:mm')
              : null,
          endTime:
            item.absence === 'Partial Day' && item.endTime
              ? item.endTime.format('HH:mm')
              : null
        }));
      if (payload.length > 0) {
        setLoading(true);
        const response = await EODReportService.addTeamAbsence(payload);
        if (response.status === 201) {
          updateStepData(currentStepId, tableData);
          toast.success('Record is successfully saved');
          onNext();
        }
        return;
      }
      updateStepData(currentStepId, tableData);
      onNext();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (clinicId && currentStepData.length > 0) {
        const positions = [
          ...new Set(currentStepData.map((item) => item.position))
        ];
        await Promise.all(positions.map((pos) => fetchStaffByPosition(pos)));
        const transformedData = currentStepData.map((item) => ({
          reason: item.reason,
          absence: item.absence,
          position: item.position,
          name: item.user?.id || item.name,
          key: item.id?.toString() || item.key?.toString(),
          startTime: item.startTime || null,
          endTime: item.endTime || null
        }));
        setTableData(transformedData);
      }
    };
    loadData();
  }, [clinicId]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-end mb-4">
          <Button
            size="lg"
            onClick={handleAddNew}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Absence
          </Button>
        </div>
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
