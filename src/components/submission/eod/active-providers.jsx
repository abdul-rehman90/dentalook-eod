import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import AddModal from './add-modal';
import toast from 'react-hot-toast';
import { Checkbox, TimePicker } from 'antd';
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
  const { steps, reportData, currentStep, updateStepData, getCurrentStepData } =
    useGlobalContext();
  const currentStepData = getCurrentStepData();
  const [providers, setProviders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clinicId = reportData?.eod?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;
  const provinceId = reportData?.eod?.basic?.province;
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

    // Disable minutes before open time for the opening hour
    const disabledMinutes = (hour) => {
      if (hour === openTime.hour()) {
        return Array.from({ length: openTime.minute() }, (_, i) => i);
      }
      // Disable minutes after close time for the closing hour
      if (hour === closeTime.hour()) {
        return Array.from(
          { length: 60 - closeTime.minute() - 1 },
          (_, i) => i + closeTime.minute() + 1
        );
      }
      return [];
    };

    return {
      disabledHours: disabledHours,
      disabledMinutes: disabledMinutes,
      disabledSeconds: () => []
    };
  };

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
      width: 150,
      title: 'Active',
      key: 'is_active',
      dataIndex: 'is_active',
      render: (_, record) => (
        <Checkbox
          disabled={isClinicClosed}
          checked={record.is_active}
          className="custom-checkbox"
          onChange={(e) => {
            const updatedProviders = providers.map((p) =>
              p.key === record.key ? { ...p, is_active: e.target.checked } : p
            );
            setProviders(updatedProviders);
          }}
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
          format="HH:mm"
          showNow={false}
          hideDisabledOptions
          inputReadOnly={true}
          value={record.start_time}
          disabledTime={disabledTime}
          disabled={!record.is_active}
          onChange={(time) => {
            const updatedProviders = providers.map((p) =>
              p.key === record.key ? { ...p, start_time: time } : p
            );
            setProviders(updatedProviders);
          }}
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
          format="HH:mm"
          showNow={false}
          hideDisabledOptions
          inputReadOnly={true}
          value={record.end_time}
          disabledTime={disabledTime}
          disabled={!record.is_active}
          onChange={(time) => {
            const updatedProviders = providers.map((p) =>
              p.key === record.key ? { ...p, end_time: time } : p
            );
            setProviders(updatedProviders);
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
          name="type"
          control="select"
          label="Provider Type"
          options={providerTypes}
        />
      </React.Fragment>
    );
  };

  const addNewProvider = async (values) => {
    const payload = {
      name: values.name,
      clinic_id: clinicId,
      province_id: provinceId,
      provider_title: values.type
    };
    const response = await EODReportService.addNewProvider(payload);
    if (response.status === 201) {
      fetchProviders();
      toast.success('Record is successfully saved');
    }
  };

  const addActiveProviders = async () => {
    try {
      const payload = providers.map((provider) => ({
        ...provider,
        user: provider.id
      }));
      const response = await EODReportService.addActiveProviders(payload);
      if (response.status === 201) {
        updateStepData(currentStepId, providers);
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {}
  };

  const fetchProviders = async () => {
    try {
      const { data } = await EODReportService.getProviders(clinicId, 'False');
      setProviders(
        data.providers.map((provider) => ({
          id: provider.id,
          key: provider.id,
          name: provider.name,
          type: provider.user_type,
          end_time: null,
          start_time: null,
          is_active: false
        }))
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (currentStepData.length > 0) {
      return setProviders(currentStepData);
    }
    fetchProviders();
  }, []);

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
        <GenericTable columns={columns} dataSource={providers} />
      </div>
      <StepNavigation onNext={addActiveProviders} />
    </React.Fragment>
  );
}
