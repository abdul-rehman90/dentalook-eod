import React, { useEffect, useState } from 'react';
import { Input, Select } from 'antd';

export default function EditableCell({
  value,
  field,
  onCommit,
  recordKey,
  options = [],
  type = 'text',
  placeholder = '',
  disabled = false
}) {
  const [localValue, setLocalValue] = useState(value ?? '');

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  if (type === 'select') {
    return (
      <Select
        options={options}
        disabled={disabled}
        value={localValue || undefined}
        onChange={(val) => {
          setLocalValue(val);
          onCommit(recordKey, field, val);
        }}
      />
    );
  }

  return (
    <Input
      value={localValue}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onCommit(recordKey, field, localValue)}
    />
  );
}
