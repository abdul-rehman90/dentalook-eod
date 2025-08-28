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

  const getMissedOpportunitiesFooter = () => {
    if (title !== 'Missed Opportunities' || !data || data.length === 0) {
      return null;
    }

    const totalHours = data.reduce(
      (sum, record) => sum + (record.total_number_in_hours || 0),
      0
    );
    const totalValueMissed = data.reduce(
      (sum, record) => sum + (record.total_value_missed || 0),
      0
    );

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={8} className="font-semibold">
          Total
        </Table.Summary.Cell>
        <Table.Summary.Cell index={8} className="font-semibold">
          {totalHours.toFixed(2)}
        </Table.Summary.Cell>
        <Table.Summary.Cell index={9} className="font-semibold">
          ${totalValueMissed.toFixed(2)}
        </Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  const treeData = title === 'Total Production' ? prepareTreeData(data) : data;

  return (
    <Modal
      width={1200}
      footer={null}
      open={visible}
      onCancel={onCancel}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      title={
        <div className="p-4">
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        </div>
      }
    >
      <Table
        columns={columns}
        pagination={false}
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
        summary={
          title === 'Missed Opportunities'
            ? getMissedOpportunitiesFooter
            : undefined
        }
      />
    </Modal>
  );
}
