'use client';

import React from 'react';
import { Modal, Table } from 'antd';

export default function CardDetailsModal({
  data,
  title,
  columns,
  visible,
  onCancel
}) {
  return (
    <Modal
      width={1000}
      footer={null}
      open={visible}
      onCancel={onCancel}
      title={
        <div className="p-4">
          <h4
            style={{
              marginBottom: 0,
              fontWeight: 500,
              color: '#030303'
            }}
          >
            {title}
          </h4>
        </div>
      }
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Modal>
  );
}
