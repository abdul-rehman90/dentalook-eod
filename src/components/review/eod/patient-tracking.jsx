import React, { useState, useMemo, useEffect } from 'react';
import { Col } from 'antd';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
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
      key: 'comments',
      title: 'Comments',
      inputType: 'text',
      dataIndex: 'comments'
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
      render: (_, record) => (
        <Button disabled size="icon" className="ml-3" variant="destructive">
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        source: item.source,
        key: item.id.toString(),
        comments: item.comments,
        patient_name: item.patient_name
      }));
      setTableData(transformedData);
      setActual(transformedData.length);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 px-6">
        <Col span={10}>
          <h2 className="text-base font-medium text-black mb-4">
            New Patients
          </h2>
          <GenericTable dataSource={summaryData} columns={newPatientColumns} />
        </Col>
        <div>
          <h1 className="text-base font-medium text-black mb-4">
            Patient Source
          </h1>
          <GenericTable dataSource={tableData} columns={patientSourceColumns} />
        </div>
      </div>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
