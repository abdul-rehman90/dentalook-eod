import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import AddModal from './add-modal';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
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

export default function DailyProduction({ onNext }) {
  const [goal, setGoal] = useState(0);
  const [providers, setProviders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { provinces, reportData, submissionId } = useGlobalContext();
  const clinicId = reportData?.eod?.basic?.clinic;
  const provinceId = reportData?.eod?.basic?.province;
  const clinicName = reportData?.eod?.basic?.clinic_name || '';
  const isClinicClosed = reportData?.eod?.basic?.status === 'closed';
  const provinceName =
    provinces.find((province) => province.value === provinceId)?.label || '';

  const initialValues = {
    clinic_id: clinicName,
    province: provinceName
  };

  const summaryData = useMemo(() => {
    const totalDDS = providers
      .filter((item) => item.type === 'DDS')
      .reduce((sum, item) => sum + (Number(item.production_amount) || 0), 0);

    const totalRDH = providers
      .filter((item) => item.type === 'RDH')
      .reduce((sum, item) => sum + (Number(item.production_amount) || 0), 0);

    const totalProduction = totalDDS + totalRDH;
    const difference = totalProduction - goal;

    return [
      {
        key: 'summary',
        goal: `${goal.toLocaleString()}`,
        DDS: `${totalDDS.toLocaleString()}`,
        RDH: `${totalRDH.toLocaleString()}`,
        '+/-': `${difference.toLocaleString()}`,
        totalProduction: `${totalProduction.toLocaleString()}`
      }
    ];
  }, [providers, goal]);

  const totalProductionColumns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => 'Production ($):'
    },
    {
      key: 'totalProduction',
      title: 'Total Production',
      dataIndex: 'totalProduction'
    },
    {
      key: 'DDS',
      dataIndex: 'DDS',
      title: 'Total (DDS)'
    },
    {
      key: 'RDH',
      dataIndex: 'RDH',
      title: 'Total (RDH)'
    },
    {
      key: 'goal',
      dataIndex: 'goal',
      title: 'Target (Goal)'
    },
    {
      key: '+/-',
      title: '+/-',
      dataIndex: '+/-'
    }
  ];

  const providersColumns = [
    {
      width: 150,
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
      render: (type) => type || 'N/A'
    },
    {
      width: 150,
      key: 'name',
      dataIndex: 'name',
      title: 'Provider Name',
      render: (name) => name || 'N/A'
    },
    {
      width: 150,
      editable: true,
      inputType: 'number',
      title: 'Production',
      disabled: isClinicClosed,
      key: 'production_amount',
      dataIndex: 'production_amount'
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
      render: (_, record) => (
        <Button
          size="icon"
          className="ml-3"
          variant="destructive"
          // onClick={() => handleDelete(record.id)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const GetModalContent = () => {
    return (
      <React.Fragment>
        <FormControl
          disabled
          name="province"
          control="input"
          label="Province"
          // value={provinceName}
        />
        <FormControl
          disabled
          control="input"
          name="clinic_id"
          // value={clinicName}
          label="Practice Name"
        />
        <FormControl
          required
          name="name"
          control="input"
          label="Provider Name"
        />
        <FormControl
          required
          control="select"
          name="provider_title"
          label="Provider Title"
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
      provider_title: values.provider_title
    };
    const response = await EODReportService.addNewProvider(payload);
    if (response.status === 201) {
      fetchProviders();
      toast.success('Record is successfully saved');
    }
  };

  const createProduction = async () => {
    try {
      const payload = providers.map((item) => ({
        ...item,
        user: item.id,
        eodsubmission: submissionId
      }));
      const response = await EODReportService.addProduction(payload);
      if (response.status === 201) {
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {}
  };

  const handleCellChange = (record, dataIndex, value) => {
    setProviders(
      providers.map((item) =>
        item.key === record.key
          ? {
              ...item,
              [dataIndex]: dataIndex === 'production' ? Number(value) : value
            }
          : item
      )
    );
  };

  const fetchTargetGoal = async () => {
    try {
      const response = await EODReportService.getTargetGoalByClinicId(clinicId);
      setGoal(response.data.submission_month_target);
    } catch (error) {}
  };

  const fetchProviders = async () => {
    try {
      const { data } = await EODReportService.getProviders(clinicId, 'True');
      setProviders(
        data.providers.map((provider) => ({
          id: provider.id,
          key: provider.id,
          name: provider.name,
          type: provider.user_type
        }))
      );
    } catch (error) {}
  };

  useEffect(() => {
    fetchProviders();
    fetchTargetGoal();
  }, []);

  return (
    <React.Fragment>
      <AddModal
        visible={isModalOpen}
        onSubmit={addNewProvider}
        initialValues={initialValues}
        onCancel={() => setIsModalOpen(false)}
      >
        <GetModalContent />
      </AddModal>
      <div className="flex flex-col gap-6 px-6">
        <GenericTable
          dataSource={summaryData}
          columns={totalProductionColumns}
        />
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-medium text-black">
              Daily Production ($)
            </h1>
            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Add New Provider
            </Button>
          </div>
          <GenericTable
            dataSource={providers}
            columns={providersColumns}
            onCellChange={handleCellChange}
          />
        </div>
      </div>
      <StepNavigation onNext={createProduction} />
    </React.Fragment>
  );
}
