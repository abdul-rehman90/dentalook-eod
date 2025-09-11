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
  let treeData = data;

  // Group data by Number of New Patients
  const prepareNewPatientsData = (patients) => {
    const grouped = patients.reduce((acc, patient, index) => {
      const { source, ...rest } = patient;
      if (!acc[source]) {
        acc[source] = {
          source,
          children: [],
          patientsCount: 0,
          rowType: 'source',
          key: `source-${source}`
        };
      }
      acc[source].patientsCount += 1;
      acc[source].children.push({
        ...rest,
        no_of_patients: 1,
        rowType: 'patient',
        key: `source-${source}-patient-${index}`
      });
      return acc;
    }, {});

    return Object.values(grouped).map((group) => ({
      ...group,
      no_of_patients: group.patientsCount
    }));
  };

  // Group data by provider name
  const prepareProductionByProviderData = (submissions) => {
    const grouped = {};

    submissions.forEach((submission, sIndex) => {
      submission.prduction_by_provider?.forEach((provider, pIndex) => {
        const providerKey = provider.provider_id;

        if (!grouped[providerKey]) {
          grouped[providerKey] = {
            children: [],
            rowType: 'provider',
            total_production: 0,
            key: `provider-${providerKey}`,
            provider_id: provider.provider_id,
            clinic_name: submission.clinic_name,
            provider_name: provider.provider_name,
            provider_type: provider.provider_type,
            provider_email: provider.provider_email
          };
        }

        // add child submission row
        grouped[providerKey].children.push({
          rowType: 'submission',
          submission_id: submission.submission_id,
          provider_hours: provider.provider_hours,
          submission_date: submission.submission_date,
          production_per_hour: provider.production_per_hour,
          total_production: `$${provider.total_production.toFixed(2)}`,
          key: `provider-${providerKey}-submission-${sIndex}-${pIndex}`
        });

        // update provider total
        grouped[providerKey].total_production += provider.total_production || 0;
      });
    });

    // Format total_production as currency
    return Object.values(grouped).map((provider) => ({
      ...provider,
      total_production: `$${provider.total_production.toFixed(2)}`
    }));
  };

  // Group Missed Opportunities by provider name
  const prepareMissedOpportunitiesData = (records) => {
    const grouped = {};

    records.forEach((record, rIndex) => {
      const provider = record.provider_details;
      if (!provider) return;

      const providerKey = provider.provider_id;

      if (!grouped[providerKey]) {
        grouped[providerKey] = {
          no_shows: 0,
          children: [],
          unfilled_spots: 0,
          rowType: 'provider',
          total_value_missed: 0,
          failed_appointments: 0,
          total_number_in_hours: 0,
          short_notice_cancellations: 0,
          clinic_name: record.clinic_name,
          key: `mo-provider-${providerKey}`,
          provider_id: provider.provider_id,
          provider_name: provider.provider_name,
          provider_type: provider.provider_type
        };
      }

      const { clinic_name, ...rest } = record;

      // push child submission (with fixed decimals)
      grouped[providerKey].children.push({
        ...rest,
        rowType: 'submission',
        provider_hours: provider.provider_hours,
        submission_date: record.submission_date,
        key: `mo-provider-${providerKey}-submission-${rIndex}`,
        total_number_in_hours: record.total_number_in_hours
          ? record.total_number_in_hours.toFixed(2)
          : '0.00',
        total_value_missed: record.total_value_missed
          ? `$${record.total_value_missed.toFixed(2)}`
          : '$0.00'
      });

      // accumulate provider totals
      grouped[providerKey].no_shows += record.no_shows || 0;
      grouped[providerKey].unfilled_spots += record.unfilled_spots || 0;
      grouped[providerKey].failed_appointments +=
        record.failed_appointments || 0;
      grouped[providerKey].short_notice_cancellations +=
        record.short_notice_cancellations || 0;
      grouped[providerKey].total_number_in_hours +=
        record.total_number_in_hours || 0;
      grouped[providerKey].total_value_missed += record.total_value_missed || 0;
    });

    // format provider totals
    return Object.values(grouped).map((provider) => ({
      ...provider,
      total_number_in_hours: provider.total_number_in_hours.toFixed(2),
      total_value_missed: `$${provider.total_value_missed.toFixed(2)}`
    }));
  };

  // Missed Opportunities Footer
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

  if (title === 'Total Production') {
    treeData = prepareProductionByProviderData(data);
  } else if (title === 'Number of New Patients') {
    treeData = prepareNewPatientsData(data);
  } else if (title === 'Missed Opportunities') {
    treeData = prepareMissedOpportunitiesData(data);
  }

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
        dataSource={treeData}
        expandable={{
          expandRowByClick: true,
          showExpandColumn: false
        }}
        onRow={(record) => ({
          className:
            record.rowType === 'submission' || record.rowType === 'patient'
              ? 'bg-gray-50'
              : ''
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
