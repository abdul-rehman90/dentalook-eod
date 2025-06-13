import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Col, Row, Input } from 'antd';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import { Card, CardHeader, CardTitle } from '@/common/components/card/card';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
const { TextArea } = Input;

const paymentOptions = [
  { value: 'VISA', label: 'VISA' },
  { value: 'AMEX', label: 'AMEX' },
  { value: 'DEBIT', label: 'DEBIT' },
  { value: 'MASTERCARD', label: 'MASTERCARD' },
  { value: 'CC/DEBIT REFUND', label: 'CC/DEBIT REFUND' },
  { value: 'PATIENT E-TRANSFER', label: 'PATIENT E-TRANSFER' },
  { value: 'PATIENT CHEQUE', label: 'PATIENT CHEQUE' },
  { value: 'INSURANCE  CHEQUE', label: 'INSURANCE  CHEQUE' },
  { value: 'EFT PAYMENT', label: 'EFT PAYMENT' },
  { value: 'CASH', label: 'CASH' }
];

export default function Payment({ onNext }) {
  const [notes, setNotes] = useState('');
  const [payments, setPayments] = useState([]);
  const { steps, currentStep, updateStepData, getCurrentStepData } =
    useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;

  const columns = [
    {
      key: 'type',
      editable: true,
      dataIndex: 'type',
      inputType: 'select',
      title: 'Payment Type',
      selectOptions: paymentOptions
    },
    {
      key: 'amount',
      editable: true,
      inputType: 'number',
      title: 'Amount ($)',
      dataIndex: 'amount'
    },
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <Button
          size="icon"
          className="ml-3"
          variant="destructive"
          onClick={() => handleDelete(record.key)}
        >
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const footer = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1 text-left p-2">Total Amount</div>
      <div className="flex-1 text-left p-2">
        {payments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
      </div>
      <div className="flex-1 p-2"></div>
    </div>
  );

  const createPayment = async () => {
    try {
      const payload = {
        notes: notes,
        payments: payments.map((item) => ({
          ...item,
          eodsubmission: 1,
          payment_type: payments[0].type,
          payment_amount: payments[0].amount
        }))
      };
      const response = await EODReportService.addPayment(payload);
      if (response.status === 201) {
        updateStepData(currentStepId, { notes, payments });
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {}
  };

  const handleCellChange = (record, dataIndex, value) => {
    const newPayments = payments.map((item) => {
      if (item.key === record.key) {
        return {
          ...item,
          [dataIndex]: dataIndex === 'amount' ? Number(value) || 0 : value
        };
      }
      return item;
    });
    setPayments(newPayments);
  };

  const handleAddPayment = () => {
    const newPayment = {
      key: payments.length ? Math.max(...payments.map((p) => p.key)) + 1 : 1,
      type: '',
      amount: '',
      action: ''
    };
    setPayments([...payments, newPayment]);
  };

  const handleDelete = (key) => {
    setPayments(payments.filter((item) => item.key !== key));
  };

  useEffect(() => {
    if (Object.entries(currentStepData).length > 0) {
      setNotes(currentStepData.notes);
      setPayments(currentStepData.payments);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-medium text-black">Payments</h1>
          <Button
            size="lg"
            onClick={handleAddPayment}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Payment
          </Button>
        </div>
        <Row gutter={16}>
          <Col span={16}>
            <GenericTable
              footer={footer}
              columns={columns}
              dataSource={payments}
              onCellChange={handleCellChange}
            />
          </Col>
          <Col span={8}>
            <Card className="!p-0 !gap-0 border border-secondary-50">
              <CardHeader className="!gap-0 !px-4 !py-3 bg-gray-50 rounded-tl-xl rounded-tr-xl border-b border-secondary-50">
                <CardTitle className="text-[15px] font-medium text-black">
                  Payment Notes
                </CardTitle>
              </CardHeader>
              <TextArea
                rows={4}
                value={notes}
                placeholder="Enter note here..."
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  height: '170px',
                  color: '#777B8B',
                  fontSize: '15px',
                  boxShadow: 'none',
                  borderRadius: '12px',
                  padding: '10px 16px'
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
      <StepNavigation onNext={createPayment} />
    </React.Fragment>
  );
}
