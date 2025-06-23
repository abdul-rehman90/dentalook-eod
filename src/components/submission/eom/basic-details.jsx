import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Form } from 'antd';
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
      setPractices(
        data.clinics.map((clinic) => ({
          value: clinic.clinic_id,
          label: clinic.clinic_name,
          managers: clinic.regional_managers.map((manager) => ({
            label: manager.name,
            value: manager.id
          }))
        }))
      );
      setRegionalManagers([]);
      form.setFieldsValue({ clinic: undefined, user: undefined });
    } catch (error) {}
  };

  const handleClinicChange = (clinicId) => {
    if (!clinicId) return;

    const selectedClinic = practices.find(
      (clinic) => clinic.value === clinicId
    );

    if (selectedClinic?.managers) {
      setRegionalManagers(selectedClinic.managers);
      form.setFieldsValue({
        user: selectedClinic.managers[0].value
      });
    }
  };

  const handleSubmit = async () => {
    if (id) return router.push(`/submission/eom/${currentStep + 1}/${id}`);
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        ...values,
        submission_month: dayjs(values.submission_month).format('YYYY-MM-DD')
      };

      const response = await EOMReportService.sumbmissionOfBasicDetails(
        payload
      );
      if (response.status === 201) {
        updateStepData(currentStepId, payload);
        const submission_id = response.data.id;
        toast.success('Record is successfully saved');
        router.push(`/submission/eom/${currentStep + 1}/${submission_id}`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.non_field_errors[0] || 'Failed to save record'
      );
    } finally {
      setLoading(false);
    }
  };

  const initializeForm = async () => {
    try {
      const { data } = await EODReportService.getDataOfProvinceById(
        currentStepData?.province_id || currentStepData?.province
      );
      setPractices(
        data.clinics.map((clinic) => ({
          value: clinic.clinic_id,
          label: clinic.clinic_name,
          managers: clinic.regional_managers.map((manager) => ({
            label: manager.name,
            value: manager.id
          }))
        }))
      );
      const selectedClinic = data.clinics.find(
        (clinic) => clinic.clinic_id === currentStepData.clinic
      );
      if (selectedClinic?.regional_managers) {
        setRegionalManagers(
          selectedClinic.regional_managers.map((manager) => ({
            value: manager.id,
            label: manager.name
          }))
        );
      }
      form.setFieldsValue({
        clinic: currentStepData.clinic,
        province: currentStepData.province,
        proud_moment: currentStepData.proud_moment,
        user: currentStepData.user || currentStepData.regional_manager_id,
        submission_month: currentStepData.submission_month
          ? dayjs(currentStepData.submission_month)
          : dayjs()
      });
    } catch (error) {}
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
    if (currentStepData?.province && practices.length === 0) initializeForm();
  }, [currentStepData?.province]);

  return (
    <React.Fragment>
      <Form
        form={form}
        initialValues={initialValues}
        style={{ width: '50%', padding: '0 24px' }}
      >
        <FormControl
          required
          name="province"
          control="select"
          label="Province"
          options={provinces}
          onChange={handleProvinceChange}
        />
        <FormControl
          required
          name="clinic"
          control="select"
          options={practices}
          label="Practice Name"
          onChange={handleClinicChange}
        />
        <FormControl
          name="user"
          control="select"
          label="Regional Manager"
          options={regionalManagers}
        />
        <FormControl
          required
          control="date"
          picker="month"
          format="MMM YYYY"
          name="submission_month"
          label="Submission Month"
          placeholder="Select Date"
        />
        <div className="proud-moment">
          <FormControl
            control="input"
            name="proud_moment"
            label="Proud Moment of the Month:"
            placeholder="Write your proud moment"
          />
        </div>
      </Form>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
