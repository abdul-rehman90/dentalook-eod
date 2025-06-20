import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { Form } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function BasicDetails({ onNext }) {
  const [form] = Form.useForm();
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  useEffect(() => {
    if (Object.entries(currentStepData).length > 0) {
      const formValues = {
        province: currentStepData.province,
        practice_name: currentStepData.clinic_name,
        proud_moment: currentStepData.proud_moment,
        regional_manager: currentStepData.regional_manager,
        submission_month: dayjs(currentStepData.submission_month)
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
          picker="month"
          format="MMM YYYY"
          name="submission_month"
          label="Submission Month"
          placeholder="Select Date"
        />
        <div className="proud-moment">
          <FormControl
            disabled
            control="input"
            name="proud_moment"
            label="Proud Moment of the Month:"
            placeholder="Write your proud moment"
          />
        </div>
      </Form>
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
