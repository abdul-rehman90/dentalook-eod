import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';

export default function List() {
  const router = useRouter();
  const [clinics, setClinics] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const { loading, setLoading } = useGlobalContext();
  const [regionalManagers, setRegionalManagers] = useState([]);
  const [filters, setFilters] = useState({
    province: null,
    clinic_id: null,
    submission_month: null,
    regional_manager: null
  });

  const columns = [
    {
      key: 'submission_month',
      title: 'Submission Month',
      dataIndex: 'submission_month',
      render: (text) => dayjs(text).format('MMM DD, YYYY')
    },
    { title: 'Province', dataIndex: 'province_name', key: 'province_name' },
    {
      title: 'Regional Manager',
      key: 'regional_manager_name',
      dataIndex: 'regional_manager_name'
    },
    { title: 'Practice', dataIndex: 'clinic_name', key: 'clinic_name' },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (status) =>
        status ? (
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold ${
              status === 'Submitted' || status === 'Completed'
                ? 'bg-[#E9F7EE] text-primary-400'
                : 'bg-[#FFF4ED] text-[#FF8A4E]'
            }`}
          >
            {status === 'Submitted' || status === 'Completed'
              ? 'Submitted'
              : 'Draft'}
          </span>
        ) : (
          'N/A'
        )
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="destructive"
            className="w-full m-auto"
            href={`/submission/eom/1/${record.eodsubmission_id}`}
          >
            <EditOutlined />
          </Button>
        </div>
      )
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
      clinic_id: null,
      submission_month: null,
      regional_manager: null
    });
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await EOMReportService.getAllSubmissionList(filters);
      if (response.data) {
        const dataWithKeys = response.data.map((item, index) => ({
          ...item,
          key: item.id || index.toString()
        }));
        setSubmissions(dataWithKeys);
      }
    } catch (error) {
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
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllRegionalManagers();
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
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
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
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
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
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
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
            <p className="text-sm text-gray-900 font-medium whitespace-nowrap">
              Submission Month
            </p>
            <DatePicker
              picker="month"
              format="MMM YYYY"
              allowClear={false}
              placeholder="Select date"
              style={{ width: '100%' }}
              value={filters.submission_month}
              onChange={(date) =>
                handleFilterChange(
                  'submission_month',
                  dayjs(date).startOf('month')
                )
              }
            />
          </div>
        </div>
      </div>
      <div className="p-5 bg-white">
        <p className="text-base font-medium text-black mb-4">
          Clinic Submissions
        </p>
        <GenericTable
          showPagination
          loading={loading}
          columns={columns}
          dataSource={submissions}
        />
      </div>
    </React.Fragment>
  );
}

//  <Button
//             size="icon"
//             variant="destructive"
//             className="w-full m-auto"
//             href={`/review/eom/1/${record.eodsubmission_id}`}
//           >
//             <EyeOutlined />
//           </Button>
