'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { DatePicker, Form, Input, Select } from 'antd';
import { Button } from '@/common/components/button/button';
import { EODReportService } from '@/common/services/eod-report';

export default function ClinicAdjustment() {
  const [form] = Form.useForm();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: null,
    clinic_id: null,
    clinic_name: ''
  });
  const initialValues = {
    amount: '',
    date: null,
    clinic_id: null,
    clinic_name: ''
  };

  const handleFilterChange = (key, value, label) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(label ? { clinic_name: label } : {})
    }));
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        amount: values.amount,
        clinic_id: filters.clinic_id,
        date: filters.date ? dayjs(filters.date).format('YYYY-MM-DD') : null
      };

      const response = await EODReportService.addClinicAdjustment(payload);
      if (response.status === 201) {
        form.resetFields();
        setFilters({ date: null, clinic_id: null });
        toast.success('Record is successfully saved');
      }
    } catch (error) {
      let errorMessage =
        error?.response?.data?.detail ??
        'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRegionalManagers = async () => {
    try {
      const { data } = await EODReportService.getAllRegionalManagers();
      setClinics(
        data.clinics.map((item) => ({
          value: item.id,
          label: item.name
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllRegionalManagers();
  }, []);

  useEffect(() => {
    if (filters.clinic_id && filters.date) {
      form.setFieldsValue({
        clinic_name: filters.clinic_name || '',
        date: filters.date ? dayjs(filters.date).format('DD/MM/YYYY') : null
      });
    }
  }, [filters, form]);

  return (
    <div className="px-13 py-6 bg-[#FAFAFB] min-h-[calc(100vh_-_75px)]">
      <div className="bg-white p-6 rounded-xl">
        <h1 className="text-2xl font-semibold text-black">Clinic Adjustment</h1>
        <div className="flex flex-wrap gap-4 mt-5">
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
              Clinics
            </p>
            <Select
              options={clinics}
              value={filters.clinic_id}
              style={{ width: '100%' }}
              placeholder="Select Clinic"
              onChange={(value, option) =>
                handleFilterChange('clinic_id', value, option?.label)
              }
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
              Date
            </p>
            <DatePicker
              allowClear={false}
              format="MM/DD/YYYY"
              placeholder="Select date"
              style={{ width: '100%' }}
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(date) =>
                handleFilterChange('date', date ? date.toDate() : null)
              }
            />
          </div>
        </div>
        <div className="mt-8">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialValues}
          >
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 clinic-adj">
              <Form.Item label="Clinic" name="clinic_name">
                <Input
                  disabled
                  placeholder="Select Clinic"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </Form.Item>
              <Form.Item label="Date" name="date">
                <Input
                  disabled
                  placeholder="Select date"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </Form.Item>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </Form.Item>
            </div>
            <div className="flex justify-end mt-1">
              <Form.Item>
                <Button
                  size="lg"
                  type="submit"
                  variant="secondary"
                  isLoading={loading}
                  className="w-full h-9 !shadow-none text-black !rounded-lg"
                >
                  Submit
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
