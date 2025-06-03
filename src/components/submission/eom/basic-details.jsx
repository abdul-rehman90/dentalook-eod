import React from 'react';
import { Form } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function BasicDetails({ onNext }) {
  const [form] = Form.useForm();

  const selectOptions = [
    { value: 'california', label: 'California' },
    { value: 'new_york', label: 'New York' },
    { value: 'texas', label: 'Texas' },
    { value: 'florida', label: 'Florida' }
  ];

  const createBasicDetails = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      onNext();
    } catch (error) {
      return;
    }
  };

  return (
    <React.Fragment>
      <Form form={form} style={{ width: '50%', padding: '0 24px' }}>
        <FormControl
          required
          name="province"
          control="select"
          label="Province"
          options={selectOptions}
        />
        <FormControl
          control="select"
          options={selectOptions}
          name="regional_manager"
          label="Regional Manager"
        />
        <FormControl
          required
          control="select"
          name="practice_name"
          label="Practice Name"
          options={selectOptions}
        />
        <FormControl
          required
          control="date"
          picker="month"
          format="MMM YYYY"
          name="submission_date"
          label="Submission Date"
          placeholder="Select Date"
        />
        <div className="proud-moment">
          <FormControl
            name="moment"
            control="input"
            label="Proud Moment of the Month:"
            placeholder="Write your proud moment"
          />
        </div>
      </Form>
      <StepNavigation onNext={createBasicDetails} />
    </React.Fragment>
  );
}
