'use client';

import React from 'react';
import dayjs from 'dayjs';
import { LeftOutlined } from '@ant-design/icons';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { Stepper } from '@/common/components/stepper/stepper';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';

export default function SubmissionLayout({ children }) {
  const router = useRouter();
  const { steps, reportData, type, id, currentStep, totalSteps } =
    useGlobalContext();
  const submission_date =
    reportData?.eod?.basic?.clinicDetails?.submission_date;
  const submission_month = reportData?.eom?.basic?.submission_month;
  const stepName = steps[currentStep - 1]?.name;

  if (currentStep > 1 && !id) {
    redirect(`/submission/${type}/1`);
  }

  const handleNext = async () => {
    try {
      window.dispatchEvent(new CustomEvent('stepNavigationNext'));
    } catch (error) {}
  };

  const handleSave = async () => {
    try {
      window.dispatchEvent(new CustomEvent('stepNavigationSave'));
    } catch (error) {}
  };

  return (
    <div className="px-13 py-6 bg-[#FAFAFB] min-h-screen">
      <h1 className="flex items-center text-[18px] font-semibold text-black mb-7">
        <Button
          size="icon"
          className="mr-2"
          variant="destructive"
          onClick={() => router.back()}
        >
          <LeftOutlined />
        </Button>
        {stepName}
        {id &&
          (type === 'eod'
            ? ` - ${dayjs(submission_date).format('ddd, MMMM D, YYYY')}`
            : ` - ${dayjs(submission_month).format('MMM YYYY')}`)}
      </h1>
      <div className="flex gap-2">
        <div className="w-full max-w-[250px]">
          <Stepper />
        </div>
        <div className="flex-1">
          <Card className="border !border-[#F7F7F7] bg-white !shadow-none !gap-4">
            <CardHeader className="!border-b-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-secondary-400">
                    Step {currentStep} of {totalSteps}
                  </CardTitle>
                  <CardDescription className="text-xl font-medium text-black mt-2">
                    {steps[currentStep - 1].name}
                  </CardDescription>
                </div>
                <StepNavigation onNext={handleNext} onSave={handleSave} />
              </div>
            </CardHeader>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
