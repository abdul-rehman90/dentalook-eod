import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { Form } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const options = [
  { label: 'Open', value: 'open' },
  { label: 'Close', value: 'close' }
];

export default function BasicDetails({ onNext }) {
  const [form] = Form.useForm();
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  useEffect(() => {
    if (Object.entries(currentStepData).length > 0) {
      const parseTimeString = (timeString) => {
        if (!timeString) return null;
        return dayjs(timeString, 'HH:mm:ss').isValid()
          ? dayjs(timeString, 'HH:mm:ss')
          : null;
      };

      const formValues = {
        province: currentStepData.province,
        practice_name: currentStepData.clinic_name,
        regional_manager: currentStepData.regional_manager,
        submission_date: dayjs(currentStepData.submission_date),
        open_to: parseTimeString(currentStepData.clinic_close_time),
        open_from: parseTimeString(currentStepData.clinic_open_time),
        clinic: currentStepData.status === 'opened' ? 'open' : 'close'
      };

      form.setFieldsValue(formValues);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <Form form={form} style={{ width: '50%', padding: '0 24px' }}>
        <FormControl
          disabled
          name="province"
          control="input"
          label="Province"
        />
        <FormControl
          disabled
          control="input"
          name="regional_manager"
          label="Regional Manager"
        />
        <FormControl
          disabled
          control="input"
          name="practice_name"
          label="Practice Name"
        />
        <FormControl
          disabled
          control="date"
          name="submission_date"
          label="Submission Date"
        />
        <FormControl
          disabled
          name="clinic"
          control="radio"
          options={options}
          label="Clinic Open/Closed?"
        />
        <FormControl
          disabled
          control="time"
          name="open_from"
          label="Open From"
        />
        <FormControl disabled control="time" name="open_to" label="Open To" />
      </Form>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
