import React, { useEffect, useState } from 'react';
import { Col, Row, Input, Select, Table } from 'antd';
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
  const [notes, setNotes] = useState('');
  const [tableData, setTableData] = useState([]);
  const { getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 100,
      key: 'type',
      dataIndex: 'type',
      title: 'Payment Type',
      render: (type, record) => {
        const showInsuranceInput =
          type === 'EFT PAYMENT' || type === 'INSURANCE CHEQUE';
        return (
          <div className="flex flex-col gap-1">
            <Select
              value={type}
              disabled={true}
              className={
                record.type === 'CC/DEBIT REFUND' ? 'refund-amount-cell' : ''
              }
            >
              {paymentOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            {showInsuranceInput && (
              <Input
                disabled={true}
                placeholder="Insurance Company"
                value={record.insurance_company || ''}
              />
            )}
          </div>
        );
      }
    },
    {
      width: 100,
      key: 'amount',
      title: 'Amount ($)',
      dataIndex: 'amount',
      render: (_, record) => (
        <Input
          prefix="$"
          type="text"
          disabled={true}
          value={record.amount || ''}
          className={
            record.type === 'CC/DEBIT REFUND' ? 'refund-amount-cell' : ''
          }
        />
      )
    },
    {
      width: 150,
      key: 'remarks',
      title: 'Remarks',
      dataIndex: 'remarks',
      render: (remarks, record) => (
        <Input
          disabled={true}
          value={remarks}
          className={
            record.type === 'CC/DEBIT REFUND' ? 'refund-amount-cell' : ''
          }
        />
      )
    }
  ];

  const footer = () => {
    const totalAmount = tableData.reduce((sum, item) => {
      const amount = Number(item.amount) || 0;
      return item.type === 'CC/DEBIT REFUND' ? sum - amount : sum + amount;
    }, 0);

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0}>Total Amount</Table.Summary.Cell>
        <Table.Summary.Cell index={1} colSpan={2}>
          ${totalAmount.toFixed(2)}
        </Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  useEffect(() => {
    if (currentStepData.length > 0) {
      const storedNotes = currentStepData[0]?.notes;
      const transformedData = currentStepData.map((item) => ({
        remarks: item.remarks,
        type: item.payment_type,
        key: item.id.toString(),
        amount: item.payment_amount,
        insurance_company: item.insurance_company
      }));
      setTableData(transformedData);
      setNotes(storedNotes);
    }
  }, [currentStepData]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', onNext);
    return () => {
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [onNext]);

  return (
    <React.Fragment>
      <div className="px-6">
        <Row gutter={16}>
          <Col span={12}>
            <div className="payment-table">
              <GenericTable
                footer={footer}
                columns={columns}
                dataSource={tableData}
              />
            </div>
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
                value={notes}
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
      <StepNavigation
        onNext={onNext}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
