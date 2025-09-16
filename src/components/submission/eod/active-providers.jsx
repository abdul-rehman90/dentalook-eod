import React, { useEffect, useMemo, useState } from 'react';
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
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const status = form.getFieldValue('status');
  const [loading, setLoading] = useState(false);
  const clinicId = form.getFieldValue('clinic');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clinicOpenTime = form.getFieldValue('clinic_open_time');
  const clinicCloseTime = form.getFieldValue('clinic_close_time');

  console.log(tableData);

  const timeOptions = useMemo(
    () =>
      generateTimeOptions(clinicOpenTime, clinicCloseTime)[
        (clinicOpenTime, clinicCloseTime)
      ]
  );

  const columns = [
    {
      width: 50,
      title: 'Active',
      key: 'is_active',
      dataIndex: 'is_active',
      render: (_, record) => (
        <Checkbox
          checked={record.is_active}
          className="custom-checkbox"
          disabled={status === 'closed'}
          onChange={(e) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key ? { ...p, is_active: e.target.checked } : p
            );
            setTableData(updatedProviders);
          }}
        />
      )
    },
    { width: 50, key: 'type', title: 'Title', dataIndex: 'type' },
    { width: 100, key: 'name', title: 'Provider Name', dataIndex: 'name' },
    {
      width: 80,
      editable: true,
      key: 'start_time',
      title: 'Start Time',
      inputType: 'select',
      dataIndex: 'start_time',
      selectOptions: timeOptions,
      render: (_, record) => {
        // const timeOptions = generateTimeOptions(
        //   clinicOpenTime,
        //   clinicCloseTime
        // );
        console.log(timeOptions);
        return (
          <EditableCell
            type="select"
            field="start_time"
            options={timeOptions}
            recordKey={record.key}
            value={record.start_time}
            onCommit={handleCellCommit}
            disabled={!record.is_active}
          />
        );
      }
    },
    {
      width: 80,
      editable: true,
      key: 'end_time',
      title: 'End Time',
      inputType: 'select',
      dataIndex: 'end_time',
      selectOptions: timeOptions,
      render: (_, record) => {
        // const timeOptions = generateTimeOptions(
        //   clinicOpenTime,
        //   clinicCloseTime
        // );
        return (
          <EditableCell
            type="select"
            field="end_time"
            options={timeOptions}
            recordKey={record.key}
            value={record.end_time}
            onCommit={handleCellCommit}
            disabled={!record.is_active}
          />
        );
      }
    },
    {
      width: 80,
      title: 'Pt. Seen',
      key: 'number_of_patients_seen',
      render: (_, record) => (
        <EditableCell
          type="number"
          recordKey={record.key}
          onCommit={handleCellCommit}
          disabled={!record.is_active}
          field="number_of_patients_seen"
          value={record.number_of_patients_seen}
        />
      )
    },
    {
      width: 80,
      key: 'unfilled_spots',
      title: 'Unfilled (Units)',
      render: (_, record) => (
        <EditableCell
          type="number"
          field="unfilled_spots"
          recordKey={record.key}
          onCommit={handleCellCommit}
          disabled={!record.is_active}
          value={record.unfilled_spots}
        />
      )
    },
    {
      width: 80,
      key: 'no_shows',
      title: 'No Shows (Units)',
      render: (_, record) => (
        <EditableCell
          type="number"
          field="no_shows"
          recordKey={record.key}
          value={record.no_shows}
          onCommit={handleCellCommit}
          disabled={!record.is_active}
        />
      )
    },
    {
      width: 80,
      title: 'Short Ntc (Units)',
      key: 'short_notice_cancellations',
      render: (_, record) => (
        <EditableCell
          type="number"
          recordKey={record.key}
          onCommit={handleCellCommit}
          disabled={!record.is_active}
          field="short_notice_cancellations"
          value={record.short_notice_cancellations}
        />
      )
    },
    {
      width: 80,
      title: 'Failed (Units)',
      key: 'failed_appointments',
      render: (_, record) => (
        <EditableCell
          type="number"
          recordKey={record.key}
          field="failed_appointments"
          onCommit={handleCellCommit}
          disabled={!record.is_active}
          value={record.failed_appointments}
        />
      )
    }
  ];

  const handleCellCommit = (recordKey, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === recordKey ? { ...item, [field]: value } : item
      )
    );
  };

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
        type: values.user_type,
        id: response.data.user_id,
        key: response.data.user_id,
        number_of_patients_seen: null,
        short_notice_cancellations: null
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
      const { data } = await EODReportService.getProviders(clinicId);
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
          type: provider.user_type,
          short_notice_cancellations: null,
          failed_appointments: provider.failed_appointments
        }))
        .sort((a, b) => {
          if (a.type === 'DDS' && b.type !== 'DDS') return -1;
          if (a.type !== 'DDS' && b.type === 'DDS') return 1;
          return 0;
        });

      if (currentStepData?.activeProviders?.length > 0) {
        const mergedData = baseProviders.map((provider) => {
          const existingData = currentStepData.activeProviders.find(
            (item) => item.user?.id === provider.id || item.id === provider.id
          );
          return existingData
            ? {
                ...provider,
                no_shows: existingData.no_shows,
                is_active: existingData.is_active,
                unfilled_spots: existingData.unfilled_spots,
                end_time: formatTimeForUI(existingData.end_time),
                start_time: formatTimeForUI(existingData.start_time),
                failed_appointments: existingData.failed_appointments,
                number_of_patients_seen: existingData.number_of_patients_seen,
                short_notice_cancellations:
                  existingData.short_notice_cancellations
              }
            : provider;
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
      <div className="pr-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-red-500 text-xs font-semibold">
            Note: Please input the number of units for Unfilled Spots, No Shows,
            Short Notice, Failed Appts
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
        <GenericTable
          loading={loading}
          columns={columns}
          dataSource={tableData}
        />
      </div>
    </React.Fragment>
  );
}
