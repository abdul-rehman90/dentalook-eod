import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Input } from 'antd';
import toast from 'react-hot-toast';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

const defaultRow = {
  key: '1',
  overage_reason: '',
  supplies_actual: ''
};

export default function Supplies({ onNext }) {
  const [editingId, setEditingId] = useState(null);
  const [editRowData, setEditRowData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [totalSupplies, setTotalSupplies] = useState([]);
  const [tableData, setTableData] = useState([defaultRow]);
  const {
    id,
    steps,
    setLoading,
    reportData,
    currentStep,
    updateStepData,
    getCurrentStepData
  } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const clinicId = reportData?.eom?.basic?.clinic;
  const currentStepId = steps[currentStep - 1].id;
  const submission_month = dayjs(
    reportData?.eom?.basic?.submission_month
  ).format('YYYY-MM');

  const columns = [
    {
      title: '',
      width: 100,
      key: 'summary',
      dataIndex: 'summary',
      render: () => (
        <div className="text-[15px] text-gray-900 font-bold">
          Total Supplies
        </div>
      )
    },
    {
      width: 50,
      // editable: true,
      // disabled: true,
      title: 'Actual',
      // inputType: 'number',
      key: 'supplies_actual',
      dataIndex: 'supplies_actual',
      render: (text) => {
        const total = totalSupplies.reduce(
          (sum, item) => sum + (Number(item.supplies_actual) || 0),
          0
        );
        return total || text;
      }
    },
    {
      key: '',
      title: '',
      width: 370,
      dataIndex: ''
    }
    // {
    //   width: 370,
    //   editable: true,
    //   inputType: 'text',
    //   key: 'overage_reason',
    //   title: 'Reason for Overage',
    //   dataIndex: 'overage_reason'
    // }
  ];

  const totalSuppliesColumns = [
    {
      width: 50,
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date'
    },
    {
      width: 50,
      title: 'Actual',
      key: 'supplies_actual',
      dataIndex: 'supplies_actual',
      render: (text, record) => {
        if (editingId === record.id) {
          return (
            <Input
              type="number"
              value={editRowData.supplies_actual}
              onChange={(e) =>
                setEditRowData({
                  ...editRowData,
                  supplies_actual: e.target.value
                })
              }
            />
          );
        }
        return text;
      }
    },
    {
      width: 160,
      key: 'overage_reason',
      title: 'Reason for Overage',
      dataIndex: 'overage_reason',
      render: (text, record) => {
        if (editingId === record.id) {
          return (
            <Input
              type="text"
              value={editRowData.overage_reason}
              onChange={(e) =>
                setEditRowData({
                  ...editRowData,
                  overage_reason: e.target.value
                })
              }
            />
          );
        }
        return text;
      }
    },
    {
      key: '',
      width: 50,
      dataIndex: '',
      title: 'Monthly Budget'
    },
    {
      key: '',
      width: 50,
      dataIndex: '',
      title: 'Variance'
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <div className="flex gap-4">
              <SaveOutlined
                onClick={() => handleSaveEdit(record)}
                className="text-blue-500 cursor-pointer"
              />
              <CloseOutlined
                onClick={() => {
                  setEditingId(null);
                  setEditRowData(null);
                }}
                className="text-red-500 cursor-pointer"
              />
            </div>
          );
        }
        return (
          <EditOutlined
            onClick={() => {
              setEditingId(record.id);
              setEditRowData({ ...record });
            }}
            className="text-blue-500 cursor-pointer"
          />
        );
      }
    }
  ];

  const footer = () => {
    const totalActual = totalSupplies.reduce(
      (sum, item) => sum + (Number(item.supplies_actual) || 0),
      0
    );
    return (
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] p-2">
        <div className="font-semibold">Total</div>
        <div
          // className="ml-8"
          className="min-[1280px]:max-[1350px]:ml-[22px] min-[1351px]:max-[1500px]:ml-[24px] min-[1501px]:max-[1650px]:ml-[28px] min-[1651px]:max-[1850px]:ml-[32px] min-[1851px]:max-[2000px]:ml-[36px] min-[2001px]:max-[2250px]:ml-[40px] min-[2251px]:ml-[48px]"
        >
          {totalActual}
        </div>
        <div></div>
        <div className="text-center ml-15">0</div>
        <div
          className="text-center max-[1850px]:ml-[24px]"
          style={{
            color: totalActual - 0 >= 0 ? 'green' : 'red'
          }}
        >
          {totalActual - 0}
        </div>
        <div></div>
      </div>
    );
  };

  const handleSaveEdit = async (record) => {
    try {
      setLoading(true);
      const payload = {
        ...editRowData,
        clinic: clinicId,
        supplies_actual: parseFloat(editRowData.supplies_actual)
      };
      const response = await EODReportService.addSupplies(record.id, payload);
      if (response.status === 200) {
        toast.success('Record updated successfully');
        const { data } = await EODReportService.getAllSupplies(
          clinicId,
          submission_month
        );
        setTotalSupplies(
          data.map((item) => ({
            ...item,
            key: item.id
          }))
        );
        setEditingId(null);
        setEditRowData(null);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const saveData = useCallback(
    async (navigate = false) => {
      try {
        setLoading(true);
        const rowData = tableData[0];
        if (rowData.supplies_actual) {
          const payload = {
            ...rowData,
            clinic: clinicId,
            supplies_actual: parseFloat(rowData.supplies_actual)
          };
          const response = await EODReportService.addSupplies(id, payload);
          if (response.status === 200) {
            updateStepData(currentStepId, rowData);
            toast.success('Record is successfully saved');
            if (navigate) {
              onNext();
            }
          }
        } else {
          updateStepData(currentStepId, rowData);
          if (navigate) {
            onNext();
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [tableData, clinicId, id, currentStepId, setLoading, updateStepData]
  );

  const handleSubmit = useCallback(async () => {
    await saveData(true); // Save and navigate
  }, [saveData]);

  const handleSave = useCallback(async () => {
    await saveData(false); // Save without navigation
  }, [saveData]);

  useEffect(() => {
    if (clinicId && Object.entries(currentStepData).length > 0) {
      const transformedData = [
        {
          key: '1',
          overage_reason: currentStepData.overage_reason || '',
          supplies_actual: currentStepData.supplies_actual || ''
        }
      ];
      setTableData(transformedData);
    }
  }, [clinicId]);

  useEffect(() => {
    const getAllSupplies = async () => {
      try {
        setDataLoading(true);
        const { data } = await EODReportService.getAllSupplies(
          clinicId,
          submission_month
        );
        setTotalSupplies(
          data.map((item) => ({
            ...item,
            key: item.id
          }))
        );
      } catch (error) {
      } finally {
        setDataLoading(false);
      }
    };
    clinicId && getAllSupplies();
  }, [clinicId]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', handleSubmit);
    window.addEventListener('stepNavigationSave', handleSave);

    return () => {
      window.removeEventListener('stepNavigationNext', handleSubmit);
      window.removeEventListener('stepNavigationSave', handleSave);
    };
  }, [handleSubmit, handleSave]);

  return (
    <div className="px-6 flex flex-col gap-14">
      <GenericTable columns={columns} dataSource={tableData} />
      <GenericTable
        footer={footer}
        loading={dataLoading}
        dataSource={totalSupplies}
        columns={totalSuppliesColumns}
      />
    </div>
  );
}
