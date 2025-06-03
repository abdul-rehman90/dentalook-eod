'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Stepper } from '@/common/components/stepper/stepper';
import { useGlobalContext } from '@/common/context/global-context';

export default function SubmissionLayout({ children }) {
  const { type, step } = useParams();
  const { stepConfig } = useGlobalContext();
  const currentStep = parseInt(step || '1');
  const steps = stepConfig[type] || [];

  return (
    <div className="p-6 flex bg-gray-50 min-h-screen">
      <div className="">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>
      {children}
    </div>
  );
}
