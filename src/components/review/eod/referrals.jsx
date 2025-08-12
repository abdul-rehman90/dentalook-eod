import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const specialityOptions = [
  { value: 'Orthodontics-Braces', label: 'Orthodontics-Braces' },
  {
    value: 'Orthodontics-Clear Aligners',
    label: 'Orthodontics-Clear Aligners'
  },
  { value: 'Periodontics', label: 'Periodontics' },
  { value: 'Endodontics-RCT', label: 'Endodontics-RCT' },
  { value: 'Endodontics-Retreatment', label: 'Endodontics-Retreatment' },
  {
    value: 'Oral Surgery Complicated Extraction',
    label: 'Oral Surgery Complicated Extraction'
  },
  { value: 'Oral Surgery Wisdom Teeth', label: 'Oral Surgery Wisdom Teeth' },
  {
    value: 'Oral Surgery Implant Placement',
    label: 'Oral Surgery Implant Placement'
  },
  { value: 'Oral Surgery Pathology', label: 'Oral Surgery Pathology' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'TMJ', label: 'TMJ' },
  { value: 'Prosthodontics', label: 'Prosthodontics' },
  { value: 'Cosmetic Dentistry', label: 'Cosmetic Dentistry' },
  { value: 'Dentures', label: 'Dentures' },
  { value: 'Other', label: 'Other' }
];

export default function Referrals() {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
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
      key: 'name',
      disabled: true,
      editable: true,
      dataIndex: 'name',
      inputType: 'input',
      title: 'Provider Name'
    },
    {
      width: 150,
      disabled: true,
      editable: true,
      key: 'speciality',
      title: 'Speciality',
      inputType: 'select',
      dataIndex: 'speciality',
      selectOptions: specialityOptions
    },
    {
      width: 250,
      disabled: true,
      editable: true,
      inputType: 'text',
      key: 'other_specialty',
      title: 'Other Speciality',
      dataIndex: 'other_specialty'
    },
    {
      width: 250,
      key: 'reason',
      disabled: true,
      editable: true,
      inputType: 'text',
      dataIndex: 'reason',
      title: 'Reason (Clinic/Provider referred to)'
    }
  ];

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        reason: item.reason,
        name: item.user?.name,
        key: item.id.toString(),
        patient_name: item.patient_name,
        speciality: item.specialty || '',
        other_specialty: item.other_specialty
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <GenericTable columns={columns} dataSource={tableData} />
      </div>
      <StepNavigation onNext={() => router.push('/review/list/eod')} />
    </React.Fragment>
  );
}
