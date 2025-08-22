'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Skeleton, DatePicker, Select } from 'antd';
import CardDetailsModal from './card-details-modal';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { EODReportService } from '@/common/services/eod-report';
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label
} from 'recharts';

const { RangePicker } = DatePicker;

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const defaultMetrics = [
  {
    value: '$0',
    details: [],
    percentage: 0,
    title: 'Total Production'
  },
  {
    value: 0,
    details: [],
    percentage: 0,
    title: 'Number of Patients'
  },
  {
    value: 0,
    details: [],
    percentage: 0,
    title: 'Missed Opportunities'
  },
  {
    value: 0,
    details: [],
    percentage: 0,
    title: 'Monthly Supplies'
  }
];

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

const formatValue = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

export default function Dashboard() {
  const router = useRouter();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [clinicSubmissions, setClinicSubmissions] = useState([]);
  const [productionByProviders, setProductionByProviders] = useState([]);
  const [filters, setFilters] = useState({
    end_date: null,
    clinic_id: null,
    start_date: null
  });
  const [modalState, setModalState] = useState({
    data: [],
    title: '',
    columns: [],
    visible: false
  });

  const getCurrentMonthRange = () => {
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    return [startOfMonth, endOfMonth];
  };

  const metricModalColumns = {
    'Total Productions': [
      {
        key: 'submission_date',
        title: 'Submission Date',
        dataIndex: 'submission_date',
        render: (value, record) => {
          if (record.rowType !== 'provider')
            return value ? dayjs(value).format('MMM DD, YYYY') : '';
        }
      },
      {
        key: 'clinic_name',
        title: 'Clinic Name',
        dataIndex: 'clinic_name'
      },
      {
        key: 'provider_name',
        title: 'Provider Name',
        dataIndex: 'provider_name'
      },
      {
        key: 'provider_type',
        title: 'Provider Type',
        dataIndex: 'provider_type'
      },
      {
        key: 'total_production',
        title: 'Total Production',
        dataIndex: 'total_production'
      }
    ],
    'Production by Providers': [
      {
        key: 'provider_name',
        title: 'Provider Name',
        dataIndex: 'provider_name'
      },
      {
        key: 'provider_type',
        title: 'Provider Type',
        dataIndex: 'provider_type'
      },
      {
        key: 'provider_email',
        title: 'Provider Email',
        dataIndex: 'provider_email'
      },
      { title: 'Hours Open', dataIndex: 'hours_open', key: 'hours_open' },
      {
        title: 'Production / Hour',
        key: 'production_per_hour',
        dataIndex: 'production_per_hour'
      },
      {
        key: 'total_production',
        title: 'Total Production',
        dataIndex: 'total_production'
      }
    ],
    'Number of Patients': [
      { title: 'Date', dataIndex: 'date', key: 'date' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Source', dataIndex: 'source', key: 'source' },
      { title: 'Comments', dataIndex: 'comments', key: 'comments' }
    ],
    'Missed Opportunities': [
      { title: 'Clinic Name', dataIndex: 'clinic_name', key: 'clinic_name' },
      {
        key: 'unfilled_spots',
        title: 'Unfilled Spots',
        dataIndex: 'unfilled_spots'
      },
      { title: 'No Shows', dataIndex: 'no_shows', key: 'no_shows' },
      {
        title: 'Short Notice',
        key: 'short_notice_cancellations',
        dataIndex: 'short_notice_cancellations'
      },
      { title: 'Total Missed', dataIndex: 'total_missed', key: 'total_missed' }
    ],
    'Monthly Supplies': [
      {
        title: 'Actual',
        key: 'supplies_actual',
        dataIndex: 'supplies_actual',
        render: (value) => `$${value.toFixed(2)}`
      },
      {
        title: 'Monthly Budget',
        key: 'avg_budget_supplies',
        dataIndex: 'avg_budget_supplies',
        render: (value) => 0
      },
      {
        title: 'Remarks',
        key: 'overage_reason',
        dataIndex: 'overage_reason'
      }
    ]
  };

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

  const handleCardClick = (metric) => {
    setModalState({
      visible: true,
      title: metric.title,
      data: metric.details || [],
      columns: metricModalColumns[metric.title]
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      end_date: dates?.[1] ? dayjs(dates[1]).format('YYYY-MM-DD') : null,
      start_date: dates?.[0] ? dayjs(dates[0]).format('YYYY-MM-DD') : null
    }));
  };

  const handlePieChartClick = (data, index) => {
    setModalState({
      visible: true,
      title: 'Production by Providers',
      data: [productionByProviders[index]] || [],
      columns: metricModalColumns['Production by Providers']
    });
  };

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

  const processRevenueData = (apiData) => {
    const productionMap = new Map();
    const accountReceivableMap = new Map();

    apiData.revenue_trends.production.forEach((item) => {
      productionMap.set(item.month, item.total);
    });

    apiData.revenue_trends.account_receivable.forEach((item) => {
      accountReceivableMap.set(item.month, item.total);
    });

    return monthOrder.map((month) => {
      const shortMonth = month.substring(0, 3);
      return {
        month: shortMonth,
        production: productionMap.get(month) || 0,
        accountReceivable: accountReceivableMap.get(month) || 0
      };
    });
  };

  const formatMetricsData = (apiData) => {
    return [
      {
        title: 'Total Productions',
        percentage: apiData.total_production.percentage,
        details: apiData.total_production.eod_submissions,
        value: `$${apiData.total_production.value.toLocaleString()}`
      },
      {
        title: 'Number of Patients',
        value: apiData.number_of_patients.value,
        percentage: apiData.number_of_patients.percentage,
        details: apiData.number_of_patients.patient_details?.[0]?.patients || []
      },
      {
        title: 'Missed Opportunities',
        percentage: apiData.missed_schedule.percentage,
        details: apiData.missed_schedule.provider_details,
        value: apiData.missed_schedule.total_missed_appointments
      },
      {
        percentage: 0,
        title: 'Monthly Supplies',
        details: apiData.monthly_metrics.supplies,
        value: `$${apiData.monthly_metrics.total_supplies_actual.toLocaleString()}`
      }
    ];
  };

  useEffect(() => {
    const fetchAllRegionalManagers = async () => {
      try {
        const { data } = await EODReportService.getAllRegionalManagers();
        const clinicsData = data.clinics.map((item) => ({
          value: item.id,
          label: item.name
        }));

        setClinics(clinicsData);

        if (clinicsData.length > 0) {
          setFilters((prev) => ({
            ...prev,
            clinic_id: clinicsData[0].value
          }));
        }

        const [startOfMonth, endOfMonth] = getCurrentMonthRange();
        setFilters((prev) => ({
          ...prev,
          end_date: endOfMonth.format('YYYY-MM-DD'),
          start_date: startOfMonth.format('YYYY-MM-DD')
        }));
      } catch (error) {}
    };

    fetchAllRegionalManagers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.clinic_id || !filters.start_date || !filters.end_date)
        return;

      try {
        setLoading(true);
        const response = await EOMReportService.getDashboardData(filters);

        if (response.status === 200) {
          const data = response.data;
          setMetrics(formatMetricsData(data));
          setRevenueData(processRevenueData(data));
          setProductionByProviders(
            data.production_by_provider.map((item) => ({
              ...item,
              name: item.provider_type,
              value: item.total_production
            }))
          );
          setClinicSubmissions(
            data.clinic_submissions.map((item, index) => ({
              date: item.date,
              key: `${index + 1}`,
              status: item.status,
              practice: item.practice,
              province: item.province,
              user: item.regional_manager
            }))
          );
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 mx-13 my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {[...Array(4)].map((_, index) => (
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

        <div className="p-6 h-90 rounded-xl border border-[#D9DADF]">
          <div className="mb-4">
            <Skeleton.Input active style={{ width: 200, height: 24 }} />
          </div>
          <div className="w-full h-full p-4 flex justify-center items-center">
            <Skeleton.Avatar
              active
              size={200}
              shape="circle"
              style={{ width: 200, height: 200 }}
            />
          </div>
        </div>

        <div className="p-6 rounded-xl border border-[#D9DADF]">
          <div className="mb-4">
            <Skeleton.Input active style={{ width: 100, height: 24 }} />
          </div>
          <Skeleton.Node active style={{ width: '100%', height: 300 }} />
        </div>

        <div className="p-6 rounded-xl border border-[#D9DADF]">
          <div className="mb-4">
            <Skeleton.Input active style={{ width: 150, height: 24 }} />
          </div>
          <Skeleton.Node active style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mx-13 my-4">
      <CardDetailsModal
        data={modalState.data}
        title={modalState.title}
        visible={modalState.visible}
        columns={modalState.columns}
        onCancel={() => setModalState((prev) => ({ ...prev, visible: false }))}
      />

      <div className="w-fit ml-auto flex items-center gap-2">
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
            Clinics
          </p>
          <Select
            options={clinics}
            // allowClear={true}
            value={filters.clinic_id}
            style={{ width: '100%' }}
            placeholder="Select Clinic"
            onChange={(value) => handleFilterChange('clinic_id', value)}
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
          <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
            Date Range
          </p>
          <RangePicker
            allowClear={false}
            style={{ width: '100%' }}
            onChange={handleDateRangeChange}
            value={[
              filters.start_date ? dayjs(filters.start_date) : null,
              filters.end_date ? dayjs(filters.end_date) : null
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            onClick={() => handleCardClick(metric)}
            className="bg-white !gap-4 h-fit cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-[#5D606D] font-semibold text-sm">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-3xl font-semibold text-black">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-6 h-90 rounded-xl border border-[#D9DADF]">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-black">
            Total Production by Providers
          </h2>
        </div>
        <div className="w-full h-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                dataKey="value"
                fill="#8884d8"
                outerRadius={100}
                labelLine={false}
                data={productionByProviders}
                onClick={handlePieChartClick}
                label={({ name, value, percent }) =>
                  `${name}: ${formatValue(value)} (${(percent * 100).toFixed(
                    0
                  )}%)`
                }
              >
                {productionByProviders.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatValue(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
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

              <Area
                dot={false}
                type="monotone"
                strokeWidth={2}
                stroke="#1B3A57"
                dataKey="production"
                fill="rgba(15, 23, 42, 0.1)"
              />

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

// {metric.percentage !== undefined && (
//                 <div
//                   className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${
//                     metric.percentage > 0
//                       ? 'bg-[#E9F7EE] text-[#167F3D]'
//                       : metric.percentage < 0
//                       ? 'bg-[#FEF3F2] text-[#B42318]'
//                       : 'bg-[#F2F4F7] text-[#344054]'
//                   }`}
//                 >
//                   {metric.percentage > 0 ? (
//                     <ArrowUpOutlined />
//                   ) : metric.percentage < 0 ? (
//                     <ArrowDownOutlined />
//                   ) : null}
//                   {metric.percentage}
//                 </div>
//               )}
