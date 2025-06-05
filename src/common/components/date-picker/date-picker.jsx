import React from 'react';
import { DatePicker, Form } from 'antd';

export default function DatePickerField({
  name,
  label,
  required,
  placeholder,
  message = '',
  picker = 'day',
  disabled = false,
  format = 'MM/DD/YYYY',
  disableFutureDates = true
}) {
  const disabledDate = disableFutureDates
    ? (current) => {
        if (!current) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return current.toDate() > today;
      }
    : undefined;

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
      <DatePicker
        picker={picker}
        format={format}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder={placeholder}
        disabledDate={disabledDate}
      />
    </Form.Item>
  );
}
