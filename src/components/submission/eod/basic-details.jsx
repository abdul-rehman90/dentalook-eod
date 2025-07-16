import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Form, Row } from 'antd';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ActiveProviders from './active-providers';
import { ClockCircleOutlined } from '@ant-design/icons';
import { FormControl } from '@/common/utils/form-control';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import {
  formatTimeForUI,
  generateTimeSlots
} from '@/common/utils/time-handling';

const options = [
  { label: 'Open', value: 'opened' },
  { label: 'Close', value: 'closed' }
];

export default function BasicDetails() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState([]);
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
  const clinicId = currentStepData?.clinicDetails?.clinic;

  const initialValues = {
    user: null,
    clinic: null,
    province: null,
    status: 'closed',
    clinic_open_time: null,
    clinic_close_time: null,
    submission_date: dayjs()
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

  const moveRouter = (submission_id, values, activeProviders = []) => {
    toast.success('Record is successfully saved');
    updateStepData(currentStepId, {
      clinicDetails: values,
      activeProviders: activeProviders
    });
    router.push(`/submission/eod/${currentStep + 1}/${submission_id}`);
  };

  const addActiveProviders = async (values, submission_id) => {
    const activeProviders = tableData.filter((provider) => provider.is_active);

    // If no active providers, just go to next step
    if (activeProviders.length === 0) {
      moveRouter(submission_id, values);
      return;
    }

    try {
      const payload = activeProviders.map((provider) => ({
        ...provider,
        user: provider.id,
        eod_submission: Number(submission_id),
        start_time: provider.start_time
          ? dayjs(provider.start_time, 'h:mm a').format('HH:mm:ss')
          : null,
        end_time: provider.end_time
          ? dayjs(provider.end_time, 'h:mm a').format('HH:mm:ss')
          : null
      }));
      const response = await EODReportService.addActiveProviders(payload);
      if (response.status === 201) {
        moveRouter(submission_id, values, payload);
      }
    } catch (error) {}
  };

  const handleSubmit = async () => {
    if (id) return router.push(`/submission/eod/${currentStep + 1}/${id}`);
    const invalidProviders = tableData.filter(
      (provider) =>
        provider.is_active &&
        (!provider.end_time ||
          !provider.no_shows ||
          !provider.start_time ||
          !provider.unfilled_spots ||
          !provider.number_of_patients_seen ||
          !provider.short_notice_cancellations)
    );

    if (invalidProviders.length > 0) {
      toast.error('Please set all the field values for all active providers');
      return;
    }
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        ...values,
        submission_date: dayjs(values.submission_date).format('YYYY-MM-DD'),
        clinic_open_time:
          values.status === 'opened'
            ? dayjs(values.clinic_open_time, 'h:mm a').format('HH:mm:ss')
            : null,
        clinic_close_time:
          values.status === 'opened'
            ? dayjs(values.clinic_close_time, 'h:mm a').format('HH:mm:ss')
            : null
      };

      const response = await EODReportService.addBasicDetails(payload);
      if (response.status === 201) {
        const submission_id = response.data.data.id;
        addActiveProviders(payload, submission_id);
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
      clinic: currentStepData.clinicDetails.clinic,
      province: currentStepData.clinicDetails.province,
      status: currentStepData.clinicDetails.status || 'closed',
      clinic_open_time: formatTimeForUI(
        currentStepData.clinicDetails.clinic_open_time
      ),
      clinic_close_time: formatTimeForUI(
        currentStepData.clinicDetails.clinic_close_time
      ),
      user:
        currentStepData.clinicDetails.user ||
        currentStepData.clinicDetails.regional_manager_id,
      submission_date: currentStepData.clinicDetails.submission_date
        ? dayjs(currentStepData.clinicDetails.submission_date)
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
        currentStepData?.clinicDetails?.province_id ||
          currentStepData?.clinicDetails?.province
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
            prevValues.status !== currentValues.status ||
            prevValues.clinic_open_time !== currentValues.clinic_open_time ||
            prevValues.clinic_close_time !== currentValues.clinic_close_time
          }
        >
          {({ getFieldValue }) => {
            const openTime = getFieldValue('clinic_open_time');
            const closeTime = getFieldValue('clinic_close_time');
            const isOpened = getFieldValue('status') === 'opened';
            const shouldShowProviders = isOpened && openTime && closeTime;
            return (
              <React.Fragment>
                <Row justify="space-between">
                  <FormControl
                    control="select"
                    label="Open From"
                    required={isOpened}
                    disabled={!isOpened}
                    name="clinic_open_time"
                    suffixIcon={<ClockCircleOutlined />}
                    options={generateTimeSlots(7, 22, 30)}
                  />
                  <FormControl
                    label="Open To"
                    control="select"
                    required={isOpened}
                    disabled={!isOpened}
                    name="clinic_close_time"
                    suffixIcon={<ClockCircleOutlined />}
                    options={generateTimeSlots(7, 22, 30)}
                  />
                </Row>
                {shouldShowProviders && (
                  <ActiveProviders
                    form={form}
                    tableData={tableData}
                    setTableData={setTableData}
                  />
                )}
              </React.Fragment>
            );
          }}
        </Form.Item>
      </Form>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
