'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { useRouter } from 'next/navigation';
import { UserService } from '@/common/services/users';
import { useDebounce } from '@/common/hooks/useDebounce';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { useGlobalContext } from '@/common/context/global-context';
import ConfirmModal from '@/common/components/confirm-modal/confirm-moda';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';

export default function List() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [modalOpen, setModalOpen] = useState(false);
  const { loading, setLoading } = useGlobalContext();
  const [selectedUser, setSelectedUser] = useState(null);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role'
    },
    {
      key: 'phone_number',
      title: 'Phone Number',
      dataIndex: 'phone_number',
      render: (phone_number) => (phone_number ? phone_number : 'N/A')
    },
    {
      key: 'provider_coverage',
      title: 'Provider coverage',
      dataIndex: 'provider_coverage',
      render: (provider_coverage) =>
        provider_coverage ? provider_coverage : 'N/A'
    },
    {
      key: 'user_type',
      title: 'User Type',
      dataIndex: 'user_type',
      render: (type) => (type ? type : 'N/A')
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
            onClick={() => router.push(`/users/${record.id}`)}
            className="p-1 w-full m-auto rounded-full hover:bg-gray-100"
          >
            <EditOutlined />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="p-1 w-full m-auto rounded-full hover:bg-gray-100"
          >
            <DeleteOutlined onClick={() => handleDeleteClick(record)} />
          </Button>
        </div>
      )
    }
  ];

  const handleDeleteClick = (record) => {
    setModalOpen(true);
    setSelectedUser(record);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    await UserService.deleteUser(selectedUser.id);
    setLoading(false);
    fetchUsers(debouncedSearch);
    setModalOpen(false);
  };

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      const { data } = await UserService.getAllUsers({ name: query });
      setUsers(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Call API when debounced value changes
  useEffect(() => {
    fetchUsers(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <React.Fragment>
      <ConfirmModal
        open={modalOpen}
        loading={loading}
        title="Delete User"
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalOpen(false)}
        message={`Are you sure you want to delete the user?`}
      />
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-medium text-black">Users</h2>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            className="!py-2"
            suffix={<SearchOutlined />}
            placeholder="Search users..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => router.push('/users/create')}
          >
            Create User
          </Button>
        </div>
      </div>
      <GenericTable
        showPagination
        loading={loading}
        columns={columns}
        dataSource={users}
      />
    </React.Fragment>
  );
}
