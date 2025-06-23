import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Image from 'next/image';
import { DatePicker } from 'antd';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const typeOptions = [
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Repair', label: 'Repair' }
];

const defaultRow = {
  key: 1,
  cost: '',
  comments: '',
  equipment_repairs: '',
  purchase_or_repair: '',
  last_maintenance_date: null
};

export default function EquipmentRepairs({ onNext }) {
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    id,
    steps,
    setLoading,
    reportData,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const clinicId = reportData?.eom?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;

  const columns = [
    {
      width: 100,
      title: 'Item',
      editable: true,
      inputType: 'text',
      key: 'equipment_repairs',
      dataIndex: 'equipment_repairs'
    },
    {
      width: 150,
      editable: true,
      inputType: 'select',
      key: 'purchase_or_repair',
      selectOptions: typeOptions,
      title: 'Purchase or Repair?',
      dataIndex: 'purchase_or_repair'
    },
    {
      width: 150,
      key: 'last_maintenance_date',
      title: 'Last Maintenance Date?',
      dataIndex: 'last_maintenance_date',
      render: (_, record) => (
        <div className="h-full">
          <DatePicker
            format="ddd, MMM D, YYYY"
            placeholder="Select Date"
            value={record.last_maintenance_date}
            onChange={(date) =>
              handleCellChange(record, 'last_maintenance_date', date)
            }
          />
        </div>
      )
    },
    {
      width: 50,
      key: 'cost',
      title: 'Cost',
      editable: true,
      dataIndex: 'cost',
      inputType: 'number'
    },
    {
      width: 150,
      editable: true,
      key: 'comments',
      title: 'Comments',
      inputType: 'text',
      dataIndex: 'comments'
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

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleDelete = (key) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((item) => item.key !== key));
    }
  };

  const handleAddNew = () => {
    const newKey =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.key)) + 1
        : 1;
    const newItem = {
      cost: '',
      key: newKey,
      comments: '',
      equipment_repairs: '',
      purchase_or_repair: '',
      last_maintenance_date: null
    };
    setTableData([...tableData, newItem]);
  };

  const handleSubmit = async () => {
    try {
      const payload = tableData
        .filter(
          (item) =>
            item.equipment_repairs && item.purchase_or_repair && item.cost
        )
        .map((item) => ({
          ...item,
          submission: id,
          last_maintenance_date: dayjs(item.last_maintenance_date).format(
            'YYYY-MM-DD'
          )
        }));

      if (payload.length > 0) {
        setLoading(true);
        const response = await EOMReportService.addEquipment(payload);
        if (response.status === 201) {
          updateStepData(currentStepId, tableData);
          toast.success('Record is successfully saved');
          onNext();
        }
        return;
      }
      updateStepData(currentStepId, tableData);
      onNext();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId && currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        cost: item.cost,
        comments: item.comments,
        equipment_repairs: item.equipment_repairs,
        purchase_or_repair: item.purchase_or_repair,
        key: item.id?.toString() || item.key?.toString(),
        last_maintenance_date: dayjs(item.last_maintenance_date)
      }));
      setTableData(transformedData);
    }
  }, [clinicId]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-medium text-black">
            Equipment/Repairs
          </h1>
          <Button
            size="lg"
            onClick={handleAddNew}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Equipment
          </Button>
        </div>
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
