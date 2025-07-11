import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { Form, Row } from 'antd';
import ActiveProviders from './active-providers';
import { ClockCircleOutlined } from '@ant-design/icons';
import { FormControl } from '@/common/utils/form-control';
import { formatTimeForUI } from '@/common/utils/time-handling';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const options = [
  { label: 'Open', value: 'open' },
  { label: 'Close', value: 'close' }
];

function generateTimeSlots(startHour, endHour, intervalMinutes) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const period = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const timeString = `${displayHour}:${
        minute === 0 ? '00' : minute
      } ${period}`;
      slots.push({ label: timeString, value: timeString });
    }
  }
  return slots;
}

export default function BasicDetails({ onNext }) {
  const [form] = Form.useForm();
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  useEffect(() => {
    if (
      currentStepData?.clinicDetails &&
      Object.entries(currentStepData.clinicDetails).length > 0
    ) {
      const formValues = {
        province: currentStepData.clinicDetails.province,
        practice_name: currentStepData.clinicDetails.clinic_name,
        regional_manager: currentStepData.clinicDetails.regional_manager,
        submission_date: dayjs(currentStepData.clinicDetails.submission_date),
        open_to: formatTimeForUI(
          currentStepData.clinicDetails.clinic_close_time
        ),
        open_from: formatTimeForUI(
          currentStepData.clinicDetails.clinic_open_time
        ),
        clinic:
          currentStepData.clinicDetails.status === 'opened' ? 'open' : 'close'
      };

      form.setFieldsValue(formValues);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <Form form={form} style={{ padding: '0 24px' }}>
        <Row justify="space-between">
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
        </Row>
        <Row justify="space-between">
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
        </Row>
        <Row justify="space-between">
          <FormControl
            disabled
            name="clinic"
            control="radio"
            options={options}
            label="Clinic Open/Closed?"
          />
        </Row>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.clinic !== currentValues.clinic ||
            prevValues.open_to !== currentValues.open_to ||
            prevValues.open_from !== currentValues.open_from
          }
        >
          {({ getFieldValue }) => {
            const closeTime = getFieldValue('open_to');
            const openTime = getFieldValue('open_from');
            const isOpened = getFieldValue('clinic') === 'open';
            const shouldShowProviders = isOpened && openTime && closeTime;
            return (
              <React.Fragment>
                <Row justify="space-between">
                  <FormControl
                    disabled
                    control="select"
                    name="open_from"
                    label="Open From"
                    suffixIcon={<ClockCircleOutlined />}
                    options={generateTimeSlots(7, 22, 30)}
                  />
                  <FormControl
                    disabled
                    name="open_to"
                    label="Open To"
                    control="select"
                    suffixIcon={<ClockCircleOutlined />}
                    options={generateTimeSlots(7, 22, 30)}
                  />
                </Row>
                {shouldShowProviders && <ActiveProviders form={form} />}
              </React.Fragment>
            );
          }}
        </Form.Item>
      </Form>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
