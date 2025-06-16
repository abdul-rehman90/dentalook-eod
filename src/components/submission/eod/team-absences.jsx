import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Input, Select } from 'antd';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const positionOptions = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' },
  { value: 'PCC', label: 'PCC' },
  { value: 'CDA', label: 'CDA' },
  { value: 'PM', label: 'PM' },
  { value: 'Dental Aide', label: 'Dental Aide' }
];

export default function TeamAbsences({ onNext }) {
  const [staffData, setStaffData] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const { reportData, steps, currentStep, updateStepData, getCurrentStepData } =
    useGlobalContext();
  const currentStepData = getCurrentStepData();
  const currentStepId = steps[currentStep - 1].id;
  const clinicId = reportData?.eod?.basic?.clinic;

  const columns = [
    {
      width: 150,
      editable: true,
      key: 'position',
      title: 'Position',
      inputType: 'select',
      dataIndex: 'position',
      selectOptions: positionOptions
    },
    {
      width: 150,
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => {
        if (['DDS', 'RDH'].includes(record.position)) {
          return (
            <div className="h-full">
              <Select
                value={text}
                options={staffData[record.position] || []}
                onChange={(value) => handleCellChange(record, 'name', value)}
              />
            </div>
          );
        }
        return (
          <div className="h-full">
            <Input
              value={text}
              onChange={(e) => handleCellChange(record, 'name', e.target.value)}
            />
          </div>
        );
      }
    },
    {
      width: 150,
      key: 'reason',
      editable: true,
      title: 'Reason',
      inputType: 'text',
      dataIndex: 'reason'
    },
    {
      width: 150,
      key: 'absence',
      editable: true,
      inputType: 'select',
      dataIndex: 'absence',
      title: 'Absent/Present',
      selectOptions: [
        { value: 'Full Day', label: 'Full Day' },
        { value: 'Partial Day', label: 'Partial Day' }
      ]
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

  const fetchStaffByPosition = async (position) => {
    try {
      const { data } = await EODReportService.getProviders(clinicId, 'False');
      setStaffData((prev) => ({
        ...prev,
        [position]: data.providers
          .filter((item) => item.user_type === position)
          .map((item) => ({
            value: item.id,
            label: item.name
          }))
      }));
    } catch (error) {}
  };

  const createTeamAbsence = async () => {
    try {
      const payload = teamMembers.map((item) => ({
        ...item,
        user: item.id,
        eodsubmission: 1
      }));
      const response = await EODReportService.addTeamAbsence(payload);
      if (response.status === 201) {
        updateStepData(currentStepId, teamMembers);
        toast.success('Record is successfully saved');
        onNext();
      }
    } catch (error) {}
  };

  const handleCellChange = (record, dataIndex, value) => {
    const newTeamMembers = teamMembers.map((item) => {
      if (item.key === record.key) {
        const updatedItem = { ...item, [dataIndex]: value };
        if (dataIndex === 'position') {
          updatedItem.name = '';
          fetchStaffByPosition(value);
        }

        return updatedItem;
      }
      return item;
    });
    setTeamMembers(newTeamMembers);
  };

  const handleAddAbsence = () => {
    const newAbsence = {
      key: teamMembers.length
        ? Math.max(...teamMembers.map((p) => p.key)) + 1
        : 1,
      name: '',
      reason: '',
      absence: '',
      position: ''
    };
    setTeamMembers([...teamMembers, newAbsence]);
  };

  const handleDelete = (key) => {
    setTeamMembers(teamMembers.filter((item) => item.key !== key));
  };

  useEffect(() => {
    const loadData = async () => {
      if (currentStepData.length > 0) {
        const positions = [
          ...new Set(currentStepData.map((item) => item.position))
        ];
        await Promise.all(positions.map((pos) => fetchStaffByPosition(pos)));
        setTeamMembers(currentStepData);
      }
    };

    loadData();
  }, []);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-medium text-black">Current Day</h1>
          <Button
            size="lg"
            onClick={handleAddAbsence}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Add New Absence
          </Button>
        </div>
        <GenericTable
          columns={columns}
          dataSource={teamMembers}
          onCellChange={handleCellChange}
        />
      </div>
      <StepNavigation onNext={createTeamAbsence} />
    </React.Fragment>
  );
}
