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
            href={`/submission/eom/1/${record.id}`}
          >
            <EditOutlined />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 rounded-xl border border-solid border-[#ececec] shadow-[0px_14px_20px_0px_#0000000A]">
      <h2 className="text-black text-base font-semibold mb-4">
        Clinic Submissions
      </h2>
      <GenericTable columns={columns} dataSource={clinicSubmissions} />
    </div>
  );
}

//  <Button size="sm" variant="destructive">
//           <DeleteOutlined />
//         </Button>
