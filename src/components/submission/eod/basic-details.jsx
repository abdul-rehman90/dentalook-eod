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
  const { steps, provinces, updateStepData, currentStep, getCurrentStepData } =
    useGlobalContext();
  const currentStepData = getCurrentStepData();

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

  const createBasicDetails = async () => {
    try {
      const values = await form.validateFields();
      const formattedData = {
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

      const { data } = await EODReportService.sumbmissionOfBasicDetails(
        formattedData
      );
      if (data.data) {
        const currentStepId = steps[currentStep - 1].id;
        updateStepData(currentStepId, formattedData);
        toast.success(data.message);
        onNext();
      }
    } catch (error) {}
  };

  const handleProvinceChange = async (provinceId) => {
    if (!provinceId) return;

    try {
      const { data } = await EODReportService.getDataOfProvinceById(provinceId);
      setRegionalManagers(
        data.users.map((manager) => ({
          value: manager.id,
          label: manager.name
        }))
      );
      setPractices(
        data.clinics.map((practice) => ({
          value: practice.id,
          label: practice.name
        }))
      );

      // if (!currentStepData?.province) {
      //   form.setFieldsValue({ user: undefined, clinic: undefined });
      // }
    } catch (error) {}
  };

  useEffect(() => {
    if (currentStepData?.province)
      handleProvinceChange(currentStepData.province);
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
          name="user"
          control="select"
          label="Regional Manager"
          options={regionalManagers}
        />
        <FormControl
          required
          name="clinic"
          control="select"
          options={practices}
          label="Practice Name"
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
      <StepNavigation onNext={createBasicDetails} />
    </React.Fragment>
  );
}
