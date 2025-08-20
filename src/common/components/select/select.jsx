import React from 'react';
import { Form, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export default function SelectField({
  name,
  label,
  options,
  required,
  onChange,
  message = '',
  disabled = false,
  showSearch = false,
  placeholder = 'Select one',
  suffixIcon = <DownOutlined />
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
        <span className="text-[15px] font-medium text-black">
          {label} {required ? <span className="text-[#E62E2E]">*</span> : null}
        </span>
      }
    >
      <Select
        onChange={onChange}
        disabled={disabled}
        showSearch={showSearch}
        suffixIcon={suffixIcon}
        placeholder={placeholder}
        filterOption={(input, option) =>
          (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
        }
      >
        {options.map((item) => (
          <Select.Option value={item.value}>{item.label}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
