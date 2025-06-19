import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Form } from 'antd';
import toast from 'react-hot-toast';
import { FormControl } from '@/common/utils/form-control';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const options = [
  { label: 'Open', value: 'opened' },
  { label: 'Close', value: 'closed' }
];

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
    status: currentStepData?.status || 'closed',
    submission_date: currentStepData?.submission_date
      ? dayjs(currentStepData.submission_date)
      : dayjs(),
    clinic_open_time: currentStepData?.clinic_open_time
      ? dayjs(currentStepData.clinic_open_time, 'HH:mm:ss')
      : null,
    clinic_close_time: currentStepData?.clinic_close_time
      ? dayjs(currentStepData.clinic_close_time, 'HH:mm:ss')
      : null
  };

  const clearTimeFieldValidations = () => {
    form.setFields([
      {
        name: 'clinic_open_time',
        errors: []
      },
      {
        name: 'clinic_close_time',
        errors: []
      }
    ]);
  };

  const handleProvinceChange = async (provinceId) => {
    if (!provinceId) return;

    try {
      const { data } = await EODReportService.getDataOfProvinceById(provinceId);
      setPractices(
        data.clinics.map((clinic) => ({
          value: clinic.clinic_id,
          label: clinic.clinic_name,
          unitLength: clinic.unit_length,
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
        unit_length: selectedClinic?.unitLength,
        submission_date: dayjs(values.submission_date).format('YYYY-MM-DD'),
        clinic_open_time:
          values.status === 'opened'
            ? dayjs(values.clinic_open_time).format('HH:mm:ss')
            : undefined,
        clinic_close_time:
          values.status === 'opened'
            ? dayjs(values.clinic_close_time).format('HH:mm:ss')
            : undefined
      };

      const response = await EODReportService.sumbmissionOfBasicDetails(
        payload
      );
      if (response.status === 201) {
        setSubmissionId(response.data.data.id);
        updateStepData(currentStepId, payload);
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {
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
          unitLength: clinic.unit_length,
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
        status: currentStepData.status || 'closed',
        submission_date: currentStepData.submission_date
          ? dayjs(currentStepData.submission_date)
          : dayjs(),
        clinic_open_time: currentStepData.clinic_open_time
          ? dayjs(currentStepData.clinic_open_time, 'HH:mm:ss')
          : null,
        clinic_close_time: currentStepData.clinic_close_time
          ? dayjs(currentStepData.clinic_close_time, 'HH:mm:ss')
          : null
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
        onValuesChange={(changedValues) => {
          if ('status' in changedValues) {
            if (changedValues.status !== 'opened') {
              clearTimeFieldValidations();
            }
          }
        }}
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
          disabled={!form.getFieldValue('clinic')}
        />
        <FormControl
          required
          control="date"
          name="submission_date"
          label="Submission Date"
        />
        <FormControl
          name="status"
          control="radio"
          options={options}
          label="Clinic Open/Closed?"
        />
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.status !== currentValues.status
          }
        >
          {({ getFieldValue }) => {
            const isOpened = getFieldValue('status') === 'opened';
            return (
              <React.Fragment>
                <FormControl
                  control="time"
                  label="Open From"
                  required={isOpened}
                  disabled={!isOpened}
                  name="clinic_open_time"
                />
                <FormControl
                  control="time"
                  label="Open To"
                  required={isOpened}
                  disabled={!isOpened}
                  name="clinic_close_time"
                />
              </React.Fragment>
            );
          }}
        </Form.Item>
      </Form>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
