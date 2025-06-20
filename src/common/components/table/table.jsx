import React from 'react';
import { Table, Input, Select } from 'antd';

// const tableStyles = `
//   .ant-table .ant-table-tbody > tr > td.editable-cell {
//     // padding: 1px !important;
//   }
// `;

function GenericTable({
  columns,
  loading,
  dataSource,
  onCellChange,
  footer = null,
  bordered = true,
  showHeader = true
}) {
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

      // Add onCell property to add class for editable cells
      col.onCell = () => {
        return {
          className: 'editable-cell'
        };
      };
    }
    return col;
  });

  return (
    <React.Fragment>
      <Table
        size="middle"
        footer={footer}
        loading={loading}
        pagination={false}
        bordered={bordered}
        dataSource={dataSource}
        showHeader={showHeader}
        columns={transformedColumns}
      />
    </React.Fragment>
  );
}

export { GenericTable };
