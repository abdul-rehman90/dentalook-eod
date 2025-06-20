import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Col, Row, Input } from 'antd';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
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
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 200,
      key: 'type',
      disabled: true,
      editable: true,
      dataIndex: 'type',
      inputType: 'select',
      title: 'Payment Type',
      selectOptions: paymentOptions
    },
    {
      width: 150,
      key: 'amount',
      editable: true,
      disabled: true,
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
        <Button disabled size="icon" className="ml-3" variant="destructive">
          <Image src={Icons.cross} alt="cross" />
        </Button>
      )
    }
  ];

  const footer = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1 text-left p-2">Total Amount</div>
      <div className="flex-1 text-left p-2">
        ${tableData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
      </div>
    </div>
  );

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        key: item.id.toString(),
        type: item.payment_type,
        amount: item.payment_amount
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <h1 className="text-base font-medium text-black mb-4">Payments</h1>
        <Row gutter={16}>
          <Col span={12}>
            <GenericTable
              footer={footer}
              columns={columns}
              dataSource={tableData}
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
                disabled
                placeholder="Enter note here..."
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
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
