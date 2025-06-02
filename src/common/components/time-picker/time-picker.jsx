import React from 'react';
import { Form, TimePicker } from 'antd';

// import dayjs from 'dayjs';
const format = 'HH:mm';

export default function TimePickerField({
  name,
  label,
  required,
  disabled,
  placeholder,
  message = ''
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
      <TimePicker
        showNow={false}
        format={format}
        disabled={disabled}
        inputReadOnly={true}
        style={{ width: '100%' }}
        // popupClassName="hide-ok-button"
      />
    </Form.Item>
  );
}
