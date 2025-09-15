import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function ClinicSubmissions({ clinicSubmissions }) {
  const router = useRouter();

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
              text === 'Submitted'
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
            size="icon"
            variant="destructive"
            className="w-full m-auto"
            href={`/submission/eod/1/${record.id}`}
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

  return (
    <div className="p-6 rounded-xl border border-solid border-[#ececec] shadow-[0px_14px_20px_0px_#0000000A]">
      <h2 className="text-black text-base font-medium mb-4">
        Clinic Submissions
      </h2>
      <GenericTable columns={columns} dataSource={clinicSubmissions} />
    </div>
  );
}
