import React from 'react';
import { Form, Input } from 'antd';

export default function InputField({
  name,
  label,
  required,
  message = '',
  disabled = false,
  placeholder = ''
}) {
  return (
    <Form.Item
      name={name}
      labelAlign="left"
      labelCol={{ span: 10 }}
      style={{ width: '50%' }}
      wrapperCol={{ span: 13 }}
      rules={[{ required, message: `${label} is required` }]}
      label={
        <span className="text-base font-medium text-black">
          {label} {required ? <span className="text-[#E62E2E]">*</span> : null}
        </span>
      }
    >
      <Input disabled={disabled} placeholder={placeholder} />
    </Form.Item>
  );
}
