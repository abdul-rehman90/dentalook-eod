'use client';

import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import Payment from '@/components/reports/eod/payment';
import { Button } from '@/common/components/button/button';
import Referrals from '@/components/reports/eod/referrals';
import BasicDetails from '@/components/reports/eod/basic-details';
import TeamAbsences from '@/components/reports/eod/team-absences';
import DailyProduction from '@/components/reports/eod/daily-production';
import PatientTracking from '@/components/reports/eod/patient-tracking';
import ScheduleOpening from '@/components/reports/eod/schedule-opening';
import AttritionTracking from '@/components/reports/eod/attrition-tracking';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';

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
    'Basic Details',
    'Account Receivable',
    'Equipment',
    'Clinic Upgrades',
    'Hiring and Training',
    'Supplies',
    'Google Reviews',
    'Issues/Ideas'
  ]
};

export default function ReportPage() {
  const router = useRouter();
  const { type, step } = useParams();
  const currentStep = parseInt(step);
  const totalSteps = type === 'eod' ? 8 : 6;

  const stepComponents = {
    eod: {
      1: <BasicDetails onNext={handle} />,
      2: <DailyProduction onNext={handle} />,
      3: <Payment onNext={handle} />,
      4: <TeamAbsences onNext={handle} />,
      5: <ScheduleOpening onNext={handle} />,
      6: <PatientTracking onNext={handle} />,
      7: <AttritionTracking onNext={handle} />,
      8: <Referrals onNext={handle} />
    },
    eom: {
      1: <BasicDetails />,
      2: <DailyProduction />
    }
  };

  function handle() {
    router.push(`/reports/${type}/${currentStep + 1}`);
  }

  return (
    <div className="flex-1 bg-gray-50 border border-secondary-50 rounded-r-lg">
      <Card className="!py-4 !border-0 bg-white !shadow-none !rounded-none">
        <div className="flex items-center justify-between px-5">
          <CardTitle className="flex items-center text-[18px] font-semibold text-black">
            <Button size="icon" variant="destructive" className="mr-2">
              <LeftOutlined />
            </Button>
            Submit {type.toUpperCase()}
            <div className="w-11 h-6 bg-primary-50 text-sm font-semibold text-primary-400 rounded-full flex items-center justify-center ml-3">
              New
            </div>
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="lg"
              variant="secondary"
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
              {stepConfig[type][currentStep - 1]}
            </CardDescription>
          </CardHeader>
          <div className="pt-6 border-t-1 border-t-secondary-50 ">
            {stepComponents[type][currentStep]}
          </div>
        </Card>
      </div>
    </div>
  );
}
