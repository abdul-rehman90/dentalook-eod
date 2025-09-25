'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { useDebounce } from '@/common/hooks/useDebounce';
import { ClinicService } from '@/common/services/clinics';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import { EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';

export default function List() {
  const [search, setSearch] = useState('');
  const [clinics, setClinics] = useState([]);
  const debouncedSearch = useDebounce(search, 500);
  const { loading, setLoading } = useGlobalContext();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Province', dataIndex: 'province_name', key: 'province_name' },
    {
      key: 'unit_length',
      title: 'Unit Length',
      dataIndex: 'unit_length'
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
            className="p-1 w-full m-auto rounded-full hover:bg-gray-100"
            // href={`/submission/eod/1/${record.eodsubmission_id}`}
          >
            <EyeOutlined />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="p-1 w-full m-auto rounded-full hover:bg-gray-100"
            // href={`/submission/eod/1/${record.eodsubmission_id}`}
          >
            <EditOutlined />
          </Button>
        </div>
      )
    }
  ];

  const fetchClinics = async (query = '') => {
    try {
      setLoading(true);
      const { data } = await ClinicService.getAllClinics({ name: query });
      setClinics(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <React.Fragment>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-medium text-black">Clinics</h2>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            className="!py-2"
            suffix={<SearchOutlined />}
            placeholder="Search clinics..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary">Create Clinic</Button>
        </div>
      </div>
      <GenericTable
        showPagination
        loading={loading}
        columns={columns}
        dataSource={clinics}
      />
    </React.Fragment>
  );
}
