import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Checkbox, TimePicker } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ActiveProviders({ onNext }) {
  const { steps, reportData, currentStep, updateStepData } = useGlobalContext();
  const [providers, setProviders] = useState([]);
  const clinicId = reportData?.eod?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;

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
          inputReadOnly={true}
          value={record.start_time}
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
          inputReadOnly={true}
          value={record.end_time}
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

  const handleActiveProviders = async () => {
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
    fetchProviders();
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="mb-4">
          <h1 className="text-base font-medium text-black">Active Providers</h1>
        </div>
        <GenericTable columns={columns} dataSource={providers} />
      </div>
      <StepNavigation onNext={handleActiveProviders} />
    </React.Fragment>
  );
}
