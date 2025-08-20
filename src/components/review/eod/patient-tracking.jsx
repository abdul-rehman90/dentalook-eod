import React, { useState, useMemo, useEffect } from 'react';
import { Col } from 'antd';
import { GenericTable } from '@/common/components/table/table';
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
  { value: 'Others', label: 'Others' }
];

export default function PatientTracking({ onNext }) {
  const [target, setTarget] = useState(3);
  const [actual, setActual] = useState(0);
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  // Calculate summary data
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

  const newPatientColumns = [
    {
      title: '',
      key: 'summary',
      dataIndex: 'summary',
      render: () => 'This Week'
    },
    {
      key: 'actual',
      title: 'Actual',
      dataIndex: 'actual'
    },
    {
      key: 'target',
      title: 'Target',
      dataIndex: 'target'
    },
    {
      key: '+/-',
      title: '+/-',
      dataIndex: '+/-'
    }
  ];

  const patientSourceColumns = [
    {
      width: 150,
      disabled: true,
      editable: true,
      inputType: 'text',
      key: 'patient_name',
      title: 'Patient Name',
      dataIndex: 'patient_name'
    },
    {
      width: 150,
      key: 'source',
      disabled: true,
      editable: true,
      title: 'Source',
      dataIndex: 'source',
      inputType: 'select',
      selectOptions: sourceOptions
    },
    {
      width: 250,
      disabled: true,
      editable: true,
      inputType: 'text',
      key: 'other_source',
      title: 'Other Source',
      dataIndex: 'other_source'
    },
    {
      width: 250,
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
        source: item.source,
        key: item.id.toString(),
        comments: item.comments,
        other_source: item.other_source,
        patient_name: item.patient_name
      }));
      setTableData(transformedData);
      setActual(transformedData.length);
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
      <div className="flex flex-col gap-6 px-6">
        <Col span={10}>
          <GenericTable dataSource={summaryData} columns={newPatientColumns} />
        </Col>
        <GenericTable dataSource={tableData} columns={patientSourceColumns} />
      </div>
      <StepNavigation
        onNext={onNext}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
