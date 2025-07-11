import React from 'react';
import { Form, Radio } from 'antd';

export default function RadioButtons({
  name,
  label,
  options,
  required,
  disabled,
  onChange,
  message = ''
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
      <Radio.Group disabled={disabled} options={options} onChange={onChange} />
    </Form.Item>
  );
}
