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

        if (picker === 'month') {
          // For month picker, compare year and month only
          const currentYear = current.year();
          const currentMonth = current.month(); // 0-11 (Jan-Dec)
          const todayYear = today.getFullYear();
          const todayMonth = today.getMonth();

          // Allow current month and next month
          const nextMonth = new Date(todayYear, todayMonth + 1, 1);
          const nextMonthYear = nextMonth.getFullYear();
          const nextMonthMonth = nextMonth.getMonth();

          // Disable months after next month
          return (
            currentYear > nextMonthYear ||
            (currentYear === nextMonthYear && currentMonth > nextMonthMonth)
          );
        } else {
          // Original day-level logic
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return current.toDate() > tomorrow;
        }
      }
    : undefined;

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
