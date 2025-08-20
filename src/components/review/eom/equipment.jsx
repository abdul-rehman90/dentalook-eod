import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const typeOptions = [
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Repair', label: 'Repair' }
];

export default function EquipmentRepairs({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 100,
      key: 'item',
      title: 'Item',
      editable: true,
      disabled: true,
      dataIndex: 'item',
      inputType: 'text'
    },
    {
      width: 150,
      disabled: true,
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
            disabled
            format="ddd, MMM D, YYYY"
            placeholder="Select Date"
            value={record.last_maintenance_date}
          />
        </div>
      )
    },
    {
      width: 50,
      key: 'cost',
      title: 'Cost',
      disabled: true,
      editable: true,
      dataIndex: 'cost',
      inputType: 'number'
    },
    {
      width: 150,
      disabled: true,
      editable: true,
      key: 'comments',
      title: 'Comments',
      inputType: 'text',
      dataIndex: 'comments'
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        cost: item.cost,
        key: item.id.toString(),
        comments: item.comments,
        item: item.equipment_repairs,
        purchase_or_repair: item.purchase_or_repair,
        last_maintenance_date: dayjs(item.last_maintenance_date)
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', onNext);
    return () => {
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [onNext]);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation
        onNext={onNext}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
