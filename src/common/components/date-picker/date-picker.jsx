import React from 'react';
import { DatePicker, Form } from 'antd';

export default function DatePickerField({
  name,
  label,
  required,
  placeholder,
  message = ''
}) {
  return (
    <Form.Item
      labelAlign="left"
      name={name}
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 12 }}
      rules={[{ required, message: `${label} is required` }]}
      label={
        <span className="text-base font-medium text-black">
          {label} {required ? <span className="text-[#E62E2E]">*</span> : null}
        </span>
      }
    >
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>
  );
}
