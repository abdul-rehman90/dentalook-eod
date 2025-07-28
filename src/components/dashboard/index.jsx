'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent
} from '@/common/components/card/card';
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const monthOrder = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const getYAxisDomain = (data, dataKey) => {
  // Filter out zero values to calculate min/max of actual data
  const nonZeroValues = data
    .map((item) => item[dataKey])
    .filter((value) => value > 0);

  if (nonZeroValues.length === 0) return [0, 100]; // Default range if all zeros

  const minValue = Math.min(...nonZeroValues);
  const maxValue = Math.max(...nonZeroValues);

  // Calculate padding (10% of range)
  const rangePadding = (maxValue - minValue) * 0.1;

  return [
    Math.max(0, minValue - rangePadding), // Don't go below 0
    maxValue + rangePadding
  ];
};

export default function Dashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [clinicSubmissions, setClinicSubmissions] = useState([]);
  const productionDomain = getYAxisDomain(revenueData, 'production');
  const accountReceivableDomain = getYAxisDomain(
    revenueData,
    'accountReceivable'
  );

  const columns = [
    {
      key: 'date',
      title: 'Date',
      dataIndex: 'date'
    },
    {
      key: 'practice',
      title: 'Practice',
      dataIndex: 'practice'
    },
    {
      key: 'province',
      title: 'Province',
      dataIndex: 'province'
    },
    {
      key: 'user',
      dataIndex: 'user',
      title: 'Regional Manager'
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (text) =>
        text ? (
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold ${
              text === 'Completed'
                ? 'bg-[#E9F7EE] text-primary-400'
                : 'bg-[#FFF4ED] text-[#FF8A4E]'
            }`}
          >
            {text}
          </span>
        ) : (
          'N/A'
        )
    },
    {
      key: '',
      width: 50,
      dataIndex: '',
      title: 'Action',
      render: (_, record) => (
        <div className="flex items-center">
          <Button size="sm" variant="destructive">
            <EditOutlined />
          </Button>
          <Button size="sm" variant="destructive">
            <DeleteOutlined />
          </Button>
        </div>
      )
    }
  ];

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

  // Use the most expansive domain to cover both series
  const yDomain = [
    Math.min(productionDomain[0], accountReceivableDomain[0]),
    Math.max(productionDomain[1], accountReceivableDomain[1])
  ];

  const formatYAxisTick = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    else if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const processRevenueData = (apiData) => {
    // Create a map for easy lookup
    const productionMap = new Map();
    const accountReceivableMap = new Map();

    apiData.revenue_trends.production.forEach((item) => {
      productionMap.set(item.month, item.total);
    });

    apiData.revenue_trends.account_receivable.forEach((item) => {
      accountReceivableMap.set(item.month, item.total);
    });

    // Create complete year data with all months
    const completeYearData = monthOrder.map((month) => {
      const shortMonth = month.substring(0, 3);
      return {
        month: shortMonth,
        production: productionMap.get(month) || 0,
        accountReceivable: accountReceivableMap.get(month) || 0
      };
    });

    return completeYearData;
  };

  const formatMetricsData = (apiData) => {
    return [
      {
        title: 'Total Production',
        value: `$${apiData.total_production.value.toLocaleString()}`,
        percentage: apiData.total_production.percentage
      },
      {
        title: 'Account Receivable',
        value: `$${apiData.total_account_receivable.value.toLocaleString()}`,
        percentage: apiData.total_account_receivable.percentage
      },
      {
        title: 'Total Clinics',
        value: apiData.total_clinics.value,
        percentage: apiData.total_clinics.percentage
      },
      {
        title: 'Number of Patients',
        value: apiData.number_of_patients.value,
        percentage: apiData.number_of_patients.percentage
      },
      {
        title: 'Hiring and Training Ratio',
        value: apiData.hiring_and_training_needs.value,
        percentage: apiData.hiring_and_training_needs.percentage
      },
      {
        title: 'Total Google Reviews',
        value: apiData.total_google_reviews.value,
        percentage: apiData.total_google_reviews.percentage
      }
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await EOMReportService.getDashboardData();

        if (response.status === 200) {
          const data = response.data;

          const formattedMetrics = formatMetricsData(data);
          const processedRevenueData = processRevenueData(data);
          const processedSubmissions = data.clinic_submissions.map(
            (item, index) => ({
              date: item.date,
              key: `${index + 1}`,
              status: item.status,
              practice: item.practice,
              province: item.province,
              user: item.regional_manager
            })
          );

          setMetrics(formattedMetrics);
          setRevenueData(processedRevenueData);
          setClinicSubmissions(processedSubmissions);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 mx-13 my-4">
        {/* Skeleton for Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="bg-white !gap-4 h-fit">
              <CardHeader>
                <Skeleton.Input active style={{ width: 150, height: 20 }} />
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Skeleton.Input active style={{ width: 100, height: 32 }} />
                <Skeleton.Button active style={{ width: 80, height: 24 }} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton for Revenue Chart */}
        <div className="p-6 rounded-xl border border-[#D9DADF]">
          <div className="mb-4">
            <Skeleton.Input active style={{ width: 100, height: 24 }} />
          </div>
          <Skeleton.Node active style={{ width: '100%', height: 200 }} />
        </div>

        {/* Skeleton for Clinic Submissions Table */}
        <div className="p-6 rounded-xl border border-[#D9DADF]">
          <div className="mb-4">
            <Skeleton.Input active style={{ width: 100, height: 24 }} />
          </div>
          <Skeleton.Node active style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mx-13 my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-white !gap-4 h-fit">
            <CardHeader>
              <CardTitle className="text-[#5D606D] font-semibold text-sm">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-3xl font-semibold text-black">
                {metric.value}
              </p>
              {metric.percentage !== undefined && (
                <div
                  className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                    metric.percentage > 0
                      ? 'bg-[#E9F7EE] text-[#167F3D]'
                      : metric.percentage < 0
                      ? 'bg-[#FEF3F2] text-[#B42318]'
                      : 'bg-[#F2F4F7] text-[#344054]'
                  }`}
                >
                  {metric.percentage > 0 ? (
                    <ArrowUpOutlined />
                  ) : metric.percentage < 0 ? (
                    <ArrowDownOutlined />
                  ) : null}
                  {metric.percentage}%
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="p-6 h-90 rounded-xl border border-[#D9DADF]">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-black">Revenue Trends</h2>
        </div>
        <div className="w-full h-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid stroke="#E5E7EB" vertical={false} />
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

              {/* Area for production */}
              <Area
                dot={false}
                type="monotone"
                strokeWidth={2}
                stroke="#1B3A57"
                dataKey="production"
                fill="rgba(15, 23, 42, 0.1)"
              />

              {/* Area for account receivable */}
              <Area
                dot={false}
                type="monotone"
                strokeWidth={2}
                stroke="#008433"
                dataKey="accountReceivable"
                fill="rgba(34, 197, 94, 0.1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-6 rounded-xl border border-[#D9DADF]">
        <h2 className="text-black text-base font-medium mb-4">
          Clinic Submissions
        </h2>
        <GenericTable columns={columns} dataSource={clinicSubmissions} />
      </div>
    </div>
  );
}
