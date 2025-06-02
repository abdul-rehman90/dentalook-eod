'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Stepper } from '@/common/components/stepper/stepper';

const stepConfig = {
  eod: [
    'Basic Details',
    'Daily Production',
    'Payment',
    'Team Absences',
    'Schedule Openings',
    'Patient Tracking',
    'Attrition Tracking',
    'Referrals'
  ],
  eom: [
    'Monthly Summary',
    'Financial Overview',
    'Team Performance',
    'Patient Statistics',
    'Equipment Status',
    'Inventory Check'
  ]
};

export default function ReportLayout({ children }) {
  const { type, step } = useParams();
  const steps = stepConfig[type] || [];
  const currentStep = parseInt(step || '1');

  return (
    <div className="p-6 flex bg-gray-50 min-h-screen">
      <Stepper steps={steps} currentStep={currentStep} />
      {children}
    </div>
  );
}
