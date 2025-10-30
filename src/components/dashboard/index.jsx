'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Metrics from './metrics';
import PieGraph from './pie-graph';
import RevenueTrends from './revenue-trends';
import CardDetailsModal from './card-details-modal';
import ClinicSubmissions from './clinic-submissions';
import { Card, Skeleton, DatePicker, Select } from 'antd';
import { EOMReportService } from '@/common/services/eom-report';
import { EODReportService } from '@/common/services/eod-report';
import { CardHeader, CardContent } from '@/common/components/card/card';
import {
  MONTH_ORDER,
  DEFAULT_METRICS,
  METRICS_MODAL_COLUMNS
} from './constant';

const { RangePicker } = DatePicker;

export default function Dashboard() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prodTypes, setProdTypes] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [missedTypes, setMissedTypes] = useState([]);
  const [prodProviders, setProdProviders] = useState([]);
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [missedProviders, setMissedProviders] = useState([]);
  const [clinicSubmissions, setClinicSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    end_date: null,
    clinic_id: null,
    start_date: null
  });
  const [modalState, setModalState] = useState({
    data: [],
    title: '',
    columns: [],
    visible: false,
    attritionData: []
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
          ) || [],
        attritionData:
          apiData.number_of_attritions.attrition_detail?.[0]?.patients?.sort(
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
              <CardContent className="flex items-center justify-between gap-2">
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
        attritionData={modalState.attritionData}
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
      <Metrics
        metrics={metrics}
        setModalState={setModalState}
        metricModalColumns={METRICS_MODAL_COLUMNS}
      />
      <PieGraph
        prodTypes={prodTypes}
        missedTypes={missedTypes}
        setModalState={setModalState}
        prodProviders={prodProviders}
        missedProviders={missedProviders}
        metricModalColumns={METRICS_MODAL_COLUMNS}
      />
      <RevenueTrends revenueData={revenueData} />
      <ClinicSubmissions clinicSubmissions={clinicSubmissions} />
    </div>
  );
}
