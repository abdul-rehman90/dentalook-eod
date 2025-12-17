'use client';

import React, { useState, useEffect } from 'react';
import FileListSection from './file-list-section';
import { DatePicker, Select, Row, Col } from 'antd';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import { CollectionTrackerService } from '@/common/services/collection-tracker';

export default function CollectionTracker() {
  const [clinics, setClinics] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const { loading, setLoading } = useGlobalContext();
  const [paymentData, setPaymentData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [regionalManagers, setRegionalManagers] = useState([]);
  const [filters, setFilters] = useState({
    province: null,
    end_date: null,
    clinic_id: null,
    start_date: null,
    regional_manager: null
  });

  const productionColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Clinic Name', dataIndex: 'clinic_name', key: 'clinic_name' },
    {
      title: 'Title',
      key: 'provider_title',
      dataIndex: 'provider_title'
    },
    {
      key: 'provider_name',
      title: 'Provider Name',
      dataIndex: 'provider_name'
    },
    {
      key: 'production_amount',
      title: 'Production Amount',
      dataIndex: 'production_amount',
      render: (amount) => `$${Number(amount).toLocaleString()}`
    }
  ];

  const paymentColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Clinic Name', dataIndex: 'clinic_name', key: 'clinic_name' },
    { title: 'Payment Type', dataIndex: 'payment_type', key: 'payment_type' },
    {
      key: 'payment_amount',
      title: 'Payment Amount',
      dataIndex: 'payment_amount',
      render: (amount) => `$${Number(amount).toLocaleString()}`
    },
    {
      key: 'insurance_company',
      title: 'Insurance Company',
      dataIndex: 'insurance_company'
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      province: null,
      end_date: null,
      clinic_id: null,
      start_date: null,
      regional_manager: null
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productionResponse, paymentResponse] = await Promise.all([
        CollectionTrackerService.getProductionDetails(filters),
        CollectionTrackerService.getPaymentDetails(filters)
      ]);

      if (productionResponse.data) {
        const filteredData = productionResponse.data.filter(
          (item) => item.date !== 'All'
        );
        const dataWithKeys = filteredData.map((item, index) => ({
          ...item,
          key: item.id || index.toString()
        }));
        setProductionData(dataWithKeys);
      }

      if (paymentResponse.data) {
        const filteredData = paymentResponse.data.filter(
          (item) => item.date !== 'All'
        );
        const dataWithKeys = filteredData.map((item, index) => ({
          ...item,
          key: item.id || index.toString()
        }));
        setPaymentData(dataWithKeys);
      }
    } catch (error) {
      console.error('Error fetching collection tracker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRegionalManagers = async () => {
    try {
      const { data } = await EODReportService.getAllRegionalManagers();
      setProvinces(
        data.provinces.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
      setClinics(
        data.clinics.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
      setRegionalManagers(
        data.regional_managers.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
    } catch (error) {
      console.error('Error fetching regional managers:', error);
    }
  };

  useEffect(() => {
    fetchAllRegionalManagers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <div className="px-8 py-6 bg-gray-50 min-h-[calc(100vh-86px)]">
      <div className="p-4 bg-white border border-secondary-50 rounded-tl-[5px] rounded-tr-[5px]">
        <p className="flex items-center text-[18px] font-semibold text-black">
          Collection Tracker Details
        </p>
      </div>
      <div className="p-4 border-[1px] border-t-0 border-solid border-secondary-50">
        <div className="flex flex-col gap-5 ">
          <div className="p-4 bg-white border border-secondary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-black">Filters</p>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleResetFilters}
                className="h-9 !shadow-none text-black !rounded-lg"
              >
                Reset Filters
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
                  Province
                </p>
                <Select
                  options={provinces}
                  value={filters.province}
                  style={{ width: '100%' }}
                  placeholder="Select Province"
                  onChange={(value) => handleFilterChange('province', value)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
                  Regional Manager
                </p>
                <Select
                  style={{ width: '100%' }}
                  options={regionalManagers}
                  value={filters.regional_manager}
                  placeholder="Select Regional Manager"
                  onChange={(value) =>
                    handleFilterChange('regional_manager', value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
                  Practice Name
                </p>
                <Select
                  options={clinics}
                  value={filters.clinic_id}
                  style={{ width: '100%' }}
                  placeholder="Select Practice"
                  onChange={(value) => handleFilterChange('clinic_id', value)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
                  From
                </p>
                <DatePicker
                  allowClear={false}
                  format="MM/DD/YYYY"
                  placeholder="Select date"
                  style={{ width: '100%' }}
                  value={filters.start_date}
                  onChange={(date) => handleFilterChange('start_date', date)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
                  To
                </p>
                <DatePicker
                  allowClear={false}
                  format="MM/DD/YYYY"
                  value={filters.end_date}
                  placeholder="Select date"
                  style={{ width: '100%' }}
                  onChange={(date) => handleFilterChange('end_date', date)}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-secondary-50 rounded-lg">
            <p className="text-base font-medium text-black mb-4">
              Production Details
            </p>
            <GenericTable
              showPagination
              loading={loading}
              columns={productionColumns}
              dataSource={productionData}
            />
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">
                  Total Production Amount:
                </span>
                <span className="font-semibold text-lg text-gray-800">
                  $
                  {productionData
                    .reduce(
                      (sum, item) => sum + Number(item.production_amount || 0),
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-secondary-50 rounded-lg">
            <p className="text-base font-medium text-black mb-4">
              Payment Details
            </p>
            <Row gutter={16}>
              <Col span={16}>
                <GenericTable
                  showPagination
                  loading={loading}
                  columns={paymentColumns}
                  dataSource={paymentData}
                />
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Total Payment Amount:
                    </span>
                    <span className="font-semibold text-lg text-gray-800">
                      $
                      {paymentData
                        .reduce(
                          (sum, item) => sum + Number(item.payment_amount || 0),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <FileListSection filters={filters} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}
