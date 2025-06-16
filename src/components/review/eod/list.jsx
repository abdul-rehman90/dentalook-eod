import React, { useState, useEffect } from 'react';
import { DatePicker, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { EditOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReviewService } from '@/common/services/review-eod';

export default function List() {
  const router = useRouter();
  const [clinics, setClinics] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    clinic_id: null,
    start_date: null,
    end_date: null
  });

  const columns = [
    { title: 'Date', dataIndex: 'submission_date', key: 'submission_date' },
    { title: 'Practice', dataIndex: 'clinic_name', key: 'clinic_name' },
    { title: 'Province', dataIndex: 'province_name', key: 'province_name' },
    {
      title: 'Regional Manager',
      key: 'regional_manager_name',
      dataIndex: 'regional_manager_name'
    },
    {
      key: 'submitted',
      title: 'Status',
      dataIndex: 'submitted',
      render: (text) => (
        <span
          className={`px-2 py-1 rounded-full text-sm font-semibold ${
            text === 'Completed'
              ? 'bg-[#E9F7EE] text-primary-400'
              : 'bg-[#FFF4ED] text-[#FF8A4E]'
          }`}
        >
          {text}
        </span>
      )
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
      render: (_, record) => (
        <Button
          size="icon"
          variant="destructive"
          className="w-full m-auto"
          onClick={() => router.push('/review/eod/1')}
        >
          <EditOutlined />
        </Button>
      )
    }
  ];

  const fetchSubmissions = async () => {
    try {
      const response = await EODReviewService.getAllSubmissions(filters);
      if (response.data) {
        const dataWithKeys = response.data.map((item, index) => ({
          ...item,
          key: item.id || index.toString()
        }));
        setSubmissions(dataWithKeys);
      }
    } catch (error) {}
  };

  const fetchClinics = async () => {
    try {
      const { data } = await EODReviewService.getAllClinics();
      setClinics(
        data.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
    } catch (error) {}
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      clinic_id: null,
      start_date: null,
      end_date: null
    });
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  return (
    <React.Fragment>
      <div className="p-5 bg-white border-b border-secondary-50">
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
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
              Practice Name
            </p>
            <Select
              placeholder="Select Practice"
              value={filters.clinic_id}
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('clinic_id', value)}
              options={clinics}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
              Submission Date (From)
            </p>
            <DatePicker
              format="MM/DD/YYYY"
              placeholder="Select date"
              style={{ width: '100%' }}
              value={filters.start_date}
              onChange={(date) => handleFilterChange('start_date', date)}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
              Submission Date (To)
            </p>
            <DatePicker
              format="MM/DD/YYYY"
              value={filters.end_date}
              placeholder="Select date"
              style={{ width: '100%' }}
              onChange={(date) => handleFilterChange('end_date', date)}
            />
          </div>
        </div>
      </div>
      <div className="p-5 bg-white">
        <p className="text-base font-medium text-black mb-4">
          Clinic Submissions
        </p>
        <GenericTable columns={columns} dataSource={submissions} />
      </div>
    </React.Fragment>
  );
}
