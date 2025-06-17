'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { Stepper } from '@/common/components/stepper/stepper';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';

export default function SubmissionLayout({ children }) {
  const router = useRouter();
  const { steps, type, submissionId, currentStep, totalSteps } =
    useGlobalContext();

  const handleSubmit = async () => {
    try {
      const response = await EODReportService.submissionEODReport({
        eodsubmission_id: submissionId
      });
      if (response.status === 200) {
        toast.success('EOD submission is successfully submitted');
        router.push(`/review/list/${type}`);
      }
    } catch (error) {}
  };

  return (
    <div className="p-6 flex bg-gray-50 min-h-screen">
      <div className="bg-white border border-secondary-50 rounded-l-lg">
        <Stepper />
      </div>
      <div className="flex-1 bg-gray-50 border border-secondary-50 rounded-r-lg">
        <Card className="!py-4 !border-0 bg-white !shadow-none !rounded-none">
          <div className="flex items-center justify-between px-5">
            <CardTitle className="flex items-center text-[18px] font-semibold text-black">
              <Button
                size="icon"
                className="mr-2"
                variant="destructive"
                onClick={() => router.push('/clinics-reporting')}
              >
                <LeftOutlined />
              </Button>
              Submit End Of {type === 'eod' ? 'Day' : 'Month'}
              <div className="w-11 h-6 bg-primary-50 text-sm font-semibold text-primary-400 rounded-full flex items-center justify-center ml-3">
                New
              </div>
            </CardTitle>
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="h-9 !shadow-none text-black !rounded-lg"
                onClick={() => router.push(`/review/list/${type}`)}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleSubmit}
                className="h-9 !shadow-none text-black !rounded-lg"
              >
                Submit
              </Button>
            </div>
          </div>
        </Card>
        <div className="p-4">
          <Card className="bg-white !shadow-none !py-5">
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
