import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Col, Row, Input, Select } from 'antd';
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

const initialPayments = paymentOptions.map((option, index) => ({
  key: index + 1,
  type: option.value,
  amount: '',
  action: ''
}));

export default function Payment({ onNext }) {
  const [notes, setNotes] = useState('');
  const [tableData, setTableData] = useState(initialPayments);
  const {
    steps,
    setLoading,
    currentStep,
    submissionId,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;

  const columns = [
    {
      width: 200,
      key: 'type',
      editable: true,
      dataIndex: 'type',
      inputType: 'select',
      title: 'Payment Type',
      selectOptions: paymentOptions,
      render: (type, record) => {
        return (
          <div className="flex flex-col gap-1">
            <Select
              value={type}
              onChange={(value) => handleTypeChange(record.key, value)}
            >
              {paymentOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            {type === 'EFT PAYMENT' && (
              <Input
                placeholder="Insurance Company"
                value={record.eftReference || ''}
                onChange={(e) =>
                  handleDetailChange(record.key, 'eftReference', e.target.value)
                }
              />
            )}
          </div>
        );
      }
    },
    {
      width: 150,
      key: 'amount',
      editable: true,
      inputType: 'number',
      title: 'Amount ($)',
      dataIndex: 'amount'
    },
    {
      width: 50,
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
        {tableData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
      </div>
    </div>
  );

  const handleTypeChange = (key, value) => {
    const newPayments = tableData.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          type: value,
          // Clear EFT reference if changing from EFT PAYMENT to another type
          ...(value !== 'EFT PAYMENT' && { eftReference: undefined })
        };
      }
      return item;
    });
    setTableData(newPayments);
  };

  const handleDetailChange = (key, field, value) => {
    const newPayments = tableData.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          [field]: value
        };
      }
      return item;
    });
    setTableData(newPayments);
  };

  const handleCellChange = (record, dataIndex, value) => {
    const newPayments = tableData.map((item) => {
      if (item.key === record.key) {
        return {
          ...item,
          [dataIndex]: dataIndex === 'amount' ? Number(value) || 0 : value
        };
      }
      return item;
    });
    setTableData(newPayments);
  };

  const handleAddNew = () => {
    const newPayment = {
      key: tableData.length ? Math.max(...tableData.map((p) => p.key)) + 1 : 1,
      type: '',
      amount: '',
      action: ''
    };
    setTableData([...tableData, newPayment]);
  };

  const handleDelete = (key) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((item) => item.key !== key));
    }
  };

  const handleSubmit = async () => {
    try {
      const validPayments = tableData.filter(
        (item) =>
          item.amount !== '' &&
          item.amount !== undefined &&
          item.amount !== null &&
          !isNaN(item.amount) &&
          Number(item.amount) > 0
      );

      const payload = {
        notes: notes,
        payments: validPayments.map((item) => ({
          ...item,
          payment_type: item.type,
          eodsubmission: submissionId,
          payment_amount: item.amount
        }))
      };

      if (validPayments.length > 0) {
        setLoading(true);
        const response = await EODReportService.addPayment(payload);
        if (response.status === 201) {
          updateStepData(currentStepId, { notes, payments: tableData });
          toast.success('Record is successfully saved');
          onNext();
        }
        return;
      }

      updateStepData(currentStepId, { notes: '', payments: tableData });
      onNext();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.entries(currentStepData).length > 0) {
      setNotes(currentStepData.notes);
      setTableData(currentStepData.payments);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-medium text-black">Payments</h1>
          <Button
            size="lg"
            onClick={handleAddNew}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Payment
          </Button>
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <GenericTable
              footer={footer}
              columns={columns}
              dataSource={tableData}
              onCellChange={handleCellChange}
            />
          </Col>
          <Col span={12}>
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
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
