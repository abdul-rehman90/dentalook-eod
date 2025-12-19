'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import FileListSection from './file-list-section';
import { DatePicker, Select, Row, Col } from 'antd';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { CollectionTrackerService } from '@/common/services/collection-tracker';

const yesterday = dayjs().subtract(1, 'day');

export default function CollectionTracker() {
  const [clinics, setClinics] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [regionalManagers, setRegionalManagers] = useState([]);
  const [tableData, setTableData] = useState({
    payment: [],
    production: []
  });
  const [tableLoading, setTableLoading] = useState({
    payment: false,
    production: false
  });
  const [filters, setFilters] = useState({
    province: null,
    clinic_id: null,
    end_date: yesterday,
    start_date: yesterday,
    regional_manager: null
  });

  const productionColumns = [
    { title: 'Date', dataIndex: 'date' },
    { title: 'Clinic Name', dataIndex: 'clinic_name' },
    { title: 'Title', dataIndex: 'provider_title' },
    { title: 'Provider Name', dataIndex: 'provider_name' },
    {
      title: 'Production Amount',
      dataIndex: 'production_amount',
      render: (v) => `$${Number(v).toLocaleString()}`
    }
  ];

  const paymentColumns = [
    { title: 'Date', dataIndex: 'date' },
    { title: 'Clinic Name', dataIndex: 'clinic_name' },
    { title: 'Payment Type', dataIndex: 'payment_type' },
    {
      title: 'Payment Amount',
      dataIndex: 'payment_amount',
      render: (v) => `$${Number(v).toLocaleString()}`
    },
    { title: 'Insurance Company', dataIndex: 'insurance_company' }
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

    if (key === 'start_date') {
      newFilters.end_date = value;
    }

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
      end_date: yesterday,
      start_date: yesterday,
      regional_manager: null
    };

    setFilters(initialFilters);
    await fetchInitialData();
  };

  const fetchProductionData = async (currentFilters) => {
    try {
      setTableLoading((p) => ({ ...p, production: true }));

      const { data } = await CollectionTrackerService.getProductionDetails(
        currentFilters
      );

      setTableData((p) => ({
        ...p,
        production: (data || [])
          .filter((i) => i.date !== 'All')
          .map((i, idx) => ({ ...i, key: i.id || idx }))
      }));
    } catch (e) {
      console.error('Production API error:', e);
    } finally {
      setTableLoading((p) => ({ ...p, production: false }));
    }
  };

  const fetchPaymentData = async (currentFilters) => {
    try {
      setTableLoading((p) => ({ ...p, payment: true }));

      const { data } = await CollectionTrackerService.getPaymentDetails(
        currentFilters
      );

      setTableData((p) => ({
        ...p,
        payment: (data || [])
          .filter((i) => i.date !== 'All')
          .map((i, idx) => ({ ...i, key: i.id || idx }))
      }));
    } catch (e) {
      console.error('Payment API error:', e);
    } finally {
      setTableLoading((p) => ({ ...p, payment: false }));
    }
  };

  const fetchInitialData = async () => {
    try {
      const { data } = await EODReportService.getFilteredListData();

      setClinics(data.clinics.map((i) => ({ value: i.id, label: i.name })));
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
    fetchProductionData(filters);
    fetchPaymentData(filters);
  }, [filters]);

  return (
    <div className="flex flex-col gap-5 px-8 py-6 bg-gray-50 min-h-[calc(100vh-86px)]">
      <div className="p-4 bg-white border border-secondary-50 rounded-lg">
        <p className="text-[18px] font-semibold text-black">
          Collection Tracker Details
        </p>
      </div>

      <div className="p-4 bg-white border border-secondary-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-black">Filters</p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleResetFilters}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Reset Filters
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col flex-1 gap-2">
            <p className="text-xs font-medium text-gray-900">Province</p>
            <Select
              showSearch
              options={provinces}
              optionFilterProp="label"
              value={filters.province}
              style={{ width: '100%' }}
              placeholder="Select Province"
              onChange={(val) => handleFilterChange('province', val)}
            />
          </div>

          <div className="flex flex-col flex-1 gap-2">
            <p className="text-xs font-medium text-gray-900">
              Regional Manager
            </p>
            <Select
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={regionalManagers}
              value={filters.regional_manager}
              placeholder="Select Regional Manager"
              onChange={(val) => handleFilterChange('regional_manager', val)}
            />
          </div>

          <div className="flex flex-col flex-1 gap-2">
            <p className="text-xs font-medium text-gray-900">Practice Name</p>
            <Select
              showSearch
              options={clinics}
              optionFilterProp="label"
              value={filters.clinic_id}
              style={{ width: '100%' }}
              placeholder="Select Practice"
              onChange={(val) => handleFilterChange('clinic_id', val)}
            />
          </div>

          <div className="flex flex-col flex-1 gap-2">
            <p className="text-xs font-medium text-gray-900">Date</p>
            <DatePicker
              allowClear={false}
              format="MM/DD/YYYY"
              placeholder="Select date"
              style={{ width: '100%' }}
              value={filters.start_date}
              onChange={(date) => handleFilterChange('start_date', date)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border border-secondary-50 rounded-lg">
        <Row gutter={16}>
          <Col span={16}>
            <p className="font-medium mb-4">Payment Details</p>
            <GenericTable
              showPagination
              loading={tableLoading.payment}
              columns={paymentColumns}
              dataSource={tableData.payment}
            />
          </Col>
          <Col span={8}>
            <p className="font-medium mb-4">File Attachements</p>
            <FileListSection filters={filters} />
          </Col>
        </Row>
      </div>

      <div className="p-4 bg-white border border-secondary-50 rounded-lg">
        <p className="font-medium mb-4">Production Details</p>
        <GenericTable
          showPagination
          columns={productionColumns}
          loading={tableLoading.production}
          dataSource={tableData.production}
        />
      </div>
    </div>
  );
}
