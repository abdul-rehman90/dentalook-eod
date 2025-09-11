import React, { useEffect, useState, useCallback } from 'react';
import { Input } from 'antd';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { useRouter } from 'next/navigation';
import { PlusOutlined } from '@ant-design/icons';
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
  specialty: '',
  patient_name: '',
  provider_name: '',
  other_specialty: ''
};

export default function Referrals() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [tableData, setTableData] = useState([defaultRow]);
  const { id, reportData, setLoading, getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
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
      key: 'specialty',
      title: 'Speciality',
      inputType: 'select',
      dataIndex: 'specialty',
      selectOptions: specialityOptions
    },
    ...(tableData.some((item) => item.specialty === 'Other')
      ? [
          {
            width: 250,
            key: 'other_specialty',
            title: 'Other Speciality',
            dataIndex: 'other_specialty',
            render: (_, record) => (
              <Input
                value={record.other_specialty}
                disabled={record.specialty !== 'Other'}
                onChange={(e) => {
                  const updatedProviders = tableData.map((p) =>
                    p.key === record.key
                      ? {
                          ...p,
                          other_specialty: e.target.value
                        }
                      : p
                  );
                  setTableData(updatedProviders);
                }}
              />
            )
          }
        ]
      : []),
    {
      width: 250,
      key: 'reason',
      editable: true,
      inputType: 'text',
      dataIndex: 'reason',
      title: 'Reason (Clinic/Provider referred to)'
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

  const handleSubmitEODReport = async () => {
    try {
      setLoading(true);
      const response = await EODReportService.submissionEODReport({
        eodsubmission_id: id
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
        specialty: '',
        patient_name: '',
        provider_name: '',
        other_specialty: ''
      }
    ]);
  };

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        setLoading(true);

        const rowsWithMissingData = tableData.filter(
          (item) =>
            item.patient_name && (!item.provider_name || !item.specialty)
        );

        const rowsWithMissingOtherSpeciality = tableData.filter(
          (item) => item.specialty === 'Other' && !item.other_specialty
        );

        if (rowsWithMissingData.length > 0) {
          toast.error(
            'Please specify both Provider and Specialty for all patients with names'
          );
          return;
        }

        if (rowsWithMissingOtherSpeciality.length > 0) {
          toast.error(
            'Please specify the "Other Speciality" for all rows where specialty is "Other"'
          );
          return;
        }

        const payload = tableData
          .filter(
            (item) => item.patient_name && item.provider_name && item.specialty
          )
          .map(({ key, ...item }) => ({
            ...item,
            user: item.provider_name,
            eodsubmission: Number(id)
          }));

        if (payload.length > 0) {
          const response = await EODReportService.addRefferal(payload);
          if (response.status === 201) {
            if (navigate) {
              await handleSubmitEODReport();
            } else {
              toast.success('Record is successfully saved');
            }
          }
        } else {
          if (navigate) {
            await handleSubmitEODReport();
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, clinicId, id, setLoading]
  );

  const handleSubmit = useCallback(async () => {
    await saveData(true); // Save and navigate
  }, [saveData]);

  const handleSave = useCallback(async () => {
    await saveData(false);
  }, [saveData]);

  const fetchActiveProviders = async () => {
    try {
      const { data } = await EODReportService.getActiveProviders(id);
      setProviders(
        data.providers.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (clinicId) fetchActiveProviders();
    if (clinicId && currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        reason: item.reason,
        specialty: item.specialty,
        provider_name: item.user?.id,
        patient_name: item.patient_name,
        other_specialty: item.other_specialty,
        key: item.id?.toString() || item.key?.toString()
      }));
      setTableData(transformedData);
    }
  }, [clinicId]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', handleSubmit);
    return () => {
      window.removeEventListener('stepNavigationNext', handleSubmit);
    };
  }, [handleSubmit]);

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
            Add New Referrals
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
