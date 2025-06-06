import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { FormControl } from '@/common/utils/form-control';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

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

export default function BasicDetails({ onNext }) {
  const [form] = Form.useForm();
  const { data, setData } = useGlobalContext();
  const [clinicStatus, setClinicStatus] = useState(data?.clinic || 'close');

  const createBasicDetails = async () => {
    try {
      const values = await form.validateFields();
      setData(values);
      onNext();
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
      setClinicStatus(data.clinic || 'close');
    }
  }, []);

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
