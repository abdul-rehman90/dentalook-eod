import React, { useEffect, useState } from 'react';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import { EOMReportService } from '@/common/services/eom-report';
import toast from 'react-hot-toast';

const defaultRow = {
  key: '1',
  google_review_score: '',
  google_review_count: ''
};

export default function GoogleReviews({ onNext }) {
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    steps,
    setLoading,
    currentStep,
    submissionId,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;

  const columns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="px-2 text-[15px] text-gray-900 font-bold">
          This Month
        </div>
      )
    },
    {
      editable: true,
      inputType: 'number',
      key: 'google_review_count',
      dataIndex: 'google_review_count',
      title: 'Current Google Score (Out of 5)'
    },
    {
      editable: true,
      inputType: 'number',
      key: 'google_review_score',
      title: 'Google Reviews (#)',
      dataIndex: 'google_review_score'
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const rowData = tableData[0];

      if (rowData.google_review_count && rowData.google_review_score) {
        setLoading(true);
        const payload = { ...rowData };
        const response = await EOMReportService.addSuppliesAndGoogleReviews(
          submissionId,
          payload
        );
        if (response.status === 200) {
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
    if (currentStepData.length > 0) {
      setTableData(currentStepData);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
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
