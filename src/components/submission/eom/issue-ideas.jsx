import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const categoryOptions = [
  { value: 'Issue', label: 'Issue' },
  { value: 'Idea', label: 'Idea' }
];

const defaultRow = {
  key: 1,
  details: '',
  category: ''
};

export default function IssuesIdeas() {
  const router = useRouter();
  const [tableData, setTableData] = useState([defaultRow]);
  const { id, setLoading, getCurrentStepData } = useGlobalContext();
  const currentStepData = getCurrentStepData();

  const columns = [
    {
      width: 100,
      editable: true,
      key: 'category',
      title: 'Category',
      inputType: 'select',
      dataIndex: 'category',
      selectOptions: categoryOptions
    },
    {
      width: 200,
      key: 'details',
      editable: true,
      title: 'Details',
      inputType: 'text',
      dataIndex: 'details'
    },
    {
      width: 50,
      key: 'action',
      title: 'Action',
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

  const handleSubmitEOMReport = async () => {
    try {
      setLoading(true);
      const response = await EOMReportService.submissionEOMReport({
        eomsubmission_id: id
      });
      if (response.status === 200) {
        toast.success('EOM submission is successfully submitted');
        router.push('/review/list/eom');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (record, dataIndex, value) => {
    setTableData(
      tableData.map((item) =>
        item.key === record.key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  const handleDelete = (key) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((item) => item.key !== key));
    }
  };

  const handleAddNew = () => {
    const newKey =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.key)) + 1
        : 1;
    const newItem = {
      key: newKey,
      details: '',
      category: ''
    };
    setTableData([...tableData, newItem]);
  };

  const handleSubmit = async () => {
    try {
      const payload = tableData
        .filter((item) => item.category && item.details)
        .map((item) => ({
          ...item,
          submission: id
        }));

      if (payload.length > 0) {
        const response = await EOMReportService.addIssueIdeas(payload);
        if (response.status === 201) {
          handleSubmitEOMReport();
        }
        return;
      }
      handleSubmitEOMReport();
    } catch (error) {}
  };

  useEffect(() => {
    if (currentStepData.length > 0) {
      const transformedData = currentStepData.map((item) => ({
        details: item.details,
        category: item.category,
        key: item.id?.toString() || item.key?.toString()
      }));
      setTableData(transformedData);
    }
  }, [currentStepData]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-medium text-black">Issues/Ideas</h1>
          <Button
            size="lg"
            onClick={handleAddNew}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add Issue/Idea
          </Button>
        </div>
        <GenericTable
          columns={columns}
          dataSource={tableData}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={handleSubmit} />
    </React.Fragment>
  );
}
