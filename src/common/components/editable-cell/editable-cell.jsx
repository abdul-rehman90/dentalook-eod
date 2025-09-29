import React, { useEffect, useState } from 'react';
import { Input, Select } from 'antd';

export default function EditableCell({
  value,
  field,
  onCommit,
  recordKey,
  prefix = '',
  options = [],
  type = 'text',
  className = '',
  placeholder = '',
  disabled = false,
  showSearch = false
}) {
  const [localValue, setLocalValue] = useState(value ?? '');

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  if (type === 'select') {
    return (
      <Select
        showSearch={showSearch}
        filterOption={
          showSearch
            ? (input, option) =>
                option.label?.toLowerCase().includes(input.toLowerCase())
            : false
        }
        options={options}
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        value={localValue || undefined}
        onChange={(val) => {
          setLocalValue(val);
          onCommit(recordKey, field, val);
        }}
      />
    );
  }

  const handleChange = (e) => {
    let newValue = e.target.value;

    if (prefix) {
      newValue = newValue.replace(/[^0-9.]/g, '');
      const parts = newValue.split('.');
      if (parts[1]?.length > 2) {
        parts[1] = parts[1].slice(0, 2);
        newValue = parts.join('.');
      }
    }

    setLocalValue(newValue);
  };

  const handleBlur = () => {
    let formattedValue = localValue;
    if (prefix && localValue !== '') {
      const num = parseFloat(localValue);
      if (!isNaN(num)) {
        formattedValue = num.toFixed(2);
      }
    }
    setLocalValue(formattedValue);
    onCommit(recordKey, field, formattedValue);
  };

  return (
    <Input
      type={type}
      prefix={prefix}
      value={localValue}
      disabled={disabled}
      onBlur={handleBlur}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
