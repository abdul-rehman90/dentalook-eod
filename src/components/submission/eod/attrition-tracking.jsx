import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import EditableCell from '@/common/components/editable-cell/editable-cell';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const reasonOptions = [
  { value: 'Another Dentist', label: 'Another Dentist' },
  { value: 'Another City', label: 'Another City' },
  { value: 'Quality Of Care', label: 'Quality Of Care' },
  { value: 'Negative Experience', label: 'Negative Experience' },
  { value: 'Deceased', label: 'Deceased' },
  { value: 'Other', label: 'Other' }
];

const defaultRow = {
  key: 1,
  reason: '',
  comments: '',
  patient_name: '',
  other_reason: ''
};

export default function AttritionTracking({ onNext }) {
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
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinicDetails?.clinic;

  const columns = [
    {
      width: 150,
      editable: true,
      inputType: 'text',
      key: 'patient_name',
      title: 'Patient Name',
      dataIndex: 'patient_name'
    },
    {
      width: 150,
      key: 'reason',
      editable: true,
      title: 'Reason',
      dataIndex: 'reason',
      inputType: 'select',
      selectOptions: reasonOptions
    },
    ...(tableData.some((item) => item.reason === 'Other')
      ? [
          {
            width: 250,
            editable: true,
            inputType: 'text',
            key: 'other_reason',
            title: 'Other Reason',
            dataIndex: 'other_reason',
            render: (_, record) => {
              if (record.reason === 'Other') {
                return (
                  <EditableCell
                    field="other_reason"
                    recordKey={record.key}
                    value={record.other_reason}
                    onCommit={handleCellCommit}
                  />
                );
              }
              return null;
            }
          }
        ]
      : []),
    {
      width: 250,
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

  const handleCellCommit = (key, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

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
    setTableData([
      ...tableData,
      {
        key: newKey,
        reason: '',
        comments: '',
        other_reason: '',
        patient_name: ''
      }
    ]);
  };

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const rowsWithPatientButNoReason = tableData.filter(
          (item) => item.patient_name && !item.reason
        );

        const rowsWithMissingOtherReason = tableData.filter(
          (item) => item.reason === 'Other' && !item.other_reason
        );

        if (rowsWithPatientButNoReason.length > 0) {
          toast.error(
            'Please specify the "Reason" for all patients with names'
          );
          return;
        }

        if (rowsWithMissingOtherReason.length > 0) {
          toast.error(
            'Please specify the "Other Reason" for all rows where reason is "Other"'
          );
          return;
        }

        const payload = tableData
          .filter((item) => item.patient_name && item.reason)
          .map((item) => ({
            ...item,
            eodsubmission: Number(id)
          }));

        if (payload.length > 0) {
          setLoading(true);
          const response = await EODReportService.addAttritionTracking(payload);
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

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  useEffect(() => {
    if (clinicId && currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        reason: item.reason,
        comments: item.comments,
        patient_name: item.patient_name,
        other_reason: item.other_reason,
        key: item.id?.toString() || item.key?.toString()
      }));
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
            Add New Attrition
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
