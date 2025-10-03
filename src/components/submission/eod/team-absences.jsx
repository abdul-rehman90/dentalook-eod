import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import EditableCell from '@/common/components/editable-cell/editable-cell';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import {
  formatTimeForUI,
  generateTimeOptions
} from '@/common/utils/time-handling';

const positionOptions = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' },
  { value: 'RDT', label: 'RDT' },
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
  end_time: null,
  start_time: null
};

export default function TeamAbsences({ onNext }) {
  const [staffData, setStaffData] = useState({});
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    id,
    steps,
    setDirty,
    reportData,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinicDetails?.clinic;
  const clinicOpenTime =
    reportData?.eod?.basic?.clinicDetails?.clinic_open_time;
  const clinicCloseTime =
    reportData?.eod?.basic?.clinicDetails?.clinic_close_time;
  const clinic_open_time = formatTimeForUI(clinicOpenTime);
  const clinic_close_time = formatTimeForUI(clinicCloseTime);
  const timeOptions = generateTimeOptions(clinic_open_time, clinic_close_time);

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
      render: (_, record) => {
        if (['DDS', 'RDH', 'RDT'].includes(record.position)) {
          return (
            <EditableCell
              field="name"
              type="select"
              value={record.name}
              recordKey={record.key}
              onCommit={handleCellCommit}
              placeholder="Select Provider"
              options={staffData[record.position] || []}
            />
          );
        }
        return (
          <EditableCell
            field="name"
            value={record.name}
            recordKey={record.key}
            onCommit={handleCellCommit}
          />
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
      editable: true,
      inputType: 'select',
      dataIndex: 'absence',
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
        <EditableCell
          showSearch
          type="select"
          field="start_time"
          options={timeOptions}
          recordKey={record.key}
          placeholder="Select Time"
          value={record.start_time}
          onCommit={handleCellCommit}
          disabled={record.absence !== 'Partial Day'}
        />
      )
    },
    {
      width: 100,
      key: 'end_time',
      title: 'End Time',
      dataIndex: 'end_time',
      render: (_, record) => (
        <EditableCell
          showSearch
          type="select"
          field="end_time"
          options={timeOptions}
          recordKey={record.key}
          value={record.end_time}
          placeholder="Select Time"
          onCommit={handleCellCommit}
          disabled={record.absence !== 'Partial Day'}
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
                  setTableData((prev) =>
                    prev.filter((item) => item.key !== record.key)
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

  const handleCellCommit = (recordKey, field, value) => {
    setDirty(true);
    setTableData((prev) =>
      prev.map((item) =>
        item.key === recordKey
          ? {
              ...item,
              [field]: value,
              ...(field === 'position' ? { name: '' } : {})
            }
          : item
      )
    );
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
    setDirty(true);
    setTableData(newTeamMembers);
  };

  const fetchStaffByPosition = async (position) => {
    try {
      const { data } = await EODReportService.getProviders(clinicId);
      setStaffData((prev) => ({
        ...prev,
        [position]: data.providers
          .filter((item) => item.user_type === position)
          .map((item) => ({ value: item.id, label: item.name }))
      }));
    } catch (error) {}
  };

  const handleAddNew = () => {
    const newRow = {
      key: tableData.length ? Math.max(...tableData.map((p) => p.key)) + 1 : 1,
      id: null,
      name: '',
      reason: '',
      absence: '',
      position: '',
      end_time: null,
      start_time: null
    };
    setTableData([...tableData, newRow]);
  };

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const nonEmptyRows = tableData.filter(
          (item) => item.position || item.name
        );
        if (nonEmptyRows.length === 0) {
          updateStepData(currentStepId, []);
          if (navigate) onNext();
          return;
        }

        const rowsWithMissingData = nonEmptyRows.filter(
          (item) => !item.position || !item.name || !item.absence
        );
        if (rowsWithMissingData.length > 0) {
          toast.error('Please complete all required fields for each absence.');
          return false;
        }

        const rowsWithInvalidTimes = tableData.filter(
          (item) =>
            item.absence === 'Partial Day' &&
            (!item.start_time || !item.end_time)
        );
        if (rowsWithInvalidTimes.length > 0) {
          toast.error(
            'Please provide start and end times for Partial Day absences.'
          );
          return false;
        }

        const seen = new Set();
        for (const row of nonEmptyRows) {
          const key = `${row.position}-${row.name}`;
          if (seen.has(key)) {
            toast.error('Duplicate entry is not allowed');
            return false;
          }
          seen.add(key);
        }

        const payload = nonEmptyRows.map((item) => ({
          ...item,
          eodsubmission: Number(id),
          user: ['DDS', 'RDH', 'RDT'].includes(item.position)
            ? item.name
            : null,
          other_provider: !['DDS', 'RDH', 'RDT'].includes(item.position)
            ? item.name
            : null,
          start_time:
            item.absence === 'Partial Day' && item.start_time
              ? dayjs(item.start_time, 'h:mm a').format('HH:mm:ss')
              : null,
          end_time:
            item.absence === 'Partial Day' && item.end_time
              ? dayjs(item.end_time, 'h:mm a').format('HH:mm:ss')
              : null
        }));

        setLoading(true);
        const response = await EODReportService.addTeamAbsence(payload);
        if (response.status === 201) {
          setDirty(false);
          updateStepData(currentStepId, tableData);
          toast.success('Record is successfully saved');
          if (navigate) onNext();
          return true;
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, id, currentStepId, setLoading, updateStepData, onNext, setDirty]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  useEffect(() => {
    if (clinicId && currentStepData.length > 0) {
      const positions = [
        ...new Set(currentStepData.map((item) => item.position))
      ];
      positions.forEach((pos) => fetchStaffByPosition(pos));
      const transformedData = currentStepData.map((item) => ({
        id: item.id,
        reason: item.reason,
        absence: item.absence,
        position: item.position,
        name: item.user?.id || item.name || item.other_provider,
        key: item.id?.toString() || item.key?.toString(),
        end_time: item.end_time?.includes('m')
          ? item.end_time
          : formatTimeForUI(item.end_time),
        start_time: item.start_time?.includes('m')
          ? item.start_time
          : formatTimeForUI(item.start_time)
      }));
      setTableData(transformedData);
    }
  }, [clinicId, currentStepData]);

  useEffect(() => {
    window.addEventListener('stepNavigationSave', handleSave);
    window.addEventListener('stepNavigationNext', handleSubmit);

    return () => {
      window.removeEventListener('stepNavigationSave', handleSave);
      window.removeEventListener('stepNavigationNext', handleSubmit);
    };
  }, [handleSubmit, handleSave]);

  useEffect(() => {
    registerStepSaveHandler(currentStep, async (navigate = false) => {
      return saveData(navigate);
    });
    return () => {
      unregisterStepSaveHandler(currentStep);
    };
  }, [
    saveData,
    currentStep,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  ]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-end mb-4">
          <Button
            size="lg"
            variant="destructive"
            onClick={handleAddNew}
            className="!px-0 text-[15px] font-semibold text-[#339D5C]"
          >
            <PlusOutlined />
            Add New Absence
          </Button>
        </div>
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
