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
  const prepareTreeData = (submissions) => {
    return submissions.map((submission, index) => {
      const totalProduction =
        submission.prduction_by_provider?.reduce(
          (sum, provider) => sum + (provider.total_production || 0),
          0
        ) || 0;

      // Sort providers: DDS first, then others
      const sortedProviders = submission.prduction_by_provider
        ? [...submission.prduction_by_provider].sort((a, b) => {
            if (a.provider_type === 'DDS' && b.provider_type !== 'DDS') {
              return -1; // DDS comes first
            } else if (a.provider_type !== 'DDS' && b.provider_type === 'DDS') {
              return 1; // DDS comes first
            }
            return 0; // Keep original order for same types
          })
        : null;

      return {
        key: `submission-${index}`,
        clinic_name: submission.clinic_name,
        submission_date: submission.submission_date,
        total_production: `$${totalProduction.toFixed(2)}`,
        children: sortedProviders
          ? sortedProviders.map((provider, pIndex) => ({
              rowType: 'provider',
              provider_type: provider.provider_type,
              provider_name: provider.provider_name,
              key: `submission-${index}-provider-${pIndex}`,
              total_production: `$${provider.total_production.toFixed(2)}`
            }))
          : null
      };
    });
  };

  const treeData = title === 'Total Productions' ? prepareTreeData(data) : data;

  return (
    <Modal
      width={1200}
      footer={null}
      open={visible}
      onCancel={onCancel}
      title={
        <div className="p-4">
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        </div>
      }
    >
      <Table
        columns={columns}
        pagination={false}
        scroll={{ x: 1000 }}
        dataSource={treeData.sort(
          (a, b) => new Date(b.submission_date) - new Date(a.submission_date)
        )}
        expandable={{
          expandRowByClick: true,
          showExpandColumn: false
        }}
        onRow={(record) => ({
          className: record.rowType === 'provider' ? 'bg-gray-50' : ''
        })}
      />
    </Modal>
  );
}
