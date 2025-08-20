import React, { useEffect, useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function GoogleReviews({ onNext }) {
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const [tableData, setTableData] = useState([
    {
      key: '1',
      google_review_count: '',
      google_review_score: ''
    }
  ]);

  const columns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="text-[15px] text-gray-900 font-bold">This Month</div>
      )
    },
    {
      editable: true,
      disabled: true,
      inputType: 'text',
      key: 'google_review_count',
      dataIndex: 'google_review_count',
      title: 'Current Google Score (Out of 5)'
    },
    {
      editable: true,
      disabled: true,
      inputType: 'text',
      key: 'google_review_score',
      title: 'Google Reviews (#)',
      dataIndex: 'google_review_score'
    }
  ];

  useEffect(() => {
    if (Object.entries(currentStepData).length > 0) {
      const transformedData = [
        {
          key: '1',
          google_review_count: currentStepData.google_review_count,
          google_review_score: currentStepData.google_review_score
        }
      ];
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
