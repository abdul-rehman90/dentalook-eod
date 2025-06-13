import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Form, Modal, Typography } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const { Title, Text } = Typography;

export default function DailyProduction({ onNext }) {
  const [form] = Form.useForm();
  const [goal, setGoal] = useState(0);
  const [providers, setProviders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providerOptions, setProviderOptions] = useState([]);
  const { steps, reportData, currentStep, updateStepData, getCurrentStepData } =
    useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinic;
  const provinceId = reportData?.eod?.basic?.province;
  const isClinicClosed = reportData?.eod?.basic?.status === 'closed';

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
        totalProduction: `${totalProduction.toLocaleString()}`,
        DDS: `${totalDDS.toLocaleString()}`,
        RDH: `${totalRDH.toLocaleString()}`,
        goal: `${goal.toLocaleString()}`,
        '+/-': `${difference.toLocaleString()}`
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

  const addProvider = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        clinic_id: clinicId,
        province_id: provinceId,
        provider_title: values.provider_title
      };
      const response = await EODReportService.addNewProvider(payload);
      if (response.status === 201) {
        fetchProviders();
        setIsModalOpen(false);
        toast.success('Record is successfully saved');
        form.setFieldsValue({ name: undefined, provider_title: undefined });
      }
    } catch (error) {}
  };

  const createProduction = async () => {
    try {
      const payload = providers.map((item) => ({
        ...item,
        user: 3037,
        eodsubmission: 1
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

  // const handleDelete = (key) => {
  //   setTableData(tableData.filter((item) => item.key !== key));
  // };

  const fetchProviders = async () => {
    try {
      const { data } = await EODReportService.getProviders();
      setProviders(
        data.slice(0, 5).map((provider) => ({
          id: provider.id,
          key: provider.id,
          name: provider.name,
          type: provider.provider_type
        }))
      );
    } catch (error) {}
  };

  const fetchTargetGoal = async () => {
    try {
      const response = await EODReportService.getTargetGoalByClinicId(clinicId);
      setGoal(response.data.submission_month_target);
    } catch (error) {}
  };

  const fetchProduction = async () => {
    try {
      const response = await EODReportService.getProduction();
      // console.log(response);
    } catch (error) {}
  };

  const getProvinceData = async () => {
    if (!provinceId) return;

    try {
      const { data } = await EODReportService.getDataOfProvinceById(provinceId);
      setProviderOptions(
        data.users.map((user) => ({
          value: user.id,
          label: user.provider_type
        }))
      );
      form.setFieldsValue({
        province: data.province,
        clinic_id: data.clinics.find((item) => item.id === clinicId).name
      });
    } catch (error) {}
  };

  useEffect(() => {
    fetchProviders();
    fetchTargetGoal();
    // fetchProduction();
    getProvinceData();
  }, []);

  return (
    <React.Fragment>
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
        <Modal
          centered
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          title={
            <div className="p-4">
              <Title
                level={4}
                style={{
                  marginBottom: 0,
                  fontWeight: 500,
                  color: '#030303'
                }}
              >
                Add New Provider
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#484A54'
                }}
              >
                Step 2 of 8 - Daily Productivity
              </Text>
            </div>
          }
          footer={
            <div className="p-4 flex items-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-9 !shadow-none text-black !rounded-lg"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={addProvider}
                className="h-9 !shadow-none text-black !rounded-lg"
              >
                Create
              </Button>
            </div>
          }
        >
          <Form form={form}>
            <FormControl
              disabled
              name="province"
              control="input"
              label="Province"
            />
            <FormControl
              disabled
              control="input"
              name="clinic_id"
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
              options={providerOptions}
            />
          </Form>
        </Modal>
      </div>
      <StepNavigation onNext={createProduction} />
    </React.Fragment>
  );
}
