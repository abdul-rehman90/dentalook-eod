import React, { useState } from 'react';
import { Form } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function BasicDetails({ onNext }) {
  const [form] = Form.useForm();
  const [clinicStatus, setClinicStatus] = useState('close');

  const options = [
    { label: 'Open', value: 'open' },
    { label: 'Close', value: 'close' }
  ];

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
          // required
          disabled
          name="province"
          control="select"
          label="Province"
          options={selectOptions}
        />
        <FormControl
          disabled
          control="select"
          options={selectOptions}
          name="regional_manager"
          label="Regional Manager"
        />
        <FormControl
          // required
          disabled
          control="select"
          name="practice_name"
          label="Practice Name"
          options={selectOptions}
        />
        <FormControl
          // required
          disabled
          control="date"
          name="submission_date"
          label="Submission Date"
        />
        <FormControl
          name="clinic"
          control="radio"
          options={options}
          label="Clinic Open/Closed?"
          onChange={(e) => setClinicStatus(e.target.value)}
        />
        <FormControl
          control="time"
          name="open_from"
          label="Open From"
          required={clinicStatus === 'open'}
          disabled={clinicStatus === 'close'}
        />
        <FormControl
          control="time"
          name="open_to"
          label="Open To"
          required={clinicStatus === 'open'}
          disabled={clinicStatus === 'close'}
        />
      </Form>
      <StepNavigation onNext={createBasicDetails} />
    </React.Fragment>
  );
}
