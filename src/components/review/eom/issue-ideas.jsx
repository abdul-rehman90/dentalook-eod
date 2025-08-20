import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';

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

  useEffect(() => {
    window.addEventListener('stepNavigationNext', () =>
      router.push('/review/list/eom')
    );
    return () => {
      window.removeEventListener('stepNavigationNext', () =>
        router.push('/review/list/eom')
      );
    };
  }, []);

  return (
    <div className="px-6">
      <GenericTable columns={columns} dataSource={tableData} />
    </div>
  );
}
