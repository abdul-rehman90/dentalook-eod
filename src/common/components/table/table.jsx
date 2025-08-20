import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { Table, Input, Select } from 'antd';
import { useSortable } from '@dnd-kit/sortable';

const Row = ({ children, ...props }) => {
  const {
    listeners,
    transform,
    attributes,
    setNodeRef,
    transition,
    isDragging
  } = useSortable({
    id: props['data-row-key']
  });

  const style = {
    transition,
    cursor: 'move',
    ...props.style,
    transform: CSS.Transform.toString(transform),
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {})
  };

  return (
    <tr
      {...props}
      style={style}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      {children}
    </tr>
  );
};

function GenericTable({
  columns,
  loading,
  onCellChange,
  footer = null,
  dataSource = [],
  bordered = true,
  showHeader = true
}) {
  const AMOUNT_REGEX = /^(\d+)(\.\d{0,2})?$/;

  const isValidAmountInput = (value) => {
    if (value === '' || value == null) return true;
    return AMOUNT_REGEX.test(value);
  };

  const handleNumberChange = (record, dataIndex, value) => {
    const v = String(value).trim();
    if (!isValidAmountInput(v)) return;
    onCellChange(record, dataIndex, v);
  };

  const handleNumberBlur = (record, dataIndex, value) => {
    if (value === '' || value === null || value === undefined) {
      onCellChange(record, dataIndex, '');
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      onCellChange(record, dataIndex, '');
      return;
    }

    // Format to two decimal places
    const formattedValue = num.toFixed(2);
    onCellChange(record, dataIndex, formattedValue);
  };

  const transformedColumns = columns.map((col) => {
    if (!col.render && col.editable) {
      col.render = (text, record) => {
        const cellContent =
          col.inputType === 'select' && col.selectOptions ? (
            <Select
              value={text}
              disabled={col.disabled}
              style={{ width: '100%' }}
              options={col.selectOptions}
              onChange={(value) => onCellChange(record, col.dataIndex, value)}
            />
          ) : col.inputType === 'number' ? (
            <Input
              value={text}
              prefix={'$'}
              type="number"
              controls={false}
              disabled={col.disabled}
              onChange={(e) =>
                handleNumberChange(record, col.dataIndex, e.target.value)
              }
              onBlur={(e) =>
                handleNumberBlur(record, col.dataIndex, e.target.value)
              }
            />
          ) : (
            <Input
              value={text}
              controls={false}
              type={col.inputType}
              disabled={col.disabled}
              onChange={(e) =>
                onCellChange(record, col.dataIndex, e.target.value)
              }
            />
          );

        return <div className="h-full">{cellContent}</div>;
      };

      col.onCell = () => {
        return {
          className: 'editable-cell'
        };
      };
    }
    return col;
  });

  return (
    <Table
      rowKey="key"
      size="middle"
      footer={footer}
      loading={loading}
      pagination={false}
      bordered={bordered}
      showHeader={showHeader}
      dataSource={dataSource}
      columns={transformedColumns}
      components={{ body: { row: Row } }}
    />
  );
}

export { GenericTable };
