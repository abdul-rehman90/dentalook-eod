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

const defaultRow = {
  key: 1,
  reason: '',
  speciality: '',
  patient_name: '',
  provider_name: ''
};

export default function Referrals() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const { submissionId, setLoading } = useGlobalContext();
  const [tableData, setTableData] = useState([defaultRow]);

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
          className="ml-3"
          variant="destructive"
          onClick={() => handleDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const handleSubmitEODReport = async () => {
    try {
      setLoading(true);
      const response = await EODReportService.submissionEODReport({
        eodsubmission_id: submissionId
      });
      if (response.status === 200) {
        toast.success('EOD submission is successfully submitted');
        router.push('/review/list/eod');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
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
        speciality: '',
        patient_name: '',
        provider_name: ''
      }
    ]);
  };

  const handleDelete = (key) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((item) => item.key !== key));
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = tableData
        .filter(
          (item) => item.patient_name && item.provider_name && item.speciality
        )
        .map((item) => ({
          ...item,
          user: item.id,
          eodsubmission: submissionId
        }));

      if (payload.length > 0) {
        const response = await EODReportService.addRefferal(payload);
        if (response.status === 201) {
          handleSubmitEODReport();
        }
        return;
      }
      handleSubmitEODReport();
    } catch (error) {}
  };

  const fetchActiveProviders = async () => {
    try {
      const { data } = await EODReportService.getActiveProviders(submissionId);
      setProviders(
        data.providers.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
    } catch (error) {}
  };

  useEffect(() => {
    fetchActiveProviders();
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
            onClick={handleAddNew}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Refferals
          </Button>
        </div>
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
