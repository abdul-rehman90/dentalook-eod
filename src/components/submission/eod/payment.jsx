import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Col, Row, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import { Card, CardHeader, CardTitle } from '@/common/components/card/card';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
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
  const [dataLoading, setDataLoading] = useState(false);
  const {
    id,
    steps,
    reportData,
    setLoading,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinicDetails?.clinic;
  const sensors = [
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  ];

  const columns = [
    {
      width: 50,
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
      width: 50,
      key: 'amount',
      editable: true,
      inputType: 'number',
      title: 'Amount ($)',
      dataIndex: 'amount'
    },
    {
      width: 250,
      key: 'remarks',
      editable: true,
      title: 'Remarks',
      inputType: 'text',
      dataIndex: 'remarks'
    }
  ];

  const footer = () => (
    <div className="grid grid-cols-[1fr_1fr_1fr] p-1.5">
      <div className="font-semibold">Total Amount</div>
      <div className="pl-10">
        {tableData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
      </div>
      <div></div>
    </div>
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active?.id !== over?.id) {
      setTableData((items) => {
        const oldIndex = items.findIndex((item) => item.key === active?.id);
        const newIndex = items.findIndex((item) => item.key === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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
      remarks: '',
      action: ''
    };
    setTableData([...tableData, newPayment]);
  };

  const handlePaymentTypeOrder = async () => {
    try {
      const paymentOrderPayload = {
        clinic_id: clinicId,
        payment_type_order: tableData.reduce((acc, item, index) => {
          acc[item.type] = index + 1;
          return acc;
        }, {})
      };
      await EODReportService.handlePaymentTypeOrder(paymentOrderPayload);
    } catch (error) {}
  };

  const handleSubmit = async () => {
    try {
      const validPayments = tableData.filter(
        (item) => item.amount && !isNaN(item.amount) && Number(item.amount) > 0
      );

      const payload = {
        notes: notes,
        payments: validPayments.map((item) => ({
          ...item,
          payment_type: item.type,
          eodsubmission: Number(id),
          payment_amount: item.amount
        }))
      };

      if (validPayments.length > 0) {
        setLoading(true);
        const response = await EODReportService.addPayment(payload);
        if (response.status === 201) {
          handlePaymentTypeOrder();
          toast.success('Record is successfully saved');
          updateStepData(currentStepId, { notes, payments: tableData });
          onNext();
        }
        return;
      }

      updateStepData(currentStepId, { notes: '', payments: tableData });
      onNext();
      handlePaymentTypeOrder();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPayments = async () => {
    try {
      setDataLoading(true);
      const response = await EODReportService.getAllPaymentsOrderByClinic(
        clinicId
      );
      if (response.status === 200) {
        const basePayments = Object.entries(response.data.payment_type_order)
          .map(([type, order]) => ({
            amount: '',
            key: order,
            type: type,
            remarks: ''
          }))
          .sort((a, b) => a.key - b.key);

        if (currentStepData.length > 0) {
          const storedNotes = currentStepData[0]?.notes;
          const mergedData = basePayments.map((payment) => {
            const existingData = currentStepData.find(
              (item) => item.payment_type === payment.type
            );
            return existingData
              ? {
                  ...payment,
                  remarks: existingData.remarks,
                  amount: existingData.payment_amount
                }
              : payment;
          });
          setNotes(storedNotes);
          setTableData(mergedData);
        } else {
          setTableData(basePayments);
        }
      }
    } catch (error) {
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (
      !Array.isArray(currentStepData) &&
      Object.keys(currentStepData).length > 0
    ) {
      const notes = currentStepData.notes || '';
      const payments = currentStepData.payments || [];
      setNotes(notes);
      setTableData(payments);
    } else if (clinicId) {
      fetchAllPayments();
    }
  }, [clinicId]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-end mb-4">
          <Button
            size="lg"
            variant="destructive"
            onClick={handleAddNew}
            className="!px-0 text-[15px] font-semibold text-[#339D5C]"
          >
            <PlusOutlined />
            Add New Payment
          </Button>
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                strategy={verticalListSortingStrategy}
                items={tableData.map((item) => item.key)}
              >
                <GenericTable
                  footer={footer}
                  columns={columns}
                  loading={dataLoading}
                  dataSource={tableData}
                  onCellChange={handleCellChange}
                />
              </SortableContext>
            </DndContext>
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
