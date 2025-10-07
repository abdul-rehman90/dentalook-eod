'use client';

import React from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#005FB2', '#00896F', '#CC8F00', '#B35A2E'];

// Format numbers as currency (shortened if >= 1000)
const formatValue = (value) => {
  const num = Number(value) || 0;
  return num >= 1000 ? `$${(num / 1000).toFixed(2)}k` : `$${num.toFixed(2)}`;
};

// Group Production by Provider
const prepareProductionData = (submissions) => {
  const grouped = {};

  submissions.forEach((s, i) => {
    const {
      provider_id,
      provider_name,
      provider_type,
      provider_hours,
      total_production,
      production_per_hour,
      submission_date
    } = s;

    if (!grouped[provider_id]) {
      grouped[provider_id] = {
        provider_id,
        children: [],
        provider_name,
        provider_type,
        provider_hours: 0,
        rowType: 'provider',
        total_production: 0,
        submission_count: 0,
        production_per_hour: 0,
        key: `provider-${provider_id}`,
        total_production_per_hour_sum: 0
      };
    }

    grouped[provider_id].children.push({
      provider_hours,
      submission_date,
      rowType: 'submission',
      key: `provider-${provider_id}-submission-${i}`,
      total_production: `$${total_production.toFixed(2)}`,
      production_per_hour: `$${production_per_hour.toFixed(2)}`
    });

    grouped[provider_id].provider_hours += provider_hours || 0;
    grouped[provider_id].total_production += total_production || 0;
    grouped[provider_id].total_production_per_hour_sum +=
      production_per_hour || 0;
    grouped[provider_id].submission_count += 1;
  });

  return Object.values(grouped).map((p) => {
    const avgProductionPerHour =
      p.submission_count > 0
        ? p.total_production_per_hour_sum / p.submission_count
        : 0;

    return {
      ...p,
      total_production: `$${p.total_production.toFixed(2)}`,
      production_per_hour: `$${avgProductionPerHour.toFixed(2)}`
    };
  });
};

// Group Missed Opportunities by Provider
const prepareMissedData = (records) => {
  const grouped = {};

  records.forEach((r, i) => {
    const provider = r.provider_details;
    if (!provider) return;

    const { provider_id, provider_name, provider_type, provider_hours } =
      provider;

    if (!grouped[provider_id]) {
      grouped[provider_id] = {
        provider_id,
        no_shows: 0,
        children: [],
        provider_name,
        provider_type,
        unfilled_spots: 0,
        rowType: 'provider',
        total_value_missed: 0,
        failed_appointments: 0,
        total_number_in_hours: 0,
        clinic_name: r.clinic_name,
        short_notice_cancellations: 0,
        key: `mo-provider-${provider_id}`
      };
    }

    const { clinic_name, ...rest } = r;

    grouped[provider_id].children.push({
      ...rest,
      provider_hours,
      rowType: 'submission',
      submission_date: r.submission_date,
      key: `mo-provider-${provider_id}-submission-${i}`,
      total_number_in_hours: r.total_number_in_hours?.toFixed(2) || '0.00',
      total_value_missed: r.total_value_missed
        ? `$${r.total_value_missed.toFixed(2)}`
        : '$0.00'
    });

    grouped[provider_id].no_shows += r.no_shows || 0;
    grouped[provider_id].unfilled_spots += r.unfilled_spots || 0;
    grouped[provider_id].total_value_missed += r.total_value_missed || 0;
    grouped[provider_id].failed_appointments += r.failed_appointments || 0;
    grouped[provider_id].total_number_in_hours += r.total_number_in_hours || 0;
    grouped[provider_id].short_notice_cancellations +=
      r.short_notice_cancellations || 0;
  });

  return Object.values(grouped).map((p) => ({
    ...p,
    total_value_missed: `$${p.total_value_missed.toFixed(2)}`,
    total_number_in_hours: p.total_number_in_hours.toFixed(2)
  }));
};

export default function PieGraph({
  prodTypes,
  missedTypes,
  setModalState,
  prodProviders,
  missedProviders,
  metricModalColumns
}) {
  const handlePieClick = (isProduction, _, index) => {
    const types = isProduction ? prodTypes : missedTypes;
    const providers = isProduction ? prodProviders : missedProviders;
    const providerType = types[index].name;

    const filteredProviders = providers.filter((p) =>
      isProduction
        ? p.provider_type === providerType
        : p.provider_details.provider_type === providerType
    );

    const baseTitle = isProduction ? 'Production' : 'Missed Opportunities';

    const groupedData = isProduction
      ? prepareProductionData(
          filteredProviders.sort(
            (a, b) => new Date(b.submission_date) - new Date(a.submission_date)
          )
        )
      : prepareMissedData(filteredProviders);

    setModalState({
      visible: true,
      data: groupedData,
      title: `${baseTitle} by ${providerType} Providers`,
      columns: metricModalColumns[`${baseTitle} by Providers`]
    });
  };

  const renderPie = (data, isProduction) => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            outerRadius={100}
            labelLine={false}
            onClick={(entry, index) =>
              handlePieClick(isProduction, entry, index)
            }
            label={({ name, value, percent, totalHours }) =>
              isProduction
                ? `${name}: ${formatValue(value)} (${(percent * 100).toFixed(
                    0
                  )}%)`
                : `${name}: ${formatValue(value)} (${(percent * 100).toFixed(
                    0
                  )}%) - ${totalHours?.toFixed(2)} hrs`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatValue(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 h-90 flex items-center justify-between rounded-xl border border-solid border-[#ececec] shadow-[0px_14px_20px_0px_#0000000A]">
      <div className="w-full h-full border-r border-[#f0f0f0] pr-4">
        <h2 className="text-base font-semibold text-black mb-4">
          Total Production by Providers
        </h2>
        {renderPie(prodTypes, true)}
      </div>
      <div className="w-full h-full pl-4">
        <h2 className="text-base font-semibold text-black text-center mb-4">
          Total Missed Opportunities by Providers
        </h2>
        {renderPie(missedTypes, false)}
      </div>
    </div>
  );
}
