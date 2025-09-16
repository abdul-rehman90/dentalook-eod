import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from 'antd';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const sourceOptions = [
  { value: 'Word Of Mouth', label: 'Word Of Mouth' },
  { value: 'Walk In', label: 'Walk In' },
  { value: 'Signage', label: 'Signage' },
  { value: 'Flyers', label: 'Flyers' },
  { value: 'Events', label: 'Events' },
  { value: 'Online Google Ads', label: 'Online Google Ads' },
  { value: 'Online Meta Ads', label: 'Online Meta Ads' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Radio', label: 'Radio' },
  { value: 'Other', label: 'Other' }
];

const defaultRow = {
  key: 1,
  source: '',
  comments: '',
  other_source: '',
  patient_name: ''
};

export default function PatientTracking({ onNext }) {
  const [target, setTarget] = useState(3);
  const [actual, setActual] = useState(0);
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

  const summaryData = useMemo(() => {
    const difference = actual - target;
    return [
      {
        key: 'summary',
        actual: `${actual}`,
        target: `${target}`,
        '+/-': `${difference}`
      }
    ];
  }, [actual, target]);

  const EditableCell = ({ value, field, disabled, recordKey }) => {
    const [localValue, setLocalValue] = useState(value ?? '');

    useEffect(() => setLocalValue(value ?? ''), [value]);

    return (
      <Input
        value={localValue}
        disabled={disabled}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handleCellCommit(recordKey, field, localValue)}
      />
    );
  };

  const handleCellCommit = (recordKey, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === recordKey
          ? {
              ...item,
              [field]: value
            }
          : item
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
    const newKey = tableData.length
      ? Math.max(...tableData.map((item) => item.key)) + 1
      : 1;
    setActual((prev) => prev + 1);
    setTableData([...tableData, { ...defaultRow, key: newKey }]);
  };

  const newPatientColumns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => 'This Week'
    },
    { key: 'actual', title: 'Actual', dataIndex: 'actual' },
    { key: 'target', title: 'Target', dataIndex: 'target' },
    { key: '+/-', title: '+/-', dataIndex: '+/-' }
  ];

  const patientSourceColumns = [
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
      key: 'source',
      editable: true,
      title: 'Source',
      dataIndex: 'source',
      inputType: 'select',
      selectOptions: sourceOptions
    },
    ...(tableData.some((item) => item.source === 'Other')
      ? [
          {
            width: 250,
            key: 'other_source',
            title: 'Other Source',
            dataIndex: 'other_source',
            render: (_, record) => (
              <EditableCell
                field="other_source"
                recordKey={record.key}
                value={record.other_source}
                disabled={record.source !== 'Other'}
              />
            )
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
                  setTableData((prev) =>
                    prev.filter((item) => item.key !== record.key)
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

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const rowsWithPatientButNoSource = tableData.filter(
          (item) => item.patient_name && !item.source
        );
        const rowsWithMissingOtherSource = tableData.filter(
          (item) => item.source === 'Other' && !item.other_source
        );

        if (rowsWithPatientButNoSource.length > 0) {
          toast.error(
            'Please specify the "Source" for all patients with names'
          );
          return;
        }
        if (rowsWithMissingOtherSource.length > 0) {
          toast.error(
            'Please specify the "Other Source" for all rows where source is "Other"'
          );
          return;
        }

        const payload = tableData
          .filter((item) => item.patient_name && item.source)
          .map((item) => ({ ...item, eodsubmission: Number(id) }));

        if (payload.length > 0) {
          setLoading(true);
          const response = await EODReportService.addPatientTracking(payload);
          if (response.status === 201) {
            updateStepData(currentStepId, tableData);
            toast.success('Record is successfully saved');
            if (navigate) onNext();
          }
        } else {
          updateStepData(currentStepId, tableData);
          if (navigate) onNext();
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, id, currentStepId, setLoading, updateStepData, onNext]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  useEffect(() => {
    if (clinicId && currentStepData.length > 0) {
      setActual(currentStepData.length);
      const transformedData = currentStepData.map((item) => ({
        ...item,
        key: item.id?.toString() || item.key?.toString()
      }));
      setTableData(transformedData);
    }
  }, [clinicId, currentStepData]);

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
      <div className="flex flex-col gap-4 px-6">
        <GenericTable dataSource={summaryData} columns={newPatientColumns} />
        <div className="flex items-center justify-end">
          <Button
            size="lg"
            variant="destructive"
            onClick={handleAddNew}
            className="!px-0 text-[15px] font-semibold text-[#339D5C]"
          >
            <PlusOutlined />
            Add New Patient
          </Button>
        </div>
        <GenericTable
          dataSource={tableData}
          columns={patientSourceColumns}
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
