import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { GenericTable } from '@/common/components/table/table';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import { Input, Select } from 'antd';

const positionOptions = [
  { value: 'DDS', label: 'DDS' },
  { value: 'RDH', label: 'RDH' },
  { value: 'PCC', label: 'PCC' },
  { value: 'Dental Aide', label: 'Dental Aide' },
  { value: 'Other', label: 'Other' }
];

export default function TeamAbsences({ onNext }) {
  const [teamMembers, setTeamMembers] = useState([]);

  const staffData = {
    DDS: [
      { value: 'Darlene Robertson', label: 'Darlene Robertson' },
      { value: 'Courtney Henry', label: 'Courtney Henry' }
    ],
    RDH: [
      { value: 'Marvin McKinney', label: 'Marvin McKinney' },
      { value: 'Annette Black', label: 'Annette Black' }
    ]
  };

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
                options={staffData[record.position]}
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
      key: 'status',
      editable: true,
      inputType: 'select',
      dataIndex: 'status',
      title: 'Absent/Present',
      selectOptions: [
        { value: 'Present', label: 'Present' },
        { value: 'Absent', label: 'Absent' }
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

  const handleCellChange = (record, dataIndex, value) => {
    const newTeamMembers = teamMembers.map((item) => {
      if (item.key === record.key) {
        const updatedItem = { ...item, [dataIndex]: value };

        if (dataIndex === 'position') {
          if (!['DDS', 'RDH'].includes(value)) {
            updatedItem.name = '';
          } else if (
            !staffData[value]?.some((staff) => staff.value === updatedItem.name)
          ) {
            updatedItem.name = '';
          }
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
      position: '',
      status: 'Present'
    };
    setTeamMembers([...teamMembers, newAbsence]);
  };

  const handleDelete = (key) => {
    setTeamMembers(teamMembers.filter((item) => item.key !== key));
  };

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
      <StepNavigation onNext={onNext} />
    </React.Fragment>
  );
}
