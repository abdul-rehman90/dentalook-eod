import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Form, Row } from 'antd';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FormControl } from '@/common/utils/form-control';
import { EODReportService } from '@/common/services/eod-report';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function BasicDetails() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [practices, setPractices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [regionalManagers, setRegionalManagers] = useState([]);
  const {
    id,
    steps,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = currentStepData?.clinic;

  const initialValues = {
    user: currentStepData?.user,
    clinic: currentStepData?.clinic,
    province: currentStepData?.province,
    submission_month: currentStepData?.submission_month
      ? dayjs(currentStepData.submission_month)
      : dayjs()
  };

  const handleProvinceChange = async (provinceId) => {
    if (!provinceId) return;

    try {
      const { data } = await EODReportService.getDataOfProvinceById(provinceId);
      const clinics = data.clinics.map((clinic) => ({
        value: clinic.clinic_id,
        label: clinic.clinic_name,
        managers: clinic.regional_managers.map((manager) => ({
          value: manager.id,
          label: manager.name
        }))
      }));

      if (clinicId) {
        const selectedClinic = clinics.find(
          (clinic) => clinic.value === clinicId
        );
        setPractices(clinics);
        setRegionalManagers(selectedClinic?.managers || []);
      } else {
        form.setFieldsValue({
          province: provinceId,
          clinic: clinics[0]?.value,
          user: clinics[0]?.managers[0]?.value
        });
        setPractices(clinics);
        setRegionalManagers(clinics[0]?.managers || []);
      }
    } catch (error) {}
  };

  const handleClinicChange = (clinicId) => {
    if (!clinicId) return;

    const selectedClinic = practices.find(
      (clinic) => clinic.value === clinicId
    );

    if (selectedClinic?.managers?.length) {
      setRegionalManagers(selectedClinic.managers);
      form.setFieldsValue({
        user: selectedClinic.managers[0].value
      });
    } else {
      setRegionalManagers([]);
      form.setFieldsValue({ user: undefined });
    }
  };

  const saveData = useCallback(
    async (navigate = false) => {
      if (id && navigate) {
        router.push(`/submission/eom/${currentStep + 1}/${id}`);
        return;
      }

      try {
        const values = await form.validateFields();
        setLoading(true);
        const payload = {
          ...values,
          submission_month: dayjs(values.submission_month).format('YYYY-MM-DD')
        };

        const response = await EOMReportService.addBasicDetails(payload);
        if (response.status === 201) {
          updateStepData(currentStepId, payload);
          const submission_id = response.data.id;
          toast.success('Record is successfully saved');
          if (navigate) {
            router.push(`/submission/eom/${currentStep + 1}/${submission_id}`);
          }
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.non_field_errors[0] || 'Failed to save record'
        );
      } finally {
        setLoading(false);
      }
    },
    [id, form, router, setLoading, currentStep, currentStepId, updateStepData]
  );

  const handleSubmit = useCallback(async () => {
    await saveData(true); // Save and navigate
  }, [saveData]);

  const handleSave = useCallback(async () => {
    await saveData(false); // Save without navigation
  }, [saveData]);

  const initializeForm = async () => {
    form.setFieldsValue({
      clinic: currentStepData.clinic,
      province: currentStepData.province,
      proud_moment: currentStepData.proud_moment,
      user: currentStepData.user || currentStepData.regional_manager_id,
      submission_month: currentStepData.submission_month
        ? dayjs(currentStepData.submission_month)
        : dayjs()
    });
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await EODReportService.getAllProvinces();
        const provinceOptions = data.map((province) => ({
          value: province.id,
          label: province.name
        }));
        setProvinces(provinceOptions);
      } catch (error) {}
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!provinces.length) return;
    if (clinicId) {
      handleProvinceChange(
        currentStepData?.province_id || currentStepData?.province
      );
      initializeForm();
    } else if (!id) {
      handleProvinceChange(provinces[0].value);
    }
  }, [clinicId, provinces]);

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
      <Form
        form={form}
        initialValues={initialValues}
        style={{ padding: '0 24px' }}
      >
        <Row justify="space-between">
          <FormControl
            required={!id}
            name="province"
            control="select"
            label="Province"
            options={provinces}
            onChange={handleProvinceChange}
          />
          <FormControl
            name="user"
            control="select"
            label="Regional Manager"
            options={regionalManagers}
          />
        </Row>
        <Row justify="space-between">
          <FormControl
            name="clinic"
            required={!id}
            control="select"
            options={practices}
            label="Practice Name"
            onChange={handleClinicChange}
          />
          <FormControl
            control="date"
            picker="month"
            required={!id}
            format="MMM YYYY"
            name="submission_month"
            label="Submission Month"
            placeholder="Select Date"
          />
        </Row>
        <div className="proud-moment">
          <FormControl
            control="input"
            name="proud_moment"
            label="Proud Moment of the Month:"
            placeholder="Write your proud moment"
          />
        </div>
      </Form>
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
