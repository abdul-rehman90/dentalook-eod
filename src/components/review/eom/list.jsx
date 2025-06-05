import React, { useState, useMemo } from 'react';
import { DatePicker, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { EditOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';

const dentalClinics = [
  '67th Street Dental',
  'Aspire Dental',
  'Bathurst Dundas Dental Centre',
  'Calling Lakes Dental',
  'Dentists on Bloor'
];

const submissions = [
  {
    key: '1',
    date: '2025-04-01',
    submission: 'May 1, 2025',
    practice: 'Calling Lakes Dental',
    province: 'Saskatchewan (SK)',
    manager: 'Mandi Kuculym',
    status: 'Submitted'
  },
  {
    key: '2',
    date: '2025-04-01',
    submission: 'May 2, 2025',
    practice: 'Aspire Dental',
    province: 'Saskatchewan (SK)',
    manager: 'Mandi Kuculym',
    status: 'Submitted'
  }
];

export default function List() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    clinic: null,
    submissionMonth: null
  });

  const columns = [
    {
      key: 'submission',
      dataIndex: 'submission',
      title: 'Submission Month'
    },
    { title: 'Practice', dataIndex: 'practice', key: 'practice' },
    { title: 'Province', dataIndex: 'province', key: 'province' },
    { title: 'Regional Manager', dataIndex: 'manager', key: 'manager' },
    { title: 'Submission Date', dataIndex: 'date', key: 'date' },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (text) => (
        <span className="bg-[#E9F7EE] text-primary-400 px-2 py-1 rounded-full text-sm font-semibold">
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
          onClick={() => router.push('/review/eom/1')}
        >
          <EditOutlined />
        </Button>
      )
    }
  ];

  const filteredData = useMemo(() => {
    return submissions.filter((item) => {
      const itemDate = new Date(item.date);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      const matchesClinic = filters.clinic
        ? item.practice === filters.clinic
        : true;
      const matchesFrom = fromDate ? itemDate >= fromDate : true;
      const matchesTo = toDate ? itemDate <= toDate : true;

      return matchesClinic && matchesFrom && matchesTo;
    });
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      clinic: null,
      submissionMonth: null
    });
  };

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
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
              Practice Name
            </p>
            <Select
              value={filters.clinic}
              placeholder="Find Items"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('clinic', value)}
            >
              {dentalClinics.map((clinic) => (
                <Select.Option key={clinic} value={clinic}>
                  {clinic}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
              Submission Month
            </p>
            <DatePicker
              picker="month"
              format="MMM YYYY"
              value={filters.dateFrom}
              placeholder="Select date"
              style={{ width: '100%' }}
              onChange={(date) => handleFilterChange('dateFrom', date)}
            />
          </div>
        </div>
      </div>
      <div className="p-5 bg-white">
        <p className="text-base font-medium text-black mb-4">
          Clinic Submissions
        </p>
        <GenericTable columns={columns} dataSource={filteredData} />
      </div>
    </React.Fragment>
  );
}
