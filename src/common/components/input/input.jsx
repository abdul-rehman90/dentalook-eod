import React from 'react';
import { Form, Input } from 'antd';

export default function InputField({
  name,
  label,
  required,
  message = '',
  placeholder = ''
}) {
  return (
    <Form.Item
      name={name}
      labelAlign="left"
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 12 }}
      rules={[{ required, message: `${label} is required` }]}
      label={
        <span className="text-base font-medium text-black">
          {label} {required ? <span className="text-[#E62E2E]">*</span> : null}
        </span>
      }
    >
      <Input placeholder={placeholder} />
    </Form.Item>
  );
}
