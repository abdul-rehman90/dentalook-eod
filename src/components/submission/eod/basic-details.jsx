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
  const [isInitialized, setIsInitialized] = useState(false);
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
      setPractices(clinics);

      if (clinics.length > 0) {
        form.setFieldsValue({
          clinic: clinics[0].value,
          user: clinics[0].managers[0]?.value
        });
        setRegionalManagers(clinics[0].managers);
      }

      // setRegionalManagers([]);
      // form.setFieldsValue({ clinic: undefined, user: undefined });
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

      const response = await EODReportService.sumbmissionOfBasicDetails(
        payload
      );
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
      setIsInitialized(false);
    }
  };

  const initializeForm = async () => {
    if (!clinicId) {
      form.setFieldsValue({
        user: undefined,
        status: 'closed',
        clinic: undefined,
        province: undefined,
        clinic_open_time: null,
        clinic_close_time: null,
        submission_date: dayjs()
      });
      return;
    }
    try {
      const { data } = await EODReportService.getDataOfProvinceById(
        currentStepData?.province_id || currentStepData?.province
      );
      setPractices(
        data.clinics.map((clinic) => ({
          value: clinic.clinic_id,
          label: clinic.clinic_name,
          managers: clinic.regional_managers.map((manager) => ({
            value: manager.id,
            label: manager.name
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
        if (data.length > 0) {
          form.setFieldsValue({ province: data[0].id });
          handleProvinceChange(data[0].id);
        }
      } catch (error) {}
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (isInitialized) initializeForm();
  }, [isInitialized, clinicId]);

  useEffect(() => setIsInitialized(true), []);

  return (
    <React.Fragment>
      <Form
        form={form}
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
