'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { Stepper } from '@/common/components/stepper/stepper';
import { useGlobalContext } from '@/common/context/global-context';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';

export default function ReviewLayout({ children }) {
  const router = useRouter();
  const { reportData, steps, type, currentStep, totalSteps } =
    useGlobalContext();
  const submission_date =
    reportData?.eod?.basic?.clinicDetails?.submission_date;
  const submission_month = reportData?.eom?.basic?.submission_month;

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
        End of {type === 'eod' ? 'Day' : 'Month'} Reporting: View
        <div className="w-22 h-6 bg-primary-50 text-sm font-semibold text-primary-400 rounded-full flex items-center justify-center mx-2">
          Submitted
        </div>
        {type === 'eod'
          ? `/ ${dayjs(submission_date).format('D MMMM YYYY')}`
          : `/ ${dayjs(submission_month).format('MMM YYYY')}`}
      </h1>
      <div className="flex gap-2">
        <div className="w-full max-w-[250px]">
          <Stepper />
        </div>
        <div className="flex-1">
          <Card className="border !border-[#F7F7F7] bg-white !shadow-none">
            <CardHeader className="!border-b-0 !px-4">
              <CardTitle className="text-sm text-secondary-400">
                Step {currentStep} of {totalSteps}
              </CardTitle>
              <CardDescription className="text-xl font-medium text-black">
                {steps[currentStep - 1].name}
              </CardDescription>
            </CardHeader>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
