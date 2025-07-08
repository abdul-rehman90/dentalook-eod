import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Form, Row } from 'antd';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FormControl } from '@/common/utils/form-control';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const options = [
  { label: 'Open', value: 'opened' },
  { label: 'Close', value: 'closed' }
];

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
    user: undefined,
    status: 'closed',
    clinic: undefined,
    province: undefined,
    clinic_open_time: null,
    clinic_close_time: null,
    submission_date: dayjs()
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
          (clinic) => clinic.value === currentStepData.clinic
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

  const handleSubmit = async () => {
    if (id) return router.push(`/submission/eod/${currentStep + 1}/${id}`);
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        ...values,
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

      const response = await EODReportService.addBasicDetails(payload);
      if (response.status === 201) {
        updateStepData(currentStepId, payload);
        const submission_id = response.data.data.id;
        toast.success('Record is successfully saved');
        router.push(`/submission/eod/${currentStep + 1}/${submission_id}`);
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
    form.setFieldsValue({
      clinic: currentStepData.clinic,
      province: currentStepData.province,
      status: currentStepData.status || 'closed',
      user: currentStepData.user || currentStepData.regional_manager_id,
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

  return (
    <React.Fragment>
      <Form
        form={form}
        initialValues={initialValues}
        style={{ padding: '0 24px' }}
        onValuesChange={(changedValues) => {
          if ('status' in changedValues) {
            if (changedValues.status !== 'opened') {
              clearTimeFieldValidations();
            }
          }
        }}
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
            disabled={!form.getFieldValue('clinic')}
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
            required={!id}
            control="date"
            name="submission_date"
            label="Submission Date"
          />
        </Row>
        <Row justify="space-between">
          <FormControl
            name="status"
            control="radio"
            options={options}
            label="Clinic Open/Closed?"
          />
        </Row>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.status !== currentValues.status
          }
        >
          {({ getFieldValue }) => {
            const isOpened = getFieldValue('status') === 'opened';
            return (
              <Row justify="space-between">
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
              </Row>
            );
          }}
        </Form.Item>
      </Form>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
