'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import CardDetailsModal from './card-details-modal';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { EODReportService } from '@/common/services/eod-report';
import { Card, Statistic, Skeleton, DatePicker, Select } from 'antd';
import { CardHeader, CardContent } from '@/common/components/card/card';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownOutlined
} from '@ant-design/icons';
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
  Cell
} from 'recharts';

const { RangePicker } = DatePicker;

const MONTH_ORDER = [
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

const COLORS = ['#005FB2', '#00896F', '#CC8F00', '#B35A2E'];

const DEFAULT_METRICS = [
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
    title: 'Number of New Patients'
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
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [clinicSubmissions, setClinicSubmissions] = useState([]);
  const [prodProviders, setProdProviders] = useState([]);
  const [missedProviders, setMissedProviders] = useState([]);
  const [prodTypes, setProdTypes] = useState([]);
  const [missedTypes, setMissedTypes] = useState([]);

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

  const groupByProviderType = (
    providers,
    typeExtractor,
    valueExtractor,
    hoursExtractor
  ) => {
    const grouped = {};

    providers.forEach((provider) => {
      const type = typeExtractor(provider);
      if (!grouped[type]) {
        grouped[type] = {
          name: type,
          value: 0,
          totalHours: 0,
          providers: []
        };
      }
      grouped[type].value += valueExtractor(provider);
      grouped[type].totalHours += hoursExtractor(provider);
      grouped[type].providers.push(provider);
    });

    return Object.values(grouped);
  };

  const getCurrentMonthRange = () => {
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    return [startOfMonth, endOfMonth];
  };

  const metricModalColumns = {
    'Total Production': [
      {
        key: 'submission_date',
        title: 'Submission Date',
        dataIndex: 'submission_date',
        render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
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
        key: 'submission_date',
        title: 'Submission Date',
        dataIndex: 'submission_date',
        render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
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
        title: 'Hours Work',
        key: 'provider_hours',
        dataIndex: 'provider_hours'
      },
      {
        title: 'Production / Hour',
        key: 'production_per_hour',
        dataIndex: 'production_per_hour',
        render: (value) => `$${value.toFixed(2)}`
      },
      {
        key: 'total_production',
        title: 'Total Production',
        dataIndex: 'total_production',
        render: (value) => `$${value.toFixed(2)}`
      }
    ],
    'Number of New Patients': [
      {
        key: 'date',
        title: 'Date',
        dataIndex: 'date',
        render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
      },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Source', dataIndex: 'source', key: 'source' },
      { title: 'Comments', dataIndex: 'comments', key: 'comments' }
    ],
    'Missed Opportunities': [
      {
        key: 'submission_date',
        title: 'Submission Date',
        dataIndex: 'submission_date',
        render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
      },
      { title: 'Clinic Name', dataIndex: 'clinic_name', key: 'clinic_name' },
      {
        key: 'provider_name',
        title: 'Provider Name',
        dataIndex: 'provider_name',
        render: (_, record) => record.provider_details.provider_name
      },
      {
        title: 'Type',
        key: 'provider_type',
        dataIndex: 'provider_type',
        render: (_, record) => record.provider_details.provider_type
      },
      {
        title: 'Unfilled',
        key: 'unfilled_spots',
        dataIndex: 'unfilled_spots'
      },
      { title: 'No Shows', dataIndex: 'no_shows', key: 'no_shows' },
      {
        title: 'Short Ntc',
        key: 'short_notice_cancellations',
        dataIndex: 'short_notice_cancellations'
      },
      {
        title: 'Failed',
        key: 'failed_appointments',
        dataIndex: 'failed_appointments'
      },
      {
        title: 'Total Hrs',
        key: 'total_number_in_hours',
        dataIndex: 'total_number_in_hours',
        render: (value) => `${value.toFixed(2)}`
      },
      {
        key: 'total_value_missed',
        title: 'Total Value Missed',
        dataIndex: 'total_value_missed',
        render: (value) => `$${value.toFixed(2)}`
      }
    ],
    'Monthly Supplies': [
      {
        key: 'submission_date',
        title: 'Submission Date',
        dataIndex: 'submission_date',
        render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
      },
      {
        title: 'Actual',
        key: 'supplies_actual',
        dataIndex: 'supplies_actual',
        render: (value) => (value ? `$${value.toFixed(2)}` : '')
      },
      {
        title: 'Monthly Budget',
        key: 'avg_budget_supplies',
        dataIndex: 'avg_budget_supplies',
        render: () => 0
      },
      {
        title: 'Remarks',
        key: 'overage_reason',
        dataIndex: 'overage_reason'
      }
    ],
    'Missed Opportunities by Providers': [
      {
        key: 'submission_date',
        title: 'Submission Date',
        dataIndex: 'submission_date',
        render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
      },
      { title: 'Clinic Name', dataIndex: 'clinic_name', key: 'clinic_name' },
      {
        key: 'provider_name',
        title: 'Provider Name',
        dataIndex: 'provider_name',
        render: (_, record) => record.provider_details.provider_name
      },
      {
        title: 'Type',
        key: 'provider_type',
        dataIndex: 'provider_type',
        render: (_, record) => record.provider_details.provider_type
      },
      {
        title: 'Unfilled',
        key: 'unfilled_spots',
        dataIndex: 'unfilled_spots'
      },
      { title: 'No Shows', dataIndex: 'no_shows', key: 'no_shows' },
      {
        title: 'Short Ntc',
        key: 'short_notice_cancellations',
        dataIndex: 'short_notice_cancellations'
      },
      {
        title: 'Failed',
        key: 'failed_appointments',
        dataIndex: 'failed_appointments'
      },
      {
        title: 'Total Hrs',
        key: 'total_number_in_hours',
        dataIndex: 'total_number_in_hours',
        render: (value) => `${value.toFixed(2)}`
      },
      {
        key: 'total_value_missed',
        title: 'Total Value Missed',
        dataIndex: 'total_value_missed',
        render: (value) => `$${value.toFixed(2)}`
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
          <Button
            size="sm"
            variant="destructive"
            onClick={() => router.push(`/submission/eom/1/${record.id}`)}
          >
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

  const handlePieChartClick = (isProduction, _, index) => {
    const types = isProduction ? prodTypes : missedTypes;
    const providers = isProduction ? prodProviders : missedProviders;
    const providerType = types[index].name;
    const providersOfType = providers.filter((p) =>
      isProduction
        ? p.provider_type === providerType
        : p.provider_details.provider_type === providerType
    );
    const baseTitle = isProduction ? 'Production' : 'Missed Opportunities';
    setModalState({
      visible: true,
      data: providersOfType,
      title: `${baseTitle} by ${providerType} Providers`,
      columns: metricModalColumns[`${baseTitle} by Providers`]
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

    return MONTH_ORDER.map((month) => {
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
        title: 'Total Production',
        percentage: apiData.total_production.percentage,
        value: `$${apiData.total_production.value.toLocaleString()}`,
        details:
          apiData.total_production.eod_submissions?.sort(
            (a, b) => new Date(b.submission_date) - new Date(a.submission_date)
          ) || []
      },
      {
        title: 'Number of New Patients',
        value: apiData.number_of_patients.value,
        percentage: apiData.number_of_patients.percentage,
        details:
          apiData.number_of_patients.patient_details?.[0]?.patients?.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          ) || []
      },
      {
        title: 'Missed Opportunities',
        value: apiData.missed_schedule.total_number_in_hours.toFixed(2),
        percentage: `$${apiData.missed_schedule.total_value_missed
          .toFixed(2)
          .toLocaleString()}`,
        details:
          apiData.missed_schedule.provider_details?.sort(
            (a, b) => new Date(b.submission_date) - new Date(a.submission_date)
          ) || []
      },
      {
        title: 'Monthly Supplies',
        value: `$${apiData.monthly_metrics.total_supplies_actual.toLocaleString()}`,
        details:
          apiData.monthly_metrics.supplies?.sort(
            (a, b) => new Date(b.submission_date) - new Date(a.submission_date)
          ) || []
      }
    ];
  };

  useEffect(() => {
    const fetchClinics = async () => {
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

    fetchClinics();
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
          const prodProvidersData = data.production_by_provider || [];
          const missedProvidersData =
            data.missed_schedule.provider_details || [];
          setProdProviders(prodProvidersData);
          setMissedProviders(missedProvidersData);
          setProdTypes(
            groupByProviderType(
              prodProvidersData,
              (p) => p.provider_type,
              (p) => p.total_production,
              () => 0
            )
          );
          setMissedTypes(
            groupByProviderType(
              missedProvidersData,
              (p) => p.provider_details.provider_type,
              (p) => p.total_value_missed,
              (p) => p.total_number_in_hours || 0
            )
          );
          setClinicSubmissions(
            data.clinic_submissions
              .map((item, index) => ({
                date: item.date,
                key: `${index + 1}`,
                status: item.status,
                id: item.submission_id,
                practice: item.practice,
                province: item.province,
                user: item.regional_manager
              }))
              .sort((a, b) => new Date(b.date) - new Date(a.date)) || []
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
              <CardHeader className="mb-5">
                <Skeleton.Input active style={{ width: 150, height: 20 }} />
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Skeleton.Input active style={{ width: 100, height: 32 }} />
                <Skeleton.Button active style={{ width: 80, height: 24 }} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-6 h-90 flex items-center justify-between rounded-xl border border-[#D9DADF]">
          <div className="w-full h-full">
            <div className="mb-4">
              <Skeleton.Input active style={{ width: 200, height: 24 }} />
            </div>
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton.Avatar
                active
                size={200}
                shape="circle"
                style={{ width: 200, height: 200 }}
              />
            </div>
          </div>
          <div className="w-full h-full">
            <div className="mb-4 text-center">
              <Skeleton.Input active style={{ width: 200, height: 24 }} />
            </div>
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton.Avatar
                active
                size={200}
                shape="circle"
                style={{ width: 200, height: 200 }}
              />
            </div>
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
            size="large"
            options={clinics}
            className="custom-filter"
            value={filters.clinic_id}
            placeholder="Select Clinic"
            onChange={(value) => handleFilterChange('clinic_id', value)}
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
          <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
            Date Range
          </p>
          <RangePicker
            size="large"
            allowClear={false}
            className="custom-filter"
            onChange={handleDateRangeChange}
            value={[
              filters.start_date ? dayjs(filters.start_date) : null,
              filters.end_date ? dayjs(filters.end_date) : null
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            onClick={() => handleCardClick(metric)}
            className="!border !border-solid !border-[#ececec] !rounded-xl shadow-[0px_14px_20px_0px_#0000000A] cursor-pointer"
          >
            <Statistic
              title={
                <span className="text-[#5D606D] font-semibold text-sm">
                  {metric.title}
                </span>
              }
              value={metric.value}
              valueStyle={{
                display: 'flex',
                fontWeight: 600,
                fontSize: '30px',
                marginTop: '20px',
                color: '#1F1F1F',
                justifyContent: 'space-between'
              }}
              suffix={
                metric.percentage !== undefined && (
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
                    {metric.percentage}
                  </div>
                )
              }
            />
          </Card>
        ))}
      </div>

      <div className="p-6 h-90 flex items-center justify-between rounded-xl border border-solid border-[#ececec] shadow-[0px_14px_20px_0px_#0000000A]">
        <div className="w-full h-full border-r-[#f0f0f0] border-r border-solid">
          <h2 className="text-base font-semibold text-black mb-4">
            Total Production by Providers
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                dataKey="value"
                fill="#8884d8"
                data={prodTypes}
                outerRadius={100}
                labelLine={false}
                onClick={(data, index) =>
                  handlePieChartClick(true, data, index)
                }
                label={({ name, value, percent }) =>
                  `${name}: ${formatValue(value)} (${(percent * 100).toFixed(
                    0
                  )}%)`
                }
              >
                {prodTypes.map((entry, index) => (
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
        <div className="w-full h-full">
          <h2 className="text-base font-semibold text-black text-center mb-4">
            Total Missed Opportunities by Providers
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                dataKey="value"
                fill="#8884d8"
                // innerRadius={60}
                outerRadius={100}
                labelLine={false}
                data={missedTypes}
                onClick={(data, index) =>
                  handlePieChartClick(false, data, index)
                }
                label={({ name, value, percent, totalHours }) =>
                  `${name}: ${formatValue(value.toFixed(0))} (${(
                    percent * 100
                  ).toFixed(0)}%) - ${totalHours.toFixed(2)} hrs`
                }
              >
                {missedTypes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatValue(value.toFixed(0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 h-90 rounded-xl border border-solid border-[#ececec] shadow-[0px_14px_20px_0px_#0000000A]">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-black">Revenue Trends</h2>
        </div>
        <div className="w-full h-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                {/* ✅ Production Gradients */}
                <linearGradient id="productionFill" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1173E4" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="#F7931F" stopOpacity={0.2} />
                  <stop offset="75%" stopColor="#1173E4" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#F7931F" stopOpacity={0.2} />
                </linearGradient>

                <linearGradient
                  id="productionStroke"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
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

      <div className="p-6 rounded-xl border border-solid border-[#ececec] shadow-[0px_14px_20px_0px_#0000000A]">
        <h2 className="text-black text-base font-medium mb-4">
          Clinic Submissions
        </h2>
        <GenericTable columns={columns} dataSource={clinicSubmissions} />
      </div>
    </div>
  );
}

// <Card
//   key={index}
//   onClick={() => handleCardClick(metric)}
//   className="bg-white !border !border-solid !border-[#D9DADF] !gap-4 h-fit cursor-pointer !rounded-xl shadow-[0px_14px_20px_0px_#0000000A]"
// >
//   <CardHeader>
//     <CardTitle className="text-[#5D606D] font-semibold text-sm">
//       {metric.title}
//     </CardTitle>
//   </CardHeader>
//   <CardContent className="flex items-center justify-between">
//     <p className="flex items-baseline gap-1 text-3xl font-semibold text-black">
//       {metric.value}
//       {metric.title === 'Missed Opportunities' && (
//         <span className="text-base font-normal">hrs</span>
//       )}
//     </p>
//     {metric.percentage !== undefined && (
//       <div
//         className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${
//           metric.percentage > 0
//             ? 'bg-[#E9F7EE] text-[#167F3D]'
//             : metric.percentage < 0
//             ? 'bg-[#FEF3F2] text-[#B42318]'
//             : 'bg-[#F2F4F7] text-[#344054]'
//         }`}
//       >
//         {metric.percentage > 0 ? (
//           <ArrowUpOutlined />
//         ) : metric.percentage < 0 ? (
//           <ArrowDownOutlined />
//         ) : null}
//         {metric.percentage}
//       </div>
//     )}
//   </CardContent>
// </Card>;
