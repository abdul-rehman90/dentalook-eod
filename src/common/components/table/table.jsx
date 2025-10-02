import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { Table, Select, Pagination, Input } from 'antd';

const InputCell = memo(
  ({ value, type, prefix, disabled, onChange, onBlur, className, rowKey }) => {
    const [localValue, setLocalValue] = useState(
      value === undefined || value === null ? '' : String(value)
    );

    const debouncedOnChange = useMemo(
      () =>
        debounce((val) => {
          if (typeof onChange === 'function') onChange(val);
        }, 500),
      [onChange]
    );

    useEffect(() => {
      return () => {
        debouncedOnChange.cancel();
      };
    }, [debouncedOnChange]);

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

      if (!onChange || typeof onChange !== 'function') return;

      if (!prefix) {
        if (type === 'number') {
          onChange(newValue);
        } else {
          debouncedOnChange(newValue);
        }
      }
    };

    const handleBlur = () => {
      if (prefix) {
        let formattedValue = localValue;
        if (!isNaN(localValue) && localValue.trim() !== '') {
          formattedValue = parseFloat(localValue).toFixed(2);
        }
        setLocalValue(formattedValue);
        if (typeof onBlur === 'function') onBlur(formattedValue);
        else if (typeof onChange === 'function') onChange(formattedValue);
      } else {
        if (typeof onBlur === 'function') onBlur(localValue);
      }
    };

    useEffect(() => {
      setLocalValue(value === undefined || value === null ? '' : String(value));
    }, [rowKey, value]);

    return (
      <Input
        type={type}
        prefix={prefix}
        value={localValue}
        disabled={disabled}
        onBlur={handleBlur}
        className={className}
        onChange={handleChange}
      />
    );
  }
);

const SelectCell = memo(({ value, options, disabled, onChange, className }) => (
  <Select
    value={value}
    options={options}
    disabled={disabled}
    onChange={onChange}
    className={className}
  />
));

function GenericTable({
  columns,
  loading,
  onCellChange,
  footer = null,
  rowKey = 'key',
  dataSource = [],
  bordered = true,
  showHeader = true,
  showPagination = false,
  paginationOptions = { pageSize: 10, current: 1, showSizeChanger: true }
}) {
  const AMOUNT_REGEX = /^(\d+)(\.\d{0,2})?$/;
  const [currentPage, setCurrentPage] = useState(
    paginationOptions.current || 1
  );
  const [paginatedData, setPaginatedData] = useState([]);
  const [pageSize, setPageSize] = useState(paginationOptions.pageSize || 10);

  const isValidAmountInput = (value) => {
    if (value === '' || value == null) return true;
    return AMOUNT_REGEX.test(value);
  };

  const handleNumberChange = useCallback(
    (record, dataIndex, value) => {
      const v = String(value).trim();
      if (!isValidAmountInput(v)) return;
      if (typeof onCellChange === 'function')
        onCellChange(record, dataIndex, v);
    },
    [onCellChange]
  );

  const handleNumberBlur = useCallback(
    (record, dataIndex, value) => {
      if (value === '' || value === null || value === undefined) {
        if (typeof onCellChange === 'function')
          onCellChange(record, dataIndex, '');
        return;
      }
      const num = parseFloat(value);
      if (isNaN(num)) {
        if (typeof onCellChange === 'function')
          onCellChange(record, dataIndex, '');
        return;
      }
      const formattedValue = num.toFixed(2);
      if (typeof onCellChange === 'function')
        onCellChange(record, dataIndex, formattedValue);
    },
    [onCellChange]
  );

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
    if (paginationOptions.onChange)
      paginationOptions.onChange(page, newPageSize);
  };

  const transformedColumns = useMemo(
    () =>
      columns.map((col) => {
        if (!col.render && col.editable) {
          col.render = (text, record) => {
            const isDisabled =
              typeof col.disabled === 'function'
                ? col.disabled(record)
                : col.disabled;

            const cellContent =
              col.inputType === 'select' && col.selectOptions ? (
                <SelectCell
                  value={text}
                  disabled={isDisabled}
                  options={col.selectOptions}
                  onChange={(value) =>
                    typeof onCellChange === 'function' &&
                    onCellChange(record, col.dataIndex, value)
                  }
                  className={
                    record.type === 'CC/DEBIT REFUND'
                      ? 'refund-amount-cell'
                      : ''
                  }
                />
              ) : col.inputType === 'number' ? (
                <InputCell
                  value={text}
                  type="number"
                  disabled={isDisabled}
                  rowKey={record[rowKey]}
                  prefix={col.prefix || ''}
                  onChange={(value) =>
                    handleNumberChange(record, col.dataIndex, value)
                  }
                  onBlur={(value) =>
                    handleNumberBlur(record, col.dataIndex, value)
                  }
                  className={
                    record.type === 'CC/DEBIT REFUND'
                      ? 'refund-amount-cell'
                      : ''
                  }
                />
              ) : (
                <InputCell
                  value={text}
                  type={col.inputType}
                  disabled={isDisabled}
                  rowKey={record[rowKey]}
                  prefix={col.prefix || ''}
                  onChange={(value) =>
                    typeof onCellChange === 'function' &&
                    onCellChange(record, col.dataIndex, value)
                  }
                  onBlur={(value) =>
                    typeof onCellChange === 'function' &&
                    onCellChange(record, col.dataIndex, value)
                  }
                  className={
                    record.type === 'CC/DEBIT REFUND'
                      ? 'refund-amount-cell'
                      : ''
                  }
                />
              );

            return <div className="h-full">{cellContent}</div>;
          };
          col.onCell = () => ({ className: 'editable-cell' });
        }
        return col;
      }),
    [columns, onCellChange, rowKey, handleNumberChange, handleNumberBlur]
  );

  useEffect(() => {
    if (showPagination) {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setPaginatedData(dataSource.slice(start, end));
    } else {
      setPaginatedData(dataSource);
    }
  }, [currentPage, pageSize, dataSource, showPagination]);

  return (
    <div>
      <Table
        size="middle"
        rowKey={rowKey}
        loading={loading}
        pagination={false}
        bordered={bordered}
        showHeader={showHeader}
        dataSource={paginatedData}
        columns={transformedColumns}
        summary={footer ? footer : null}
      />

      {showPagination && (
        <div className="flex justify-center mt-5">
          <Pagination
            pageSize={pageSize}
            current={currentPage}
            total={dataSource.length}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger={paginationOptions.showSizeChanger}
          />
        </div>
      )}
    </div>
  );
}

export { GenericTable };
