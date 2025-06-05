import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Form, Modal, Typography } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const { Title, Text } = Typography;

const selectOptions = [
  { value: 'california', label: 'California' },
  { value: 'new_york', label: 'New York' },
  { value: 'texas', label: 'Texas' },
  { value: 'florida', label: 'Florida' }
];

const providerTypeOptions = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' }
];

export default function DailyProduction({ onNext }) {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goal, setGoal] = useState(6367);

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalDDS = tableData
      .filter((item) => item.type === 'DDS')
      .reduce((sum, item) => sum + (Number(item.production) || 0), 0);

    const totalRDH = tableData
      .filter((item) => item.type === 'RDH')
      .reduce((sum, item) => sum + (Number(item.production) || 0), 0);

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
  }, [tableData, goal]);

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

  const dailyProductionColumns = [
    {
      width: 150,
      key: 'type',
      title: 'Type',
      dataIndex: 'type'
    },
    {
      width: 150,
      key: 'providerName',
      title: 'Provider Name',
      dataIndex: 'providerName'
    },
    {
      width: 150,
      editable: true,
      key: 'production',
      inputType: 'number',
      title: 'Production',
      dataIndex: 'production'
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
          onClick={() => handleDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const createProduction = () => {
    form
      .validateFields()
      .then((values) => {
        const newData = {
          key: Date.now().toString(),
          province: values.province,
          type: values.provider_title,
          providerName: values.provider_name,
          practiceName: values.practice_name,
          production: Number(values.production)
        };
        setTableData([...tableData, newData]);

        form.resetFields();
        setIsModalOpen(false);
      })
      .catch((err) => {
        return;
      });
  };

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key
          ? {
              ...item,
              [dataIndex]: dataIndex === 'production' ? Number(value) : value
            }
          : item
      )
    );
  };

  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

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
              onClick={() => {
                form.resetFields();
                setIsModalOpen(true);
              }}
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Add New Provider
            </Button>
          </div>
          <GenericTable
            dataSource={tableData}
            onCellChange={handleCellChange}
            columns={dailyProductionColumns}
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
                onClick={createProduction}
                className="h-9 !shadow-none text-black !rounded-lg"
              >
                Create
              </Button>
            </div>
          }
        >
          <Form form={form}>
            <FormControl
              name="province"
              control="select"
              label="Province"
              options={selectOptions}
            />
            <FormControl
              control="input"
              name="practice_name"
              label="Practice Name"
            />
            <FormControl
              required
              control="input"
              name="provider_name"
              label="Provider Name"
            />
            <FormControl
              required
              control="select"
              name="provider_title"
              label="Provider Title"
              options={providerTypeOptions}
            />
          </Form>
        </Modal>
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
