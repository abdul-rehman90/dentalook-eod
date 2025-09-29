import React from 'react';
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const getYAxisDomain = (data, dataKey) => {
  const nonZeroValues = data
    .map((item) => item[dataKey])
    .filter((value) => value > 0);

  if (nonZeroValues.length === 0) return [0, 100];

  const minValue = Math.min(...nonZeroValues);
  const maxValue = Math.max(...nonZeroValues);
  const rangePadding = (maxValue - minValue) * 0.1;

  return [Math.max(0, minValue - rangePadding), maxValue + rangePadding];
};

export default function RevenueTrends({ revenueData }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white px-3 py-2 rounded shadow-[0px_2px_9px_0px_#00000024] w-[210px]">
          <p className="text-[#425B74] text-xs">This Month</p>
          <p className="text-base font-semibold text-primary-500">
            Prod: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-base font-semibold text-[#2F4051]">
            Account: ${payload[1].value.toLocaleString()}
          </p>
          <p className="text-xs text-[#696969]">{label}</p>
        </div>
      );
    }
    return null;
  };

  const productionDomain = getYAxisDomain(revenueData, 'production');
  const accountReceivableDomain = getYAxisDomain(
    revenueData,
    'accountReceivable'
  );

  const yDomain = [
    Math.min(productionDomain[0], accountReceivableDomain[0]),
    Math.max(productionDomain[1], accountReceivableDomain[1])
  ];

  const formatYAxisTick = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="p-6 h-90 rounded-xl border border-solid border-[#ececec] shadow-[0px_14px_20px_0px_#0000000A]">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-black">Revenue Trends</h2>
      </div>
      <div className="w-full h-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
            margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
          >
            <defs>
              {/* ✅ Production Gradients */}
              <linearGradient id="productionFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1173E4" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#F7931F" stopOpacity={0.2} />
                <stop offset="75%" stopColor="#1173E4" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#F7931F" stopOpacity={0.2} />
              </linearGradient>

              <linearGradient id="productionStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1173E4" />
                <stop offset="50%" stopColor="#F7931F" />
                <stop offset="75%" stopColor="#1173E4" />
                <stop offset="100%" stopColor="#F7931F" />
              </linearGradient>

              {/* ✅ Account Receivable Gradients */}
              <linearGradient id="accountFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#21B30A" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#D81919" stopOpacity={0.2} />
                <stop offset="75%" stopColor="#21B30A" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D81919" stopOpacity={0.2} />
              </linearGradient>

              <linearGradient id="accountStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#21B30A" />
                <stop offset="50%" stopColor="#D81919" />
                <stop offset="75%" stopColor="#21B30A" />
                <stop offset="100%" stopColor="#D81919" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="none" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                dy: 5,
                fontSize: 12,
                fill: '#475467',
                fontFamily: 'Montserrat'
              }}
            />
            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxisTick}
              tick={{
                fontSize: 12,
                fill: '#344054',
                fontFamily: 'Montserrat'
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              dot={false}
              type="monotone"
              strokeWidth={2}
              dataKey="production"
              fill="url(#productionFill)"
              stroke="url(#productionStroke)"
            />

            <Area
              dot={false}
              type="monotone"
              strokeWidth={2}
              fill="url(#accountFill)"
              dataKey="accountReceivable"
              stroke="url(#accountStroke)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
