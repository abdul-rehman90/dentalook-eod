import React, { useEffect, useState, useCallback } from 'react';
import { Checkbox } from 'antd';
import AddModal from './add-modal';
import toast from 'react-hot-toast';
import { PlusOutlined } from '@ant-design/icons';
import { FormControl } from '@/common/utils/form-control';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import EditableCell from '@/common/components/editable-cell/editable-cell';
import {
  formatTimeForUI,
  generateTimeOptions
} from '@/common/utils/time-handling';

const providerTypes = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' },
  { value: 'RDT', label: 'RDT' }
];

const lunchBreakOptions = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hr' }
];

const GetModalContent = () => {
  return (
    <div className="add-provider-form">
      <FormControl
        required
        name="name"
        control="input"
        label="Provider FullName"
        placeholder="Enter provider name"
      />
      <FormControl
        required
        name="user_type"
        control="select"
        label="Provider Title"
        options={providerTypes}
      />
    </div>
  );
};

export default function ActiveProviders({ form, tableData, setTableData }) {
  const { setDirty, getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const status = form.getFieldValue('status');
  const [loading, setLoading] = useState(false);
  const clinicId = form.getFieldValue('clinic');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clinicOpenTime = form.getFieldValue('clinic_open_time');
  const clinicCloseTime = form.getFieldValue('clinic_close_time');

  const timeOptions = generateTimeOptions(clinicOpenTime, clinicCloseTime);

  const columns = [
    {
      width: 50,
      title: 'Active',
      key: 'is_active',
      dataIndex: 'is_active',
      render: (_, record) => {
        if (record.isRecoveryRow) {
          return (
            <div className="flex flex-col gap-1">
              <p className="text-green-600 text-nowrap">Recovered Units</p>
              <p className="text-xs text-gray-600 text-nowrap">
                (Enter by type under No Shows / Short Ntc)
              </p>
            </div>
          );
        }
        return (
          <Checkbox
            checked={record.is_active}
            className="custom-checkbox"
            disabled={status === 'closed'}
            onChange={(e) => {
              const checked = e.target.checked;
              setDirty(true);
              setTableData((prev) => {
                const updated = prev.map((p) =>
                  p.key === record.key
                    ? {
                        ...p,
                        is_active: checked,
                        no_shows: checked ? 0 : null,
                        unfilled_spots: checked ? 0 : null,
                        break_duration: checked ? null : null,
                        failed_appointments: checked ? 0 : null,
                        number_of_patients_seen: checked ? 0 : null,
                        short_notice_cancellations: checked ? 0 : null
                      }
                    : p
                );

                if (checked) {
                  // Add recovery row if provider becomes active
                  const recoveryExists = updated.find(
                    (p) => p.key === `recovery_${record.id}`
                  );
                  if (!recoveryExists) {
                    const providerIndex = updated.findIndex(
                      (p) => p.key === record.key
                    );
                    const recoveryRow = {
                      type: '',
                      no_shows: null,
                      parentId: record.id,
                      isRecoveryRow: true,
                      name: 'Recovery Units',
                      recovered_no_shows: null,
                      id: `recovery_${record.id}`,
                      key: `recovery_${record.id}`,
                      unfilled_spots: null,
                      failed_appointments: null,
                      number_of_patients_seen: null,
                      short_notice_cancellations: null,
                      recovered_short_notice_cancellations: null
                    };
                    updated.splice(providerIndex + 1, 0, recoveryRow);
                  }
                } else {
                  // Remove recovery row if provider becomes inactive
                  return updated.filter(
                    (p) => p.key !== `recovery_${record.id}`
                  );
                }

                return updated;
              });
            }}
          />
        );
      }
    },
    {
      width: 50,
      key: 'type',
      title: 'Title',
      dataIndex: 'type',
      render: (_, record) => (record.isRecoveryRow ? '' : record.type)
    },
    {
      width: 150,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name',
      render: (_, record) => (
        <span
          className={
            record.isRecoveryRow ? 'text-green-600 font-medium ml-4' : ''
          }
        >
          {record.isRecoveryRow ? '' : record.name}
        </span>
      )
    },
    {
      width: 50,
      key: 'start_time',
      title: 'Start Time',
      dataIndex: 'start_time',
      render: (_, record) => {
        if (record.isRecoveryRow) return null;
        return (
          <EditableCell
            showSearch
            type="select"
            field="start_time"
            options={timeOptions}
            recordKey={record.key}
            placeholder="Select Time"
            value={record.start_time}
            onCommit={handleCellCommit}
            disabled={!record.is_active}
          />
        );
      }
    },
    {
      width: 50,
      key: 'end_time',
      title: 'End Time',
      dataIndex: 'end_time',
      render: (_, record) => {
        if (record.isRecoveryRow) return null;
        return (
          <EditableCell
            type="select"
            field="end_time"
            options={timeOptions}
            recordKey={record.key}
            value={record.end_time}
            placeholder="Select Time"
            onCommit={handleCellCommit}
            disabled={!record.is_active}
          />
        );
      }
    },
    {
      width: 50,
      title: 'Lunch Break',
      key: 'break_duration',
      dataIndex: 'break_duration',
      render: (_, record) => {
        if (record.isRecoveryRow) return null;
        return (
          <EditableCell
            type="select"
            field="break_duration"
            recordKey={record.key}
            options={lunchBreakOptions}
            onCommit={handleCellCommit}
            disabled={!record.is_active}
            placeholder="Select Duration"
            value={record.break_duration}
          />
        );
      }
    },
    {
      width: 130,
      editable: true,
      title: 'Pt. Seen',
      inputType: 'text',
      key: 'number_of_patients_seen',
      dataIndex: 'number_of_patients_seen',
      disabled: (record) => !record.is_active || record.isRecoveryRow
    },
    {
      width: 130,
      editable: true,
      inputType: 'text',
      key: 'unfilled_spots',
      title: 'Unfilled (Units)',
      dataIndex: 'unfilled_spots',
      disabled: (record) => !record.is_active || record.isRecoveryRow
    },
    {
      width: 130,
      editable: true,
      key: 'no_shows',
      inputType: 'text',
      dataIndex: 'no_shows',
      title: 'No Shows (Units)',
      disabled: (record) => !record.is_active && !record.isRecoveryRow
    },
    {
      width: 130,
      editable: true,
      inputType: 'text',
      title: 'Short Ntc (Units)',
      key: 'short_notice_cancellations',
      dataIndex: 'short_notice_cancellations',
      disabled: (record) => !record.is_active && !record.isRecoveryRow
    },
    {
      width: 130,
      editable: true,
      inputType: 'text',
      title: 'Failed (Units)',
      key: 'failed_appointments',
      dataIndex: 'failed_appointments',
      disabled: (record) => !record.is_active || record.isRecoveryRow
    }
  ];

  const handleCellCommit = useCallback((recordKey, field, value) => {
    setDirty(true);
    setTableData((prev) => {
      const updated = [...prev];
      const recordIndex = updated.findIndex((item) => item.key === recordKey);
      if (recordIndex !== -1) {
        updated[recordIndex] = { ...updated[recordIndex], [field]: value };
      }
      return updated;
    });
  }, []);

  const handleCellChange = useCallback((record, dataIndex, value) => {
    setDirty(true);
    setTableData((prev) => {
      const updated = [...prev];
      const recordIndex = updated.findIndex((item) => item.key === record.key);

      if (recordIndex !== -1) {
        if (record.isRecoveryRow) {
          // For recovery rows, update both the display field and the recovery field
          const recoveryField =
            dataIndex === 'no_shows'
              ? 'recovered_no_shows'
              : 'recovered_short_notice_cancellations';
          updated[recordIndex] = {
            ...updated[recordIndex],
            [dataIndex]: value,
            [recoveryField]: value
          };

          // Update parent provider with recovery data
          const parentIndex = updated.findIndex(
            (item) => item.id === record.parentId
          );
          if (parentIndex !== -1) {
            updated[parentIndex] = {
              ...updated[parentIndex],
              [recoveryField]: value
            };
          }
        } else {
          updated[recordIndex] = {
            ...updated[recordIndex],
            [dataIndex]: value
          };
        }
      }

      return updated;
    });
  }, []);

  const addNewProvider = async (values) => {
    const payload = {
      ...values,
      clinic_id: clinicId
    };
    const response = await EODReportService.addNewProvider(payload);
    if (response.status === 201) {
      const newProvider = {
        no_shows: null,
        end_time: null,
        start_time: null,
        is_active: false,
        name: values.name,
        unfilled_spots: null,
        break_duration: null,
        type: values.user_type,
        id: response.data.user_id,
        key: response.data.user_id,
        number_of_patients_seen: null,
        short_notice_cancellations: null,
        recovered_no_shows: null,
        recovered_short_notice_cancellations: null
      };
      toast.success('Record is successfully saved');
      setTableData((prev) => {
        const updatedProviders = [newProvider, ...prev];
        return updatedProviders.sort((a, b) => {
          if (a.type === 'DDS' && b.type !== 'DDS') return -1;
          if (a.type !== 'DDS' && b.type === 'DDS') return 1;
          return 0;
        });
      });
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data } = await EODReportService.getProviders(clinicId, true);
      const baseProviders = data.providers
        .map((provider) => ({
          no_shows: null,
          end_time: null,
          id: provider.id,
          start_time: null,
          key: provider.id,
          is_active: false,
          name: provider.name,
          unfilled_spots: null,
          break_duration: null,
          type: provider.user_type,
          recovered_no_shows: null,
          short_notice_cancellations: null,
          recovered_short_notice_cancellations: null,
          failed_appointments: provider.failed_appointments
        }))
        .sort((a, b) => {
          if (a.type === 'DDS' && b.type !== 'DDS') return -1;
          if (a.type !== 'DDS' && b.type === 'DDS') return 1;
          return 0;
        });

      if (currentStepData?.activeProviders?.length > 0) {
        const mergedData = [];
        baseProviders.forEach((provider) => {
          const existingData = currentStepData.activeProviders.find(
            (item) => item.user?.id === provider.id || item.id === provider.id
          );
          const updatedProvider = existingData
            ? {
                ...provider,
                no_shows: existingData.no_shows,
                is_active: existingData.is_active,
                unfilled_spots: existingData.unfilled_spots,
                break_duration: existingData.break_duration,
                end_time: formatTimeForUI(existingData.end_time),
                start_time: formatTimeForUI(existingData.start_time),
                failed_appointments: existingData.failed_appointments,
                number_of_patients_seen: existingData.number_of_patients_seen,
                short_notice_cancellations:
                  existingData.short_notice_cancellations,
                recovered_no_shows: existingData.recovered_no_shows,
                recovered_short_notice_cancellations:
                  existingData.recovered_short_notice_cancellations
              }
            : provider;

          mergedData.push(updatedProvider);

          // Add recovery row if provider is active
          if (updatedProvider.is_active) {
            mergedData.push({
              type: '',
              isRecoveryRow: true,
              parentId: provider.id,
              name: 'Recovery Units',
              id: `recovery_${provider.id}`,
              key: `recovery_${provider.id}`,
              no_shows: updatedProvider.recovered_no_shows,
              short_notice_cancellations:
                updatedProvider.recovered_short_notice_cancellations,
              recovered_no_shows: updatedProvider.recovered_no_shows,
              recovered_short_notice_cancellations:
                updatedProvider.recovered_short_notice_cancellations
            });
          }
        });
        setTableData(mergedData);
      } else {
        setTableData(baseProviders);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [clinicId]);

  return (
    <React.Fragment>
      <AddModal
        visible={isModalOpen}
        onSubmit={addNewProvider}
        onCancel={() => setIsModalOpen(false)}
      >
        <GetModalContent />
      </AddModal>
      <div className="pr-6 border-t-1 border-t-secondary-50 pt-6">
        <h2 className="text-xl font-medium mb-2">Active Providers</h2>
        <div className="flex items-center justify-between mb-4">
          <p className="text-red-500 text-xs font-medium">
            (Note: Please input the number of units for Unfilled Spots, No
            Shows, Short Notice, Failed Appts)
          </p>
          <Button
            size="lg"
            variant="destructive"
            onClick={() => setIsModalOpen(true)}
            className="!px-0 text-[15px] font-semibold text-[#339D5C]"
          >
            <PlusOutlined />
            Add New Provider
          </Button>
        </div>
        <div>
          <GenericTable
            stickyHeader
            loading={loading}
            columns={columns}
            dataSource={tableData}
            onCellChange={handleCellChange}
          />
        </div>
      </div>
    </React.Fragment>
  );
}
