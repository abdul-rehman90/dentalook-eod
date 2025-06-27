import React from 'react';
import { Form, Select } from 'antd';

export default function SelectField({
  name,
  label,
  options,
  required,
  onChange,
  message = '',
  disabled = false,
  placeholder = 'Select one'
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
      <Select onChange={onChange} disabled={disabled} placeholder={placeholder}>
        {options.map((item) => (
          <Select.Option value={item.value}>{item.label}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
