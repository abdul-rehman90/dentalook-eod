import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const defaultRow = {
  key: '1',
  google_review_score: '',
  google_review_count: ''
};

export default function GoogleReviews({ onNext }) {
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    id,
    steps,
    setDirty,
    setLoading,
    reportData,
    currentStep,
    updateStepData,
    getCurrentStepData,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const clinicId = reportData?.eom?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;

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
      inputType: 'text',
      key: 'google_review_score',
      dataIndex: 'google_review_score',
      title: 'Current Google Score (Out of 5)'
    },
    {
      editable: true,
      inputType: 'text',
      key: 'google_review_count',
      title: 'Google Reviews (#)',
      dataIndex: 'google_review_count'
    }
  ];

  const handleCellChange = (record, dataIndex, value) => {
    setDirty(true);
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const rowData = tableData[0];

        if (rowData.google_review_score) {
          const numericValue = parseFloat(rowData.google_review_score);
          if (numericValue > 5) {
            toast.error('Google review score cannot be greater than 5');
            return false;
          }
          if (numericValue < 0) {
            toast.error('Google review score cannot be negative');
            return false;
          }
        }

        if (rowData.google_review_count) {
          const numericValue = parseInt(rowData.google_review_count, 10);
          if (numericValue < 0) {
            toast.error('Review count cannot be negative');
            return false;
          }
        }

        if (rowData.google_review_count && rowData.google_review_score) {
          setLoading(true);
          const payload = { ...rowData };
          const response = await EOMReportService.addSuppliesAndGoogleReviews(
            id,
            payload
          );
          if (response.status === 200) {
            setDirty(false);
            updateStepData(currentStepId, rowData);
            toast.success('Record is successfully saved');
            if (navigate) onNext();
            return true;
          }
        } else {
          setDirty(false);
          updateStepData(currentStepId, rowData);
          if (navigate) onNext();
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, id, currentStepId, setLoading, updateStepData, onNext, setDirty]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  useEffect(() => {
    if (clinicId && Object.entries(currentStepData).length > 0) {
      const transformedData = [
        {
          key: '1',
          google_review_count: currentStepData.google_review_count,
          google_review_score: currentStepData.google_review_score
        }
      ];
      setTableData(transformedData);
    }
  }, [clinicId]);

  useEffect(() => {
    window.addEventListener('stepNavigationSave', handleSave);
    window.addEventListener('stepNavigationNext', handleSubmit);

    return () => {
      window.removeEventListener('stepNavigationSave', handleSave);
      window.removeEventListener('stepNavigationNext', handleSubmit);
    };
  }, [handleSubmit, handleSave]);

  useEffect(() => {
    registerStepSaveHandler(currentStep, async (navigate = false) => {
      return saveData(navigate);
    });
    return () => {
      unregisterStepSaveHandler(currentStep);
    };
  }, [
    saveData,
    currentStep,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  ]);

  return (
    <React.Fragment>
      <div className="px-6">
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
