import React, { useCallback, useEffect, useState } from 'react';
import { Input } from 'antd';
import toast from 'react-hot-toast';
import { Col, Row, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import EditableCell from '@/common/components/editable-cell/editable-cell';
import { Card, CardHeader, CardTitle } from '@/common/components/card/card';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const { TextArea } = Input;

const paymentOptions = [
  { value: 'VISA', label: 'VISA' },
  { value: 'AMEX', label: 'AMEX' },
  { value: 'CASH', label: 'CASH' },
  { value: 'DEBIT', label: 'DEBIT' },
  { value: 'MASTERCARD', label: 'MASTERCARD' },
  { value: 'CC/DEBIT REFUND', label: 'CC/DEBIT REFUND' },
  { value: 'PATIENT E-TRANSFER', label: 'PATIENT E-TRANSFER' },
  { value: 'PATIENT CHEQUE', label: 'PATIENT CHEQUE' },
  { value: 'INSURANCE CHEQUE', label: 'INSURANCE CHEQUE' },
  { value: 'EFT PAYMENT', label: 'EFT PAYMENT' }
];

export default function Payment({ onNext }) {
  const [notes, setNotes] = useState('');
  const [tableData, setTableData] = useState([]);
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

  const handleTypeChange = (key, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              type: value,
              ...(value !== 'EFT PAYMENT' ? { insurance_company: '' } : {})
            }
          : item
      )
    );
  };

  const handleCellCommit = (key, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddNew = () => {
    setTableData((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random()}`,
        type: '',
        amount: '',
        remarks: '',
        insurance_company: ''
      }
    ]);
  };

  const handleCellChange = (record, dataIndex, value) => {
    const newPayments = tableData.map((item) =>
      item.key === record.key ? { ...item, [dataIndex]: value } : item
    );
    setTableData(newPayments);
  };

  const footer = () => {
    const totalAmount = tableData.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
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
        const showInsuranceInput =
          type === 'EFT PAYMENT' || type === 'INSURANCE CHEQUE';
        return (
          <div className="flex flex-col gap-1">
            <EditableCell
              field="type"
              value={type}
              type="select"
              recordKey={record.key}
              options={paymentOptions}
              onCommit={handleTypeChange}
            />

            {showInsuranceInput && (
              <EditableCell
                type="text"
                recordKey={record.key}
                field="insurance_company"
                onCommit={handleCellCommit}
                placeholder="Insurance Company"
                value={record.insurance_company}
              />
            )}
          </div>
        );
      }
    },
    {
      width: 100,
      prefix: '$',
      key: 'amount',
      editable: true,
      title: 'Amount',
      dataIndex: 'amount',
      inputType: 'number'
    },
    {
      width: 150,
      key: 'remarks',
      editable: true,
      title: 'Remarks',
      inputType: 'text',
      dataIndex: 'remarks'
    }
  ];

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        const typeCounts = tableData.reduce((acc, item) => {
          if (
            item.type &&
            item.amount &&
            item.type !== 'EFT PAYMENT' &&
            item.type !== 'INSURANCE CHEQUE'
          ) {
            acc[item.type] = (acc[item.type] || 0) + 1;
          }
          return acc;
        }, {});

        const duplicateType = Object.keys(typeCounts).find(
          (type) => typeCounts[type] > 1
        );

        if (duplicateType) {
          toast.error(
            `Duplicate payment type "${duplicateType}" is not allowed`
          );
          return;
        }

        const invalidInsurance = tableData.find(
          (item) =>
            (item.type === 'EFT PAYMENT' || item.type === 'INSURANCE CHEQUE') &&
            item.amount &&
            !item.insurance_company
        );

        if (invalidInsurance) {
          toast.error(
            `Insurance Company is required for ${invalidInsurance.type}`
          );
          return;
        }

        const validPayments = tableData.filter(
          (item) => item.amount && !isNaN(item.amount)
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
            toast.success('Record is successfully saved');
            updateStepData(currentStepId, { notes, payments: tableData });
            if (navigate) onNext();
          }
        } else {
          updateStepData(currentStepId, { notes: '', payments: tableData });
          if (navigate) onNext();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [tableData, notes, id, setLoading, currentStepId, updateStepData, onNext]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  useEffect(() => {
    if (
      !Array.isArray(currentStepData) &&
      Object.keys(currentStepData).length > 0
    ) {
      setNotes(currentStepData.notes || '');
      setTableData(currentStepData.payments || []);
    } else if (clinicId) {
      const storedNotes =
        Array.isArray(currentStepData) && currentStepData[0]?.notes;

      const mergedData = paymentOptions.flatMap((payment, index) => {
        const existingRows = Array.isArray(currentStepData)
          ? currentStepData.filter(
              (item) => item.payment_type === payment.value
            )
          : [];

        if (existingRows.length > 0) {
          return existingRows.map((row, idx) => ({
            type: payment.value,
            remarks: row.remarks,
            amount: row.payment_amount,
            key: `merged-${idx}-${payment.value}`,
            insurance_company: row.insurance_company
          }));
        }

        return {
          amount: '',
          remarks: '',
          type: payment.value,
          key: `merged-${index}-${payment.value}`
        };
      });

      setNotes(storedNotes || '');
      setTableData(mergedData);
    }
  }, [clinicId, currentStepData]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', handleSubmit);
    window.addEventListener('stepNavigationSave', handleSave);
    return () => {
      window.removeEventListener('stepNavigationNext', handleSubmit);
      window.removeEventListener('stepNavigationSave', handleSave);
    };
  }, [handleSubmit, handleSave]);

  console.log(tableData);

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
            <div className="payment-table">
              <GenericTable
                footer={footer}
                columns={columns}
                dataSource={tableData}
                onCellChange={handleCellChange}
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
                value={notes}
                placeholder="Enter note here..."
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  height: '170px',
                  fontSize: '15px',
                  boxShadow: 'none',
                  color: '#777B8B',
                  borderRadius: '12px',
                  padding: '10px 16px'
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        className="border-t-1 border-t-[#F3F5F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
