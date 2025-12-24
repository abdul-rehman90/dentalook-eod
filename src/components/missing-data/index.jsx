'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Select } from 'antd';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { MissingDataService } from '@/common/services/missing-data';

const currentMonth = dayjs().startOf('month');
const today = dayjs();

export default function MissingData() {
  const [clinics, setClinics] = useState([]);
  const [tableData, setTableData] = useState();
  const [provinces, setProvinces] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [regionalManagers, setRegionalManagers] = useState([]);
  const [filters, setFilters] = useState({
    province: null,
    clinic_id: null,
    end_date: today,
    regional_manager: null,
    start_date: currentMonth
  });

  const missingDataColumns = [
    {
      title: 'Submission Date',
      dataIndex: 'submission_date'
    },
    {
      title: 'Clinic Name',
      dataIndex: 'clinic_name'
    },
    {
      title: 'Provider Name',
      dataIndex: 'provider_name'
    },
    {
      title: 'Provider Type',
      dataIndex: 'provider_type'
    },
    {
      title: 'Production',
      dataIndex: 'production',
      render: (value) => (
        <span
          className={
            value === 0
              ? 'bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium'
              : ''
          }
        >
          ${Number(value).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Patient Seen',
      dataIndex: 'patient_seen',
      render: (value) => (
        <span
          className={
            value === 0
              ? 'bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium'
              : ''
          }
        >
          {value}
        </span>
      )
    }
  ];

  const updateDependentFilters = async (params) => {
    try {
      const { data } = await EODReportService.getFilteredListData(params);
      let dependentUpdates = {};

      if (params.province && !params.regional_manager) {
        setRegionalManagers(
          data.regional_managers.map((i) => ({ value: i.id, label: i.name }))
        );
        setClinics(data.clinics.map((i) => ({ value: i.id, label: i.name })));
        dependentUpdates = { regional_manager: null, clinic_id: null };
      }

      if (params.regional_manager) {
        setClinics(data.clinics.map((i) => ({ value: i.id, label: i.name })));
        dependentUpdates = { clinic_id: null };
      }

      return dependentUpdates;
    } catch (e) {
      console.error('Error updating dependent filters:', e);
      return {};
    }
  };

  const handleFilterChange = async (key, value) => {
    const newFilters = { ...filters, [key]: value };

    let dependentUpdates = {};
    if (key === 'province') {
      dependentUpdates = await updateDependentFilters({ province: value });
    }
    if (key === 'regional_manager') {
      dependentUpdates = await updateDependentFilters({
        province: newFilters.province,
        regional_manager: value
      });
    }

    setFilters({ ...newFilters, ...dependentUpdates });
  };

  const handleResetFilters = async () => {
    const initialFilters = {
      province: null,
      clinic_id: null,
      end_date: today,
      regional_manager: null,
      start_date: currentMonth
    };

    setFilters(initialFilters);
    await fetchInitialData();
  };

  const fetchMissingData = async (currentFilters) => {
    try {
      setTableLoading(true);
      const { data } = await MissingDataService.getMissingDataDetails(
        currentFilters
      );
      setTableData(data.provider_zero_production_patients);
    } catch (e) {
      console.error('Missing API error:', e);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const { data } = await EODReportService.getFilteredListData();
      const clinicOptions = data.clinics.map((i) => ({
        value: i.id,
        label: i.name
      }));
      setClinics(clinicOptions);
      setProvinces(data.provinces.map((i) => ({ value: i.id, label: i.name })));
      setRegionalManagers(
        data.regional_managers.map((i) => ({ value: i.id, label: i.name }))
      );
    } catch (e) {
      console.error('Error fetching filter data:', e);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMissingData(filters);
  }, [filters]);

  return (
    <div className="flex flex-col gap-5 px-8 py-6 bg-gray-50 min-h-[calc(100vh-86px)]">
      <div className="p-4 bg-white border border-secondary-50 rounded-xl">
        <p className="text-[18px] font-semibold text-black">
          Missing Data Report
        </p>
      </div>

      <div className="p-4 bg-white border border-secondary-50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800">Filters</p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleResetFilters}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Reset Filters
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 bg-white rounded-lg">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Province
            </label>
            <Select
              showSearch
              options={provinces}
              optionFilterProp="label"
              value={filters.province}
              placeholder="Select Province"
              onChange={(value) => handleFilterChange('province', value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Regional Manager
            </label>
            <Select
              showSearch
              optionFilterProp="label"
              options={regionalManagers}
              value={filters.regional_manager}
              placeholder="Select Regional Manager"
              onChange={(value) =>
                handleFilterChange('regional_manager', value)
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Practice Name
            </label>
            <Select
              showSearch
              options={clinics}
              optionFilterProp="label"
              value={filters.clinic_id}
              placeholder="Select Practice"
              onChange={(value) => handleFilterChange('clinic_id', value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">From</label>
            <DatePicker
              allowClear={false}
              className="w-full"
              format="MM/DD/YYYY"
              value={filters.start_date}
              onChange={(date) => handleFilterChange('start_date', date)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">To</label>
            <DatePicker
              allowClear={false}
              className="w-full"
              format="MM/DD/YYYY"
              value={filters.end_date}
              onChange={(date) => handleFilterChange('end_date', date)}
            />
          </div>
        </div>
      </div>
      <div className="p-4 bg-white border border-secondary-50 rounded-xl">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Missing Data Details
        </p>
        <GenericTable
          columns={missingDataColumns}
          loading={tableLoading}
          dataSource={tableData}
        />
      </div>
    </div>
  );
}
