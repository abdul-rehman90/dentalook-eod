import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
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
  const { reportData } = useGlobalContext();
  const [tableData, setTableData] = useState([]);
  const [providers, setProviders] = useState([]);
  const clinicId = reportData?.eod?.basic?.clinic;

  const patientReasonColumns = [
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
      editable: true,
      inputType: 'select',
      key: 'provider_name',
      title: 'Provider Name',
      selectOptions: providers,
      dataIndex: 'provider_name'
    },
    {
      width: 150,
      editable: true,
      key: 'speciality',
      title: 'Speciality',
      inputType: 'select',
      dataIndex: 'speciality',
      selectOptions: specialityOptions
    },
    {
      width: 250,
      key: 'reason',
      editable: true,
      inputType: 'text',
      dataIndex: 'reason',
      title: 'Reason (Clinic/Provider referred to)'
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
      render: (_, record) => (
        <Button
          size="icon"
          variant="destructive"
          onClick={() => handleDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const createReferrals = async () => {
    try {
      const payload = tableData.map((item) => ({
        ...item,
        user: item.id,
        eodsubmission: 1
      }));
      const response = await EODReportService.addRefferal(payload);
      if (response.status === 201) {
        toast.success('Record is successfully saved');
        router.push('/review/list/eod');
      }
    } catch (error) {}
  };

  const fetchProvidersByClinic = async () => {
    try {
      const { data } = await EODReportService.getProviders(clinicId, 'False');
      setProviders(
        data.providers.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
    } catch (error) {}
  };

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleAddRefferals = () => {
    const newKey =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.key)) + 1
        : 1;
    setTableData([
      ...tableData,
      {
        key: newKey,
        reason: '',
        speciality: '',
        patient_name: '',
        provider_name: ''
      }
    ]);
  };

  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  useEffect(() => {
    fetchProvidersByClinic();
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-medium text-black">
            Outgoing Patient Referral
          </h1>
          <Button
            size="lg"
            onClick={handleAddRefferals}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Refferals
          </Button>
        </div>
        <GenericTable
          dataSource={tableData}
          columns={patientReasonColumns}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={createReferrals} />
    </React.Fragment>
  );
}
