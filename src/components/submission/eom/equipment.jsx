import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import Image from 'next/image';
import { DatePicker } from 'antd';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { PlusOutlined } from '@ant-design/icons';
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
            allowClear={false}
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
    ...(tableData.length > 1
      ? [
          {
            width: 50,
            key: 'action',
            title: 'Action',
            render: (_, record) => (
              <Button
                size="icon"
                className="ml-3"
                variant="destructive"
                onClick={() =>
                  setTableData(
                    tableData.filter((item) => item.key !== record.key)
                  )
                }
              >
                <Image src={Icons.cross} alt="cross" />
              </Button>
            )
          }
        ]
      : [])
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
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

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const rowsWithMissingData = tableData.filter(
          (item) =>
            item.equipment_repairs && (!item.purchase_or_repair || !item.cost)
        );

        if (rowsWithMissingData.length > 0) {
          toast.error(
            'Please complete all required fields: ' +
              'When Equipment is provided, both Purchase/Repair type and Cost must be specified'
          );
          return;
        }

        const payload = tableData
          .filter(
            (item) =>
              item.equipment_repairs && item.purchase_or_repair && item.cost
          )
          .map((item) => ({
            ...item,
            submission: id,
            last_maintenance_date: item.last_maintenance_date
              ? dayjs(item.last_maintenance_date).format('YYYY-MM-DD')
              : null
          }));

        if (payload.length > 0) {
          setLoading(true);
          const response = await EOMReportService.addEquipment(payload);
          if (response.status === 201) {
            updateStepData(currentStepId, tableData);
            toast.success('Record is successfully saved');
            if (navigate) {
              onNext();
            }
          }
        } else {
          updateStepData(currentStepId, tableData);
          if (navigate) {
            onNext();
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, id, currentStepId, setLoading, updateStepData]
  );

  const handleSubmit = useCallback(async () => {
    await saveData(true); // Save and navigate
  }, [saveData]);

  const handleSave = useCallback(async () => {
    await saveData(false); // Save without navigation
  }, [saveData]);

  useEffect(() => {
    if (clinicId && currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        cost: item.cost,
        comments: item.comments,
        equipment_repairs: item.equipment_repairs,
        purchase_or_repair: item.purchase_or_repair,
        key: item.id?.toString() || item.key?.toString(),
        last_maintenance_date: item.last_maintenance_date
          ? dayjs(item.last_maintenance_date)
          : null
      }));
      setTableData(transformedData);
    }
  }, [clinicId]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', handleSubmit);
    window.addEventListener('stepNavigationSave', handleSave);

    return () => {
      window.removeEventListener('stepNavigationNext', handleSubmit);
      window.removeEventListener('stepNavigationSave', handleSave);
    };
  }, [handleSubmit, handleSave]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-end mb-4">
          <Button
            size="lg"
            variant="destructive"
            onClick={handleAddNew}
            className="!px-0 text-[15px] font-semibold text-[#339D5C]"
          >
            <PlusOutlined />
            Add New Equipment
          </Button>
        </div>
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
