import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Pagination } from 'antd';

function GenericTable({
  rowKey,
  columns,
  loading,
  onCellChange,
  footer = null,
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

      col.onCell = () => ({ className: 'editable-cell' });
    }
    return col;
  });

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
    if (paginationOptions.onChange) {
      paginationOptions.onChange(page, newPageSize);
    }
  };

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
        // components={{ body: { row: Row } }}
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
