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

const normalizeTableData = (rows, totalKey) => {
  const totalRow = rows.find((i) => i.date === 'All');
  const normalRows = rows.filter((i) => i.date !== 'All');

  if (normalRows.length === 0) return [];

  return [
    ...normalRows.map((i, idx) => ({ ...i, key: i.id || idx })),
    ...(totalRow ? [{ ...totalRow, key: totalKey, isTotal: true }] : [])
  ];
};

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
    {
      title: 'Date',
      dataIndex: 'date',
      render: (value, record) =>
        record.isTotal ? <span className="font-semibold">Total</span> : value
    },
    {
      title: 'Clinic Name',
      dataIndex: 'clinic_name',
      render: (value, record) => (record.isTotal ? '' : value)
    },
    { title: 'Title', dataIndex: 'provider_title' },
    { title: 'Provider Name', dataIndex: 'provider_name' },
    {
      title: 'Production Amount',
      dataIndex: 'production_amount',
      render: (v) => `$${Number(v).toLocaleString()}`
    }
  ];

  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (value, record) =>
        record.isTotal ? <span className="font-semibold">Total</span> : value
    },
    {
      title: 'Clinic Name',
      dataIndex: 'clinic_name',
      render: (value, record) => (record.isTotal ? '' : value)
    },
    {
      title: 'Payment Type',
      dataIndex: 'payment_type',
      render: (value, record) => (record.isTotal ? '' : value)
    },
    {
      title: 'Payment Amount',
      dataIndex: 'payment_amount',
      render: (v) => `$${Number(v).toLocaleString()}`
    },
    {
      title: 'Insurance Company',
      dataIndex: 'insurance_company',
      render: (value, record) => (record.isTotal ? '' : value)
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

      const rows = data || [];
      const totalKey = 'production-total';
      const normalizedRows = normalizeTableData(rows, totalKey);
      setTableData((p) => ({ ...p, production: normalizedRows }));
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

      const rows = data || [];
      const totalKey = 'payment-total';
      const normalizedRows = normalizeTableData(rows, totalKey);
      setTableData((p) => ({ ...p, payment: normalizedRows }));
    } catch (e) {
      console.error('Payment API error:', e);
    } finally {
      setTableLoading((p) => ({ ...p, payment: false }));
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

      if (clinicOptions.length > 0) {
        setFilters((prev) => ({
          ...prev,
          clinic_id: clinicOptions[0].value
        }));
      }
    } catch (e) {
      console.error('Error fetching filter data:', e);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!filters.clinic_id) return;
    fetchProductionData(filters);
    fetchPaymentData(filters);
  }, [filters]);

  return (
    <div className="flex flex-col gap-5 px-8 py-6 bg-gray-50 min-h-[calc(100vh-86px)]">
      <div className="p-4 bg-white border border-secondary-50 rounded-xl">
        <p className="text-[18px] font-semibold text-black">
          Collection Tracker Details
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 bg-white rounded-lg">
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
            <label className="text-xs font-medium text-gray-700">Date</label>
            <DatePicker
              allowClear={false}
              className="w-full"
              format="MM/DD/YYYY"
              value={filters.start_date}
              onChange={(date) => handleFilterChange('start_date', date)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border border-secondary-50 rounded-xl">
        <Row gutter={24}>
          <Col span={16}>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Payment Details
            </p>
            <GenericTable
              columns={paymentColumns}
              loading={tableLoading.payment}
              dataSource={tableData.payment}
              rowClassName={(record) =>
                record.isTotal ? 'bg-gray-100 font-semibold' : ''
              }
            />
          </Col>
          <Col span={8}>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              File Attachements
            </p>
            <FileListSection filters={filters} />
          </Col>
        </Row>
      </div>

      <div className="p-4 bg-white border border-secondary-50 rounded-xl">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Production Details
        </p>
        <GenericTable
          columns={productionColumns}
          loading={tableLoading.production}
          dataSource={tableData.production}
          rowClassName={(record) =>
            record.isTotal ? 'bg-gray-100 font-semibold' : ''
          }
        />
      </div>
    </div>
  );
}
