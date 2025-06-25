import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import AddModal from './add-modal';
import toast from 'react-hot-toast';
import { Checkbox, Input, TimePicker } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const providerTypes = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' }
];

export default function ActiveProviders({ onNext }) {
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
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clinicId = reportData?.eod?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;
  const clinicOpenTime = reportData?.eod?.basic?.clinic_open_time;
  const clinicCloseTime = reportData?.eod?.basic?.clinic_close_time;
  const isClinicClosed = reportData?.eod?.basic?.status === 'closed';

  // Convert to dayjs objects for comparison
  const openTime = clinicOpenTime ? dayjs(clinicOpenTime, 'HH:mm') : null;
  const closeTime = clinicCloseTime ? dayjs(clinicCloseTime, 'HH:mm') : null;

  const disabledTime = (current) => {
    if (!openTime || !closeTime) return {};

    // Disable hours before open time and after close time
    const disabledHours = () => {
      const hours = [];
      for (let i = 0; i < 24; i++) {
        if (i < openTime.hour() || i > closeTime.hour()) {
          hours.push(i);
        }
      }
      return hours;
    };

    return {
      disabledHours: disabledHours,
      disabledSeconds: () => []
    };
  };

  const columns = [
    {
      width: 50,
      key: 'type',
      title: 'Type',
      dataIndex: 'type'
    },
    {
      width: 150,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name'
    },
    {
      width: 50,
      title: 'Active',
      key: 'is_active',
      dataIndex: 'is_active',
      render: (_, record) => (
        <Checkbox
          disabled={isClinicClosed}
          checked={record.is_active}
          className="custom-checkbox"
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
          disabledTime={disabledTime}
          disabled={!record.is_active}
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
          disabledTime={disabledTime}
          disabled={!record.is_active}
          onChange={(time) => {
            const updatedProviders = tableData.map((p) =>
              p.key === record.key ? { ...p, end_time: time } : p
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
      key: 'short_notice_cancellations',
      title: 'Short Notice Cancellations',
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
      <React.Fragment>
        <FormControl
          required
          name="name"
          control="input"
          label="Provider Name"
          placeholder="Enter provider name"
        />
        <FormControl
          required
          name="user_type"
          control="select"
          label="Provider Type"
          options={providerTypes}
        />
      </React.Fragment>
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
        no_shows: '',
        end_time: null,
        start_time: null,
        is_active: false,
        unfilled_spots: '',
        name: values.name,
        type: values.user_type,
        id: response.data.user_id,
        key: response.data.user_id,
        number_of_patients_seen: null,
        short_notice_cancellations: ''
      };
      toast.success('Record is successfully saved');
      setTableData((prev) => [...prev, newProvider]);
    }
  };

  const handleSubmit = async () => {
    const activeProviders = tableData.filter((provider) => provider.is_active);
    const invalidProviders = tableData.filter(
      (provider) =>
        provider.is_active && (!provider.start_time || !provider.end_time)
    );

    // If no active providers, just go to next step
    if (activeProviders.length === 0) {
      updateStepData(currentStepId, tableData);
      onNext();
      return;
    }

    if (invalidProviders.length > 0) {
      toast.error(
        'Please set both start and end times for all active providers'
      );
      return;
    }

    try {
      setLoading(true);
      const payload = activeProviders.map((provider) => ({
        ...provider,
        user: provider.id,
        eod_submission: Number(id)
      }));
      const response = await EODReportService.addActiveProviders(payload);
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

  const fetchProviders = async () => {
    try {
      const { data } = await EODReportService.getProviders(clinicId);
      const baseProviders = data.providers.map((provider) => ({
        no_shows: '',
        end_time: null,
        id: provider.id,
        start_time: null,
        key: provider.id,
        is_active: false,
        unfilled_spots: '',
        name: provider.name,
        type: provider.user_type,
        short_notice_cancellations: ''
      }));

      if (currentStepData?.length > 0) {
        const mergedData = baseProviders.map((provider) => {
          const existingData = currentStepData.find(
            (item) => item.user?.id === provider.id || item.id === provider.id
          );
          return existingData
            ? {
                ...provider,
                no_shows: existingData.no_shows,
                is_active: existingData.is_active,
                unfilled_spots: existingData.unfilled_spots,
                number_of_patients_seen: existingData.number_of_patients_seen,
                short_notice_cancellations:
                  existingData.short_notice_cancellations,
                end_time: existingData.end_time
                  ? dayjs(existingData.end_time)
                  : null,
                start_time: existingData.start_time
                  ? dayjs(existingData.start_time)
                  : null
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
    if (clinicId) fetchProviders();
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
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-medium text-black">Active Providers</h1>
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Provider
          </Button>
        </div>
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
