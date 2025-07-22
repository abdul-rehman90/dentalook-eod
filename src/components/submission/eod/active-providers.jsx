import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import AddModal from './add-modal';
import toast from 'react-hot-toast';
import { Checkbox, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FormControl } from '@/common/utils/form-control';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { formatTimeForUI } from '@/common/utils/time-handling';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';

const providerTypes = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' }
];

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

export default function ActiveProviders({ form, tableData, setTableData }) {
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const status = form.getFieldValue('status');
  const clinicId = form.getFieldValue('clinic');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clinicOpenTime = form.getFieldValue('clinic_open_time');
  const clinicCloseTime = form.getFieldValue('clinic_close_time');

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
    {
      width: 50,
      key: 'type',
      title: 'Title',
      dataIndex: 'type'
    },
    {
      width: 150,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name'
    },
    {
      width: 100,
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
            options={timeOptions}
            placeholder="Select one"
            value={record.start_time}
            style={{ width: '100%' }}
            disabled={!record.is_active}
            onChange={(value) => {
              const updatedProviders = tableData.map((p) =>
                p.key === record.key
                  ? {
                      ...p,
                      start_time: value
                    }
                  : p
              );
              setTableData(updatedProviders);
            }}
          />
        );
      }
    },
    {
      width: 100,
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
            options={timeOptions}
            value={record.end_time}
            placeholder="Select one"
            style={{ width: '100%' }}
            disabled={!record.is_active}
            onChange={(value) => {
              const updatedProviders = tableData.map((p) =>
                p.key === record.key
                  ? {
                      ...p,
                      end_time: value
                    }
                  : p
              );
              setTableData(updatedProviders);
            }}
          />
        );
      }
    },
    {
      width: 50,
      title: 'Patients Seen',
      key: 'number_of_patients_seen',
      dataIndex: 'number_of_patients_seen',
      render: (_, record) => (
        <Input
          type="number"
          disabled={!record.is_active}
          value={record.number_of_patients_seen || ''}
          onChange={(e) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key
                ? {
                    ...p,
                    number_of_patients_seen: e.target.value
                      ? parseInt(e.target.value)
                      : null
                  }
                : p
            );
            setTableData(updatedProviders);
          }}
        />
      )
    },
    {
      width: 50,
      key: 'unfilled_spots',
      title: 'Unfilled Spots',
      dataIndex: 'unfilled_spots',
      render: (_, record) => (
        <Input
          type="number"
          disabled={!record.is_active}
          value={record.unfilled_spots}
          onChange={(e) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key
                ? {
                    ...p,
                    unfilled_spots: e.target.value
                      ? parseInt(e.target.value)
                      : null
                  }
                : p
            );
            setTableData(updatedProviders);
          }}
        />
      )
    },
    {
      width: 50,
      key: 'no_shows',
      title: 'No Shows',
      dataIndex: 'no_shows',
      render: (_, record) => (
        <Input
          type="number"
          value={record.no_shows}
          disabled={!record.is_active}
          onChange={(e) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key
                ? {
                    ...p,
                    no_shows: e.target.value ? parseInt(e.target.value) : null
                  }
                : p
            );
            setTableData(updatedProviders);
          }}
        />
      )
    },
    {
      width: 50,
      title: 'Short Notice',
      key: 'short_notice_cancellations',
      dataIndex: 'short_notice_cancellations',
      render: (_, record) => (
        <Input
          type="number"
          disabled={!record.is_active}
          value={record.short_notice_cancellations}
          onChange={(e) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key
                ? {
                    ...p,
                    short_notice_cancellations: e.target.value
                      ? parseInt(e.target.value)
                      : null
                  }
                : p
            );
            setTableData(updatedProviders);
          }}
        />
      )
    }
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
          short_notice_cancellations: null
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
    } catch (error) {}
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
        <div className="flex items-center justify-end mb-4">
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
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
    </React.Fragment>
  );
}
