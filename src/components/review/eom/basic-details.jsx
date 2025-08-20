import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { Form, Row } from 'antd';
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

  useEffect(() => {
    window.addEventListener('stepNavigationNext', onNext);
    return () => {
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [onNext]);

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
            picker="month"
            format="MMM YYYY"
            name="submission_month"
            label="Submission Month"
            placeholder="Select Date"
          />
        </Row>
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
      <StepNavigation
        onNext={onNext}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
