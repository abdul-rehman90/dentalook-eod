import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { useRouter } from 'next/navigation';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import EditableCell from '@/common/components/editable-cell/editable-cell';
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
  { value: 'Radiology-CBCT', label: 'Radiology-CBCT' },
  { value: 'Sedation - Adult', label: 'Sedation - Adult' },
  { value: 'Sedation - Pediatric', label: 'Sedation - Pediatric' },
  { value: 'Botox', label: 'Botox' },
  { value: 'Orthognathic Surgery', label: 'Orthognathic Surgery' },
  { value: 'Other', label: 'Other' }
];

const referralTypeOptions = [
  { value: 'Internal', label: 'Internal' },
  { value: 'External', label: 'External' }
];

const defaultRow = {
  key: 1,
  reason: '',
  refer_to: '',
  specialty: '',
  refer_type: '',
  patient_name: '',
  provider_name: '',
  other_specialty: ''
};

export default function Referrals() {
  const router = useRouter();
  const [clinics, setClinics] = useState([]);
  const [providers, setProviders] = useState([]);
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    id,
    steps,
    setDirty,
    reportData,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData,
    registerStepSaveHandler,
    unregisterStepSaveHandler
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
      title: 'Specialty',
      inputType: 'select',
      dataIndex: 'specialty',
      selectOptions: specialityOptions
    },
    ...(tableData.some((item) => item.specialty === 'Other')
      ? [
          {
            width: 250,
            editable: true,
            inputType: 'text',
            key: 'other_specialty',
            title: 'Other Specialty',
            dataIndex: 'other_specialty',
            render: (_, record) =>
              record.specialty === 'Other' ? (
                <EditableCell
                  recordKey={record.key}
                  field="other_specialty"
                  onCommit={handleCellCommit}
                  value={record.other_specialty}
                />
              ) : null
          }
        ]
      : []),
    {
      width: 150,
      editable: true,
      key: 'refer_type',
      inputType: 'select',
      title: 'Referral Type',
      dataIndex: 'refer_type',
      selectOptions: referralTypeOptions
    },
    ...(tableData.some((item) => item.refer_type)
      ? [
          {
            width: 200,
            editable: true,
            key: 'refer_to',
            title: 'Refer To',
            inputType: 'text',
            dataIndex: 'refer_to',
            render: (_, record) => {
              if (record.refer_type === 'Internal') {
                return (
                  <EditableCell
                    type="select"
                    field="refer_to"
                    options={clinics}
                    recordKey={record.key}
                    value={record.refer_to}
                    onCommit={handleCellCommit}
                  />
                );
              } else if (record.refer_type === 'External') {
                return (
                  <EditableCell
                    field="refer_to"
                    recordKey={record.key}
                    value={record.refer_to}
                    onCommit={handleCellCommit}
                  />
                );
              }
              return null;
            }
          }
        ]
      : []),
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
    setDirty(true);
    setTableData((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        if (field === 'refer_type') {
          return { ...item, [field]: value, refer_to: '' };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const handleCellChange = (record, dataIndex, value) => {
    setDirty(true);
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
    setTableData([...tableData, { ...defaultRow, key: newKey }]);
  };

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

        const rowsWithReferTypeButNoReferTo = tableData.filter(
          (item) => item.refer_type && !item.refer_to
        );

        if (rowsWithMissingData.length > 0) {
          toast.error(
            'Please specify both Provider and Specialty for all patients with names'
          );
          return false;
        }

        if (rowsWithMissingOtherSpeciality.length > 0) {
          toast.error(
            'Please specify the "Other Specialty" for all rows where specialty is "Other"'
          );
          return false;
        }

        if (rowsWithReferTypeButNoReferTo.length > 0) {
          toast.error(
            'Please select "Refer To" for all rows where Referral Type is selected'
          );
          return false;
        }

        const payload = tableData
          .filter(
            (item) => item.patient_name && item.provider_name && item.specialty
          )
          .map(({ key, ...item }) => {
            let referToValue = item.refer_to;

            if (item.refer_type === 'Internal') {
              const selectedClinic = clinics.find(
                (c) => c.value === item.refer_to
              );
              referToValue = selectedClinic ? selectedClinic.label : '';
            }

            return {
              ...item,
              refer_to: referToValue,
              user: item.provider_name,
              eodsubmission: Number(id),
              refer_type: item.refer_type
            };
          });

        if (payload.length > 0) {
          const response = await EODReportService.addRefferal(payload);
          if (response.status === 201) {
            setDirty(false);
            if (navigate) {
              await handleSubmitEODReport();
            } else {
              updateStepData(currentStepId, tableData);
              toast.success('Record is successfully saved');
            }
            return true;
          }
        } else {
          setDirty(false);
          if (navigate) await handleSubmitEODReport();
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, clinics, id, setLoading, setDirty]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

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

  const fetchClinics = async (provinceId) => {
    try {
      const { data } = await EODReportService.getDataOfProvinceById(provinceId);
      setClinics(
        data.clinics.map((clinic) => ({
          value: clinic.clinic_id,
          label: clinic.clinic_name
        }))
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (clinicId) {
      fetchActiveProviders();
      const provinceId =
        reportData?.eod?.basic?.clinicDetails?.province_id ||
        reportData?.eod?.basic?.clinicDetails?.province;
      if (provinceId) fetchClinics(provinceId);
    }
    if (clinicId && currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        reason: item.reason,
        specialty: item.specialty,
        refer_to: item.refer_to || '',
        patient_name: item.patient_name,
        refer_type: item.refer_type || '',
        other_specialty: item.other_specialty,
        key: item.id?.toString() || item.key?.toString(),
        provider_name: item.user?.id || item.provider_name
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
