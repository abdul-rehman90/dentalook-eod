'use client';

import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { Stepper } from '@/common/components/stepper/stepper';
import { EODReportService } from '@/common/services/eod-report';
import { EOMReportService } from '@/common/services/eom-report';
import { useGlobalContext } from '@/common/context/global-context';
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
  const submission_date = reportData?.eod?.basic?.submission_date;
  const submission_month = reportData?.eom?.basic?.submission_month;

  useEffect(() => {
    if (currentStep > 1 && !id) {
      router.push(`/submission/${type}/1`);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const service = type === 'eod' ? EODReportService : EOMReportService;
      const payload = {
        [`${type}submission_id`]: id
      };

      const response =
        type === 'eod'
          ? await service.submissionEODReport(payload)
          : await service.submissionEOMReport(payload);

      if (response.status === 200) {
        toast.success(
          `${type.toUpperCase()} submission successfully submitted`
        );
        router.push(`/review/list/${type}`);
      }
    } catch (error) {}
  };

  if (currentStep > 1 && !id) {
    return null;
  }

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
        Submit End Of {type === 'eod' ? 'Day' : 'Month'}{' '}
        {id &&
          (type === 'eod'
            ? ` / ${dayjs(submission_date).format('D MMMM YYYY')}`
            : ` / ${dayjs(submission_month).format('MMM YYYY')}`)}
      </h1>
      <div className="flex gap-2">
        <div className="w-full max-w-[250px]">
          <Stepper />
        </div>
        <div className="flex-1">
          <Card className="border !border-[#F7F7F7] bg-white !shadow-none">
            <CardHeader className="!border-b-0">
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
