import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Form, Row } from 'antd';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import WeeklySchedule from './weekly-schedule';
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
  { label: 'Open', value: 'open' },
  { label: 'Close', value: 'close' }
];

export default function BasicDetails() {
  const router = useRouter();
  const [form] = Form.useForm();
  const status = Form.useWatch('status', form);
  const [tableData, setTableData] = useState([]);
  const [practices, setPractices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [regionalManagers, setRegionalManagers] = useState([]);
  const submissionDate = Form.useWatch('submission_date', form);
  const [selectedDays, setSelectedDays] = useState(
    new Set([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ])
  );
  const {
    id,
    steps,
    setDirty,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = currentStepData?.clinicDetails?.clinic;
  const submissionId = currentStepData?.clinicDetails?.eodsubmission_id;
  const eod_submission = submissionId || id;

  const initialValues = {
    user: null,
    status: null,
    clinic: null,
    province: null,
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

      const selectedClinic =
        (clinicId && clinics.find((c) => c.value === clinicId)) || clinics[0];
      // setDirty(true);
      setPractices(clinics);
      setRegionalManagers(selectedClinic?.managers || []);
      form.setFieldsValue({
        province: provinceId,
        clinic: selectedClinic?.value,
        user: selectedClinic?.managers?.[0]?.value
      });
    } catch (error) {}
  };

  const handleClinicChange = (clinicId) => {
    if (!clinicId) return;

    const selectedClinic = practices.find(
      (clinic) => clinic.value === clinicId
    );

    // setDirty(true);
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

  const handleSubmitEODReport = async (submission_id) => {
    try {
      setLoading(true);
      const response = await EODReportService.submissionEODReport({
        eodsubmission_id: submission_id
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

  const addWeeklySchedule = async (weeklyPayloadParam) => {
    try {
      const response = await EODReportService.addWeeklySchedule(
        weeklyPayloadParam
      );
      if (response.status === 201) {
        toast.success('Weekly schedule saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save weekly schedule');
    }
  };

  const moveRouter = useCallback(
    (submission_id, values, activeProviders = [], weeklySchedule = null) => {
      updateStepData(currentStepId, {
        weeklySchedule: weeklySchedule,
        activeProviders: activeProviders,
        clinicDetails: { ...values, eodsubmission_id: submission_id }
      });
      toast.success('Record is successfully saved');
      router.push(`/submission/eod/${currentStep + 1}/${submission_id}`);
    },
    [currentStep, currentStepId, router, updateStepData]
  );

  const addActiveProviders = useCallback(
    async (values, submission_id, navigate, weeklySchedule = null) => {
      const activeProviders = tableData.filter(
        (provider) => provider.is_active
      );

      // If no active providers, just go to next step
      if (activeProviders.length === 0) {
        setDirty(false);
        if (navigate) {
          moveRouter(submission_id, values, [], weeklySchedule);
        } else {
          updateStepData(currentStepId, {
            weeklySchedule: weeklySchedule,
            activeProviders: activeProviders,
            clinicDetails: { ...values, eodsubmission_id: submission_id }
          });
          toast.success('Record is successfully saved');
        }
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
          setDirty(false);
          if (navigate) {
            moveRouter(submission_id, values, payload, weeklySchedule);
          } else {
            toast.success('Record is successfully saved');
            updateStepData(currentStepId, {
              weeklySchedule: weeklySchedule,
              activeProviders: payload || [],
              clinicDetails: { ...values, eodsubmission_id: submission_id }
            });
          }
        }
      } catch (error) {}
    },
    [tableData, moveRouter]
  );

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const incompleteProviders = tableData
          .filter((provider) => provider.is_active)
          .map((provider) => {
            const errors = [];
            if (!provider.start_time) errors.push('start time');
            if (!provider.end_time) errors.push('end time');
            return {
              provider,
              errors
            };
          })
          .filter(({ errors }) => errors.length > 0);

        if (incompleteProviders.length > 0) {
          const uniqueErrors = [
            ...new Set(incompleteProviders.flatMap(({ errors }) => errors))
          ];

          const errorMessage = uniqueErrors.join(', ');

          toast.error(
            `Please complete the following fields for active providers: ${errorMessage}`,
            { duration: 10000 }
          );
          return false;
        }

        const values = await form.validateFields();
        const payload = {
          ...values,
          ...(eod_submission && { eodsubmission_id: eod_submission }),
          submission_date: dayjs(values.submission_date).format('YYYY-MM-DD'),
          clinic_open_time:
            values.status === 'open'
              ? dayjs(values.clinic_open_time, 'h:mm a').format('HH:mm:ss')
              : null,
          clinic_close_time:
            values.status === 'open'
              ? dayjs(values.clinic_close_time, 'h:mm a').format('HH:mm:ss')
              : null
        };

        setLoading(true);
        const response = await EODReportService.addBasicDetails(payload);
        if (response.status === 201) {
          const submission_id = response.data.data.id;
          const weeklyPayloadLocal = {
            clinic: values.clinic,
            created_at: dayjs(values.submission_date).format('YYYY-MM-DD'),
            monday: selectedDays.has('monday'),
            tuesday: selectedDays.has('tuesday'),
            wednesday: selectedDays.has('wednesday'),
            thursday: selectedDays.has('thursday'),
            friday: selectedDays.has('friday'),
            saturday: selectedDays.has('saturday'),
            sunday: selectedDays.has('sunday')
          };
          if (values.status === 'close') {
            await handleSubmitEODReport(submission_id);
          } else {
            await addWeeklySchedule(weeklyPayloadLocal);
            await addActiveProviders(
              payload,
              submission_id,
              navigate,
              weeklyPayloadLocal
            );
          }

          return true;
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.non_field_errors[0] || 'Failed to save record'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      id,
      form,
      setDirty,
      tableData,
      setLoading,
      selectedDays,
      currentStepData,
      addActiveProviders
    ]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  const initializeForm = async () => {
    form.setFieldsValue({
      clinic: currentStepData.clinicDetails.clinic,
      status: currentStepData.clinicDetails.status.toLowerCase() || 'close',
      province:
        currentStepData.clinicDetails.province_id ||
        currentStepData.clinicDetails.province,
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
      const savedSchedule = currentStepData?.weeklySchedule;
      if (savedSchedule) {
        const activeDays = Object.entries(savedSchedule)
          .filter(([key, value]) => value === true && key !== 'clinic')
          .map(([key]) => key);

        setSelectedDays(new Set(activeDays));
      }
    } else if (!id) {
      handleProvinceChange(provinces[0].value);
    }
  }, [clinicId, provinces]);

  useEffect(() => {
    window.addEventListener('stepNavigationSave', handleSave);
    window.addEventListener('stepNavigationNext', handleSubmit);

    return () => {
      window.removeEventListener('stepNavigationSave', handleSave);
      window.removeEventListener('stepNavigationNext', handleSubmit);
    };
  }, [handleSubmit, handleSave]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('formStatusChange', {
      detail: { status }
    }));
  }, [status]);

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
            const isOpened = getFieldValue('status') === 'open';
            const shouldShowProviders = isOpened && openTime && closeTime;
            return (
              <React.Fragment>
                <Row justify="space-between">
                  <FormControl
                    showSearch
                    control="select"
                    label="Open From"
                    required={isOpened}
                    disabled={!isOpened}
                    name="clinic_open_time"
                    suffixIcon={<ClockCircleOutlined />}
                    options={generateTimeSlots(7, 22, 30)}
                  />
                  <FormControl
                    showSearch
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
                  <WeeklySchedule
                    selectedDays={selectedDays}
                    submissionDate={submissionDate}
                    setSelectedDays={setSelectedDays}
                  />
                )}
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
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        isClinicClosed={status === 'close'}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
