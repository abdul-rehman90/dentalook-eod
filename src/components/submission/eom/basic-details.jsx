import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Form } from 'antd';
import toast from 'react-hot-toast';
import { FormControl } from '@/common/utils/form-control';
import { EODReportService } from '@/common/services/eod-report';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function BasicDetails({ onNext }) {
  const [form] = Form.useForm();
  const [practices, setPractices] = useState([]);
  const [regionalManagers, setRegionalManagers] = useState([]);
  const {
    steps,
    provinces,
    setLoading,
    currentStep,
    updateStepData,
    setSubmissionId,
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
    try {
      const values = await form.validateFields();
      setLoading(true);
      const selectedClinic = practices.find(
        (clinic) => clinic.value === values.clinic
      );
      const payload = {
        ...values,
        clinic_name: selectedClinic?.label,
        submission_month: dayjs(values.submission_month).format('YYYY-MM-DD')
      };

      const response = await EOMReportService.sumbmissionOfBasicDetails(
        payload
      );
      if (response.status === 201) {
        setSubmissionId(response.data.id);
        updateStepData(currentStepId, payload);
        toast.success('Record is successfully saved');
        onNext();
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
    if (!currentStepData?.province) return;

    try {
      const { data } = await EODReportService.getDataOfProvinceById(
        currentStepData.province
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
        user: currentStepData.user,
        clinic: currentStepData.clinic,
        province: currentStepData.province,
        proud_moment: currentStepData.proud_moment,
        submission_month: currentStepData.submission_month
          ? dayjs(currentStepData.submission_month)
          : dayjs()
      });
    } catch (error) {}
  };

  useEffect(() => {
    initializeForm();
  }, []);

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
