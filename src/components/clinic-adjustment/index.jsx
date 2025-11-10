'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { DatePicker, Input, Table } from 'antd';
import { Button } from '@/common/components/button/button';
import { EODReportService } from '@/common/services/eod-report';

export default function ClinicAdjustment() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [clinicAmounts, setClinicAmounts] = useState({});

  const columns = [
    {
      key: 'name',
      width: '60%',
      dataIndex: 'name',
      title: 'Clinic Name'
    },
    {
      width: '40%',
      key: 'amount',
      title: 'Amount',
      dataIndex: 'amount',
      render: (_, record) => (
        <Input
          type="number"
          placeholder="Enter amount"
          className="!p-2 !rounded-md"
          value={clinicAmounts[record.id] || ''}
          onChange={(e) => handleAmountChange(record.id, e.target.value)}
        />
      )
    }
  ];

  const handleAmountChange = (clinicId, amount) => {
    setClinicAmounts((prev) => ({
      ...prev,
      [clinicId]: amount
    }));
  };

  const fetchClinicAdjustments = async (date) => {
    try {
      setLoading(true);
      const { data } = await EODReportService.getClinicAdjustment({
        date: dayjs(date).format('YYYY-MM-DD')
      });
      const amounts = {};
      data?.forEach((item) => {
        amounts[item.clinic] = item.amount;
      });
      setClinicAmounts(amounts);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const payload = Object.entries(clinicAmounts).map(([clinicId, amount]) => ({
      amount: parseFloat(amount),
      clinic_id: parseInt(clinicId),
      date: dayjs(selectedDate).format('YYYY-MM-DD')
    }));

    if (payload.length === 0) {
      toast.error('Please enter at least one amount');
      return;
    }

    try {
      setLoading(true);
      const response = await EODReportService.addClinicAdjustment(payload);
      if (response.status === 200) {
        setClinicAmounts({});
        setSelectedDate(null);
        toast.success('Records successfully saved');
      }
    } catch (error) {
      let errorMessage =
        error?.response?.data?.error[0] ??
        'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRegionalManagers = async () => {
    try {
      setLoading(true);
      const { data } = await EODReportService.getAllRegionalManagers();
      setClinics(data.clinics || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRegionalManagers();
  }, []);

  return (
    <div className="px-13 py-6 bg-[#FAFAFB] min-h-[calc(100vh_-_75px)]">
      <div className="bg-white p-5 rounded-xl">
        <div className="flex justify-between items-center border-b-1 border-b-secondary-50 pb-4">
          <h1 className="text-2xl font-semibold text-black">
            Clinic Adjustment
          </h1>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
              Date
            </p>
            <DatePicker
              allowClear={false}
              format="MM/DD/YYYY"
              placeholder="Select date"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(date) => {
                const newDate = date ? date.toDate() : null;
                setSelectedDate(newDate);
                if (newDate) {
                  fetchClinicAdjustments(newDate);
                }
              }}
            />
          </div>
        </div>
        <div className="mt-5 ">
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            pagination={false}
            dataSource={clinics}
            className="clinic-adjustment-table"
          />
          <div className="flex justify-end mt-6">
            <Button
              size="lg"
              onClick={onSubmit}
              isLoading={loading}
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
