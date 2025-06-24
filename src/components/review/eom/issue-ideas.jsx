import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const categoryOptions = [
  { value: 'Issue', label: 'Issue' },
  { value: 'Idea', label: 'Idea' }
];

export default function IssuesIdeas() {
  const router = useRouter();
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const [tableData, setTableData] = useState([]);

  const columns = [
    {
      width: 100,
      disabled: true,
      editable: true,
      key: 'category',
      title: 'Category',
      inputType: 'select',
      dataIndex: 'category',
      selectOptions: categoryOptions
    },
    {
      width: 200,
      disabled: true,
      key: 'details',
      editable: true,
      title: 'Details',
      inputType: 'text',
      dataIndex: 'details'
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        details: item.details,
        category: item.category,
        key: item.id.toString()
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <h1 className="text-base font-medium text-black mb-4">Issues/Ideas</h1>
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={() => router.push('/review/list/eom')} />
    </React.Fragment>
  );
}
