'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { UserService } from '@/common/services/users';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { EODReportService } from '@/common/services/eod-report';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function UserForm() {
  const { id } = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log(values);
      if (id) {
        await UserService.updateUser(id, values);
      } else {
        await UserService.createUser(values);
        router.push('/users');
        // form.resetFields();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Fetch user data for edit mode
  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        try {
          const { data } = await UserService.getUserById(id);
          form.setFieldsValue(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="destructive"
          onClick={() => router.push('/users')}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftOutlined />
        </Button>
        <h2 className="text-2xl font-semibold text-gray-800">
          {!id ? 'Add New User' : 'Update User'}
        </h2>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  type: 'email',
                  required: true,
                  message: 'This field is required'
                }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={
                !id
                  ? [{ required: true, message: 'This field is required' }]
                  : []
              }
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <Select placeholder="Select role">
                <Option value="RM">RM</Option>
                <Option value="PM">PM</Option>
                <Option value="Provider">Provider</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="user_type" label="User Type">
              <Input placeholder="Enter user type" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone_number" label="Phone Number">
              <Input placeholder="+1234567890" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="city" label="City">
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="provider_coverage" label="Provider Coverage">
              <Select placeholder="Select provider coverage">
                <Option value="Internal">Internal</Option>
                <Option value="External">External</Option>
                <Option value="ACE">ACE</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="clinics"
              label="Clinics"
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <Select
                mode="multiple"
                options={clinics}
                placeholder="Select clinics"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="provinces"
              label="Provinces"
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <Select
                mode="multiple"
                options={provinces}
                placeholder="Select provinces"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            disabled={loading}
            variant="secondary"
            onClick={() => form.resetFields()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={loading}>
            {!id ? 'Create User' : 'Update User'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
