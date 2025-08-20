import React, { useEffect, useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function ClinicalUpgrade({ onNext }) {
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 150,
      key: 'items',
      title: 'Item',
      disabled: true,
      editable: true,
      dataIndex: 'items',
      inputType: 'text'
    },
    {
      width: 150,
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
        items: item.items,
        comments: item.comments,
        key: item.id.toString()
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
